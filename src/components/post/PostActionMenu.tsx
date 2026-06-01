import './PostActionMenu.scss';
import { EllipsisVertical, Share2 } from 'lucide-react-taro';
import { useCallback, useState, type FC } from 'react';
import Taro from '@tarojs/taro';
import { PostActionSheet } from './PostActionSheet';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import {
  blockUserAndInvalidate,
  submitReport,
} from '../../hooks/useSyncApi';
import { isApiEnabled } from '../../constants/api';
import { requireAuth } from '../../utils/authGate';
import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { usePostShareStore } from '../../stores/postShareStore';
import type { ReportCategory } from '../../types/backend';
import type { PostSharePayload } from '../../utils/postShare';
import { POST_ACTION_ICON_COLOR } from '../../utils/postActionColors';
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
    <Button
      className="s-post-share-btn"
      aria-label="分享"
      openType={isWeapp ? 'share' : undefined}
      onClick={handleShareTap}
    >
      <Share2 size={18} color={POST_ACTION_ICON_COLOR} />
    </Button>
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
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setReportOpen(false);
  }, []);

  const ensureApiReady = useCallback((): boolean => {
    if (isApiEnabled()) return true;
    void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
    return false;
  }, []);

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
        void Taro.showToast({ title: '举报已提交', icon: 'success' });
      } catch (error) {
        void Taro.showToast({
          title: getApiErrorMessage(error, '举报失败，请稍后重试'),
          icon: 'none',
        });
      }
    },
    [authorUserId, ensureApiReady, postId],
  );

  const handleReport = useCallback(
    (category: ReportCategory) => {
      closeAll();
      requireAuth(() => {
        void runReport(category);
      }, 'social');
    },
    [closeAll, runReport],
  );

  if (disabled) return null;

  const sheetOpen = menuOpen || reportOpen;
  const sheetStep = reportOpen ? 'report' : 'actions';
  const sheetMode = onDelete ? 'owner' : 'viewer';

  return (
    <View>
      <Button
        className="s-post-action-menu__trigger"
        aria-label="更多"
        onClick={() => setMenuOpen(true)}
      >
        <EllipsisVertical size={18} color={POST_ACTION_ICON_COLOR} />
      </Button>

      <PostActionSheet
        open={sheetOpen}
        step={sheetStep}
        mode={sheetMode}
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
        onOpenReport={
          !onDelete
            ? () => {
                setMenuOpen(false);
                setReportOpen(true);
              }
            : undefined
        }
        onBlock={!onDelete ? handleBlock : undefined}
        onReportCategory={handleReport}
      />

      {confirmDialog}
    </View>
  );
};
