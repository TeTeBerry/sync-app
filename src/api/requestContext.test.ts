import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetClientUserId = vi.fn(() => 'client-id');
const mockGetClientUserName = vi.fn(() => 'Demo User');
const mockGetAccessToken = vi.fn((): string | null => null);

vi.mock('../utils/session', () => ({
  getClientUserId: () => mockGetClientUserId(),
  getClientUserName: () => mockGetClientUserName(),
}));

vi.mock('../utils/authStorage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}));

import {
  mergeOwnerQueryParams,
  notificationQueryParams,
  ownerQueryParams,
  ownerQueryParamsWithActivity,
  resolveRequestUserId,
} from './requestContext';

describe('ownerQueryParams', () => {
  beforeEach(() => {
    mockGetAccessToken.mockReturnValue(null);
    mockGetClientUserId.mockReturnValue('client-id');
    mockGetClientUserName.mockReturnValue('Demo User');
  });

  it('returns userId and authorName from session helpers when no token', () => {
    expect(ownerQueryParams()).toEqual({
      userId: 'client-id',
      authorName: 'Demo User',
    });
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
    mockGetClientUserName.mockReturnValue('Alice');
  });

  it('merges owner params with extra string fields', () => {
    expect(mergeOwnerQueryParams({ limit: '20', cursor: 'abc' })).toEqual({
      userId: 'u1',
      authorName: 'Alice',
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
      authorName: 'Alice',
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
      authorName: 'Alice',
      activityLegacyId: '7',
    });
  });

  it('returns only owner params when extra is omitted', () => {
    expect(mergeOwnerQueryParams()).toEqual({
      userId: 'u1',
      authorName: 'Alice',
    });
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
    mockGetClientUserName.mockReturnValue('Alice');
  });

  it('adds activityLegacyId when finite', () => {
    expect(ownerQueryParamsWithActivity(42)).toEqual({
      userId: 'u1',
      authorName: 'Alice',
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
    expect(ownerQueryParamsWithActivity(undefined)).toEqual({
      userId: 'u1',
      authorName: 'Alice',
    });
  });

  it('omits activityLegacyId when NaN', () => {
    expect(ownerQueryParamsWithActivity(Number.NaN)).toEqual({
      userId: 'u1',
      authorName: 'Alice',
    });
  });
});
