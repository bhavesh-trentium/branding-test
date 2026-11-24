import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BrandingProvider, useBranding } from '@/state/BrandingContext';

function Navigation() {
  const { colors, dark } = useBranding();
  return <>
    <StatusBar style={dark ? 'light' : 'dark'} />
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.muted,
      // No fixed height/padding: React Navigation adds the bottom safe-area inset (Android nav buttons, iOS home indicator).
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <TabGlyph glyph="⌂" color={String(color ?? '#7465E8')} /> }} />
      <Tabs.Screen name="icons" options={{ title: 'Icons', tabBarIcon: ({ color }) => <TabGlyph glyph="✦" color={String(color ?? '#7465E8')} /> }} />
      <Tabs.Screen name="widgets" options={{ title: 'Widgets', tabBarIcon: ({ color }) => <TabGlyph glyph="▦" color={String(color ?? '#7465E8')} /> }} />
      <Tabs.Screen name="simulate" options={{ title: 'Activity', tabBarIcon: ({ color }) => <TabGlyph glyph="↗" color={String(color ?? '#7465E8')} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'More', tabBarIcon: ({ color }) => <TabGlyph glyph="•••" color={String(color ?? '#7465E8')} /> }} />
      {/* Hidden from the tab bar but still routable. `href: null` blocks navigation to the screen. */}
      <Tabs.Screen name="app-name" options={{ title: 'App name', tabBarButton: () => null, tabBarItemStyle: { display: 'none' } }} />
    </Tabs>
  </>;
}

function TabGlyph({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ color, fontSize: 19, fontWeight: '800', lineHeight: 23 }}>{glyph}</Text>;
}

export default function RootLayout() {
  return <BrandingProvider><Navigation /></BrandingProvider>;
}
