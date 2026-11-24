import { NativeBranding } from '@/native/BrandingNative';
import type { OperationResult } from '@/types/branding';

export async function applyAppName(name: string): Promise<OperationResult> {
  if (!NativeBranding) return { ok: false, message: 'App name switching needs the native app build.' };
  try {
    return await NativeBranding.setAppName(name);
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'The app name could not be changed.' };
  }
}
