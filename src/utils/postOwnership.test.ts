import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetClientUserId = vi.fn(() => '');
const mockGetClientUserName = vi.fn(() => '');

vi.mock('./session', () => ({
  getClientUserId: () => mockGetClientUserId(),
  getClientUserName: () => mockGetClientUserName(),
}));

import { isCurrentUserPostAuthor } from './postOwnership';

describe('isCurrentUserPostAuthor', () => {
  beforeEach(() => {
    mockGetClientUserId.mockReset();
    mockGetClientUserName.mockReset();
  });

  it('matches by userId', () => {
    mockGetClientUserId.mockReturnValue('user-abc');
    expect(isCurrentUserPostAuthor('Someone', 'user-abc')).toBe(true);
  });

  it('matches by author name first token', () => {
    mockGetClientUserId.mockReturnValue('');
    mockGetClientUserName.mockReturnValue('Zara Chen');
    expect(isCurrentUserPostAuthor('Zara Chen', undefined)).toBe(true);
    expect(isCurrentUserPostAuthor('Zara', undefined)).toBe(true);
  });

  it('treats demo-zara client as owner of demo-zara posts', () => {
    mockGetClientUserId.mockReturnValue('demo-zara');
    mockGetClientUserName.mockReturnValue('');
    expect(isCurrentUserPostAuthor('Other Name', 'demo-zara')).toBe(true);
  });

  it('returns false for unrelated author', () => {
    mockGetClientUserId.mockReturnValue('user-x');
    mockGetClientUserName.mockReturnValue('Alice');
    expect(isCurrentUserPostAuthor('Bob Smith', 'user-y')).toBe(false);
  });
});
