import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersonalityTestResult } from '@/domains/personality-test';

const { isLoggedInMock, loadResultMock, restoreResultMock } = vi.hoisted(() => ({
  isLoggedInMock: vi.fn(),
  loadResultMock: vi.fn(),
  restoreResultMock: vi.fn(),
}));

vi.mock('@/utils/authStorage', () => ({
  isLoggedIn: isLoggedInMock,
}));

vi.mock('@/domains/personality-test/utils/personalityTestStorage', () => ({
  loadPersonalityTestResult: loadResultMock,
  restorePersonalityTestResultFromServer: restoreResultMock,
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
    isLoggedInMock.mockReset();
    loadResultMock.mockReset();
    restoreResultMock.mockReset();
  });

  it('reads local storage when logged out', async () => {
    isLoggedInMock.mockReturnValue(false);
    loadResultMock.mockReturnValue(RESULT_FIXTURE);

    await expect(resolvePersonalityTestSoulDjName()).resolves.toBe('TIËSTO');
    expect(restoreResultMock).not.toHaveBeenCalled();
  });

  it('restores from server when logged in', async () => {
    isLoggedInMock.mockReturnValue(true);
    restoreResultMock.mockResolvedValue(RESULT_FIXTURE);

    await expect(resolvePersonalityTestSoulDjName()).resolves.toBe('TIËSTO');
    expect(loadResultMock).not.toHaveBeenCalled();
  });

  it('returns null when no saved result', async () => {
    isLoggedInMock.mockReturnValue(false);
    loadResultMock.mockReturnValue(null);

    await expect(resolvePersonalityTestSoulDjName()).resolves.toBeNull();
  });
});
