import React from 'react';
import { Platform, Text, View } from 'react-native';
import { getVariant } from '@/constants/branding';
import { BrandMark, Button, Card, Notice, OperationNotice, Page, Pill, SectionTitle } from '@/components/ui';
import { useBranding } from '@/state/BrandingContext';

export default function WidgetManagerScreen() {
  const { state, updateWidget, capabilities, colors } = useBranding();
  const variant = getVariant(state.variant);
  return <Page title="Home widgets" eyebrow="At a glance" trailing={<Pill label={capabilities.widgets === 'supported' ? 'NATIVE' : 'BUILD REQUIRED'} />}>
    <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>Glance and WidgetKit render this state from native storage after the app writes it. These previews show the payload; the operation status below reports whether the native write succeeded.</Text>
    <Card style={{ backgroundColor: '#20243A', borderColor: '#20243A', minHeight: 170, justifyContent: 'space-between' }}>
      <SectionTitle title="Small widget" caption="Home screen · compact" onDark />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}><BrandMark variant={state.variant} size={47} /><View style={{ gap: 4 }}><Text style={{ color: '#AEB5CE', fontSize: 10, fontWeight: '700' }}>BRANDLAB · {state.streak} DAY STREAK</Text><Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>{variant.name} mode</Text></View></View>
      <ProgressBar progress={state.dailyProgress} />
    </Card>
    <Card style={{ backgroundColor: colors.surfaceAlt, borderColor: colors.line, minHeight: 150 }}>
      <SectionTitle title="Medium widget" caption="Home screen · expanded" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><BrandMark variant={state.variant} size={54} /><View style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }}>{variant.name} today</Text><Text style={{ color: colors.muted, fontSize: 12 }}>Last activity {new Date(state.lastActivityAt).toLocaleDateString()}</Text></View><Text style={{ color: colors.accent, fontSize: 20, fontWeight: '800' }}>{Math.round(state.dailyProgress * 100)}%</Text></View>
      <ProgressBar progress={state.dailyProgress} light />
    </Card>
    <OperationNotice kinds={['widget']} successTitle="Widget refresh requested" errorTitle="Widget update did not complete" />
    <Button label="Request widget refresh" onPress={() => void updateWidget()} />
    <Card>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>Add it to your Home Screen</Text>
      <Step number="01" text="Touch and hold an empty area on the Home Screen." />
      <Step number="02" text={Platform.OS === 'ios' ? 'Tap Add (+), search for BrandLab, then choose a size.' : 'Open Widgets, find BrandLab, and choose a size.'} />
      <Step number="03" text="Place the widget. Refresh timing is controlled by iOS or the Android launcher." />
    </Card>
    <Notice title="Refresh limits" body="A refresh request asks the platform to reload widget data. WidgetKit timelines and Android launcher scheduling can delay rendering; neither platform guarantees immediate or unrestricted updates." />
  </Page>;
}

function ProgressBar({ progress, light = false }: { progress: number; light?: boolean }) {
  const { colors } = useBranding();
  return <View style={{ height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: light ? colors.line : '#3B4059' }}><View style={{ width: `${Math.round(progress * 100)}%`, height: 8, borderRadius: 99, backgroundColor: light ? colors.accent : '#D8D1FF' }} /></View>;
}

function Step({ number, text }: { number: string; text: string }) {
  const { colors } = useBranding();
  return <View style={{ flexDirection: 'row', gap: 11, alignItems: 'flex-start' }}><Pill label={number} /><Text style={{ flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 }}>{text}</Text></View>;
}
