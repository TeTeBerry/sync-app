import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';
import {
  clearLiveInfoWristband,
  fetchLiveInfoSnapshot,
  publishLiveInfoUpdate,
  submitLiveInfoWristband,
  toggleLiveInfoUpdateLike,
} from '../../../api/syncApi';
import { isApiEnabled } from '../../../constants/api';
import type { LiveInfoCertStatus, LiveInfoViewerState } from '../../../types/backend';
import { pickWristbandImagePath, uploadImageFile } from '../../../utils/uploadImage';
import type { LiveInfoCategoryId } from './liveInfoConfig';
import {
  resolveLiveInfoCertCount,
  resolveLiveInfoFeed,
  resolveLiveInfoSummary,
  type LiveInfoFeedItem,
  type LiveInfoSummaryRow,
} from './liveInfoMock';

export type PublishLiveInfoPayload = {
  ratings: { categoryId: LiveInfoCategoryId; score: number }[];
  remark?: string;
};

type UseEventLiveInfoOptions = {
  /** When false, skips API reload (e.g. until user opens the live tab). */
  enabled?: boolean;
};

export function useEventLiveInfo(
  eventId: number,
  _userName: string,
  options?: UseEventLiveInfoOptions,
) {
  const enabled = options?.enabled ?? true;
  const [loading, setLoading] = useState(false);
  const [viewerCertified, setViewerCertified] = useState(false);
  const [certStatus, setCertStatus] = useState<LiveInfoCertStatus>('none');
  const [certExpiryLabel, setCertExpiryLabel] = useState('23:59');
  const [rejectReason, setRejectReason] = useState<string | undefined>();
  const [summary, setSummary] = useState<LiveInfoSummaryRow[]>([]);
  const [certCount, setCertCount] = useState(0);
  const [feed, setFeed] = useState<LiveInfoFeedItem[]>([]);

  const applyViewer = useCallback((viewer?: LiveInfoViewerState) => {
    setViewerCertified(Boolean(viewer?.isCertified));
    setCertStatus(viewer?.certStatus ?? (viewer?.isCertified ? 'approved' : 'none'));
    setCertExpiryLabel(viewer?.certExpiryLabel ?? '23:59');
    setRejectReason(viewer?.rejectReason);
  }, []);

  const applySnapshot = useCallback(
    (snap: Awaited<ReturnType<typeof fetchLiveInfoSnapshot>>) => {
      applyViewer(snap?.viewer);
      const nextFeed = resolveLiveInfoFeed(snap?.feed);
      setSummary(resolveLiveInfoSummary(snap?.summary));
      setCertCount(resolveLiveInfoCertCount(snap?.certCount, snap?.feed));
      setFeed(nextFeed);
    },
    [applyViewer],
  );

  const reload = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!isApiEnabled() || !Number.isFinite(eventId) || eventId <= 0) return;
      if (!opts?.silent) setLoading(true);
      try {
        const snap = await fetchLiveInfoSnapshot(eventId);
        applySnapshot(snap);
      } catch {
        void Taro.showToast({ title: '加载现场实时资讯失败', icon: 'none' });
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [applySnapshot, eventId],
  );

  useEffect(() => {
    if (!enabled) return;
    void reload();
  }, [enabled, eventId, reload]);

  const isCertified = viewerCertified;

  const uploadWristband = useCallback(async () => {
    if (!isApiEnabled() || eventId <= 0) {
      void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
      return;
    }

    const filePath = await pickWristbandImagePath();
    if (!filePath) return;

    try {
      void Taro.showLoading({ title: 'AI 审核中…', mask: true });
      const imageUrl = await uploadImageFile(filePath);
      const res = await submitLiveInfoWristband(eventId, { imageUrl });
      applyViewer(res.viewer);
      if (res.ok && res.viewer.isCertified) {
        void Taro.showToast({ title: '手环认证成功', icon: 'success' });
      } else {
        const msg =
          res.message?.trim() ||
          res.viewer.rejectReason?.trim() ||
          (res.code === 'duplicate_image'
            ? '该手环照片已使用过，请重新拍摄'
            : '手环照片未通过审核');
        void Taro.showToast({
          title: msg.slice(0, 40),
          icon: 'none',
          duration: res.code === 'duplicate_image' ? 3500 : 3000,
        });
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : '认证失败';
      void Taro.showToast({ title: msg.slice(0, 40) || '认证失败', icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  }, [applyViewer, eventId]);

  const reuploadWristband = useCallback(async () => {
    await uploadWristband();
  }, [uploadWristband]);

  const clearWristband = useCallback(async () => {
    if (!isApiEnabled() || eventId <= 0) return;
    try {
      const res = await clearLiveInfoWristband(eventId);
      applyViewer(res.viewer);
    } catch {
      applyViewer(undefined);
      setCertStatus('none');
    }
  }, [applyViewer, eventId]);

  const publishUpdate = useCallback(
    async (payload: PublishLiveInfoPayload): Promise<boolean> => {
      if (!payload.ratings.length) return false;
      if (!isApiEnabled() || eventId <= 0) {
        void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
        return false;
      }

      try {
        await publishLiveInfoUpdate(eventId, payload);
        await reload({ silent: true });
        void Taro.showToast({ title: '现场实时资讯已发布', icon: 'success' });
        return true;
      } catch (err: unknown) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message?: string }).message)
            : '发布失败';
        void Taro.showToast({ title: msg.slice(0, 40) || '发布失败', icon: 'none' });
        return false;
      }
    },
    [eventId, reload],
  );

  const toggleFeedLike = useCallback(
    async (feedId: string) => {
      if (!isApiEnabled() || eventId <= 0) return;
      try {
        const res = await toggleLiveInfoUpdateLike(eventId, feedId);
        const { likes, liked } = res.update;
        setFeed((prev) =>
          prev.map((item) =>
            item.id === feedId
              ? {
                  ...item,
                  likes: typeof likes === 'number' && likes >= 0 ? likes : item.likes,
                  liked: Boolean(liked),
                }
              : item,
          ),
        );
      } catch {
        void Taro.showToast({ title: '操作失败', icon: 'none' });
      }
    },
    [eventId],
  );

  return {
    loading,
    isCertified,
    certStatus,
    certExpiryLabel,
    rejectReason,
    summary,
    certCount,
    feed,
    liveInfoCount: Array.isArray(feed) ? feed.length : 0,
    uploadWristband,
    reuploadWristband,
    clearWristband,
    publishUpdate,
    toggleFeedLike,
    reload,
  };
}
