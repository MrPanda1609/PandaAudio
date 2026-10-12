import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.panda.audio',
  appName: 'PandaAudio',
  webDir: 'dist',
  android: {
    // Cho phép WebView phát audio dưới nền
    allowMixedContent: true,
  },
};

export default config;
