import { afterEach, describe, expect, it, vi } from 'vitest';

describe('isProfileBenefitsEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is false by default', async () => {
    vi.stubEnv('TARO_APP_ENABLE_PROFILE_BENEFITS', undefined);
    const { isProfileBenefitsEnabled } = await import('@/constants/featureFlags');
    expect(isProfileBenefitsEnabled()).toBe(false);
  });

  it('is true only when env is "true"', async () => {
    vi.stubEnv('TARO_APP_ENABLE_PROFILE_BENEFITS', 'true');
    vi.resetModules();
    const { isProfileBenefitsEnabled } = await import('@/constants/featureFlags');
    expect(isProfileBenefitsEnabled()).toBe(true);
  });
});
