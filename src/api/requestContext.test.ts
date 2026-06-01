import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetClientUserId = vi.fn(() => 'client-id');
const mockGetAccessToken = vi.fn((): string | null => null);

vi.mock('../utils/session', () => ({
  getClientUserId: () => mockGetClientUserId(),
}));

vi.mock('../utils/authStorage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}));

import {
  demoActorQueryParams,
  hasAuthenticatedRequest,
  mergeOwnerQueryParams,
  notificationQueryParams,
  ownerQueryParams,
  ownerQueryParamsWithActivity,
  resolveRequestUserId,
} from './requestContext';

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

describe('demoActorQueryParams', () => {
  beforeEach(() => {
    mockGetClientUserId.mockReturnValue('demo-u1');
  });

  it('returns userId only', () => {
    expect(demoActorQueryParams()).toEqual({ userId: 'demo-u1' });
    expect(demoActorQueryParams()).not.toHaveProperty('authorName');
  });
});

describe('ownerQueryParams', () => {
  beforeEach(() => {
    mockGetAccessToken.mockReturnValue(null);
    mockGetClientUserId.mockReturnValue('client-id');
  });

  it('returns userId only from session when no token', () => {
    expect(ownerQueryParams()).toEqual({ userId: 'client-id' });
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

  it('merges owner params with extra string fields', () => {
    expect(mergeOwnerQueryParams({ limit: '20', cursor: 'abc' })).toEqual({
      userId: 'u1',
      limit: '20',
      cursor: 'abc',
    });
  });

  it('keeps only extra fields when bearer token is present', () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    expect(mergeOwnerQueryParams({ limit: '20' })).toEqual({ limit: '20' });
  });

  it('extra overrides owner fields', () => {
    expect(mergeOwnerQueryParams({ userId: 'override' })).toEqual({
      userId: 'override',
    });
  });

  it('drops undefined and empty string values', () => {
    expect(
      mergeOwnerQueryParams({
        limit: undefined,
        cursor: '',
        activityLegacyId: '7',
      }),
    ).toEqual({
      userId: 'u1',
      activityLegacyId: '7',
    });
  });

  it('returns only owner params when extra is omitted', () => {
    expect(mergeOwnerQueryParams()).toEqual({ userId: 'u1' });
  });
});

describe('notificationQueryParams', () => {
  beforeEach(() => {
    mockGetAccessToken.mockReturnValue(null);
    mockGetClientUserId.mockReturnValue('notify-user');
  });

  it('returns userId when no bearer token', () => {
    expect(notificationQueryParams()).toEqual({ userId: 'notify-user' });
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
      userId: 'u1',
      activityLegacyId: '42',
    });
  });

  it('adds only activityLegacyId when bearer token is present', () => {
    mockGetAccessToken.mockReturnValue('jwt-token');
    expect(ownerQueryParamsWithActivity(42)).toEqual({
      activityLegacyId: '42',
    });
  });

  it('omits activityLegacyId when undefined', () => {
    expect(ownerQueryParamsWithActivity(undefined)).toEqual({ userId: 'u1' });
  });

  it('omits activityLegacyId when NaN', () => {
    expect(ownerQueryParamsWithActivity(Number.NaN)).toEqual({ userId: 'u1' });
  });
});
