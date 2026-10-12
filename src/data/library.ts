import type { Episode, Story } from '../types';
import { getProgress } from '../lib/storage';
import { isNativeApp } from '../lib/appUrls';

function isEpisode(x: unknown): x is Episode {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.storyId === 'string' &&
    typeof o.storyTitle === 'string' &&
    typeof o.title === 'string' &&
    typeof o.file === 'string' &&
    typeof o.duration === 'number'
  );
}

/** Đọc thư viện từ public/data/library.json — graceful khi file rỗng/lỗi.
 *  Trong app native: ưu tiên tải từ server để tự cập nhật truyện mới. */
export async function loadLibrary(): Promise<Episode[]> {
  const urls = isNativeApp()
    ? ['https://panda-audio.vercel.app/data/library.json', '/data/library.json']
    : ['/data/library.json'];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data: unknown = await res.json();
      if (!Array.isArray(data)) continue;
      const eps = data.filter(isEpisode);
      if (eps.length > 0) return eps;
    } catch {
      /* thử URL tiếp theo */
    }
  }
  return [];
}

/** Gom các tập thành từng bộ truyện, sắp xếp theo thứ tự thêm vào. */
export function groupStories(episodes: Episode[]): Story[] {
  const map = new Map<string, Story>();
  for (const ep of episodes) {
    let story = map.get(ep.storyId);
    if (!story) {
      story = { id: ep.storyId, title: ep.storyTitle, episodes: [], totalDuration: 0 };
      map.set(ep.storyId, story);
    }
    story.episodes.push(ep);
    story.totalDuration += ep.duration || 0;
  }
  return [...map.values()];
}

export interface ContinueItem {
  episode: Episode;
  /** giây đã nghe tới */
  t: number;
  at: number;
}

/**
 * "Nghe tiếp": các tập đang nghe dở (đã qua 10s, chưa gần hết),
 * sắp xếp theo lần nghe gần nhất.
 */
export function getContinueList(episodes: Episode[], limit = 10): ContinueItem[] {
  const out: ContinueItem[] = [];
  for (const ep of episodes) {
    const p = getProgress(ep.id);
    if (!p) continue;
    const dur = ep.duration || 0;
    if (p.t > 10 && (dur === 0 || p.t < dur - 20)) {
      out.push({ episode: ep, t: p.t, at: p.at });
    }
  }
  out.sort((a, b) => b.at - a.at);
  return out.slice(0, limit);
}

/** Màu gradient artwork cho mỗi truyện — hash từ storyId, không cần ảnh. */
export function storyHue(storyId: string): number {
  let h = 0;
  for (let i = 0; i < storyId.length; i++) {
    h = (h * 31 + storyId.charCodeAt(i)) % 360;
  }
  return h;
}

/** Màu theo chủ đề — đồng nhất cả app: nhìn màu là biết thể loại. */
const CATEGORY_HUES: Record<string, number> = {
  'Xuyên không': 268, // tím
  'Báo thù': 4, // đỏ
  'Mẹ chồng – Nàng dâu': 24, // cam
  'Viễn tưởng': 210, // xanh dương
};

export function categoryHue(name?: string): number {
  if (name && CATEGORY_HUES[name] !== undefined) return CATEGORY_HUES[name];
  return storyHue(name ?? 'khac');
}

export const UNCATEGORIZED = 'Khác';

export interface CategoryInfo {
  name: string;
  episodes: Episode[];
  stories: Story[];
  totalDuration: number;
}

/** Gom tập theo chủ đề (category), sắp xếp theo thứ tự ưu tiên. */
export function getCategories(episodes: Episode[]): CategoryInfo[] {
  const map = new Map<string, Episode[]>();
  for (const ep of episodes) {
    const c = (ep.category || '').trim() || UNCATEGORIZED;
    if (!map.has(c)) map.set(c, []);
    map.get(c)!.push(ep);
  }
  // Thứ tự ưu tiên theo gu của user; chủ đề mới tự thêm sẽ xếp sau theo A-Z
  const PREFERRED = ['Xuyên không', 'Viễn tưởng', 'Mẹ chồng – Nàng dâu', 'Báo thù'];
  const names = [...map.keys()].sort((a, b) => {
    const ia = PREFERRED.indexOf(a);
    const ib = PREFERRED.indexOf(b);
    const ra = ia === -1 ? 999 : ia;
    const rb = ib === -1 ? 999 : ib;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b, 'vi');
  });
  return names.map((name) => {
    const eps = map.get(name)!;
    return {
      name,
      episodes: eps,
      stories: groupStories(eps),
      totalDuration: eps.reduce((s, e) => s + (e.duration || 0), 0),
    };
  });
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * "Nghe gì hôm nay?" — gợi ý đổi mỗi ngày (seed theo ngày, deterministic):
 * ưu tiên 2 tập đang nghe dở, còn lại xáo trộn theo ngày.
 */
export function getTodayPicks(episodes: Episode[], count = 8): Episode[] {
  if (episodes.length === 0) return [];
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const rand = mulberry32(hashStr(`panda-audio:${today}`));
  const shuffled = [...episodes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const contIds = new Set(getContinueList(episodes, 2).map((c) => c.episode.id));
  const first = shuffled.filter((e) => contIds.has(e.id));
  const rest = shuffled.filter((e) => !contIds.has(e.id));
  return [...first, ...rest].slice(0, count);
}

/** Truyện mới cập nhật — sắp xếp theo addedAt mới nhất, mỗi truyện 1 đại diện.
 *  Nếu cùng ngày, truyện thêm sau (nằm sau trong mảng) xếp trước. */
export function getRecentStories(episodes: Episode[], count = 8): Story[] {
  const stories = groupStories(episodes);
  const latest = (s: Story) =>
    s.episodes.reduce((max, e) => (e.addedAt && e.addedAt > max ? e.addedAt : max), '');
  const firstIdx = (s: Story) => episodes.findIndex((e) => e.storyId === s.id);
  return stories
    .slice()
    .sort((a, b) => latest(b).localeCompare(latest(a)) || firstIdx(b) - firstIdx(a))
    .slice(0, count);
}

/** Story có phải "mới" (thêm trong 14 ngày gần đây) — để gắn badge MỚI. */
export function isNewStory(episodes: Episode[]): boolean {
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const now = new Date().toISOString().slice(0, 10);
  return episodes.some((e) => e.addedAt && e.addedAt >= twoWeeksAgo && e.addedAt <= now);
}
