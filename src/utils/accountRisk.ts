import { ApiError } from './apiClient';
import type { AccountRiskPublicStatus } from '../types/backend';
import { invalidateUser } from './queryInvalidation';

const DEFAULT_BLOCK_MESSAGE = '当前账号发帖与评论功能已受限，请稍后再试或联系客服。';

export function isAccountPublishRestricted(
  accountRisk?: AccountRiskPublicStatus | null,
): boolean {
  if (!accountRisk || accountRisk.status === 'normal') return false;
  if (!accountRisk.postBlockedUntil) return true;
  const until = Date.parse(accountRisk.postBlockedUntil);
  if (Number.isNaN(until)) return true;
  return until > Date.now();
}

export function getAccountRiskBlockMessage(
  accountRisk?: AccountRiskPublicStatus | null,
): string {
  if (accountRisk?.message?.trim()) return accountRisk.message.trim();
  return DEFAULT_BLOCK_MESSAGE;
}

/** True when API rejected publish/comment due to account sanctions (HTTP 403). */
export function isAccountRiskApiError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

/**
 * After a 403 publish/comment failure, refresh `/users/me` so UI shows restriction.
 * Returns true if the error was handled as account risk.
 */
export async function handleAccountRiskApiError(error: unknown): Promise<boolean> {
  if (!isAccountRiskApiError(error)) return false;
  await invalidateUser();
  return true;
}

export function accountRiskApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.message.trim()) {
    return error.message.trim();
  }
  return DEFAULT_BLOCK_MESSAGE;
}
