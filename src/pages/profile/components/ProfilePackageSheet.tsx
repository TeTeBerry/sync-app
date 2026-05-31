import "./ProfilePackageSheet.scss";
import "./ProfilePackageSheetActivityStep.scss";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Taro from "@tarojs/taro";
import {
  ChevronLeft,
  Crown,
  Infinity,
  LockOpen,
  Map,
  Megaphone,
  Pin,
  Sparkles,
  Ticket,
  X,
} from "lucide-react-taro";
import { useOverlayLock } from "../../../hooks/useOverlayLock";
import {
  useProfilePackagesQuery,
  purchaseProfilePackageAndInvalidate,
} from "../../../hooks/useSyncApi";
import { isApiEnabled } from "../../../constants/api";
import {
  isBoundActivityLegacyId,
  MOCK_PACKAGE_CATALOG,
  PACKAGE_SHEET_ACTIVITY_STEP,
  resolvePackageActivityPayCta,
  resolvePackageTierStepCta,
} from "../profilePackageData";
import type {
  PackageFeatureDefinition,
  PackageFeatureIcon,
  PackageTierDefinition,
  PackageTierId,
  ProfileActivityItem,
} from "../../../types/backend";
import { compareActivitiesNearestFirst } from "../../../utils/activityStatus";
import { safeTrim } from "../../../utils/safeString";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { ScrollView, Text, View } from "@tarojs/components";

const FEATURE_ICONS: Record<PackageFeatureIcon, typeof Sparkles> = {
  match: Sparkles,
  contact: LockOpen,
  map: Map,
  exposure: Megaphone,
  pin: Pin,
};

export type ProfilePackageSheetStep = "tier" | "activity";

export type ProfilePackageSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Pre-bound activity (upgrade). Skips activity selection after tier confirm. */
  activityLegacyId?: number;
  /** Pre-select tier when sheet opens (e.g. upgrade from paid card). */
  initialSelectedTierId?: PackageTierId;
  /** Paid tier already owned for pre-bound activity (blocks repeat purchase). */
  currentPaidTierId?: PackageTierId | null;
  activities?: ProfileActivityItem[];
  activitiesLoading?: boolean;
  /** activityLegacyId → paid tier owned for that activity. */
  paidTierByActivityLegacyId?: ReadonlyMap<number, PackageTierId>;
  onPurchaseSuccess?: () => void;
};

function featureIconColor(tierId: PackageTierId, selected: boolean): string {
  if (!selected) {
    return "#8e8e93";
  }
  if (tierId === "pro") {
    return "#4cc9f0";
  }
  if (tierId === "pro_plus") {
    return "var(--primary)";
  }
  if (tierId === "ultra") {
    return "#a855f7";
  }
  return "#8e8e93";
}

function formatActivityMeta(item: ProfileActivityItem): string {
  return [safeTrim(item.date), safeTrim(item.location)].filter(Boolean).join(" · ");
}

function PackageFeatureRow({
  feature,
  tierId,
  selected,
}: {
  feature: PackageFeatureDefinition;
  tierId: PackageTierId;
  selected: boolean;
}) {
  const Icon = feature.unlimited
    ? Infinity
    : (FEATURE_ICONS[feature.icon] ?? Sparkles);
  return (
    <View className="s-profile-package-sheet__feature">
      <Icon
        size={14}
        color={featureIconColor(tierId, selected)}
        className="s-profile-package-sheet__feature-icon"
        aria-hidden
      />
      <Text className="s-profile-package-sheet__feature-text">{feature.text}</Text>
    </View>
  );
}

