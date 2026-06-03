import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  clearLiveInfoWristband,
  fetchLiveInfoSnapshot,
  publishLiveInfoUpdate,
  submitLiveInfoWristband,
  toggleLiveInfoUpdateLike,
} from '../../../api/syncApi';
import { isApiEnabled } from '../../../constants/api';
import type {
  LiveInfoCertStatus,
  LiveInfoFeedFilters,
  LiveInfoViewerState,
  LiveInfoZone,
  PublishLiveInfoPayload,
} from '../../../types/backend';
import { pickWristbandImagePath, uploadImageFile } from '../../../utils/uploadImage';
import {
  buildLiveInfoFilterSubtitle,
  isLiveInfoFilterActive,
} from './liveInfoFilterLabels';
import {
  resolveLiveInfoCertCount,
  resolveLiveInfoFeed,
  resolveLiveInfoSummary,
  resolveLiveInfoZones,
  type LiveInfoFeedItem,
  type LiveInfoSummaryRow,
} from './liveInfoMock';

export type { PublishLiveInfoPayload };

type UseEventLiveInfoOptions = {
  /** When false, skips API reload (e.g. until user opens the live tab). */
  enabled?: boolean;
  /** Called after wristband certification succeeds (e.g. refresh activity posts). */
  onCertifiedSuccess?: () => void | Promise<void>;
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
  const [zones, setZones] = useState<LiveInfoZone[]>([]);
  const [filters, setFilters] = useState<LiveInfoFeedFilters>({});

  const filtersActive = isLiveInfoFilterActive(filters);
  const filterSubtitle = useMemo(
    () => buildLiveInfoFilterSubtitle(filters, zones),
    [filters, zones],
  );

  const applyViewer = useCallback((viewer?: LiveInfoViewerState) => {
    setViewerCertified(Boolean(viewer?.isCertified));
    setCertStatus(viewer?.certStatus ?? (viewer?.isCertified ? 'approved' : 'none'));
    setCertExpiryLabel(viewer?.certExpiryLabel ?? '23:59');
    setRejectReason(viewer?.rejectReason);
  }, []);

  const applySnapshot = useCallback(
    (snap: Awaited<ReturnType<typeof fetchLiveInfoSnapshot>>) => {
      applyViewer(snap?.viewer);
      const apiMode = isApiEnabled();
      const nextZones = resolveLiveInfoZones(snap?.zones, apiMode);
      setZones(nextZones);
      const nextFeed = resolveLiveInfoFeed(snap?.feed, { apiMode });
      setSummary(resolveLiveInfoSummary(snap?.summary, { apiMode }));
      setCertCount(resolveLiveInfoCertCount(snap?.certCount, snap?.feed, { apiMode }));
      setFeed(nextFeed);
    },
    [applyViewer],
  );

  const reload = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!isApiEnabled() || !Number.isFinite(eventId) || eventId <= 0) return;
      if (!opts?.silent) setLoading(true);
      try {
        const snap = await fetchLiveInfoSnapshot(eventId, filters);
        applySnapshot(snap);
      } catch {
        void Taro.showToast({ title: '加载现场实时资讯失败', icon: 'none' });
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [applySnapshot, eventId, filters],
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
        void Taro.showToast({
          title: '已认证，你的组队帖将显示现场标识',
          icon: 'success',
        });
        void options?.onCertifiedSuccess?.();
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
  }, [applyViewer, eventId, options?.onCertifiedSuccess]);

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
      if (!payload.ratings.length || !payload.zoneTag?.trim()) return false;
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
    zones,
    filters,
    setFilters,
    filtersActive,
    filterSubtitle,
    liveInfoCount: Array.isArray(feed) ? feed.length : 0,
    uploadWristband,
    reuploadWristband,
    clearWristband,
    publishUpdate,
    toggleFeedLike,
    reload,
  };
}
