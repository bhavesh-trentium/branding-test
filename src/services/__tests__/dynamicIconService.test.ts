jest.mock('@/native/BrandingNative', () => ({ NativeBranding: null }));

import { applyLauncherIcon } from '@/services/dynamicIconService';

describe('native icon failure reporting', () => {
  it('does not report success when the native module is unavailable', async () => {
    await expect(applyLauncherIcon('happy')).resolves.toEqual({
      ok: false,
      message: 'Native icon switching needs an installed development or release build.',
    });
  });
});
