import Taro from "@tarojs/taro";
import { useCallback, useEffect, useState } from "react";
import {
  clearLiveInfoWristband,
  fetchLiveInfoSnapshot,
  publishLiveInfoUpdate,
  submitLiveInfoWristband,
  toggleLiveInfoUpdateLike,
} from "../../../api/syncApi";
import { isApiEnabled } from "../../../constants/api";
import type { LiveInfoCertStatus, LiveInfoViewerState } from "../../../types/backend";
import {
  pickWristbandImagePath,
  uploadImageFile,
} from "../../../utils/uploadImage";
import type { LiveInfoCategoryId } from "./liveInfoConfig";
import {
  MOCK_LIVE_INFO_CERT_COUNT,
  MOCK_LIVE_INFO_FEED,
  MOCK_LIVE_INFO_SUMMARY,
  type LiveInfoFeedItem,
  type LiveInfoSummaryRow,
} from "./liveInfoMock";

const CERT_STORAGE_PREFIX = "event-live-cert:";

type StoredCert = {
  certifiedAt: string;
};

function certStorageKey(eventId: number): string {
  return `${CERT_STORAGE_PREFIX}${eventId}`;
}

function isCertValidToday(certifiedAt: string): boolean {
  const at = new Date(certifiedAt);
  const now = new Date();
  return (
    at.getFullYear() === now.getFullYear() &&
    at.getMonth() === now.getMonth() &&
    at.getDate() === now.getDate()
  );
}

function readCert(eventId: number): StoredCert | null {
  try {
    const raw = Taro.getStorageSync(certStorageKey(eventId));
    if (!raw || typeof raw !== "object") return null;
    const certifiedAt = (raw as StoredCert).certifiedAt;
    if (typeof certifiedAt !== "string" || !isCertValidToday(certifiedAt)) return null;
    return { certifiedAt };
  } catch {
    return null;
  }
}

function writeCert(eventId: number): void {
  Taro.setStorageSync(certStorageKey(eventId), {
    certifiedAt: new Date().toISOString(),
  } satisfies StoredCert);
}

function clearCert(eventId: number): void {
  try {
    Taro.removeStorageSync(certStorageKey(eventId));
  } catch {
    // ignore
  }
}

export type PublishLiveInfoPayload = {
  ratings: { categoryId: LiveInfoCategoryId; score: number }[];
  remark?: string;
};

function averageSummary(
  rows: LiveInfoSummaryRow[],
  incoming: { categoryId: LiveInfoCategoryId; score: number }[],
  certCount: number,
): { summary: LiveInfoSummaryRow[]; certCount: number } {
  const next = rows.map((row) => {
    const hit = incoming.find((r) => r.categoryId === row.categoryId);
    if (!hit) return row;
    const n = certCount;
    const blended = (row.score * n + hit.score) / (n + 1);
    return { ...row, score: Math.round(blended * 10) / 10 };
  });
  return { summary: next, certCount: certCount + 1 };
}

type UseEventLiveInfoOptions = {
  /** When false, skips API reload (e.g. until user opens the live tab). */
  enabled?: boolean;
};

