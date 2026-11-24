const fs = require('node:fs/promises');
const path = require('node:path');
const {
  withAndroidManifest,
  withDangerousMod,
  withXcodeProject,
} = require('expo/config-plugins');

const variants = ['default', 'happy', 'sleepy', 'sad', 'celebration'];
const namePresets = [
  { key: 'default', label: 'BrandLab' },
  { key: 'active', label: 'BrandLab Active' },
  { key: 'focus', label: 'BrandLab Focus' },
  { key: 'celebration', label: 'BrandLab Celebration' },
];
const androidDensities = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];

function withLauncherAliases(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults;
    const application = manifest.manifest.application?.[0];
    if (!application) throw new Error('[BrandLab] Android application node was not found.');
    const activities = application.activity ?? [];
    const mainActivity = activities.find((item) => String(item.$?.['android:name'] ?? '').endsWith('.MainActivity'));
    if (!mainActivity) throw new Error('[BrandLab] MainActivity was not found in AndroidManifest.xml.');
    const targetActivity = mainActivity.$['android:name'];

    mainActivity['intent-filter'] = (mainActivity['intent-filter'] ?? []).filter((filter) => {
      const hasMain = (filter.action ?? []).some((item) => item.$?.['android:name'] === 'android.intent.action.MAIN');
      const hasLauncher = (filter.category ?? []).some((item) => item.$?.['android:name'] === 'android.intent.category.LAUNCHER');
      return !(hasMain && hasLauncher);
    });
    if (!mainActivity['intent-filter'].length) delete mainActivity['intent-filter'];

    application['activity-alias'] = (application['activity-alias'] ?? []).filter(
      (item) => !String(item.$?.['android:name'] ?? '').includes('.BrandLab_'),
    );
    for (const variant of variants) {
      for (const name of namePresets) {
        const isDefault = variant === 'default' && name.key === 'default';
        application['activity-alias'].push({
          $: {
            'android:name': `.BrandLab_${variant}_${name.key}`,
            'android:enabled': String(isDefault),
            'android:exported': 'true',
            'android:icon': `@mipmap/brandlab_${variant}`,
            'android:label': `@string/brandlab_name_${name.key}`,
            'android:targetActivity': targetActivity,
          },
          'intent-filter': [{
            action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
            category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
          }],
        });
      }
    }

    application.receiver = (application.receiver ?? []).filter(
      (item) => item.$?.['android:name'] !== 'expo.modules.dynamicbranding.BrandLabWidgetReceiver',
    );
    application.receiver.push({
      $: { 'android:name': 'expo.modules.dynamicbranding.BrandLabWidgetReceiver', 'android:exported': 'true', 'android:label': 'BrandLab' },
      'intent-filter': [{ action: [{ $: { 'android:name': 'android.appwidget.action.APPWIDGET_UPDATE' } }] }],
      'meta-data': [{ $: { 'android:name': 'android.appwidget.provider', 'android:resource': '@xml/brandlab_widget_info' } }],
    });
    return mod;
  });
}

function withBrandLabResources(config) {
  return withDangerousMod(config, ['android', async (mod) => {
    const projectRoot = mod.modRequest.projectRoot;
    const appRoot = path.join(projectRoot, 'android', 'app', 'src', 'main');
    const valuesDir = path.join(appRoot, 'res', 'values');
    const xmlDir = path.join(appRoot, 'res', 'xml');
    await fs.mkdir(valuesDir, { recursive: true });
    await fs.mkdir(xmlDir, { recursive: true });

    const strings = namePresets.map((item) => `  <string name="brandlab_name_${item.key}">${item.label}</string>`).join('\n');
    await fs.writeFile(path.join(valuesDir, 'brandlab.xml'), `<resources>\n${strings}\n  <string name="brandlab_widget_description">Your BrandLab activity and daily progress.</string>\n</resources>\n`);
    await fs.writeFile(path.join(xmlDir, 'brandlab_widget_info.xml'), `<?xml version="1.0" encoding="utf-8"?>\n<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"\n  android:description="@string/brandlab_widget_description"\n  android:initialLayout="@layout/glance_default_loading_layout"\n  android:minWidth="180dp"\n  android:minHeight="110dp"\n  android:targetCellWidth="2"\n  android:targetCellHeight="1"\n  android:resizeMode="horizontal|vertical"\n  android:updatePeriodMillis="0"\n  android:widgetCategory="home_screen" />\n`);

    for (const density of androidDensities) {
      const dir = path.join(appRoot, 'res', density);
      await fs.mkdir(dir, { recursive: true });
      for (const variant of variants) {
        const source = path.join(projectRoot, 'assets', 'icons', 'android', density, `brandlab_${variant}.png`);
        await fs.copyFile(source, path.join(dir, `brandlab_${variant}.png`));
      }
    }
    return mod;
  }]);
}

function withAlternateIcons(config) {
  return withDangerousMod(config, ['ios', async (mod) => {
    const projectRoot = mod.modRequest.projectRoot;
    const iosRoot = path.join(projectRoot, 'ios');
    const entries = await fs.readdir(iosRoot, { withFileTypes: true });
    const appDirectory = entries.find((entry) => entry.isDirectory() && entry.name !== 'Pods' && entry.name !== 'build');
    if (!appDirectory) throw new Error('[BrandLab] iOS application directory was not found.');
    const assets = path.join(iosRoot, appDirectory.name, 'Images.xcassets');
    for (const variant of variants.slice(1)) {
      const setName = `AppIcon-${variant[0].toUpperCase()}${variant.slice(1)}`;
      const setPath = path.join(assets, `${setName}.appiconset`);
      await fs.mkdir(setPath, { recursive: true });
      await fs.copyFile(path.join(projectRoot, 'assets', 'icons', `${variant}.png`), path.join(setPath, `${setName}.png`));
      await fs.writeFile(path.join(setPath, 'Contents.json'), JSON.stringify({
        images: [{ filename: `${setName}.png`, idiom: 'universal', platform: 'ios', size: '1024x1024' }],
        info: { author: 'xcode', version: 1 },
      }, null, 2));
    }
    return mod;
  }]);
}

function withAlternateIconBuildSetting(config) {
  return withXcodeProject(config, (mod) => {
    const alternateNames = variants.slice(1).map((variant) => `AppIcon-${variant[0].toUpperCase()}${variant.slice(1)}`).join(' ');
    mod.modResults.addBuildProperty('ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES', `"${alternateNames}"`);
    return mod;
  });
}

module.exports = (config) => {
  config = withLauncherAliases(config);
  config = withBrandLabResources(config);
  config = withAlternateIcons(config);
  config = withAlternateIconBuildSetting(config);
  return config;
};
