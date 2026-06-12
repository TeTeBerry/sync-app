import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useSyncApi', () => ({
  deletePostAndInvalidate: vi.fn(),
}));

vi.mock('@tarojs/taro', () => ({
  default: {
    showToast: vi.fn(),
  },
}));

import Taro from '@tarojs/taro';
import { deletePostAndInvalidate } from '@/hooks/useSyncApi';
import { deletePostWithFeedback } from '@/utils/deletePostFeedback';
import { ApiError } from '@/utils/apiClient';

describe('deletePostWithFeedback', () => {
  it('removes locally only after successful delete', async () => {
    vi.mocked(deletePostAndInvalidate).mockResolvedValue(undefined);
    const onRemoved = vi.fn();

    const ok = await deletePostWithFeedback('post-1', { onRemoved });

    expect(ok).toBe(true);
    expect(onRemoved).toHaveBeenCalledOnce();
    expect(Taro.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '已删除' }),
    );
  });

  it('keeps list intact when delete fails and recovery refetch throws', async () => {
    vi.mocked(deletePostAndInvalidate).mockRejectedValue(
      new ApiError('无权删除该帖子', 403),
    );
    const onRemoved = vi.fn();
    const refetchOnFailure = vi.fn().mockRejectedValue(new Error('network'));

    const ok = await deletePostWithFeedback('post-1', {
      onRemoved,
      refetchOnFailure,
    });

    expect(ok).toBe(false);
    expect(onRemoved).not.toHaveBeenCalled();
    expect(refetchOnFailure).toHaveBeenCalledOnce();
    expect(Taro.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: '无权删除该帖子' }),
    );
  });
});
