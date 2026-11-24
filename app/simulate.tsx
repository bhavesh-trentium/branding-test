import React from 'react';
import { Text, View } from 'react-native';
import { ENGAGEMENT_ACTIONS, getVariant } from '@/constants/branding';
import { BrandMark, Button, Card, OperationNotice, Page, Pill } from '@/components/ui';
import { useBranding } from '@/state/BrandingContext';
import type { BrandingVariant } from '@/types/branding';

export default function EngagementSimulatorScreen() {
  const { state, runEngagement, colors } = useBranding();
  const activeVariant = getVariant(state.variant);
  return <Page title="Engagement lab" eyebrow="Simulate a day">
    <Card style={{ backgroundColor: colors.accent, borderColor: colors.accent }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}><BrandMark variant={state.variant} size={58} /><View style={{ flex: 1, gap: 4 }}><Text style={{ color: '#E9E6FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>CURRENT BRANDING</Text><Text style={{ color: '#FFFFFF', fontSize: 21, fontWeight: '800' }}>{activeVariant.name}</Text></View><Pill label={`${state.streak} DAY STREAK`} tint="#584BB5" /></View>
      <Text style={{ color: '#EFEDFF', fontSize: 12, lineHeight: 18 }}>Choose a scenario. BrandLab updates the engagement data, saves it, writes widget data, and requests a launcher icon change.</Text>
    </Card>
    <OperationNotice kinds={['scenario']} successTitle="Scenario applied" errorTitle="Scenario saved with native limitation" />
    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>Choose a scenario</Text>
    {ENGAGEMENT_ACTIONS.map((action) => <Scenario key={action.id} title={action.title} detail={action.detail} variant={action.variant} onPress={() => void runEngagement(action.id)} />)}
  </Page>;
}

function Scenario({ title, detail, variant, onPress }: { title: string; detail: string; variant: BrandingVariant; onPress: () => void }) {
  const { colors, state } = useBranding();
  const meta = getVariant(variant);
  return <Card style={{ padding: 14 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><BrandMark variant={variant} size={46} /><View style={{ flex: 1, gap: 4 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '800' }}>{title}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>{detail} · {meta.name}</Text></View>{state.variant === variant && <Pill label="ACTIVE" />}</View><Button label="Run scenario" secondary onPress={onPress} /></Card>;
}
