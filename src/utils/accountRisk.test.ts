import { describe, expect, it } from 'vitest';
import { ApiError } from './apiClient';
import {
  getAccountRiskBlockMessage,
  isAccountPublishRestricted,
  isAccountRiskApiError,
} from './accountRisk';
import type { AccountRiskPublicStatus } from '../types/backend';

describe('accountRisk', () => {
  it('detects active restriction from accountRisk payload', () => {
    const risk: AccountRiskPublicStatus = {
      status: 'restricted',
      postBlockedUntil: new Date(Date.now() + 86_400_000).toISOString(),
      message: '测试限制',
    };
    expect(isAccountPublishRestricted(risk)).toBe(true);
    expect(getAccountRiskBlockMessage(risk)).toBe('测试限制');
  });

  it('treats expired restriction as normal', () => {
    const risk: AccountRiskPublicStatus = {
      status: 'restricted',
      postBlockedUntil: new Date(Date.now() - 86_400_000).toISOString(),
    };
    expect(isAccountPublishRestricted(risk)).toBe(false);
  });

  it('identifies 403 ApiError as account risk', () => {
    expect(isAccountRiskApiError(new ApiError('账号受限', 403))).toBe(true);
    expect(isAccountRiskApiError(new ApiError('未授权', 401))).toBe(false);
  });
});
