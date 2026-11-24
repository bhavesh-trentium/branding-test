import { NativeBranding } from '@/native/BrandingNative';
import type { BrandingVariant, OperationResult } from '@/types/branding';

export async function applyLauncherIcon(variant: BrandingVariant): Promise<OperationResult> {
  if (!NativeBranding) return { ok: false, message: 'Native icon switching needs an installed development or release build.' };
  try {
    return await NativeBranding.setIcon(variant);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'The operating system rejected the icon change.' };
  }
}