export function useEventLiveInfo(
  eventId: number,
  userName: string,
  options?: UseEventLiveInfoOptions,
) {
  const enabled = options?.enabled ?? true;
  const apiEnabled = isApiEnabled();
  const [loading, setLoading] = useState(false);
  const [localCert, setLocalCert] = useState<StoredCert | null>(() =>
    apiEnabled ? null : readCert(eventId),
  );
  const [viewerCertified, setViewerCertified] = useState(false);
  const [certStatus, setCertStatus] = useState<LiveInfoCertStatus>("none");
  const [certExpiryLabel, setCertExpiryLabel] = useState("23:59");
  const [rejectReason, setRejectReason] = useState<string | undefined>();

  const applyViewer = useCallback((viewer?: LiveInfoViewerState) => {
    setViewerCertified(Boolean(viewer?.isCertified));
    setCertStatus(viewer?.certStatus ?? (viewer?.isCertified ? "approved" : "none"));
    setCertExpiryLabel(viewer?.certExpiryLabel ?? "23:59");
    setRejectReason(viewer?.rejectReason);
  }, []);
  const [summary, setSummary] = useState<LiveInfoSummaryRow[]>(MOCK_LIVE_INFO_SUMMARY);
  const [certCount, setCertCount] = useState(MOCK_LIVE_INFO_CERT_COUNT);
  const [feed, setFeed] = useState<LiveInfoFeedItem[]>(MOCK_LIVE_INFO_FEED);

  const applySnapshot = useCallback(
    (snap: Awaited<ReturnType<typeof fetchLiveInfoSnapshot>>) => {
      applyViewer(snap?.viewer);
      setSummary(
        Array.isArray(snap?.summary) && snap.summary.length > 0
          ? snap.summary
          : MOCK_LIVE_INFO_SUMMARY,
      );
      setCertCount(
        typeof snap?.certCount === "number" ? snap.certCount : MOCK_LIVE_INFO_CERT_COUNT,
      );
      setFeed(Array.isArray(snap?.feed) ? snap.feed : MOCK_LIVE_INFO_FEED);
    },
    [applyViewer],
  );

  const reload = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!apiEnabled || !Number.isFinite(eventId) || eventId <= 0) return;
      if (!opts?.silent) setLoading(true);
      try {
        const snap = await fetchLiveInfoSnapshot(eventId);
        applySnapshot(snap);
      } catch {
        void Taro.showToast({ title: "加载实时资讯失败", icon: "none" });
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [apiEnabled, applySnapshot, eventId],
  );

  useEffect(() => {
    if (!enabled) return;
    if (!apiEnabled) {
      setLocalCert(readCert(eventId));
      setLoading(false);
      return;
    }
    void reload();
  }, [apiEnabled, enabled, eventId, reload]);

  const isCertified = apiEnabled ? viewerCertified : localCert != null;

  const uploadWristband = useCallback(async () => {
    const filePath = await pickWristbandImagePath();
    if (!filePath) return;

    if (apiEnabled && eventId > 0) {
      try {
        void Taro.showLoading({ title: "AI 审核中…", mask: true });
        const imageUrl = await uploadImageFile(filePath);
        const res = await submitLiveInfoWristband(eventId, { imageUrl });
        applyViewer(res.viewer);
        if (res.ok && res.viewer.isCertified) {
          void Taro.showToast({ title: "手环认证成功", icon: "success" });
        } else {
          const msg =
            res.message?.trim() ||
            res.viewer.rejectReason?.trim() ||
            (res.code === "duplicate_image"
              ? "该手环照片已使用过，请重新拍摄"
              : "手环照片未通过审核");
          void Taro.showToast({
            title: msg.slice(0, 40),
            icon: "none",
            duration: res.code === "duplicate_image" ? 3500 : 3000,
          });
        }
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: string }).message)
            : "认证失败";
        void Taro.showToast({ title: msg.slice(0, 40) || "认证失败", icon: "none" });
      } finally {
        Taro.hideLoading();
      }
      return;
    }

    writeCert(eventId);
    setLocalCert(readCert(eventId));
    void Taro.showToast({ title: "手环认证成功", icon: "success" });
  }, [apiEnabled, applyViewer, eventId]);

  const reuploadWristband = useCallback(async () => {
    await uploadWristband();
  }, [uploadWristband]);

  const clearWristband = useCallback(async () => {
    if (apiEnabled && eventId > 0) {
      try {
        const res = await clearLiveInfoWristband(eventId);
        applyViewer(res.viewer);
      } catch {
        applyViewer(undefined);
        setCertStatus("none");
      }
      return;
    }
    clearCert(eventId);
    setLocalCert(null);
  }, [apiEnabled, applyViewer, eventId]);

  const publishUpdate = useCallback(
    async (payload: PublishLiveInfoPayload): Promise<boolean> => {
      if (!payload.ratings.length) return false;

      if (apiEnabled && eventId > 0) {
        try {
          await publishLiveInfoUpdate(eventId, payload);
          await reload({ silent: true });
          void Taro.showToast({ title: "实时资讯已发布", icon: "success" });
          return true;
        } catch (err: unknown) {
          const msg =
            err && typeof err === "object" && "message" in err
              ? String((err as { message?: string }).message)
              : "发布失败";
          void Taro.showToast({ title: msg.slice(0, 40) || "发布失败", icon: "none" });
          return false;
        }
      }

      const item: LiveInfoFeedItem = {
        id: `live-${Date.now()}`,
        userName: userName || "用户",
        certified: true,
        timeLabel: "刚刚",
        ratings: payload.ratings,
        remark: payload.remark?.trim() || undefined,
        likes: 0,
      };
      setFeed((prev) => [item, ...prev]);
      const averaged = averageSummary(summary, payload.ratings, certCount);
      setSummary(averaged.summary);
      setCertCount(averaged.certCount);
      void Taro.showToast({ title: "实时资讯已发布", icon: "success" });
      return true;
    },
    [apiEnabled, certCount, eventId, reload, summary, userName],
  );

  const toggleFeedLike = useCallback(
    async (feedId: string) => {
      if (apiEnabled && eventId > 0) {
        try {
          const res = await toggleLiveInfoUpdateLike(eventId, feedId);
          setFeed((prev) =>
            prev.map((item) => (item.id === feedId ? res.update : item)),
          );
        } catch {
          void Taro.showToast({ title: "操作失败", icon: "none" });
        }
        return;
      }

      setFeed((prev) =>
        prev.map((item) => {
          if (item.id !== feedId) return item;
          const liked = !item.liked;
          return {
            ...item,
            liked,
            likes: Math.max(0, item.likes + (liked ? 1 : -1)),
          };
        }),
      );
    },
    [apiEnabled, applyViewer, eventId],
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
};
