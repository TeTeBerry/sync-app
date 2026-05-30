import "./ContactUnlockQuotaExhaustedModal.scss";
import React, { useMemo } from "react";
import { ArrowRight, Crown, Lock, X } from "lucide-react-taro";
import { Text, View } from "@tarojs/components";
import { useOverlayLock } from "../../hooks/useOverlayLock";
import { useProfilePackagesQuery } from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { MOCK_PACKAGE_CATALOG } from "../../pages/profile/profilePackageData";
import type { FreeMonthlyQuota, PackageTierId } from "../../types/backend";
import {
  buildContactUnlockUpgradeCompare,
  resolveContactUnlockUpgradeTargetTier,
} from "../../utils/contactUnlockUpgradeCompare";

export type ContactUnlockQuotaExhaustedModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgrade: (targetTierId: PackageTierId) => void;
  currentPaidTierId?: PackageTierId | null;
  freeMonthly?: FreeMonthlyQuota | null;
};

export function ContactUnlockQuotaExhaustedModal({
  open,
  onClose,
  onUpgrade,
  currentPaidTierId,
  freeMonthly,
}: ContactUnlockQuotaExhaustedModalProps) {
  useOverlayLock(open);

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
      style={{ zIndex: "var(--overlay-z-dialog)" }}
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
          <X size={18} color="#8e8e93" aria-hidden />
        </View>

        <View className="s-contact-unlock-exhausted-modal__icon-wrap" aria-hidden>
          <Lock size={28} className="s-contact-unlock-exhausted-modal__icon" />
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
          <Text className="s-contact-unlock-exhausted-modal__card-title">
            {compareModel.targetTierName} 套餐权益
          </Text>
          {compareModel.rows.map((row) => (
            <View key={row.id} className="s-contact-unlock-exhausted-modal__row">
              <Text className="s-contact-unlock-exhausted-modal__row-label">
                {row.label}
              </Text>
              <View className="s-contact-unlock-exhausted-modal__row-values">
                <Text className="s-contact-unlock-exhausted-modal__row-current">
                  {row.current}
                </Text>
                <ArrowRight
                  size={14}
                  className="s-contact-unlock-exhausted-modal__row-arrow"
                  aria-hidden
                />
                <Text className="s-contact-unlock-exhausted-modal__row-target">
                  {row.target}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View
          className="s-contact-unlock-exhausted-modal__cta"
          hoverClass="s-contact-unlock-exhausted-modal__cta--pressed"
          onClick={() => onUpgrade(targetTierId)}>
          <Crown size={18} className="s-contact-unlock-exhausted-modal__cta-icon" aria-hidden />
          <Text className="s-contact-unlock-exhausted-modal__cta-label">{ctaLabel}</Text>
        </View>
        <Text
          className="s-contact-unlock-exhausted-modal__secondary"
          onClick={onClose}>
          暂不升级
        </Text>
      </View>
    </View>
  );
}
