import "./PostActionMenu.scss";
import { MoreVerticalIcon } from "lucide-react";
import { useCallback, useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import Taro from "@tarojs/taro";
import { useQueryClient } from "@tanstack/react-query";
import ActionSheet from "./ActionSheet";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { blockUserAndInvalidate, submitReportAndInvalidate } from "../hooks/useSyncApi";
import type { ReportCategory } from "../types/backend";

export type PostActionMenuProps = {
  postId: string;
  authorUserId?: string;
  disabled?: boolean;
};

export const PostActionMenu: FC<PostActionMenuProps> = ({
  postId,
  authorUserId,
  disabled,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t("common.cancel"),
  });

  const closeAll = useCallback(() => {
    setMenuOpen(false);
    setReportOpen(false);
  }, []);

  const handleBlock = useCallback(async () => {
    closeAll();
    if (!authorUserId?.trim()) {
      void Taro.showToast({ title: t("postActions.blockUnavailable"), icon: "none" });
      return;
    }

    const confirmed = await confirm({
      title: t("postActions.blockConfirmTitle"),
      message: t("postActions.blockConfirmMessage"),
      confirmText: t("postActions.block"),
    });
    if (!confirmed) return;

    try {
      await blockUserAndInvalidate(queryClient, authorUserId);
      void Taro.showToast({ title: t("postActions.blocked"), icon: "success" });
    } catch {
      void Taro.showToast({ title: t("postActions.blockFailed"), icon: "none" });
    }
  }, [authorUserId, closeAll, confirm, queryClient, t]);

  const handleReport = useCallback(
    async (category: ReportCategory) => {
      closeAll();
      try {
        await submitReportAndInvalidate(queryClient, {
          targetType: "post",
          targetId: postId,
          targetUserId: authorUserId,
          category,
        });
        void Taro.showToast({ title: t("postActions.reported"), icon: "success" });
      } catch {
        void Taro.showToast({ title: t("postActions.reportFailed"), icon: "none" });
      }
    },
    [authorUserId, closeAll, postId, queryClient, t],
  );

  if (disabled) return null;

  const reportCategories: ReportCategory[] = ["ads", "scalper", "vulgar"];

  return (
    <>
      <button
        type="button"
        className="s-post-action-menu__trigger"
        aria-label={t("postActions.more")}
        onClick={() => setMenuOpen(true)}
      >
        <MoreVerticalIcon size={18} />
      </button>

      <ActionSheet
        open={menuOpen}
        title={t("postActions.title")}
        cancelLabel={t("common.cancel")}
        onCancel={closeAll}
        items={[
          {
            label: t("postActions.report"),
            onSelect: () => {
              setMenuOpen(false);
              setReportOpen(true);
            },
          },
          {
            label: t("postActions.block"),
            onSelect: () => void handleBlock(),
          },
        ]}
      />

      <ActionSheet
        open={reportOpen}
        title={t("postActions.reportTitle")}
        cancelLabel={t("common.cancel")}
        onCancel={closeAll}
        items={reportCategories.map((category) => ({
          label: t(`postActions.categories.${category}`),
          onSelect: () => void handleReport(category),
        }))}
      />

      {confirmDialog}
    </>
  );
};
