import React from 'react';
import { Image, Pressable, ScrollView, Text, View, type ViewProps } from 'react-native';
import { Link } from 'expo-router';
import { getVariant } from '@/constants/branding';
import { useBranding, useOperationStatus, type OperationKind } from '@/state/BrandingContext';
import type { BrandingVariant } from '@/types/branding';

export function Page({ children, title, eyebrow, trailing }: React.PropsWithChildren<{ title: string; eyebrow?: string; trailing?: React.ReactNode }>) {
  const { colors } = useBranding();
  return <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 22, paddingBottom: 34, gap: 18 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12 }}>
      <View style={{ flex: 1, gap: 5 }}>
        {!!eyebrow && <Text style={{ color: colors.accent, fontSize: 11, letterSpacing: 1.5, fontWeight: '800' }}>{eyebrow.toUpperCase()}</Text>}
        <Text style={{ color: colors.text, fontSize: 29, fontWeight: '800', letterSpacing: -0.8 }}>{title}</Text>
      </View>
      {trailing}
    </View>
    {children}
  </ScrollView>;
}

export function Card({ children, style }: React.PropsWithChildren<{ style?: ViewProps['style'] }>) {
  const { colors } = useBranding();
  return <View style={[{ backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 24, padding: 18, gap: 14, boxShadow: `0 8px 24px ${colors.shadow}` }, style]}>{children}</View>;
}

export function BrandMark({ variant, size = 58 }: { variant: BrandingVariant; size?: number }) {
  const source = {
    default: require('../../assets/icons/default.png'),
    happy: require('../../assets/icons/happy.png'),
    sleepy: require('../../assets/icons/sleepy.png'),
    sad: require('../../assets/icons/sad.png'),
    celebration: require('../../assets/icons/celebration.png'),
  }[variant];
  return <Image source={source} accessibilityLabel={`${variant} BrandLab app icon`} style={{ width: size, height: size, borderRadius: size * 0.28 }} />;
}

export function SectionTitle({ title, caption, action, onDark = false }: { title: string; caption?: string; action?: React.ReactNode; onDark?: boolean }) {
  const { colors } = useBranding();
  return <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <View style={{ flex: 1, gap: 3 }}><Text style={{ color: onDark ? '#FFFFFF' : colors.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>{!!caption && <Text style={{ color: onDark ? '#AEB5CE' : colors.muted, fontSize: 12 }}>{caption}</Text>}</View>
    {action}
  </View>;
}

export function Button({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  const { colors } = useBranding();
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled} style={{ minHeight: 46, paddingHorizontal: 16, borderRadius: 15, backgroundColor: secondary ? colors.surfaceAlt : colors.accent, borderWidth: secondary ? 1 : 0, borderColor: colors.line, justifyContent: 'center', alignItems: 'center', opacity: disabled ? 0.5 : 1 }}>
    <Text style={{ color: secondary ? colors.text : '#FFFFFF', fontSize: 13, fontWeight: '700' }}>{label}</Text>
  </Pressable>;
}

export function Pill({ label, tint }: { label: string; tint?: string }) {
  const { colors } = useBranding();
  return <View style={{ backgroundColor: tint ?? colors.accentSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 }}><Text style={{ color: tint ? '#FFFFFF' : colors.accent, fontSize: 10, fontWeight: '800' }}>{label}</Text></View>;
}

export function Notice({ title, body, tone = 'info' }: { title: string; body: string; tone?: 'info' | 'error' | 'success' }) {
  const { colors } = useBranding();
  const color = tone === 'error' ? colors.danger : tone === 'success' ? colors.success : colors.accent;
  return <View accessibilityLiveRegion="polite" style={{ backgroundColor: `${color}14`, borderColor: `${color}42`, borderWidth: 1, padding: 14, borderRadius: 17, gap: 4 }}>
    <Text style={{ color, fontSize: 13, fontWeight: '800' }}>{title}</Text>
    <Text style={{ color: colors.text, fontSize: 12, lineHeight: 18 }}>{body}</Text>
  </View>;
}

/** Shows the latest native result, but only for operations started from this screen. */
export function OperationNotice({ kinds, successTitle, errorTitle }: { kinds: OperationKind[]; successTitle: string; errorTitle: string }) {
  const status = useOperationStatus(...kinds);
  if (!status) return null;
  return <Notice title={status.ok ? successTitle : errorTitle} body={status.message} tone={status.ok ? 'success' : 'error'} />;
}

export function RouteLink({ href, label, detail, icon = '↗' }: { href: '/icons' | '/widgets' | '/simulate' | '/settings' | '/app-name'; label: string; detail: string; icon?: string }) {
  const { colors } = useBranding();
  return <Link href={href} asChild><Pressable style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 }}>
    <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.accent, fontSize: 17, fontWeight: '800' }}>{icon}</Text></View>
    <View style={{ flex: 1, gap: 2 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{label}</Text><Text style={{ color: colors.muted, fontSize: 11 }}>{detail}</Text></View>
    <Text style={{ color: colors.muted, fontSize: 20 }}>›</Text>
  </Pressable></Link>;
}

export function Divider() {
  const { colors } = useBranding();
  return <View style={{ height: 1, backgroundColor: colors.line }} />;
}
