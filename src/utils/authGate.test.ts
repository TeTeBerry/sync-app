import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockIsLoggedIn = vi.fn(() => false);
const mockShow = vi.fn();

vi.mock('./authStorage', () => ({
  isLoggedIn: () => mockIsLoggedIn(),
}));

vi.mock('../stores/loginInterceptStore', () => ({
  useLoginInterceptStore: {
    getState: () => ({ show: mockShow }),
  },
}));

describe('authGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoggedIn.mockReturnValue(false);
  });

  it('isAuthGated when there is no session', async () => {
    const { isAuthGated } = await import('./authGate');
    expect(isAuthGated()).toBe(true);
  });

  it('is not auth gated when logged in', async () => {
    mockIsLoggedIn.mockReturnValue(true);
    const { isAuthGated } = await import('./authGate');
    expect(isAuthGated()).toBe(false);
  });

  it('requireAuth opens the login sheet when gated', async () => {
    const { requireAuth } = await import('./authGate');
    const action = vi.fn();
    expect(requireAuth(action, 'social')).toBe(false);
    expect(mockShow).toHaveBeenCalledWith('social', action);
    expect(action).not.toHaveBeenCalled();
  });

  it('requireAuth runs the action when logged in', async () => {
    mockIsLoggedIn.mockReturnValue(true);
    const { requireAuth } = await import('./authGate');
    const action = vi.fn();
    expect(requireAuth(action, 'social')).toBe(true);
    expect(mockShow).not.toHaveBeenCalled();
    expect(action).toHaveBeenCalledTimes(1);
  });
});
