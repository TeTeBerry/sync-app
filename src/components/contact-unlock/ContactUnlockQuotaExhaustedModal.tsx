import "./ContactUnlockQuotaExhaustedModal.scss";
import React, { useCallback, useMemo } from "react";
import Taro from "@tarojs/taro";
import {
  ArrowRight,
  Crown,
  Lock,
  Map,
  Sparkles,
  Star,
  X,
} from "lucide-react-taro";
import { Text, View } from "@tarojs/components";
import { useOverlayLock } from "../../hooks/useOverlayLock";
import { useProfilePackagesQuery } from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { MOCK_PACKAGE_CATALOG } from "../../pages/profile/profilePackageData";
import type { FreeMonthlyQuota, PackageTierId } from "../../types/backend";
import {
  buildContactUnlockUpgradeCompare,
  resolveContactUnlockUpgradeTargetTier,
  type ContactUnlockUpgradeCompareRowId,
} from "../../utils/contactUnlockUpgradeCompare";
import { goProfileBenefits } from "../../utils/route";

const ROW_ICONS: Record<
  ContactUnlockUpgradeCompareRowId,
  React.ComponentType<{ size?: number | string; className?: string }>
> = {
  contactUnlock: Lock,
  aiMatch: Sparkles,
  map: Map,
};

export type ContactUnlockQuotaExhaustedModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgrade: (targetTierId: PackageTierId) => void;
  /** Defaults to closing the modal and switching to the profile tab. */
  onViewAllBenefits?: () => void;
  currentPaidTierId?: PackageTierId | null;
  freeMonthly?: FreeMonthlyQuota | null;
};

export function ContactUnlockQuotaExhaustedModal({
  open,
  onClose,
  onUpgrade,
  onViewAllBenefits,
  currentPaidTierId,
  freeMonthly,
}: ContactUnlockQuotaExhaustedModalProps) {
  useOverlayLock(open);

  const handleViewAllBenefits = useCallback(() => {
    onClose();
    if (onViewAllBenefits) {
      onViewAllBenefits();
      return;
    }
    void Taro.nextTick(() => {
      goProfileBenefits();
    });
  }, [onClose, onViewAllBenefits]);

  const apiEnabled = isApiEnabled();
  const packagesQuery = useProfilePackagesQuery();
  const tiers = (apiEnabled ? packagesQuery.data : MOCK_PACKAGE_CATALOG)?.tiers ?? [];

  const targetTierId = useMemo(
    () => resolveContactUnlockUpgradeTargetTier(currentPaidTierId),
    [currentPaidTierId],
  );

  const compareModel = useMemo(() => {
    if (!targetTierId) {
      return null;
    }
    return buildContactUnlockUpgradeCompare({
      tiers,
      currentPaidTierId,
      targetTierId,
      freeMonthly,
    });
  }, [currentPaidTierId, freeMonthly, targetTierId, tiers]);

  if (!open || !compareModel || !targetTierId) {
    return null;
  }

  const ctaLabel = `立即升级 ${compareModel.targetTierName}`;

  return (
    <View
      className="s-overlay s-contact-unlock-exhausted-modal"
      role="presentation">
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-contact-unlock-exhausted-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-unlock-exhausted-title">
        <View
          className="s-contact-unlock-exhausted-modal__close"
          aria-label="关闭"
          onClick={onClose}>
          <X size={16} color="#8e8e93" aria-hidden />
        </View>

        <View className="s-contact-unlock-exhausted-modal__body">
          <View className="s-contact-unlock-exhausted-modal__icon-wrap" aria-hidden>
            <Lock size={26} className="s-contact-unlock-exhausted-modal__icon" />
          </View>

          <Text
            id="contact-unlock-exhausted-title"
            className="s-contact-unlock-exhausted-modal__title">
            联系方式解锁次数已用尽
          </Text>
          <Text className="s-contact-unlock-exhausted-modal__subtitle">
            本月联系方式解锁配额已全部用完{"\n"}升级套餐即可立即恢复解锁能力
          </Text>

          <View className="s-contact-unlock-exhausted-modal__card">
            <View className="s-contact-unlock-exhausted-modal__card-head">
              <Star
                size={14}
                className="s-contact-unlock-exhausted-modal__card-star"
                aria-hidden
              />
              <Text className="s-contact-unlock-exhausted-modal__card-title">
                {compareModel.targetTierName} 套餐权益
              </Text>
            </View>

            {compareModel.rows.map((row) => {
              const RowIcon = ROW_ICONS[row.id];
              return (
                <View key={row.id} className="s-contact-unlock-exhausted-modal__row">
                  <View className="s-contact-unlock-exhausted-modal__row-left">
                    <RowIcon
                      size={14}
                      className="s-contact-unlock-exhausted-modal__row-icon"
                      aria-hidden
                    />
                    <Text className="s-contact-unlock-exhausted-modal__row-label">
                      {row.label}
                    </Text>
                  </View>
                  <View className="s-contact-unlock-exhausted-modal__row-values">
                    <Text className="s-contact-unlock-exhausted-modal__pill s-contact-unlock-exhausted-modal__pill--current">
                      {row.current}
                    </Text>
                    <ArrowRight
                      size={12}
                      className="s-contact-unlock-exhausted-modal__row-arrow"
                      aria-hidden
                    />
                    <Text className="s-contact-unlock-exhausted-modal__pill s-contact-unlock-exhausted-modal__pill--target">
                      {row.target}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View className="s-contact-unlock-exhausted-modal__foot">
          <View
            className="s-contact-unlock-exhausted-modal__cta"
            hoverClass="s-contact-unlock-exhausted-modal__cta--pressed"
            onClick={() => onUpgrade(targetTierId)}>
            <Crown size={18} className="s-contact-unlock-exhausted-modal__cta-icon" aria-hidden />
            <Text className="s-contact-unlock-exhausted-modal__cta-label">{ctaLabel}</Text>
          </View>
          <Text
            className="s-contact-unlock-exhausted-modal__secondary"
            onClick={handleViewAllBenefits}>
            查看我的全部权益 &gt;
          </Text>
        </View>
      </View>
    </View>
  );
}
