import { NativeBranding } from '@/native/BrandingNative';
import type { BrandingState, OperationResult, WidgetPayload } from '@/types/branding';
import { getVariant } from '@/constants/branding';

export function toWidgetPayload(state: BrandingState): WidgetPayload {
  return {
    variant: state.variant,
    stateLabel: getVariant(state.variant).name,
    streak: state.streak,
    dailyProgress: state.dailyProgress,
    lastActivityAt: state.lastActivityAt,
    updatedAt: state.updatedAt,
  };
}

export async function refreshWidget(state: BrandingState): Promise<OperationResult> {
  if (!NativeBranding) return { ok: false, message: 'Widgets need an installed native build.' };
  try {
    return await NativeBranding.updateWidget(toWidgetPayload(state));
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'The widget update could not be requested.' };
  }
}
