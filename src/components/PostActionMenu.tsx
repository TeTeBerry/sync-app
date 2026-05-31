import "./PostActionMenu.scss";
import { EllipsisVertical, Share2 } from "lucide-react-taro";
import { useCallback, useState, type FC } from "react";
import Taro from "@tarojs/taro";
import { PostActionSheet } from "./PostActionSheet";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { blockUserAndInvalidate, submitReportAndInvalidate } from "../hooks/useSyncApi";
import { usePostShareStore } from "../stores/postShareStore";
import type { ReportCategory } from "../types/backend";
import type { PostSharePayload } from "../utils/postShare";
import { POST_ACTION_ICON_COLOR } from "../utils/postActionColors";
import { Button, View } from "@tarojs/components";

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
  const isWeapp = process.env.TARO_ENV === "weapp";

  const handleShareTap = useCallback(() => {
    setPendingShare(share);
    if (!isWeapp) {
      void Taro.showToast({ title: "请在微信小程序中分享", icon: "none" });
    }
  }, [isWeapp, setPendingShare, share]);

  return (
    <Button
      className="s-post-share-btn"
      aria-label="分享"
      openType={isWeapp ? "share" : undefined}
      onClick={handleShareTap}>
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
    cancelText: "取消",
  });

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setReportOpen(false);
  }, []);

  const handleBlock = useCallback(async () => {
    closeAll();
    if (!authorUserId?.trim()) {
      void Taro.showToast({ title: "无法屏蔽该用户", icon: "none" });
      return;
    }

    const confirmed = await confirm({
      title: "屏蔽用户",
      message: "屏蔽后将不再看到该用户的内容，确定要继续吗？",
      confirmText: "屏蔽",
    });
    if (!confirmed) return;

    try {
      await blockUserAndInvalidate(authorUserId);
      void Taro.showToast({ title: "已屏蔽", icon: "success" });
    } catch {
      void Taro.showToast({ title: "屏蔽失败，请稍后重试", icon: "none" });
    }
  }, [authorUserId, closeAll, confirm]);

  const handleReport = useCallback(
    async (category: ReportCategory) => {
      closeAll();
      try {
        await submitReportAndInvalidate({
          targetType: "post",
          targetId: postId,
          targetUserId: authorUserId,
          category,
        });
        void Taro.showToast({ title: "举报已提交", icon: "success" });
      } catch {
        void Taro.showToast({ title: "举报失败，请稍后重试", icon: "none" });
      }
    },
    [authorUserId, closeAll, postId],
  );

  if (disabled) return null;

  const sheetOpen = menuOpen || reportOpen;
  const sheetStep = reportOpen ? "report" : "actions";
  const sheetMode = onDelete ? "owner" : "viewer";

  return (
    <View>
      <Button
        className="s-post-action-menu__trigger"
        aria-label="更多"
        onClick={() => setMenuOpen(true)}>
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
        onBlock={!onDelete ? () => void handleBlock() : undefined}
        onReportCategory={(category) => void handleReport(category)}
      />

      {confirmDialog}
    </View>
  );
};
