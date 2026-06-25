import { deletePostAndInvalidate } from '../hooks/useSyncApi';
import { showAppToast } from './appToast';

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
    showAppToast('common.deleted', { icon: 'success' });
    return true;
  } catch {
    showAppToast('common.deleteFailed');
    try {
      await options?.refetchOnFailure?.();
    } catch {
      // Best-effort resync.
    }
    return false;
  }
}
