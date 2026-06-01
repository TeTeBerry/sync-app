import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUnblockUser = vi.fn();
const mockInvalidatePostFeeds = vi.fn();
const mockInvalidateBlockedUsers = vi.fn();

vi.mock('../../api/sync/users', () => ({
  unblockUser: (...args: unknown[]) => mockUnblockUser(...args),
}));

vi.mock('../../utils/queryInvalidation', () => ({
  invalidatePostFeeds: () => mockInvalidatePostFeeds(),
  invalidateBlockedUsers: () => mockInvalidateBlockedUsers(),
}));

import { normalizeBlockList, unblockUserAndInvalidate } from './users';

describe('unblockUserAndInvalidate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnblockUser.mockResolvedValue({ ok: true });
  });

  it('unblocks user and invalidates post feeds and block list', async () => {
    await unblockUserAndInvalidate('demo-finn');
    expect(mockUnblockUser).toHaveBeenCalledWith('demo-finn');
    expect(mockInvalidatePostFeeds).toHaveBeenCalledTimes(1);
    expect(mockInvalidateBlockedUsers).toHaveBeenCalledTimes(1);
  });
});

describe('normalizeBlockList', () => {
  it('builds items from ids when API omits items', () => {
    expect(
      normalizeBlockList({ blockedUserIds: ['u1', 'u2'], items: [] }),
    ).toEqual({
      blockedUserIds: ['u1', 'u2'],
      items: [
        { userId: 'u1', name: '用户' },
        { userId: 'u2', name: '用户' },
      ],
    });
  });
});
