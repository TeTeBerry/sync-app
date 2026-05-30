import "./PostActionMenu.scss";
import { EllipsisVertical, Share2 } from "lucide-react-taro";
import { useCallback, useState, type FC } from "react";
import Taro from "@tarojs/taro";
import ActionSheet from "./ActionSheet";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { blockUserAndInvalidate, submitReportAndInvalidate } from "../hooks/useSyncApi";
import { usePostShareStore } from "../stores/postShareStore";
import type { ReportCategory } from "../types/backend";
import type { PostSharePayload } from "../utils/postShare";
import { Button, Text, View } from '@tarojs/components';

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
      <Share2 size={18} color="#8e8e93" />
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

  const reportCategories: ReportCategory[] = ["ads", "scalper", "vulgar"];
  const categoryLabels: Record<ReportCategory, string> = {
    ads: "广告骚扰",
    scalper: "黄牛/欺诈",
    vulgar: "低俗内容",
  };

  const menuItems = onDelete
    ? [
        {
          label: "删除",
          onSelect: () => {
            closeAll();
            onDelete();
          },
        },
      ]
    : [
        {
          label: "举报",
          onSelect: () => {
            setMenuOpen(false);
            setReportOpen(true);
          },
        },
        {
          label: "屏蔽",
          onSelect: () => void handleBlock(),
        },
      ];

  return (
    <View>
      <Button className="s-post-action-menu__trigger"
        aria-label="更多"
        onClick={() => setMenuOpen(true)}>
        <EllipsisVertical size={18} color="#8e8e93" />
      </Button>

      <ActionSheet
        overlayClassName="s-post-action-sheet"
        open={menuOpen}
        title="帖子操作"
        cancelLabel="取消"
        onCancel={closeAll}
        items={menuItems}
      />

      {!onDelete ? (
        <ActionSheet
          overlayClassName="s-post-action-sheet"
          open={reportOpen}
          title="举报原因"
          cancelLabel="取消"
          onCancel={closeAll}
          items={reportCategories.map((category) => ({
            label: categoryLabels[category],
            onSelect: () => void handleReport(category),
          }))}
        />
      ) : null}

      {confirmDialog}
    </View>
  );
};
