import { describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { assertPostPublishedVisible } from '@/utils/postPublishFeedback';

vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
  },
}));

describe('assertPostPublishedVisible', () => {
  it('throws when post is hidden', () => {
    expect(() =>
      assertPostPublishedVisible({
        id: 'p1',
        status: 'hidden',
        moderationReason: '内容未通过审核',
        name: 'A',
        location: '',
        body: 'x',
        tags: [],
        avatar: '',
      }),
    ).toThrow('内容未通过审核');
    expect(Taro.showToast).toHaveBeenCalled();
  });

  it('passes for active posts', () => {
    expect(() =>
      assertPostPublishedVisible({
        id: 'p1',
        status: 'active',
        name: 'A',
        location: '',
        body: 'x',
        tags: [],
        avatar: '',
      }),
    ).not.toThrow();
  });
});
