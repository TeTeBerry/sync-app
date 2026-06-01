import './AiPackageUpgradeSheet.scss';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { Crown, LockOpen, Map, Pin, Shield, Sparkles, X } from 'lucide-react-taro';
import { Text, View } from '@tarojs/components';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import {
  purchaseProfilePackageAndInvalidate,
  useProfilePackagesQuery,
} from '../../hooks/useSyncApi';
import { isApiEnabled } from '../../constants/api';
import { MOCK_PACKAGE_CATALOG, packageTierCtaLabel } from '../profile';
import type {
  PackageFeatureIcon,
  PackageTierDefinition,
  PackageTierId,
} from '../../types/backend';
import {
  buildAiPackageCompareRows,
  type AiPackageCompareRow,
} from './aiPackageUpgradeTable';

const TIER_ORDER: PackageTierId[] = ['pro', 'pro_plus', 'ultra'];

type PackageFeatureIconComponent = React.ComponentType<{
  size?: number | string;
  className?: string;
}>;

const FEATURE_ICONS: Record<PackageFeatureIcon, PackageFeatureIconComponent> = {
  match: Sparkles,
  contact: LockOpen,
  map: Map,
  exposure: Sparkles,
  pin: Pin,
};

export type AiPackageUpgradeSheetProps = {
  open: boolean;
  onClose: () => void;
  activityLegacyId?: number;
  onPurchaseSuccess?: () => void;
  onViewAllBenefits?: () => void;
};

function tierBadgeLabel(tier: PackageTierDefinition): string | null {
  if (tier.id === 'pro_plus') return '推荐';
  return tier.badge ?? null;
}

