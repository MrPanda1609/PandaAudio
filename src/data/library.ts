import type { Episode, Story } from '../types';
import { getProgress } from '../lib/storage';

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

/** Đọc thư viện từ public/data/library.json — graceful khi file rỗng/lỗi. */
export async function loadLibrary(): Promise<Episode[]> {
  try {
    const res = await fetch('/data/library.json', { cache: 'no-store' });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data.filter(isEpisode);
  } catch {
    return [];
  }
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
