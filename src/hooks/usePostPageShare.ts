import Taro, { useDidShow, useShareAppMessage } from '@tarojs/taro';
import { useCallback } from 'react';
import { usePostShareStore } from '../stores/postShareStore';
import {
  DEFAULT_POST_PAGE_SHARE,
  type PostSharePayload,
  toPostShareAppMessage,
} from '../utils/postShare';

export type UsePostPageShareOptions = {
  /** Used when the user opens the menu share without tapping a post button. */
  getDefaultShare?: () => PostSharePayload | null;
};

export function usePostPageShare(options?: UsePostPageShareOptions) {
  useDidShow(() => {
    if (process.env.TARO_ENV !== 'weapp') {
      return;
    }
    void Taro.showShareMenu({ withShareTicket: true }).catch(() => {});
  });

  const resolveSharePayload = useCallback((): PostSharePayload | null => {
    const pending = usePostShareStore.getState().pendingShare;
    if (pending) {
      usePostShareStore.getState().clearPendingShare();
      return pending;
    }
    return options?.getDefaultShare?.() ?? null;
  }, [options]);

  useShareAppMessage(() => {
    const payload = resolveSharePayload();
    if (!payload) {
      return { ...DEFAULT_POST_PAGE_SHARE };
    }
    return toPostShareAppMessage(payload);
  });
}