function CompareTable({
  rows,
  selectedId,
}: {
  rows: AiPackageCompareRow[];
  selectedId: PackageTierId;
}) {
  return (
    <View className="s-ai-package-upgrade-sheet__table">
      <View className="s-ai-package-upgrade-sheet__table-head">
        <Text className="s-ai-package-upgrade-sheet__table-label-col">权益内容</Text>
        {TIER_ORDER.map((tierId) => (
          <Text
            key={tierId}
            className={`s-ai-package-upgrade-sheet__table-tier-col s-ai-package-upgrade-sheet__table-tier-col--${tierId}${
              selectedId === tierId
                ? ' s-ai-package-upgrade-sheet__table-tier-col--selected'
                : ''
            }`}
          >
            {tierId === 'pro_plus' ? 'Pro+' : tierId === 'ultra' ? 'Ultra' : 'Pro'}
          </Text>
        ))}
      </View>
      {rows.map((row) => {
        const Icon = FEATURE_ICONS[row.icon] ?? Sparkles;
        return (
          <View key={row.id} className="s-ai-package-upgrade-sheet__table-row">
            <View className="s-ai-package-upgrade-sheet__table-feature">
              <Icon
                size={14}
                className="s-ai-package-upgrade-sheet__table-feature-icon"
                aria-hidden
              />
              <Text className="s-ai-package-upgrade-sheet__table-feature-label">
                {row.label}
              </Text>
            </View>
            {TIER_ORDER.map((tierId) => (
              <Text
                key={tierId}
                className={`s-ai-package-upgrade-sheet__table-value s-ai-package-upgrade-sheet__table-value--${tierId}${
                  selectedId === tierId
                    ? ' s-ai-package-upgrade-sheet__table-value--selected'
                    : ''
                }`}
              >
                {row.values[tierId]}
              </Text>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const AiPackageUpgradeSheet: React.FC<AiPackageUpgradeSheetProps> = ({
  open,
  onClose,
  activityLegacyId,
  onPurchaseSuccess,
  onViewAllBenefits,
}) => {
  useOverlayLock(open);
  const apiEnabled = isApiEnabled();
  const packagesQuery = useProfilePackagesQuery();
  const catalog = apiEnabled ? packagesQuery.data : MOCK_PACKAGE_CATALOG;
  const tiers = useMemo(() => catalog?.tiers ?? [], [catalog?.tiers]);

  const [selectedId, setSelectedId] = useState<PackageTierId>('pro_plus');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    const defaultId = catalog?.sheet?.defaultTierId ?? 'pro_plus';
    setSelectedId(defaultId);
  }, [catalog?.sheet?.defaultTierId, open]);

  const compareRows = useMemo(() => buildAiPackageCompareRows(tiers), [tiers]);

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === selectedId) ?? tiers[1] ?? tiers[0],
    [selectedId, tiers],
  );

  const handlePurchase = useCallback(async () => {
    if (!selectedTier) {
      void Taro.showToast({ title: '套餐加载中，请稍候', icon: 'none' });
      return;
    }
    if (!apiEnabled) {
      void Taro.showToast({
        title: `${selectedTier.name} 购买即将上线`,
        icon: 'none',
      });
      onClose();
      return;
    }
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({
        title: '请先从活动页进入或报名一场活动',
        icon: 'none',
      });
      return;
    }
    if (purchasing) return;

    setPurchasing(true);
    try {
      const result = await purchaseProfilePackageAndInvalidate({
        tierId: selectedTier.id,
        activityLegacyId,
      });
      void Taro.showToast({
        title: `${result.entitlement.tierName} 已开通`,
        icon: 'success',
      });
      onPurchaseSuccess?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : '购买失败，请稍后重试';
      void Taro.showToast({ title: message, icon: 'none' });
    } finally {
      setPurchasing(false);
    }
  }, [
    activityLegacyId,
    apiEnabled,
    onClose,
    onPurchaseSuccess,
    purchasing,
    selectedTier,
  ]);

  if (!open) return null;

  return (
    <View className="s-overlay s-ai-package-upgrade-sheet" role="presentation">
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-ai-package-upgrade-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-package-upgrade-title"
      >
        <View
          className="s-ai-package-upgrade-sheet__close"
          aria-label="关闭"
          onClick={onClose}
        >
          <X size={16} color="#8e8e93" aria-hidden />
        </View>

        <View className="s-ai-package-upgrade-sheet__body">
          <View className="s-ai-package-upgrade-sheet__hero" aria-hidden>
            <View className="s-ai-package-upgrade-sheet__hero-icon-wrap">
              <Sparkles size={24} className="s-ai-package-upgrade-sheet__hero-icon" />
            </View>
            <Text
              id="ai-package-upgrade-title"
              className="s-ai-package-upgrade-sheet__hero-title"
            >
              AI 匹配次数已用完
            </Text>
            <Text className="s-ai-package-upgrade-sheet__hero-sub">
              本月 AI 智能匹配额度已耗尽{'\n'}升级套餐即可立即恢复匹配能力
            </Text>
          </View>

          <View className="s-ai-package-upgrade-sheet__tiers">
            {apiEnabled && packagesQuery.isLoading && tiers.length === 0 ? (
              <Text className="s-ai-package-upgrade-sheet__loading">加载套餐…</Text>
            ) : null}
            {TIER_ORDER.map((tierId) => {
              const tier = tiers.find((item) => item.id === tierId);
              if (!tier) return null;
              const selected = tier.id === selectedId;
              const badge = tierBadgeLabel(tier);
              return (
                <View
                  key={tier.id}
                  className={`s-ai-package-upgrade-sheet__tier s-ai-package-upgrade-sheet__tier--${tier.id}${
                    selected ? ' s-ai-package-upgrade-sheet__tier--selected' : ''
                  }`}
                  onClick={() => setSelectedId(tier.id)}
                >
                  {badge ? (
                    <View className="s-ai-package-upgrade-sheet__tier-badge">
                      <Text>{badge}</Text>
                    </View>
                  ) : null}
                  <Text className="s-ai-package-upgrade-sheet__tier-name">
                    {tier.name}
                  </Text>
                  <Text className="s-ai-package-upgrade-sheet__tier-price">
                    ¥ {tier.priceLabel}
                  </Text>
                  <Text className="s-ai-package-upgrade-sheet__tier-unit">元/单场</Text>
                </View>
              );
            })}
          </View>

          {compareRows.length > 0 ? (
            <CompareTable rows={compareRows} selectedId={selectedId} />
          ) : null}

          <View className="s-ai-package-upgrade-sheet__info">
            <Shield
              size={14}
              className="s-ai-package-upgrade-sheet__info-icon"
              aria-hidden
            />
            <Text className="s-ai-package-upgrade-sheet__info-text">
              按场次购买，灵活叠加，资金微信官方担保
            </Text>
          </View>
        </View>

        <View className="s-ai-package-upgrade-sheet__foot">
          <View
            className={[
              's-ai-package-upgrade-sheet__cta',
              purchasing && 's-ai-package-upgrade-sheet__cta--disabled',
            ]
              .filter(Boolean)
              .join(' ')}
            hoverClass={purchasing ? '' : 's-ai-package-upgrade-sheet__cta--pressed'}
            onClick={() => {
              if (!purchasing) void handlePurchase();
            }}
          >
            <Crown
              size={18}
              className="s-ai-package-upgrade-sheet__cta-icon"
              aria-hidden
            />
            <Text className="s-ai-package-upgrade-sheet__cta-label">
              {selectedTier ? packageTierCtaLabel(selectedTier) : '选择套餐'}
            </Text>
          </View>
          {onViewAllBenefits ? (
            <Text
              className="s-ai-package-upgrade-sheet__footer-link"
              onClick={onViewAllBenefits}
            >
              查看我的全部权益 &gt;
            </Text>
          ) : (
            <Text className="s-ai-package-upgrade-sheet__footer-link" onClick={onClose}>
              暂不升级
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default AiPackageUpgradeSheet;
