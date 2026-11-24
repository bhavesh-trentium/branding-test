import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_STATE } from '@/constants/branding';
import type { BrandingState } from '@/types/branding';

const STORAGE_KEY = 'brandlab.state.v1';

export async function readBrandingState(): Promise<BrandingState> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEY);
    if (!value) return INITIAL_STATE;
    return { ...INITIAL_STATE, ...JSON.parse(value) } as BrandingState;
  } catch (error) {
    console.warn('[BrandLab] Unable to read saved state', error);
    return INITIAL_STATE;
  }
}

export async function writeBrandingState(state: BrandingState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
