import React from 'react';
import { Text, View } from 'react-native';
import { BRANDING_VARIANTS, getVariant } from '@/constants/branding';
import { BrandMark, Card, Divider, Notice, Page, Pill, RouteLink, SectionTitle } from '@/components/ui';
import { useBranding } from '@/state/BrandingContext';

export default function DashboardScreen() {
  const { state, colors, capabilities, status, launcherVariant } = useBranding();
  const variant = getVariant(state.variant);
  const launcherIcon = getVariant(launcherVariant ?? 'default');
  const date = new Date(state.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  return <Page title="BrandLab" eyebrow="Dynamic branding studio" trailing={<Pill label={capabilities.platform.toUpperCase()} />}>
    <Card style={{ padding: 20, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
        <BrandMark variant={launcherIcon.id} size={74} />
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{capabilities.nativeModuleAvailable ? 'LAUNCHER ICON' : 'ICON PREVIEW'}</Text>
          <Text style={{ color: colors.text, fontSize: 23, fontWeight: '800' }}>{capabilities.nativeModuleAvailable ? launcherIcon.name : variant.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{capabilities.nativeModuleAvailable ? 'Reported by the native launcher API.' : 'The native icon will update in a development build.'}</Text>
        </View>
      </View>
      <Divider />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Metric label="App name" value={state.appName} colors={colors} />
        <Metric label="Daily progress" value={`${Math.round(state.dailyProgress * 100)}%`} colors={colors} />
        <Metric label="Streak" value={`${state.streak} days`} colors={colors} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.muted, fontSize: 11 }}>Updated {date}</Text>
        <Pill label={!capabilities.nativeModuleAvailable ? 'BUILD REQUIRED' : status && !status.ok ? 'LAST REQUEST FAILED' : 'READY'} />
      </View>
    </Card>

    {status && !status.ok && <Notice title="Native operation needs attention" body={status.message} tone="error" />}
    {!capabilities.nativeModuleAvailable && <Notice title="Development build required" body="Launcher icons and widgets call native platform APIs. Expo Go cannot run those native integrations; build BrandLab with the instructions in README.md." />}

    <Card>
      <SectionTitle title="Studio shortcuts" caption="Tune how BrandLab shows up on a device" />
      <RouteLink href="/icons" label="Launcher icon" detail={`${BRANDING_VARIANTS.length} original variants`} icon="✦" />
      <Divider />
      <RouteLink href="/app-name" label="App display name" detail="Platform-aware name presets" icon="Aa" />
      <Divider />
      <RouteLink href="/widgets" label="Home screen widgets" detail="Small and medium previews" icon="▦" />
      <Divider />
      <RouteLink href="/simulate" label="Engagement simulator" detail="Preview activity-based branding" icon="↗" />
    </Card>
  </Page>;
}

function Metric({ label, value, colors }: { label: string; value: string; colors: { text: string; muted: string } }) {
  return <View style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.muted, fontSize: 10 }}>{label}</Text><Text numberOfLines={1} style={{ color: colors.text, fontWeight: '700', fontSize: 12 }}>{value}</Text></View>;
}
