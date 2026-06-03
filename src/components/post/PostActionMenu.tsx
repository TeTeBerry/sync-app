import './PostActionMenu.scss';
import { EllipsisVertical, Share2 } from '../../components/icons';
import { useCallback, useEffect, useState, type FC } from 'react';
import Taro from '@tarojs/taro';
import { PostActionSheet } from './PostActionSheet';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { blockUserAndInvalidate, submitReport } from '../../hooks/useSyncApi';
import { fetchReportStatus } from '../../api/sync/users';
import { isLiveApi } from '../../constants/api';
import { requireAuth } from '../../utils/authGate';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { usePostShareStore } from '../../stores/postShareStore';
import type { ReportCategory } from '../../types/backend';
import type { PostSharePayload } from '../../utils/postShare';
import { POST_ACTION_ICON_COLOR } from '../../utils/postActionColors';
import {
  REPORT_SUBMITTED_MODAL,
  formatReportStatusModalContent,
} from '../../utils/reportFeedback';
import type { ReportReviewStatus } from '../../types/backend';
import { Button } from '../ui';
import { View } from '@tarojs/components';

export type PostActionMenuProps = {
  postId: string;
  authorUserId?: string;
  onDelete?: () => void;
  disabled?: boolean;
};

export type PostShareButtonProps = {
  share: PostSharePayload;
};

export const PostShareButton: FC<PostShareButtonProps> = ({ share }) => {
  const setPendingShare = usePostShareStore((state) => state.setPendingShare);
  const isWeapp = process.env.TARO_ENV === 'weapp';

  const handleShareTap = useCallback(() => {
    setPendingShare(share);
    if (!isWeapp) {
      void Taro.showToast({ title: '请在微信小程序中分享', icon: 'none' });
    }
  }, [isWeapp, setPendingShare, share]);

  return (
    <View
      className="s-post-share-btn"
      aria-label="分享"
      onClick={!isWeapp ? handleShareTap : undefined}
    >
      <Share2 size={18} color={POST_ACTION_ICON_COLOR} />
      {isWeapp ? (
        <Button
          className="s-post-share-btn__hit"
          plain
          hoverClass="none"
          aria-label="分享"
          openType="share"
          onClick={handleShareTap}
        />
      ) : null}
    </View>
  );
};

