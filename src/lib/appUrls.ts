import { Capacitor } from '@capacitor/core';

/**
 * Base URL cho file audio/thumbnail khi chạy trong app native.
 * Web: dùng relative path (cùng domain).
 * App: audio stream từ server Vercel, không đóng gói vào APK.
 */
const AUDIO_HOST = 'https://panda-audio.vercel.app';

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/** Resolve đường dẫn audio thành URL đầy đủ. */
export function resolveAudioUrl(path: string): string {
  if (!path) return path;
  // Đã là URL tuyệt đối thì giữ nguyên (dùng cho R2 sau này)
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (isNativeApp()) {
    return AUDIO_HOST + (path.startsWith('/') ? path : '/' + path);
  }
  return path;
}

/** Resolve đường dẫn thumbnail/artwork. */
export function resolveArtUrl(path: string): string {
  return resolveAudioUrl(path);
}
