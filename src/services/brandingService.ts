import { applyLauncherIcon } from '@/services/dynamicIconService';
import { writeBrandingState } from '@/services/storageService';
import { refreshWidget } from '@/services/widgetService';
import type { BrandingState, BrandingVariant, OperationResult } from '@/types/branding';

export interface BrandingOperation {
  state: BrandingState;
  icon: OperationResult;
  widget: OperationResult;
}

export async function commitBrandingState(state: BrandingState): Promise<BrandingOperation> {
  await writeBrandingState(state);
  const [icon, widget] = await Promise.all([
    applyLauncherIcon(state.variant),
    refreshWidget(state),
  ]);
  return { state, icon, widget };
}

export async function selectVariant(state: BrandingState, variant: BrandingVariant): Promise<BrandingOperation> {
  return commitBrandingState({ ...state, variant, updatedAt: new Date().toISOString() });
}
