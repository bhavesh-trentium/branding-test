import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { BRANDING_VARIANTS, INITIAL_STATE } from '@/constants/branding';
import { applyEngagementAction } from '@/services/engagementService';
import { commitBrandingState, selectVariant, type BrandingOperation } from '@/services/brandingService';
import { applyAppName } from '@/services/dynamicAppNameService';
import { readBrandingState, writeBrandingState } from '@/services/storageService';
import { refreshWidget } from '@/services/widgetService';
import { NativeBranding } from '@/native/BrandingNative';
import type { BrandingState, BrandingVariant, EngagementAction, OperationResult, PlatformCapabilities, ThemePreference } from '@/types/branding';

type ThemeColors = {
  background: string; surface: string; surfaceAlt: string; text: string; muted: string; line: string;
  accent: string; accentSoft: string; success: string; danger: string; shadow: string;
};

/** Which screen action produced the last status, so each screen only shows its own result. */
export type OperationKind = 'icon' | 'name' | 'widget' | 'scenario';
export type OperationStatus = OperationResult & { kind: OperationKind };

type BrandingContextValue = {
  state: BrandingState;
  colors: ThemeColors;
  dark: boolean;
  status: OperationStatus | null;
  capabilities: PlatformCapabilities;
  launcherVariant: BrandingVariant | null;
  runEngagement: (action: EngagementAction) => Promise<void>;
  chooseVariant: (variant: BrandingVariant) => Promise<void>;
  chooseAppName: (name: string) => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  updateWidget: () => Promise<void>;
};

const lightColors: ThemeColors = {
  background: '#F5F6FA', surface: '#FFFFFF', surfaceAlt: '#F0F1F8', text: '#202334', muted: '#85899B',
  line: '#E8E9F0', accent: '#7465E8', accentSoft: '#EEEBFF', success: '#227A66', danger: '#B4473C', shadow: 'rgba(29, 35, 62, 0.07)',
};
const darkColors: ThemeColors = {
  background: '#10121B', surface: '#191C28', surfaceAlt: '#222535', text: '#F2F3F8', muted: '#9A9FB3',
  line: '#2B2F40', accent: '#A297FF', accentSoft: '#302C4D', success: '#75CCB5', danger: '#F18F83', shadow: 'rgba(0, 0, 0, 0.24)',
};

const defaultCapabilities = (): PlatformCapabilities => {
  const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';
  if (!NativeBranding) return {
    platform, nativeModuleAvailable: false, iconSwitch: 'requires-configuration',
    nameSwitch: platform === 'android' ? 'requires-configuration' : 'requires-rebuild',
    widgets: 'requires-configuration', explanation: 'Install a native development build to access platform branding APIs.',
  };
  return {
    platform, nativeModuleAvailable: true, iconSwitch: 'supported',
    nameSwitch: platform === 'android' ? 'supported' : 'requires-rebuild', widgets: 'supported',
    explanation: platform === 'ios'
      ? 'iOS supports declared alternate icons. The app display name is configured at build time.'
      : 'Android uses launcher aliases for supported icon and label presets.',
  };
};

const isVariant = (value: string): value is BrandingVariant => BRANDING_VARIANTS.some((item) => item.id === value);

const Context = createContext<BrandingContextValue | null>(null);

export function BrandingProvider({ children }: React.PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [state, setState] = useState(INITIAL_STATE);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<OperationStatus | null>(null);
  const [capabilities, setCapabilities] = useState(defaultCapabilities);
  const [launcherVariant, setLauncherVariant] = useState<BrandingVariant | null>(null);
  const dark = state.theme === 'dark' || (state.theme === 'system' && systemScheme === 'dark');
  const colors = dark ? darkColors : lightColors;

  useEffect(() => {
    let active = true;
    readBrandingState().then((saved) => { if (active) setState(saved); }).finally(() => { if (active) setReady(true); });
    NativeBranding?.getCapabilities().then((value) => { if (active) setCapabilities(value); }).catch((reason) => {
      console.warn('[BrandLab] Capability detection failed', reason);
    });
    NativeBranding?.getActiveIcon().then((variant) => {
      if (active && isVariant(variant)) setLauncherVariant(variant);
    }).catch((reason) => console.warn('[BrandLab] Unable to read active launcher icon', reason));
    return () => { active = false; };
  }, []);

  const perform = async (kind: OperationKind, operation: () => Promise<BrandingOperation>) => {
    try {
      const result = await operation();
      setState(result.state);
      if (result.icon.ok) setLauncherVariant(result.state.variant);
      const failed = [result.icon, result.widget].filter((item) => !item.ok);
      setStatus(failed.length
        ? { kind, ok: false, message: failed.map((item) => item.message).join(' ') }
        : { kind, ok: true, message: result.icon.message });
    } catch (reason) {
      setStatus({ kind, ok: false, message: reason instanceof Error ? reason.message : 'The change could not be saved.' });
    }
  };

  const value = useMemo<BrandingContextValue>(() => ({
    state, colors, dark, status, capabilities, launcherVariant,
    runEngagement: (action) => perform('scenario', () => commitBrandingState(applyEngagementAction(state, action))),
    chooseVariant: (variant) => perform('icon', () => selectVariant(state, variant)),
    chooseAppName: async (name) => {
      const result = await applyAppName(name);
      setStatus({ kind: 'name', ...result });
      if (!result.ok) return;
      const next = { ...state, appName: name, updatedAt: new Date().toISOString() };
      setState(next);
      await writeBrandingState(next);
    },
    setTheme: async (theme) => {
      const next = { ...state, theme };
      setState(next);
      await writeBrandingState(next);
    },
    updateWidget: async () => {
      setStatus({ kind: 'widget', ...(await refreshWidget(state)) });
    },
  }), [state, colors, dark, status, capabilities, launcherVariant]);

  // Hold the first frame until saved state loads, so the UI doesn't flash the defaults.
  if (!ready) return null;
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useBranding() {
  const value = useContext(Context);
  if (!value) throw new Error('useBranding must be used within BrandingProvider');
  return value;
}

/** The last operation status, only if it came from one of the given kinds. */
export function useOperationStatus(...kinds: OperationKind[]) {
  const { status } = useBranding();
  return status && kinds.includes(status.kind) ? status : null;
}
