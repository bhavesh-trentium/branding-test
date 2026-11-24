import React from 'react';
import { Text, View } from 'react-native';
import { Button, Card, Divider, Notice, Page, Pill, RouteLink } from '@/components/ui';
import { useBranding } from '@/state/BrandingContext';
import type { PlatformCapabilities, ThemePreference } from '@/types/branding';

const capabilityLabel: Record<PlatformCapabilities['nameSwitch'], string> = {
  supported: 'Supported', 'partially-supported': 'Partial', 'requires-configuration': 'Config needed', 'requires-rebuild': 'Rebuild needed', unavailable: 'Unavailable',
};

export default function SettingsScreen() {
  const { state, setTheme, capabilities, colors } = useBranding();
  const options: ThemePreference[] = ['system', 'light', 'dark'];
  return <Page title="Settings" eyebrow="Project controls">
    <Card>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>Appearance</Text>
      <Text style={{ color: colors.muted, fontSize: 12 }}>Choose how BrandLab follows the light.</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>{options.map((option) => <View key={option} style={{ flex: 1 }}><Button label={option[0].toUpperCase() + option.slice(1)} secondary={state.theme !== option} onPress={() => void setTheme(option)} /></View>)}</View>
    </Card>
    <Card>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>Platform capabilities</Text>
      <Capability label="Launcher icons" value={capabilityLabel[capabilities.iconSwitch]} colors={colors} />
      <Capability label="Display name" value={capabilityLabel[capabilities.nameSwitch]} colors={colors} />
      <Capability label="Home screen widgets" value={capabilityLabel[capabilities.widgets]} colors={colors} />
      <Capability label="Native module" value={capabilities.nativeModuleAvailable ? 'Available' : 'Development build required'} colors={colors} />
      <Notice title={capabilities.platform.toUpperCase()} body={capabilities.explanation} />
    </Card>
    <Card>
      <RouteLink href="/app-name" label="App display name" detail="Review platform-specific name support" icon="Aa" />
      <Divider />
      <RouteLink href="/widgets" label="Widget setup" detail="Preview and add a native widget" icon="▦" />
    </Card>
    <Card style={{ backgroundColor: colors.surfaceAlt, borderColor: colors.surfaceAlt }}>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>Build configuration</Text>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Native integrations are linked into a development build. After changing app configuration, regenerate and rebuild the native targets.</Text>
    </Card>
  </Page>;
}

function Capability({ label, value, colors }: { label: string; value: string; colors: { text: string; muted: string } }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><Text style={{ color: colors.text, fontSize: 13 }}>{label}</Text><Pill label={value.toUpperCase()} /></View>;
}
