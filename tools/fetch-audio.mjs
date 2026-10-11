#!/usr/bin/env node
/**
 * PandaAudio — tools/fetch-audio.mjs
 *
 * Tải AUDIO từ YouTube / TikTok bằng yt-dlp, chuẩn hóa bằng ffmpeg thành
 * .opus nhẹ (48kbps, mono, loudness chuẩn), rồi tự cập nhật public/data/library.json.
 *
 * Cách dùng:
 *   node tools/fetch-audio.mjs --story "Tên truyện" "<url1>" "<url2>" ...
 *   node tools/fetch-audio.mjs --story "Tên truyện" --file urls.txt
 *
 * Tùy chọn:
 *   --story "Tên truyện"     Tên bộ truyện (bắt buộc nếu library chưa có, nên đặt rõ)
 *   --story-id <id>          ID bộ truyện (mặc định: slug từ --story)
 *   --category "Xuyên không" Chủ đề của bộ truyện (để duyệt theo chủ đề trên web)
 *   --file <path>            File text, mỗi dòng 1 URL
 *   --cookies <path>         File cookies Netscape cho video cần đăng nhập / giới hạn tuổi
 *   --ytdlp-arg <arg>        Tham số thêm cho yt-dlp (dùng nhiều lần), ví dụ:
 *                              --ytdlp-arg --js-runtimes --ytdlp-arg node
 *   --dry-run                Chỉ in ra sẽ làm gì, không tải thật
 *
 * Yêu cầu: ffmpeg có sẵn trong PATH. yt-dlp: script tự tải binary nếu chưa có.
 * Mỗi video = 1 tập nguyên (không cắt nhỏ), đúng yêu cầu của dự án.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const LIB_FILE = path.join(ROOT, 'public', 'data', 'library.json');
const BIN_DIR = path.join(ROOT, 'tools', '.bin');

/* ---------------- utils ---------------- */

