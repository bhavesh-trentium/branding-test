import { requireOptionalNativeModule } from 'expo-modules-core';
import type { BrandingVariant, OperationResult, PlatformCapabilities, WidgetPayload } from '@/types/branding';

type NativeBrandingApi = {
  getCapabilities(): Promise<PlatformCapabilities>;
  setIcon(variant: BrandingVariant): Promise<OperationResult>;
  getActiveIcon(): Promise<BrandingVariant>;
  setAppName(name: string): Promise<OperationResult>;
  updateWidget(payload: WidgetPayload): Promise<OperationResult>;
};

export const NativeBranding = requireOptionalNativeModule<NativeBrandingApi>('BrandingNative');
