import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'BrandLab',
  slug: 'brandlab',
  scheme: 'brandlab',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icons/default.png',
  ios: {
    bundleIdentifier: 'com.brandlab.demo',
    supportsTablet: true,
    entitlements: {
      'com.apple.security.application-groups': ['group.com.brandlab.demo'],
    },
    infoPlist: {
      CFBundleDisplayName: 'BrandLab',
      NSAppTransportSecurity: { NSAllowsArbitraryLoads: false },
    },
  },
  android: {
    package: 'com.brandlab.demo',
    adaptiveIcon: {
      foregroundImage: './assets/icons/android-foreground.png',
      backgroundColor: '#F2F3F7',
    },
  },
  plugins: [
    'expo-router',
    'expo-dev-client',
    'expo-system-ui',
    '@bacons/apple-targets',
    './plugins/with-brandlab-native',
  ],
  experiments: { typedRoutes: true },
};

export default config;