function slugify(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu tiếng Việt
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'tap';
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/* ---------------- yt-dlp bootstrap ---------------- */

function ytdlpDownloadUrl() {
  const platform = os.platform();
  const base = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';
  if (platform === 'win32') return { url: `${base}/yt-dlp.exe`, name: 'yt-dlp.exe' };
  if (platform === 'darwin') return { url: `${base}/yt-dlp_macos`, name: 'yt-dlp' };
  return { url: `${base}/yt-dlp`, name: 'yt-dlp' }; // linux
}

async function ensureYtDlp() {
  // 1) có sẵn trong PATH?
  for (const name of ['yt-dlp', 'yt-dlp.exe']) {
    try {
      const probe = os.platform() === 'win32' ? 'where' : 'which';
      await execFileAsync(probe, [name]);
      console.log(`✓ Tìm thấy yt-dlp trong PATH: ${name}`);
      return name;
    } catch {
      /* tiếp tục */
    }
  }
  // 2) đã tải trước đó vào tools/.bin?
  const { name } = ytdlpDownloadUrl();
  const local = path.join(BIN_DIR, name);
  if (await fileExists(local)) {
    console.log(`✓ Dùng yt-dlp có sẵn: ${local}`);
    return local;
  }
  // 3) tải binary standalone
  const { url } = ytdlpDownloadUrl();
  console.log(`⬇ Tải yt-dlp từ ${url} ...`);
  await fs.mkdir(BIN_DIR, { recursive: true });
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Không tải được yt-dlp (HTTP ${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(local, buf);
  if (os.platform() !== 'win32') await fs.chmod(local, 0o755);
  console.log(`✓ Đã tải yt-dlp vào ${local}`);
  return local;
}

async function ensureFfmpeg() {
  try {
    await execFileAsync('ffmpeg', ['-version']);
  } catch {
    throw new Error(
      'Không tìm thấy ffmpeg trong PATH. Cài ffmpeg trước:\n' +
        '  macOS:   brew install ffmpeg\n' +
        '  Ubuntu:  sudo apt install ffmpeg\n' +
        '  Windows: winget install ffmpeg  (hoặc tải từ ffmpeg.org)',
    );
  }
}

/* ---------------- library.json ---------------- */

async function loadLibrary() {
  try {
    const raw = await fs.readFile(LIB_FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function saveLibrary(lib) {
  await fs.mkdir(path.dirname(LIB_FILE), { recursive: true });
  await fs.writeFile(LIB_FILE, JSON.stringify(lib, null, 2) + '\n', 'utf8');
}

/* ---------------- main ---------------- */

function parseArgs(argv) {
  const opts = { story: '', storyId: '', file: '', cookies: '', dryRun: false, urls: [], ytdlpArgs: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--story') opts.story = argv[++i] ?? '';
    else if (a === '--story-id') opts.storyId = argv[++i] ?? '';
    else if (a === '--category') opts.category = argv[++i] ?? '';
    else if (a === '--file') opts.file = argv[++i] ?? '';
    else if (a === '--cookies') opts.cookies = argv[++i] ?? '';
    else if (a === '--ytdlp-arg') opts.ytdlpArgs.push(argv[++i] ?? '');
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a.startsWith('--')) throw new Error(`Tham số không rõ: ${a}`);
    else opts.urls.push(a);
  }
  return opts;
}

async function fetchInfo(ytdlp, url, cookies, extraArgs = []) {
  const args = ['--no-playlist', '--dump-single-json', '--no-warnings', ...extraArgs, url];
  if (cookies) args.push('--cookies', cookies);
  const { stdout } = await execFileAsync(ytdlp, args, { maxBuffer: 64 * 1024 * 1024 });
  const info = JSON.parse(stdout);
  const title = String(info.title || 'Không tên').trim();
  const duration = Math.round(Number(info.duration) || 0);
  return { title, duration };
}

async function downloadAudio(ytdlp, url, tmpPath, cookies, extraArgs = []) {
  const args = [
    '--no-playlist',
    '--no-warnings',
    ...extraArgs,
    '-f',
    'bestaudio[ext=webm]/bestaudio/best',
    '-o',
    tmpPath,
    url,
  ];
  if (cookies) args.push('--cookies', cookies);
  await execFileAsync(ytdlp, args, { maxBuffer: 64 * 1024 * 1024 });
}

async function normalizeToOpus(src, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const args = [
    '-y',
    '-hide_banner',
    '-loglevel',
    'warning',
    '-i',
    src,
    '-vn',
    '-c:a',
    'libopus',
    '-b:a',
    '48k',
    '-ac',
    '1',
    '-ar',
    '48000',
    '-application',
    'voip', // tối ưu cho giọng nói ở bitrate thấp
    '-af',
    'loudnorm=I=-16:TP=-1.5:LRA=11', // chuẩn hóa âm lượng mọi tập
    dest,
  ];
  await execFileAsync('ffmpeg', args);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  let urls = [...opts.urls];
  if (opts.file) {
    const raw = await fs.readFile(opts.file, 'utf8');
    urls.push(...raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
  }
  urls = [...new Set(urls)];
  if (urls.length === 0) {
    console.error(
      'Dùng: node tools/fetch-audio.mjs --story "Tên truyện" "<url1>" "<url2>" ...\n' +
        '   hoặc: node tools/fetch-audio.mjs --story "Tên truyện" --file urls.txt',
    );
    process.exit(1);
  }
  if (!opts.story) {
    console.error('Thiếu --story "Tên truyện". Hãy đặt tên bộ truyện rõ ràng.');
    process.exit(1);
  }
  const storyTitle = opts.story.trim();
  const storyId = (opts.storyId || slugify(storyTitle)).trim() || 'truyen';

  const ytdlp = opts.dryRun ? '(dry-run)' : await ensureYtDlp();
  if (!opts.dryRun) await ensureFfmpeg();

  const lib = await loadLibrary();
  const knownSources = new Set(lib.map((e) => e.source).filter(Boolean));
  const storyDir = path.join(AUDIO_DIR, storyId);
  const usedSlugs = new Set(
    lib.filter((e) => e.storyId === storyId).map((e) => path.basename(e.file, '.opus')),
  );

  console.log(`\nBộ truyện: ${storyTitle}  (id: ${storyId})`);
  console.log(`Số URL: ${urls.length}\n`);

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'panda-audio-'));
  let added = 0;
  let skipped = 0;

  try {
    for (const [n, url] of urls.entries()) {
      console.log(`[${n + 1}/${urls.length}] ${url}`);
      if (knownSources.has(url)) {
        console.log('  ↩ Đã có trong thư viện — bỏ qua.');
        skipped++;
        continue;
      }
      if (opts.dryRun) {
        console.log('  (dry-run) sẽ tải + chuẩn hóa.');
        continue;
      }

      let title = `Tập ${lib.filter((e) => e.storyId === storyId).length + added + 1}`;
      let duration = 0;
      try {
        const info = await fetchInfo(ytdlp, url, opts.cookies, opts.ytdlpArgs);
        if (info.title) title = info.title;
        duration = info.duration;
        console.log(`  Tiêu đề: ${title}`);
        if (duration > 0) console.log(`  Thời lượng: ${Math.round(duration / 60)} phút`);
      } catch (err) {
        console.log(`  ⚠ Không đọc được metadata (${err.message}) — vẫn tải, dùng tên mặc định.`);
      }

      let epSlug = slugify(title);
      let k = 2;
      while (usedSlugs.has(epSlug)) epSlug = `${slugify(title)}-${k++}`;
      usedSlugs.add(epSlug);

      const tmpRaw = path.join(tmpDir, `${epSlug}.raw`);
      const dest = path.join(storyDir, `${epSlug}.opus`);
      try {
        console.log('  ⬇ Đang tải audio...');
        await downloadAudio(ytdlp, url, tmpRaw, opts.cookies, opts.ytdlpArgs);
        console.log('  ⚙ Chuẩn hóa opus 48k mono...');
        await normalizeToOpus(tmpRaw, dest);
        // Lấy duration thật từ file nếu metadata thiếu
        if (!duration) {
          try {
            const { stdout } = await execFileAsync('ffprobe', [
              '-v',
              'error',
              '-show_entries',
              'format=duration',
              '-of',
              'default=noprint_wrappers=1:nokey=1',
              dest,
            ]);
            duration = Math.round(parseFloat(stdout) || 0);
          } catch {
            /* bỏ qua */
          }
        }
      } catch (err) {
        console.log(`  ✗ Lỗi: ${err.message} — bỏ qua URL này.`);
        continue;
      } finally {
        await fs.rm(tmpRaw, { force: true });
      }

      const id = `${storyId}-${epSlug}`;
      lib.push({
        id,
        storyId,
        storyTitle,
        title,
        file: `/audio/${storyId}/${epSlug}.opus`,
        duration,
        source: url,
        ...(opts.category.trim() ? { category: opts.category.trim() } : {}),
      });
      knownSources.add(url);
      added++;
      console.log(`  ✓ Xong: /audio/${storyId}/${epSlug}.opus`);
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }

  if (!opts.dryRun && added > 0) {
    await saveLibrary(lib);
    console.log(`\n✓ Đã cập nhật public/data/library.json (+${added} tập, bỏ qua ${skipped}).`);
  } else {
    console.log(`\nXong. Thêm mới: ${added}, bỏ qua: ${skipped}.`);
  }
  console.log('Chạy `npm run build` rồi deploy lại để thấy truyện mới trên web.');
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
