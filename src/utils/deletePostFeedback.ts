import Taro from '@tarojs/taro';
import { deletePostAndInvalidate } from '../hooks/useSyncApi';

type DeletePostFeedbackOptions = {
  onRemoved?: () => void;
  refetchOnFailure?: () => void | Promise<void>;
};

export async function deletePostWithFeedback(
  postId: string,
  options?: DeletePostFeedbackOptions,
): Promise<boolean> {
  try {
    await deletePostAndInvalidate(postId);
    options?.onRemoved?.();
    void Taro.showToast({ title: '已删除', icon: 'success' });
    return true;
  } catch {
    void Taro.showToast({ title: '删除失败，请稍后重试', icon: 'none' });
    try {
      await options?.refetchOnFailure?.();
    } catch {
      // Best-effort resync.
    }
    return false;
  }
}
