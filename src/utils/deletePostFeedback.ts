import Taro from '@tarojs/taro';
import { deletePostAndInvalidate } from '../hooks/useSyncApi';
import { getApiErrorMessage } from './apiErrorMessage';

type DeletePostFeedbackOptions = {
  onRemoved?: () => void;
  refetchOnFailure?: () => void | Promise<void>;
};

/** Deletes a post and surfaces server errors without wiping local lists on failure. */
export async function deletePostWithFeedback(
  postId: string,
  options: DeletePostFeedbackOptions = {},
): Promise<boolean> {
  try {
    await deletePostAndInvalidate(postId);
    options.onRemoved?.();
    void Taro.showToast({ title: '已删除', icon: 'success' });
    return true;
  } catch (error) {
    try {
      await options.refetchOnFailure?.();
    } catch {
      // Keep the current list if recovery refetch also fails.
    }
    void Taro.showToast({
      title: getApiErrorMessage(error, '删除失败'),
      icon: 'none',
    });
    return false;
  }
}
