import React from 'react';
import { Text, View } from 'react-native';
import { BRANDING_VARIANTS, getVariant } from '@/constants/branding';
import { BrandMark, Button, Card, Notice, OperationNotice, Page, Pill } from '@/components/ui';
import { useBranding } from '@/state/BrandingContext';
import type { BrandingVariant } from '@/types/branding';

export default function IconManagerScreen() {
  const { state, launcherVariant, chooseVariant, capabilities, colors } = useBranding();
  return <Page title="Launcher icons" eyebrow="Make your mark">
    <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>Five original BrandLab moods. Applying a variant calls the platform launcher API; it won’t be reported as applied if the native call fails.</Text>
    <OperationNotice kinds={['icon']} successTitle="Icon change requested" errorTitle="Could not apply the native icon" />
    {BRANDING_VARIANTS.map((item) => <IconCard key={item.id} variant={item.id} active={state.variant === item.id} applied={launcherVariant === item.id} onApply={chooseVariant} />)}
    <Notice title="Platform behavior" body={capabilities.platform === 'ios'
      ? 'iOS switches only among alternate icons compiled into this app. iOS may show a system confirmation when the icon changes.'
      : 'Android enables the matching activity-alias launcher entry. Launcher caching can delay the new artwork appearing.'} />
  </Page>;
}

function IconCard({ variant, active, applied, onApply }: { variant: BrandingVariant; active: boolean; applied: boolean; onApply: (variant: BrandingVariant) => Promise<void> }) {
  const item = getVariant(variant);
  const { colors } = useBranding();
  return <Card>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <BrandMark variant={variant} size={64} />
      <View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>{item.name}</Text><Text style={{ color: colors.muted, fontSize: 12 }}>{item.description}</Text></View>
      {applied ? <Pill label="ON LAUNCHER" /> : active ? <Pill label="SELECTED" /> : null}
    </View>
    {!applied && <Button label={`Apply ${item.name}`} onPress={() => void onApply(variant)} />}
  </Card>;
}
