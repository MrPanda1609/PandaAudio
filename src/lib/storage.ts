import type { ProgressEntry } from '../types';

const PROGRESS_KEY = 'panda-audio:progress:v1';
const RATE_KEY = 'panda-audio:rate:v1';

type ProgressMap = Record<string, ProgressEntry>;

function readProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ProgressMap;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let pending: ProgressMap | null = null;

/** Ghi progress với debounce 1s để không spam localStorage mỗi timeupdate */
export function saveProgress(episodeId: string, t: number): void {
  try {
    if (!pending) pending = readProgress();
    pending[episodeId] = { t: Math.floor(t), at: Date.now() };
    if (writeTimer) return;
    writeTimer = setTimeout(() => {
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(pending));
      } catch {
        /* bộ nhớ đầy — bỏ qua */
      }
      pending = null;
      writeTimer = null;
    }, 1000);
  } catch {
    /* ignore */
  }
}

export function getProgress(episodeId: string): ProgressEntry | null {
  const map = readProgress();
  return map[episodeId] ?? null;
}

export function clearProgress(episodeId: string): void {
  try {
    const map = readProgress();
    delete map[episodeId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Ghi ngay lập tức (khi pause / chuyển tập / đóng trang) */
export function flushProgress(episodeId: string, t: number): void {
  try {
    if (writeTimer) {
      clearTimeout(writeTimer);
      writeTimer = null;
    }
    const map = pending ?? readProgress();
    map[episodeId] = { t: Math.floor(t), at: Date.now() };
    pending = null;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function loadRate(): number {
  try {
    const raw = localStorage.getItem(RATE_KEY);
    const v = raw ? parseFloat(raw) : 1;
    return [0.75, 1, 1.25, 1.5, 1.75, 2].includes(v) ? v : 1;
  } catch {
    return 1;
  }
}

export function saveRate(v: number): void {
  try {
    localStorage.setItem(RATE_KEY, String(v));
  } catch {
    /* ignore */
  }
}
