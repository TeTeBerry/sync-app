import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetClientUserId = vi.fn(() => 'client-id');
const mockGetAccessToken = vi.fn((): string | null => null);

vi.mock('@/utils/session', () => ({
  getClientUserId: () => mockGetClientUserId(),
}));

vi.mock('@/utils/authStorage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}));

import {
  hasAuthenticatedRequest,
  mergeOwnerQueryParams,
  notificationQueryParams,
  ownerQueryParams,
  ownerQueryParamsWithActivity,
  resolveRequestUserId,
} from '@/api/requestContext';

describe('hasAuthenticatedRequest', () => {
  it('returns false when no access token', () => {
    mockGetAccessToken.mockReturnValue(null);
    expect(hasAuthenticatedRequest()).toBe(false);
  });

  it('returns true when access token is present', () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    expect(hasAuthenticatedRequest()).toBe(true);
  });
});

describe('ownerQueryParams', () => {
  beforeEach(() => {
    mockGetAccessToken.mockReturnValue(null);
    mockGetClientUserId.mockReturnValue('client-id');
  });

  it('returns empty object without token', () => {
    expect(ownerQueryParams()).toEqual({});
  });

  it('returns empty object when access token is present', () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    expect(ownerQueryParams()).toEqual({});
  });
});

describe('resolveRequestUserId', () => {
  beforeEach(() => {
    mockGetClientUserId.mockReturnValue('jwt-user-42');
  });

  it('returns getClientUserId (JWT-aware in session)', () => {
    expect(resolveRequestUserId()).toBe('jwt-user-42');
  });
});

describe('mergeOwnerQueryParams', () => {
  beforeEach(() => {
    mockGetAccessToken.mockReturnValue(null);
    mockGetClientUserId.mockReturnValue('u1');
  });

  it('merges extra string fields without demo query', () => {
    expect(mergeOwnerQueryParams({ limit: '20', cursor: 'abc' })).toEqual({
      limit: '20',
      cursor: 'abc',
    });
  });

  it('keeps only extra fields when bearer token is present', () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    expect(mergeOwnerQueryParams({ limit: '20' })).toEqual({ limit: '20' });
  });

  it('drops undefined and empty string values', () => {
    expect(
      mergeOwnerQueryParams({
        limit: undefined,
        cursor: '',
        activityLegacyId: '7',
      }),
    ).toEqual({
      activityLegacyId: '7',
    });
  });

  it('returns empty object when extra is omitted', () => {
    expect(mergeOwnerQueryParams()).toEqual({});
  });
});

describe('notificationQueryParams', () => {
  beforeEach(() => {
    mockGetAccessToken.mockReturnValue(null);
    mockGetClientUserId.mockReturnValue('notify-user');
  });

  it('returns undefined without bearer token', () => {
    expect(notificationQueryParams()).toBeUndefined();
  });

  it('returns undefined when bearer token is present', () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    expect(notificationQueryParams()).toBeUndefined();
  });
});

describe('ownerQueryParamsWithActivity', () => {
  beforeEach(() => {
    mockGetAccessToken.mockReturnValue(null);
    mockGetClientUserId.mockReturnValue('u1');
  });

  it('adds activityLegacyId when finite', () => {
    expect(ownerQueryParamsWithActivity(42)).toEqual({
      activityLegacyId: '42',
    });
  });

  it('adds only activityLegacyId when bearer token is present', () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    expect(ownerQueryParamsWithActivity(42)).toEqual({
      activityLegacyId: '42',
    });
  });

  it('returns empty object when activityLegacyId is undefined', () => {
    expect(ownerQueryParamsWithActivity(undefined)).toEqual({});
  });

  it('returns empty object when activityLegacyId is NaN', () => {
    expect(ownerQueryParamsWithActivity(Number.NaN)).toEqual({});
  });
});
