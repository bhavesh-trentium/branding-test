jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_STATE } from '@/constants/branding';
import { readBrandingState, writeBrandingState } from '@/services/storageService';

describe('branding state persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('restores the selected branding state after a fresh read', async () => {
    const saved = { ...INITIAL_STATE, variant: 'celebration' as const, streak: 8, dailyProgress: 1 };
    await writeBrandingState(saved);

    await expect(readBrandingState()).resolves.toMatchObject({
      variant: 'celebration',
      streak: 8,
      dailyProgress: 1,
    });
  });
});
