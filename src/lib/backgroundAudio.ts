import { Capacitor } from '@capacitor/core';

interface BackgroundAudioPlugin {
  enable(opts: { title?: string; text?: string }): Promise<{ enabled: boolean }>;
  disable(): Promise<{ enabled: boolean }>;
}

function getPlugin(): BackgroundAudioPlugin | null {
  if (!Capacitor.isNativePlatform()) return null;
  const plugins = (Capacitor as unknown as { Plugins: Record<string, unknown> }).Plugins;
  return (plugins?.BackgroundAudio as BackgroundAudioPlugin) ?? null;
}

/**
 * Bật/tắt foreground service giữ audio dưới nền (chỉ có tác dụng trong app Android).
 * Trên web: không làm gì.
 */
export async function setBackgroundAudio(enabled: boolean, title?: string, text?: string) {
  const plugin = getPlugin();
  if (!plugin) return;
  try {
    if (enabled) await plugin.enable({ title, text });
    else await plugin.disable();
  } catch {
    /* bỏ qua khi plugin lỗi */
  }
}
