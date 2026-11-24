import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { APP_NAME_OPTIONS } from '@/constants/branding';
import { Card, Notice, OperationNotice, Page, Pill } from '@/components/ui';
import { useBranding } from '@/state/BrandingContext';

export default function AppNameScreen() {
  const { state, chooseAppName, colors } = useBranding();
  const isAndroid = Platform.OS === 'android';
  return <Page title="App display name" eyebrow="A label with limits" trailing={<Pill label={isAndroid ? 'ANDROID' : 'IOS'} />}>
    <Card>
      <Text style={{ color: colors.muted, fontSize: 12 }}>Current configured label</Text>
      <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>{state.appName}</Text>
      <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{isAndroid ? 'Android switches among the app labels declared on launcher aliases.' : 'The iOS display name is part of the installed app configuration.'}</Text>
    </Card>
    <OperationNotice kinds={['name']} successTitle="Name change requested" errorTitle="Name change unavailable" />
    {isAndroid ? <>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>Declared name presets</Text>
      {APP_NAME_OPTIONS.map((name) => <NameOption key={name} name={name} active={state.appName === name} onPress={() => void chooseAppName(name)} />)}
      <Text style={{ color: colors.muted, fontSize: 11 }}>Tap a declared preset to request the native launcher label change.</Text>
      <Notice title="Android alias behavior" body="The names are declared at build time. Selecting one enables its launcher alias and disables the others. Some launchers (including Samsung One UI) close the app when this happens; reopen it from the Home Screen. Launchers may also take a moment to show the new label." />
    </> : <Notice title="iOS runtime name changes are not supported" body="Apple provides an API for switching declared alternate icons, but no supported runtime API for changing the app display name. Update CFBundleDisplayName in the app configuration and rebuild to change it." />}
  </Page>;
}

function NameOption({ name, active, onPress }: { name: string; active: boolean; onPress: () => void }) {
  const { colors } = useBranding();
  return <Pressable onPress={onPress} style={{ backgroundColor: active ? colors.accentSoft : colors.surface, borderColor: active ? colors.accent : colors.line, borderWidth: 1, borderRadius: 17, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
    <Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{name}</Text>
    <Text style={{ color: active ? colors.accent : colors.muted, fontWeight: '800' }}>{active ? '✓' : '○'}</Text>
  </Pressable>;
}