function PackageCard({
  tier,
  selected,
  onSelect,
}: {
  tier: PackageTierDefinition;
  selected: boolean;
  onSelect: (id: PackageTierId) => void;
}) {
  return (
    <View
      className={`s-profile-package-sheet__card s-profile-package-sheet__card--${tier.id}${
        selected ? " s-profile-package-sheet__card--selected" : ""
      }`}
      onClick={() => onSelect(tier.id)}>
      <View className="s-profile-package-sheet__card-head">
        <View className="s-profile-package-sheet__card-intro">
          <View className="s-profile-package-sheet__card-title-row">
            <Text className="s-profile-package-sheet__card-name">{tier.name}</Text>
            {tier.badge ? (
              <View className="s-profile-package-sheet__card-badge">
                <Text className="s-profile-package-sheet__card-badge-text">
                  {tier.badge}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="s-profile-package-sheet__card-audience">{tier.audience}</Text>
        </View>
        <View className="s-profile-package-sheet__card-price-col">
          <Text className="s-profile-package-sheet__card-price">¥ {tier.priceLabel}</Text>
          <Text className="s-profile-package-sheet__card-price-unit">元 / 单场</Text>
        </View>
      </View>
      <View className="s-profile-package-sheet__features">
        {tier.features.map((feature) => (
          <PackageFeatureRow
            key={feature.text}
            feature={feature}
            tierId={tier.id}
            selected={selected}
          />
        ))}
      </View>
    </View>
  );
}

function ActivityPickerRow({
  item,
  selected,
  onSelect,
}: {
  item: ProfileActivityItem;
  selected: boolean;
  onSelect: (legacyId: number) => void;
}) {
  const legacyId = Number(item.id);
  const meta = formatActivityMeta(item);

  return (
    <View
      className={`s-profile-package-sheet__activity-item${
        selected ? " s-profile-package-sheet__activity-item--selected" : ""
      }`}
      onClick={() => {
        if (!Number.isNaN(legacyId)) {
          onSelect(legacyId);
        }
      }}>
      <ImageWithFallback
        src={item.image}
        alt=""
        imageClassName="s-profile-package-sheet__activity-thumb"
        placeholderClassName="s-profile-package-sheet__activity-thumb s-profile-package-sheet__activity-thumb--placeholder"
        fallback={(item.title ?? "").slice(0, 2)}
      />
      <View className="s-profile-package-sheet__activity-body">
        <Text className="s-profile-package-sheet__activity-name">{item.title}</Text>
        {meta ? (
          <Text className="s-profile-package-sheet__activity-meta">{meta}</Text>
        ) : null}
      </View>
      <View className="s-profile-package-sheet__activity-radio" aria-hidden />
    </View>
  );
}

const ProfilePackageSheet: React.FC<ProfilePackageSheetProps> = ({
  open,
  onClose,
  activityLegacyId,
  initialSelectedTierId,
  currentPaidTierId,
  activities = [],
  activitiesLoading = false,
  paidTierByActivityLegacyId,
  onPurchaseSuccess,
}) => {
  useOverlayLock(open);
  const apiEnabled = isApiEnabled();
  const packagesQuery = useProfilePackagesQuery();
  const catalog = apiEnabled ? packagesQuery.data : MOCK_PACKAGE_CATALOG;
  const tiers = catalog?.tiers ?? [];
  const sheetMeta = catalog?.sheet;

  const [step, setStep] = useState<ProfilePackageSheetStep>("tier");
  const [selectedId, setSelectedId] = useState<PackageTierId>("pro");
  const [selectedActivityLegacyId, setSelectedActivityLegacyId] = useState<
    number | undefined
  >(undefined);
  const [purchasing, setPurchasing] = useState(false);

  const boundActivityLegacyId = isBoundActivityLegacyId(activityLegacyId)
    ? activityLegacyId
    : undefined;
  const activityPreKnown = boundActivityLegacyId != null;
  const displayStep: ProfilePackageSheetStep = activityPreKnown ? "tier" : step;

  const sortedActivities = useMemo(
    () => [...activities].sort(compareActivitiesNearestFirst),
    [activities],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setStep("tier");
    setSelectedActivityLegacyId(
      activityPreKnown ? boundActivityLegacyId : undefined,
    );
    if (
      initialSelectedTierId &&
      tiers.some((tier) => tier.id === initialSelectedTierId)
    ) {
      setSelectedId(initialSelectedTierId);
      return;
    }
    if (sheetMeta?.defaultTierId) {
      setSelectedId(sheetMeta.defaultTierId);
    }
  }, [
    activityPreKnown,
    boundActivityLegacyId,
    initialSelectedTierId,
    open,
    sheetMeta?.defaultTierId,
    tiers,
  ]);

  useEffect(() => {
    if (activityPreKnown && step === "activity") {
      setStep("tier");
    }
  }, [activityPreKnown, step]);

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === selectedId) ?? tiers[1] ?? tiers[0],
    [selectedId, tiers],
  );

  const effectiveActivityLegacyId = activityPreKnown
    ? boundActivityLegacyId
    : selectedActivityLegacyId;

  const paidTierForEffectiveActivity = useMemo(() => {
    if (effectiveActivityLegacyId == null) {
      return undefined;
    }
    return (
      paidTierByActivityLegacyId?.get(effectiveActivityLegacyId) ??
      (activityPreKnown ? currentPaidTierId : undefined)
    );
  }, [
    activityPreKnown,
    currentPaidTierId,
    effectiveActivityLegacyId,
    paidTierByActivityLegacyId,
  ]);

  const tierStepCta = useMemo(
    () =>
      resolvePackageTierStepCta({
        selectedTier,
        activityPreKnown,
        currentPaidTierId: activityPreKnown
          ? paidTierForEffectiveActivity
          : undefined,
      }),
    [activityPreKnown, paidTierForEffectiveActivity, selectedTier],
  );

  const activityStepCta = useMemo(
    () =>
      resolvePackageActivityPayCta({
        selectedTier,
        paidTierId: paidTierForEffectiveActivity,
      }),
    [paidTierForEffectiveActivity, selectedTier],
  );

  const activeCta = displayStep === "tier" ? tierStepCta : activityStepCta;

  const handlePurchase = useCallback(async () => {
    if (activeCta.purchaseDisabled) {
      return;
    }
    if (!selectedTier) {
      void Taro.showToast({ title: "套餐加载中，请稍候", icon: "none" });
      return;
    }
    if (!apiEnabled) {
      void Taro.showToast({
        title: `${selectedTier.name} 购买即将上线`,
        icon: "none",
      });
      onClose();
      return;
    }
    if (effectiveActivityLegacyId == null || Number.isNaN(effectiveActivityLegacyId)) {
      void Taro.showToast({
        title: "请先选择适用活动",
        icon: "none",
      });
      return;
    }
    if (purchasing) return;

    setPurchasing(true);
    try {
      const result = await purchaseProfilePackageAndInvalidate({
        tierId: selectedTier.id,
        activityLegacyId: effectiveActivityLegacyId,
      });
      void Taro.showToast({
        title: `${result.entitlement.tierName} 已开通`,
        icon: "success",
      });
      onPurchaseSuccess?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "购买失败，请稍后重试";
      void Taro.showToast({ title: message, icon: "none" });
    } finally {
      setPurchasing(false);
    }
  }, [
    activeCta.purchaseDisabled,
    apiEnabled,
    effectiveActivityLegacyId,
    onClose,
    onPurchaseSuccess,
    purchasing,
    selectedTier,
  ]);

  const handleTierStepPrimary = useCallback(() => {
    if (tierStepCta.purchaseDisabled || purchasing) {
      return;
    }
    if (activityPreKnown) {
      void handlePurchase();
      return;
    }
    setStep("activity");
  }, [activityPreKnown, handlePurchase, purchasing, tierStepCta.purchaseDisabled]);

  const handleActivityStepPrimary = useCallback(() => {
    if (activityStepCta.purchaseDisabled || purchasing) {
      return;
    }
    void handlePurchase();
  }, [activityStepCta.purchaseDisabled, handlePurchase, purchasing]);

  const handleBackToTier = useCallback(() => {
    setStep("tier");
  }, []);

  if (!open) {
    return null;
  }

  const ctaTierClass = activeCta.neutralDisabled ? "pro" : selectedId;
  const ctaDisabled = purchasing || activeCta.purchaseDisabled;

  return (
    <View
      className="s-overlay s-overlay--sheet s-profile-package-sheet"
      role="presentation">
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View className="s-overlay__panel" aria-hidden={!open}>
        <View className="s-profile-package-sheet__handle" aria-hidden />

        {displayStep === "tier" ? (
          <>
            <View className="s-profile-package-sheet__top">
              <View
                className="s-profile-package-sheet__close"
                aria-label="关闭"
                hoverClass="s-profile-package-sheet__close--pressed"
                onClick={onClose}>
                <X size={18} color="#8e8e93" />
              </View>
              <Text className="s-profile-package-sheet__title">
                {sheetMeta?.title ?? "单场套餐"}
              </Text>
              <Text className="s-profile-package-sheet__subtitle">
                {sheetMeta?.subtitle ?? "按场购买，灵活使用，无订阅压力"}
              </Text>
            </View>

            <View className="s-profile-package-sheet__list">
              {apiEnabled && packagesQuery.isLoading && tiers.length === 0 ? (
                <Text className="s-profile-package-sheet__loading">加载套餐…</Text>
              ) : null}
              {tiers.map((tier) => (
                <PackageCard
                  key={tier.id}
                  tier={tier}
                  selected={tier.id === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </View>

            <View className="s-profile-package-sheet__foot">
              <View
                className={`s-profile-package-sheet__cta s-profile-package-sheet__cta--${ctaTierClass}${
                  ctaDisabled ? " s-profile-package-sheet__cta--disabled" : ""
                }${activeCta.neutralDisabled ? " s-profile-package-sheet__cta--neutral" : ""}`}
                hoverClass={
                  ctaDisabled ? "" : "s-profile-package-sheet__cta--pressed"
                }
                onClick={handleTierStepPrimary}>
                <Crown size={18} color="inherit" aria-hidden />
                <Text className="s-profile-package-sheet__cta-label">
                  {tierStepCta.label}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View className="s-profile-package-sheet__top">
              <View
                className="s-profile-package-sheet__back"
                aria-label="返回"
                hoverClass="s-profile-package-sheet__back--pressed"
                onClick={handleBackToTier}>
                <ChevronLeft size={18} color="#8e8e93" />
              </View>
              <View
                className="s-profile-package-sheet__close"
                aria-label="关闭"
                hoverClass="s-profile-package-sheet__close--pressed"
                onClick={onClose}>
                <X size={18} color="#8e8e93" />
              </View>
              <Text className="s-profile-package-sheet__title">
                {PACKAGE_SHEET_ACTIVITY_STEP.title}
              </Text>
              <Text className="s-profile-package-sheet__subtitle">
                {PACKAGE_SHEET_ACTIVITY_STEP.subtitle}
              </Text>
            </View>

            <ScrollView
              scrollY
              enhanced
              showScrollbar={false}
              className="s-profile-package-sheet__activity-scroll s-scrollbar-none">
              <View className="s-profile-package-sheet__activity-list">
                {activitiesLoading ? (
                  <Text className="s-profile-package-sheet__loading">加载活动…</Text>
                ) : sortedActivities.length === 0 ? (
                  <View className="s-profile-package-sheet__empty">
                    <View className="s-profile-package-sheet__empty-icon">
                      <Ticket size={22} color="#8e8e93" aria-hidden />
                    </View>
                    <Text className="s-profile-package-sheet__empty-title">
                      还没有报名活动
                    </Text>
                    <Text className="s-profile-package-sheet__empty-hint">
                      在首页或活动页报名后，可在此绑定套餐权益
                    </Text>
                  </View>
                ) : (
                  sortedActivities.map((item) => {
                    const legacyId = Number(item.id);
                    return (
                      <ActivityPickerRow
                        key={item.id}
                        item={item}
                        selected={
                          !Number.isNaN(legacyId) &&
                          selectedActivityLegacyId === legacyId
                        }
                        onSelect={setSelectedActivityLegacyId}
                      />
                    );
                  })
                )}
              </View>
            </ScrollView>

            <View className="s-profile-package-sheet__foot">
              <View
                className={`s-profile-package-sheet__cta s-profile-package-sheet__cta--${ctaTierClass}${
                  ctaDisabled ? " s-profile-package-sheet__cta--disabled" : ""
                }${activeCta.neutralDisabled ? " s-profile-package-sheet__cta--neutral" : ""}`}
                hoverClass={
                  ctaDisabled ? "" : "s-profile-package-sheet__cta--pressed"
                }
                onClick={handleActivityStepPrimary}>
                <Crown size={18} color="inherit" aria-hidden />
                <Text className="s-profile-package-sheet__cta-label">
                  {activityStepCta.label}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default ProfilePackageSheet;
