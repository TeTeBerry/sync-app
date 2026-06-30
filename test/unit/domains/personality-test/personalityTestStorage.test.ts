import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersonalityTestResult } from '@/domains/personality-test';

const { resolveResultMock } = vi.hoisted(() => ({
  resolveResultMock: vi.fn(),
}));

vi.mock('@/domains/personality-test/utils/personalityTestStorage', () => ({
  resolvePersonalityTestResult: resolveResultMock,
}));

import { resolvePersonalityTestSoulDjName } from '@/domains/personality-test/utils/resolvePersonalityTestSoulDjName';

const RESULT_FIXTURE = {
  version: 1,
  recommendations: {
    soulMatch: { djName: 'TIËSTO' },
  },
} as PersonalityTestResult;

describe('resolvePersonalityTestSoulDjName', () => {
  beforeEach(() => {
    resolveResultMock.mockReset();
  });

  it('returns the soul DJ name from the resolved result', async () => {
    resolveResultMock.mockResolvedValue(RESULT_FIXTURE);

    await expect(resolvePersonalityTestSoulDjName()).resolves.toBe('TIËSTO');
    expect(resolveResultMock).toHaveBeenCalledTimes(1);
  });

  it('returns null when no saved result', async () => {
    resolveResultMock.mockResolvedValue(null);

    await expect(resolvePersonalityTestSoulDjName()).resolves.toBeNull();
  });
});
