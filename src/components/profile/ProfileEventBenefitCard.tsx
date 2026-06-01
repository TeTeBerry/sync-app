import './ProfileEventBenefitCard.scss';
import React from 'react';
import {
  ArrowUp,
  CloudLightning,
  Lock,
  MapPin,
  Sparkles,
  Star,
} from 'lucide-react-taro';
import {
  getNextTierId,
  type ProfileEventBenefitRow,
  type ProfileEventBenefitCardModel,
} from './profileBenefitsMapper';
import { sanitizeRemoteImageUrl } from '../../utils/imageUrl';
import { Image, Text, View } from '@tarojs/components';

function tierBadgeClass(tierId: ProfileEventBenefitCardModel['tierId']): string {
  if (tierId === 'ultra') {
    return 's-profile-event-benefit__tier--ultra';
  }
  if (tierId === 'pro_plus') {
    return 's-profile-event-benefit__tier--pro-plus';
  }
  return 's-profile-event-benefit__tier--pro';
}

function rowIcon(rowId: ProfileEventBenefitRow['id']) {
  const iconClass = 's-profile-event-benefit__row-icon';
  if (rowId === 'contact') {
    return <Lock size={14} color="#d4a017" className={iconClass} aria-hidden />;
  }
  if (rowId === 'ai-match') {
    return (
      <Sparkles size={14} color="var(--primary)" className={iconClass} aria-hidden />
    );
  }
  if (rowId === 'map') {
    return <MapPin size={14} color="#64d2ff" className={iconClass} aria-hidden />;
  }
  return <Star size={14} color="#d4a017" className={iconClass} aria-hidden />;
}

function quotaClassName(row: ProfileEventBenefitRow): string {
  const tone = row.quotaTone ?? 'accent';
  if (tone === 'muted') {
    return 's-profile-event-benefit__row-quota s-profile-event-benefit__row-quota--muted';
  }
  return `s-profile-event-benefit__row-quota s-profile-event-benefit__row-quota--${row.accent}`;
}

export type ProfileEventBenefitCardProps = {
  card: ProfileEventBenefitCardModel;
  onUpgrade?: (card: ProfileEventBenefitCardModel) => void;
  onUsageHistory?: () => void;
};

const ProfileEventBenefitCard: React.FC<ProfileEventBenefitCardProps> = ({
  card,
  onUpgrade,
  onUsageHistory,
}) => {
  const upgradeTierId = getNextTierId(card.tierId);
  const showUpgrade = upgradeTierId != null && onUpgrade != null;
  const imageSrc = sanitizeRemoteImageUrl(card.eventImage) ?? card.eventImage;
  return (
    <View className="s-profile-event-benefit">
      <View className="s-profile-event-benefit__shell">
        <View className="s-profile-event-benefit__header-band">
          <Text className="s-profile-event-benefit__header-title">
            {card.eventTitle}
          </Text>
          <View className="s-profile-event-benefit__header-pills">
            <View className="s-profile-event-benefit__pill s-profile-event-benefit__pill--scope">
              <Text className="s-profile-event-benefit__pill-text">单场专属</Text>
            </View>
            <View
              className={`s-profile-event-benefit__tier ${tierBadgeClass(card.tierId)}`}
            >
              <Text className="s-profile-event-benefit__tier-text">
                {card.tierName}
              </Text>
            </View>
          </View>
        </View>

        <View className="s-profile-event-benefit__body">
          <View className="s-profile-event-benefit__event">
            <View className="s-profile-event-benefit__thumb-wrap">
              {imageSrc ? (
                <Image
                  className="s-profile-event-benefit__thumb"
                  src={imageSrc}
                  mode="aspectFill"
                  alt={card.eventTitle}
                />
              ) : (
                <CloudLightning
                  size={22}
                  color="#bf5af2"
                  className="s-profile-event-benefit__thumb-fallback"
                  aria-hidden
                />
              )}
            </View>
            <View className="s-profile-event-benefit__event-copy">
              <Text className="s-profile-event-benefit__event-title">
                {card.eventTitle}
              </Text>
              {card.eventMeta ? (
                <Text className="s-profile-event-benefit__event-meta">
                  {card.eventMeta}
                </Text>
              ) : null}
              <Text className="s-profile-event-benefit__event-valid">
                {card.validUntilLabel}
              </Text>
            </View>
          </View>

          <View className="s-profile-event-benefit__rows">
            {card.rows.map((row) => {
              const showBar = row.showBar !== false;
              return (
                <View key={row.id} className="s-profile-event-benefit__row">
                  <View className="s-profile-event-benefit__row-top">
                    <View className="s-profile-event-benefit__row-label-wrap">
                      {rowIcon(row.id)}
                      <Text className="s-profile-event-benefit__row-label">
                        {row.label}
                      </Text>
                    </View>
                    <Text className={quotaClassName(row)}>{row.quotaLabel}</Text>
                  </View>
                  {showBar ? (
                    <View className="s-profile-event-benefit__bar" aria-hidden>
                      <View
                        className={`s-profile-event-benefit__bar-fill s-profile-event-benefit__bar-fill--${row.accent}`}
                        style={{ width: `${Math.round(row.remainingRatio * 100)}%` }}
                      />
                    </View>
                  ) : null}
                  {row.hint ? (
                    <Text className="s-profile-event-benefit__row-hint">
                      {row.hint}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>

          <View className="s-profile-event-benefit__footer">
            <Text className="s-profile-event-benefit__footer-text">
              购票即享 · 单场专属权益
            </Text>
            <View className="s-profile-event-benefit__footer-actions">
              {showUpgrade ? (
                <View
                  className="s-profile-event-benefit__upgrade"
                  hoverClass="s-profile-event-benefit__upgrade--pressed"
                  onClick={(event) => {
                    event.stopPropagation?.();
                    onUpgrade?.(card);
                  }}
                >
                  <ArrowUp
                    size={12}
                    color="var(--primary)"
                    className="s-profile-event-benefit__upgrade-icon"
                    aria-hidden
                  />
                  <Text className="s-profile-event-benefit__upgrade-text">
                    升级权益
                  </Text>
                </View>
              ) : null}
              <View
                className="s-profile-event-benefit__footer-link-wrap"
                hoverClass="s-profile-event-benefit__footer-link-wrap--pressed"
                onClick={onUsageHistory}
              >
                <Text className="s-profile-event-benefit__footer-link">
                  使用记录 {'>'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileEventBenefitCard;
