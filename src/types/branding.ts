export type BrandingVariant = 'default' | 'happy' | 'sleepy' | 'sad' | 'celebration';
export type EngagementAction = 'activeToday' | 'missedOneDay' | 'missedThreeDays' | 'missedSevenDays' | 'goalCompleted';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface BrandingState {
  variant: BrandingVariant;
  engagement: EngagementAction;
  lastActivityAt: string;
  updatedAt: string;
  streak: number;
  dailyProgress: number;
  appName: string;
  theme: ThemePreference;
}

export interface PlatformCapabilities {
  platform: 'android' | 'ios' | 'web' | 'unknown';
  nativeModuleAvailable: boolean;
  iconSwitch: 'supported' | 'partially-supported' | 'requires-configuration' | 'unavailable';
  nameSwitch: 'supported' | 'partially-supported' | 'requires-configuration' | 'requires-rebuild' | 'unavailable';
  widgets: 'supported' | 'partially-supported' | 'requires-configuration' | 'unavailable';
  explanation: string;
}

export interface OperationResult {
  ok: boolean;
  message: string;
}

export interface WidgetPayload {
  variant: BrandingVariant;
  stateLabel: string;
  streak: number;
  dailyProgress: number;
  lastActivityAt: string;
  updatedAt: string;
}
