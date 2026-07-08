import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vishwaleader.app',
  appName: 'VishwaLeader',
  webDir: 'public',
  server: {
    url: 'https://vishwaleader.com',
    cleartext: true
  }
};

export default config;
