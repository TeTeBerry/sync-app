import { fetchBlockedUserIds, unblockUser } from '../../api/sync/users';
import type { BlockListResult } from '../../types/backend';
import { isApiEnabled } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import {
  invalidateBlockedUsers,
  invalidatePostFeeds,
} from '../../utils/queryInvalidation';
import { useApiQuery } from '../useApiQuery';

function blocksApiEnabled(): boolean {
  return isApiEnabled() && isLoggedIn();
}

export function normalizeBlockList(data: BlockListResult): BlockListResult {
  const ids = data.blockedUserIds ?? [];
  const items =
    data.items?.length > 0
      ? data.items
      : ids.map((userId) => ({ userId, name: '用户' }));
  return { blockedUserIds: ids, items };
}

export function useBlockedUsersQuery() {
  return useApiQuery({
    queryKey: ['users', 'blocks'],
    queryFn: async () => normalizeBlockList(await fetchBlockedUserIds()),
    enabled: blocksApiEnabled(),
    staleTime: 10_000,
  });
}

export async function unblockUserAndInvalidate(blockedUserId: string) {
  const result = await unblockUser(blockedUserId);
  invalidatePostFeeds();
  invalidateBlockedUsers();
  return result;
}
