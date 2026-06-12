import { describe, expect, it } from 'vitest';
import { buildContainerApiPath } from '@/utils/cloudRunTransport';

describe('buildContainerApiPath', () => {
  it('prefixes /api and normalizes leading slash', () => {
    expect(buildContainerApiPath('auth/wechat')).toBe('/api/auth/wechat');
    expect(buildContainerApiPath('/profile/summary')).toBe('/api/profile/summary');
  });

  it('appends query params', () => {
    expect(buildContainerApiPath('/posts', { page: '1', tag: 'a b' })).toBe(
      '/api/posts?page=1&tag=a%20b',
    );
  });
});
