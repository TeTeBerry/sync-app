import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockBlockUser = vi.fn();
const mockSubmitReport = vi.fn();
const mockInvalidatePostFeeds = vi.fn();
const mockInvalidateBlockedUsers = vi.fn();

vi.mock('../../api/sync/users', () => ({
  blockUser: (...args: unknown[]) => mockBlockUser(...args),
  submitReport: (...args: unknown[]) => mockSubmitReport(...args),
}));

vi.mock('../../utils/queryInvalidation', () => ({
  invalidatePostFeeds: () => mockInvalidatePostFeeds(),
  invalidateBlockedUsers: () => mockInvalidateBlockedUsers(),
}));

import { blockUserAndInvalidate } from './posts';

describe('moderation hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBlockUser.mockResolvedValue({ ok: true });
    mockSubmitReport.mockResolvedValue({ ok: true, id: 'r1' });
    mockInvalidatePostFeeds.mockResolvedValue(undefined);
  });

  it('blockUserAndInvalidate blocks then refreshes post feeds and block list', async () => {
    await blockUserAndInvalidate('demo-finn');
    expect(mockBlockUser).toHaveBeenCalledWith('demo-finn');
    expect(mockInvalidatePostFeeds).toHaveBeenCalledTimes(1);
    expect(mockInvalidateBlockedUsers).toHaveBeenCalledTimes(1);
  });
});
