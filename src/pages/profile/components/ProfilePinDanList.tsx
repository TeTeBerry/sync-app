import Taro from "@tarojs/taro";
import React, { useCallback, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CarIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
  PackageIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmDialog from "../../../components/ConfirmDialog";
import CreatePinDanModal, {
  type PinDanCreateCategory,
  type PinDanSavedResult,
} from "../../../components/CreatePinDanModal";
import { deletePindan } from "../../../api/syncApi";
import { isApiEnabled } from "../../../constants/api";
import { invalidatePindanQueries } from "../../../hooks/useSyncApi";
import type { PindanJoinCard } from "../../../types/aiChat";
import { goPindan } from "../../../utils/route";
import { getClientUserId } from "../../../utils/session";
import { isBudgetModePindan, resolvePindanBudgetRangeLabel } from "../../../utils/pindanBudget";
import type { ProfilePinDanCategory, ProfilePinDanItem } from "../mockData";

export type ProfilePinDanListProps = {
  items: ProfilePinDanItem[];
  highlightId?: number | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onExit: (id: number) => void;
  onDeleted?: (id: number) => void;
  onRefresh?: () => void;
};

const categoryIcons: Record<ProfilePinDanCategory, typeof PackageIcon> = {
  package: PackageIcon,
  hotel: BuildingIcon,
  transport: CarIcon,
};

function toEditPindanCard(item: ProfilePinDanItem): PindanJoinCard {
  return {
    legacyId: item.id,
    activityLegacyId: item.activityId,
    category: item.category,
    title: item.title,
    subtitle: item.subtitle,
    remark: item.remark,
    date: item.date,
    location: item.location,
    price: item.price,
    pricePerPerson: item.price,
    budgetMin: item.budgetMin,
    budgetMax: item.budgetMax,
    budgetRangeLabel: item.budgetRangeLabel,
    total: item.total,
    isOwner: true,
  };
}

const ProfilePinDanList: React.FC<ProfilePinDanListProps> = ({
  items,
  highlightId = null,
  isLoading = false,
  isError = false,
  onRetry,
  onExit,
  onDeleted,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const clientUserId = useMemo(() => getClientUserId(), []);
  const [pendingExit, setPendingExit] = useState<ProfilePinDanItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProfilePinDanItem | null>(null);
  const [editPindanCard, setEditPindanCard] = useState<PindanJoinCard | null>(null);

  const handleMore = useCallback(() => {
    goPindan();
  }, []);

  const handleViewDetail = useCallback((item: ProfilePinDanItem) => {
    goPindan({
      type: item.category,
      highlightId: item.id,
      ...(item.activityId ? { activityId: item.activityId } : {}),
    });
  }, []);

  const handleExitClick = useCallback((item: ProfilePinDanItem) => {
    setPendingExit(item);
  }, []);

  const handleExitCancel = useCallback(() => {
    setPendingExit(null);
  }, []);

  const handleExitConfirm = useCallback(() => {
    if (!pendingExit) return;

    onExit(pendingExit.id);
    setPendingExit(null);
    void Taro.showToast({ title: t("profile.myPindan.exitSuccess"), icon: "success" });
  }, [onExit, pendingExit, t]);

  const handleEditClick = useCallback((item: ProfilePinDanItem) => {
    setEditPindanCard(toEditPindanCard(item));
  }, []);

  const handleDeleteClick = useCallback((item: ProfilePinDanItem) => {
    setPendingDelete(item);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDelete) return;

    const item = pendingDelete;
    setPendingDelete(null);

    if (!isApiEnabled()) {
      onDeleted?.(item.id);
      void Taro.showToast({ title: t("pindan.deleted"), icon: "success" });
      return;
    }

    try {
      await deletePindan(item.id, clientUserId);
      await invalidatePindanQueries(queryClient);
      onRefresh?.();
      void Taro.showToast({ title: t("pindan.deleted"), icon: "success" });
    } catch {
      void Taro.showToast({ title: t("common.requestFailed"), icon: "none" });
    }
  }, [clientUserId, onDeleted, onRefresh, pendingDelete, queryClient, t]);

  const handlePindanSaved = useCallback(
    (_result?: PinDanSavedResult) => {
      setEditPindanCard(null);
      void invalidatePindanQueries(queryClient);
      onRefresh?.();
    },
    [onRefresh, queryClient],
  );

  if (isLoading) {
    return <div className="s-profile-pindan__empty">{t("common.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="s-profile-pindan__empty">
        <span>{t("common.loadError")}</span>
        {onRetry ? (
          <button type="button" className="s-profile-pindan__retry" onClick={onRetry}>
            {t("common.retry")}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={pendingExit !== null}
        title={t("profile.myPindan.exitConfirmTitle")}
        message={
          pendingExit
            ? t("profile.myPindan.exitConfirmMessage", { title: pendingExit.title })
            : ""
        }
        confirmText={t("profile.myPindan.exit")}
        cancelText={t("common.cancel")}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title={t("pindan.deleteConfirmTitle")}
        message={
          pendingDelete
            ? t("pindan.deleteConfirmMessage", { title: pendingDelete.title })
            : ""
        }
        confirmText={t("pindan.delete")}
        cancelText={t("common.cancel")}
        danger
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={handleDeleteCancel}
      />

      <CreatePinDanModal
        open={editPindanCard !== null}
        onClose={() => setEditPindanCard(null)}
        categoryOptions={
          editPindanCard ? [editPindanCard.category as PinDanCreateCategory] : []
        }
        defaultCategory={editPindanCard?.category ?? "hotel"}
        initialEventName={editPindanCard?.title ?? ""}
        editPindan={editPindanCard}
        onSaved={handlePindanSaved}
      />

      <div className="s-profile-pindan">
        <div className="s-profile-pindan__head">
          <div className="s-profile-pindan__head-left">
            <span className="s-profile-pindan__head-icon" aria-hidden>
              <CheckCircle2Icon size={14} />
            </span>
            <span className="s-profile-pindan__head-title">{t("profile.myPindan.title")}</span>
            <span className="s-profile-pindan__head-badge">{items.length}</span>
          </div>
          <button type="button" className="s-profile-pindan__more" onClick={handleMore}>
            <span>{t("profile.myPindan.more")}</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>

        <div className="s-profile-pindan__list">
          {items.length === 0 ? (
            <div className="s-profile-pindan__empty">{t("profile.myPindan.empty")}</div>
          ) : (
            items.map((item) => {
              const TagIcon = categoryIcons[item.category];
              const isOwner = Boolean(item.isOwner);

              return (
                <article
                  key={item.id}
                  id={`profile-pindan-${item.id}`}
                  className={`s-profile-pindan__card${highlightId === item.id ? " s-profile-pindan__card--focused" : ""}${isOwner ? " s-profile-pindan__card--owner" : ""}`}
                >
                  <div className="s-profile-pindan__card-body">
                    <div className="s-profile-pindan__thumb-wrap">
                      <img className="s-profile-pindan__thumb" src={item.image} alt="" />
                      <span
                        className={`s-profile-pindan__joined-badge${isOwner ? " s-profile-pindan__joined-badge--owner" : ""}`}
                      >
                        <CheckCircle2Icon size={10} />
                        {isOwner
                          ? t("profile.myPindan.ownerBadge")
                          : t("profile.myPindan.joinedBadge")}
                      </span>
                    </div>

                    <div className="s-profile-pindan__content">
                      <span className="s-profile-pindan__tag">
                        <TagIcon size={10} />
                        {t(`profile.myPindan.category.${item.category}`)}
                      </span>

                      <h3 className="s-profile-pindan__title">{item.title}</h3>
                      <p className="s-profile-pindan__subtitle">{item.subtitle}</p>

                      <div className="s-profile-pindan__meta">
                        <span className="s-profile-pindan__meta-item">
                          <CalendarIcon size={12} />
                          {item.date}
                        </span>
                        <span className="s-profile-pindan__meta-item">
                          <MapPinIcon size={12} />
                          {item.location}
                        </span>
                      </div>

                      {item.remark?.trim() ? (
                        <p className="s-profile-pindan__remark">{item.remark.trim()}</p>
                      ) : null}

                      <div
                        className={`s-profile-pindan__price${
                          isBudgetModePindan(item) && resolvePindanBudgetRangeLabel(item)
                            ? ` s-profile-pindan__price--budget`
                            : ``
                        }`}
                      >
                        {isBudgetModePindan(item) && resolvePindanBudgetRangeLabel(item) ? (
                          <>
                            <span className="s-profile-pindan__price-label">
                              {t(`aimatch.pindan.budgetLabel`)}
                            </span>
                            <span className="s-profile-pindan__price-amount">
                              {resolvePindanBudgetRangeLabel(item)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="s-profile-pindan__price-currency">¥</span>
                            <span className="s-profile-pindan__price-value">{item.price}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="s-profile-pindan__divider" />

                  <div className="s-profile-pindan__foot">
                    <span className="s-profile-pindan__joined-at">
                      <ClockIcon size={12} />
                      {isOwner
                        ? t("profile.myPindan.createdAt", { time: item.joinedAt })
                        : t("profile.myPindan.joinedAt", { time: item.joinedAt })}
                    </span>

                    <div className="s-profile-pindan__actions">
                      {isOwner ? (
                        <>
                          <button
                            type="button"
                            className="s-profile-pindan__btn s-profile-pindan__btn--edit"
                            onClick={() => handleEditClick(item)}
                          >
                            {t("pindan.edit")}
                          </button>
                          <button
                            type="button"
                            className="s-profile-pindan__btn s-profile-pindan__btn--delete"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <Trash2Icon size={12} />
                            {t("pindan.delete")}
                          </button>
                          <button
                            type="button"
                            className="s-profile-pindan__btn s-profile-pindan__btn--primary"
                            onClick={() => handleViewDetail(item)}
                          >
                            {t("profile.myPindan.viewDetail")}
                            <ArrowRightIcon size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="s-profile-pindan__btn s-profile-pindan__btn--ghost"
                            onClick={() => handleExitClick(item)}
                          >
                            {t("profile.myPindan.exit")}
                          </button>
                          <button
                            type="button"
                            className="s-profile-pindan__btn s-profile-pindan__btn--primary"
                            onClick={() => handleViewDetail(item)}
                          >
                            {t("profile.myPindan.viewDetail")}
                            <ArrowRightIcon size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePinDanList;
