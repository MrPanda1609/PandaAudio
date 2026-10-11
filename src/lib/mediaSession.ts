import type { Episode } from '../types';

export interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeekBy: (delta: number) => void;
  onSeekTo: (t: number) => void;
}

const ARTWORK = [
  { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
  { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
  { src: '/icons/panda.svg', sizes: 'any', type: 'image/svg+xml' },
];

function supported(): boolean {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator;
}

/**
 * Gắn Media Session API: hiện tên truyện/tập + artwork trên màn hình khóa,
 * cho phép điều khiển play/pause/tua từ tai nghe, màn hình khóa, notification.
 * Đây là chìa khóa để Chrome Android giữ audio chạy dưới nền.
 */
export function setupMediaSession(
  audio: HTMLAudioElement,
  episode: Episode,
  h: MediaSessionHandlers,
): void {
  if (!supported()) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: episode.title,
      artist: episode.storyTitle,
      album: 'PandaAudio',
      artwork: ARTWORK,
    });

    navigator.mediaSession.setActionHandler('play', h.onPlay);
    navigator.mediaSession.setActionHandler('pause', h.onPause);
    navigator.mediaSession.setActionHandler('previoustrack', h.onPrev);
    navigator.mediaSession.setActionHandler('nexttrack', h.onNext);
    navigator.mediaSession.setActionHandler('seekbackward', (d) =>
      h.onSeekBy(-(d.seekOffset ?? 10)),
    );
    navigator.mediaSession.setActionHandler('seekforward', (d) =>
      h.onSeekBy(d.seekOffset ?? 10),
    );
    navigator.mediaSession.setActionHandler('seekto', (d) => {
      if (typeof d.seekTime === 'number') h.onSeekTo(d.seekTime);
    });

    // Báo vị trí để màn hình khóa hiện progress bar đúng
    updatePositionState(audio);
  } catch {
    /* trình duyệt không hỗ trợ đầy đủ — bỏ qua */
  }
}

export function updatePositionState(audio: HTMLAudioElement): void {
  if (!supported()) return;
  try {
    const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
    if (dur > 0 && 'setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: dur,
        playbackRate: audio.playbackRate,
        position: Math.min(audio.currentTime, dur),
      });
    }
  } catch {
    /* ignore */
  }
}

export function clearMediaSession(): void {
  if (!supported()) return;
  try {
    navigator.mediaSession.metadata = null;
    const actions = [
      'play',
      'pause',
      'previoustrack',
      'nexttrack',
      'seekbackward',
      'seekforward',
      'seekto',
    ] as const;
    for (const a of actions) {
      try {
        navigator.mediaSession.setActionHandler(a, null);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}
