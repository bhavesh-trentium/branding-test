module.exports = (config) => ({
  type: 'widget',
  name: 'BrandLabWidget',
  displayName: 'BrandLab',
  bundleIdentifier: '.widget',
  deploymentTarget: '17.0',
  frameworks: ['WidgetKit', 'SwiftUI'],
  entitlements: {
    'com.apple.security.application-groups': ['group.com.brandlab.demo'],
  },
});