export const PostActionMenu: FC<PostActionMenuProps> = ({
  postId,
  authorUserId,
  onDelete,
  disabled,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [reportReviewStatus, setReportReviewStatus] = useState<ReportReviewStatus>();
  const [reportCategory, setReportCategory] = useState<ReportCategory>();
  const [reportCreatedAt, setReportCreatedAt] = useState<string>();
  const [statusLoading, setStatusLoading] = useState(false);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setReportOpen(false);
  }, []);

  const ensureApiReady = useCallback((): boolean => {
    if (isLiveApi()) return true;
    void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
    return false;
  }, []);

  const loadReportStatus = useCallback(async () => {
    if (!isLiveApi() || onDelete) return;
    setStatusLoading(true);
    try {
      const status = await fetchReportStatus('post', postId);
      setAlreadyReported(status.reported);
      setReportReviewStatus(status.reviewStatus);
      setReportCategory(status.category);
      setReportCreatedAt(status.createdAt);
    } catch {
      setAlreadyReported(false);
      setReportReviewStatus(undefined);
    } finally {
      setStatusLoading(false);
    }
  }, [onDelete, postId]);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    if (!onDelete) {
      void loadReportStatus();
    }
  }, [loadReportStatus, onDelete]);

  const runBlock = useCallback(async () => {
    if (!ensureApiReady()) return;

    const targetId = authorUserId?.trim();
    if (!targetId) {
      void Taro.showToast({ title: '无法屏蔽该用户', icon: 'none' });
      return;
    }

    const confirmed = await confirm({
      title: '屏蔽用户',
      message: '屏蔽后将不再看到该用户的内容，确定要继续吗？',
      confirmText: '屏蔽',
    });
    if (!confirmed) return;

    try {
      await blockUserAndInvalidate(targetId);
      void Taro.showToast({ title: '已屏蔽', icon: 'success' });
    } catch (error) {
      void Taro.showToast({
        title: getApiErrorMessage(error, '屏蔽失败，请稍后重试'),
        icon: 'none',
      });
    }
  }, [authorUserId, confirm, ensureApiReady]);

  const handleBlock = useCallback(() => {
    closeAll();
    requireAuth(() => {
      void runBlock();
    }, 'social');
  }, [closeAll, runBlock]);

  const showReportSubmittedModal = useCallback(() => {
    void Taro.showModal({
      title: REPORT_SUBMITTED_MODAL.title,
      content: REPORT_SUBMITTED_MODAL.content,
      showCancel: false,
      confirmText: REPORT_SUBMITTED_MODAL.confirmText,
    });
  }, []);

  const runReport = useCallback(
    async (category: ReportCategory) => {
      if (!ensureApiReady()) return;

      try {
        await submitReport({
          targetType: 'post',
          targetId: postId,
          targetUserId: authorUserId?.trim() || undefined,
          category,
        });
        setAlreadyReported(true);
        setReportReviewStatus('pending');
        setReportCategory(category);
        setReportCreatedAt(new Date().toISOString());
        showReportSubmittedModal();
      } catch (error) {
        void Taro.showToast({
          title: getApiErrorMessage(error, '举报失败，请稍后重试'),
          icon: 'none',
        });
      }
    },
    [authorUserId, ensureApiReady, postId, showReportSubmittedModal],
  );

  const handleReport = useCallback(
    (category: ReportCategory) => {
      if (alreadyReported) return;
      closeAll();
      requireAuth(() => {
        void runReport(category);
      }, 'social');
    },
    [alreadyReported, closeAll, runReport],
  );

  const handleOpenReport = useCallback(() => {
    if (alreadyReported) return;
    setMenuOpen(false);
    setReportOpen(true);
  }, [alreadyReported]);

  const showReportStatusModal = useCallback(() => {
    void Taro.showModal({
      title: reportReviewStatus === 'acknowledged' ? '举报已受理' : '举报进度',
      content: formatReportStatusModalContent({
        category: reportCategory,
        reviewStatus: reportReviewStatus,
        createdAt: reportCreatedAt,
      }),
      showCancel: false,
      confirmText: '知道了',
    });
  }, [reportCategory, reportCreatedAt, reportReviewStatus]);

  useEffect(() => {
    setAlreadyReported(false);
    setReportReviewStatus(undefined);
    setReportCategory(undefined);
    setReportCreatedAt(undefined);
  }, [postId]);

  if (disabled) return null;

  const sheetOpen = menuOpen || reportOpen;
  const sheetStep = reportOpen ? 'report' : 'actions';
  const sheetMode = onDelete ? 'owner' : 'viewer';

  return (
    <View className="s-post-action-menu__trigger-wrap">
      <Button
        className="s-post-action-menu__trigger--plain"
        plain
        hoverClass="none"
        aria-label="更多"
        onClick={openMenu}
      >
        <EllipsisVertical size={18} color={POST_ACTION_ICON_COLOR} />
      </Button>

      <PostActionSheet
        open={sheetOpen}
        step={sheetStep}
        mode={sheetMode}
        reportAlreadySubmitted={alreadyReported}
        reportReviewStatus={reportReviewStatus}
        reportStatusLoading={statusLoading}
        onViewReportStatus={alreadyReported ? showReportStatusModal : undefined}
        onCancel={closeAll}
        onBack={
          reportOpen
            ? () => {
                setReportOpen(false);
                setMenuOpen(true);
              }
            : undefined
        }
        onDelete={
          onDelete
            ? () => {
                closeAll();
                onDelete();
              }
            : undefined
        }
        onOpenReport={!onDelete ? handleOpenReport : undefined}
        onBlock={!onDelete ? handleBlock : undefined}
        onReportCategory={handleReport}
      />

      {confirmDialog}
    </View>
  );
};
