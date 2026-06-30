import React, { useCallback, useMemo } from 'react';
import { Bell, Calendar, MapPin, Ticket, X } from '../../components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import { MetaRow } from '../MetaRow';
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection';
import type { ProfileActivityItem } from '../../types/backend';
import { compareActivityDateDesc } from '../../utils/activityStatus';
import { safeTrim } from '../../utils/safeString';
import { formatActivityLocationLabel } from '../../utils/formatActivityDisplay';
import { Text, View } from '@tarojs/components';
import { useActivityUpdateSubscribeAction } from '@/domains/activity-info';
import { useT } from '@/hooks/useI18n';
import { parseActivityLegacyId } from '@/utils/activityLegacyId';

/** Matches `--secondary`; lucide icons need literal colors in mini program data URLs. */
const ALERT_ICON_COLOR = '#4cc9f0';

function activityTitleFallback(title: unknown, fallback: string): string {
  const trimmed = safeTrim(title);
  return trimmed.slice(0, 2) || fallback;
}

type ProfileActivityCardProps = {
  item: ProfileActivityItem;
  statusText: Record<string, string>;
  eventFallback: string;
  onClick?: (activityLegacyId: string) => void;
  /** When true, show subscribe / unsubscribe controls on upcoming activities. */
  subscribeControls?: boolean;
  onConfirmUnfollow?: (eventTitle: string) => Promise<boolean>;
};

const ProfileActivityCard: React.FC<ProfileActivityCardProps> = ({
  item,
  statusText,
  eventFallback,
  onClick,
  subscribeControls = false,
  onConfirmUnfollow,
}) => {
  const t = useT();
  const legacyId = parseActivityLegacyId(item.activityLegacyId);
  const activityTitle = item.title?.trim() || t('eventCard.activityFallback');
  const confirmUnfollow = useCallback(
    () => onConfirmUnfollow?.(activityTitle) ?? Promise.resolve(false),
    [activityTitle, onConfirmUnfollow],
  );
  const { subscribed, submitting, handleSubscribe } = useActivityUpdateSubscribeAction(
    legacyId ?? undefined,
    false,
    {
      toggleable: true,
      confirmUnfollow,
    },
  );
  const statusLabel = statusText[item.status as keyof typeof statusText] ?? item.status;
  const showAlertControls = subscribeControls && item.status !== 'attended';

  const stopPropagation = (event: { stopPropagation?: () => void }) => {
    event.stopPropagation?.();
  };

  return (
    <View
      className="s-profile-activity"
      onClick={() => onClick?.(item.activityLegacyId)}
    >
      <ImageWithFallback
        src={item.image}
        alt=""
        imageClassName="s-profile-activity__thumb"
        placeholderClassName="s-profile-activity__thumb s-profile-activity__thumb--placeholder"
        fallback={activityTitleFallback(item.title, eventFallback)}
      />
      <View className="s-profile-activity__content">
        <View className="s-profile-activity__top">
          <Text className="s-profile-activity__title">{item.title}</Text>
          <Text
            className={[
              's-profile-activity__status',
              item.status === 'attended' && 's-profile-activity__status--attended',
              item.status === 'registered' && 's-profile-activity__status--followed',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {statusLabel}
          </Text>
        </View>

        <View className="s-profile-activity__meta">
          <MetaRow
            className="s-profile-activity__meta-item"
            icon={<Calendar size={12} />}
          >
            {item.date}
          </MetaRow>
          <MetaRow
            className="s-profile-activity__meta-item"
            icon={<MapPin size={12} />}
          >
            {formatActivityLocationLabel(item.location)}
          </MetaRow>
        </View>

        {showAlertControls && subscribed ? (
          <View className="s-profile-activity__subscribe-row" onClick={stopPropagation}>
            <View className="s-profile-activity__subscribe-status" aria-hidden>
              <View className="s-profile-activity__subscribe-status-icon">
                <Bell size={12} color={ALERT_ICON_COLOR} strokeWidth={2.25} />
              </View>
              <Text className="s-profile-activity__subscribe-status-text">
                {t('profile.activities.updateAlertsOn')}
              </Text>
            </View>
            <View
              className={[
                's-profile-activity__unfollow',
                submitting && 's-profile-activity__unfollow--loading',
              ]
                .filter(Boolean)
                .join(' ')}
              hoverClass={submitting ? '' : 's-profile-activity__unfollow--pressed'}
              role="button"
              aria-disabled={submitting}
              aria-label={t('eventCard.unfollow', { title: activityTitle })}
              onClick={handleSubscribe}
            >
              <X size={12} color="#8e8e93" strokeWidth={2.25} />
              <Text className="s-profile-activity__unfollow-text">
                {submitting
                  ? t('eventCard.unfollowing')
                  : t('eventCard.unfollowAction')}
              </Text>
            </View>
          </View>
        ) : null}

        {showAlertControls && !subscribed ? (
          <View
            className="s-profile-activity__subscribe-row s-profile-activity__subscribe-row--prompt"
            onClick={stopPropagation}
          >
            <Text className="s-profile-activity__subscribe-prompt">
              {t('profile.activities.updateAlertsOffHint')}
            </Text>
            <View
              className={[
                's-profile-activity__subscribe-cta',
                submitting && 's-profile-activity__subscribe-cta--loading',
              ]
                .filter(Boolean)
                .join(' ')}
              hoverClass={
                submitting ? '' : 's-profile-activity__subscribe-cta--pressed'
              }
              role="button"
              aria-disabled={submitting}
              aria-label={t('eventCard.follow', { title: activityTitle })}
              onClick={handleSubscribe}
            >
              <Bell size={12} color={ALERT_ICON_COLOR} strokeWidth={2.25} />
              <Text className="s-profile-activity__subscribe-cta-text">
                {submitting
                  ? t('eventCard.following')
                  : t('profile.activities.resubscribeAction')}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export type ProfileActivitiesSectionProps = {
  items: ProfileActivityItem[];
  /** `list` renders all items without collapsible chrome (detail sub-page). */
  mode?: 'collapsible' | 'list';
  onClick?: (activityLegacyId: string) => void;
  onConfirmUnfollow?: (eventTitle: string) => Promise<boolean>;
};

const ProfileActivitiesSection: React.FC<ProfileActivitiesSectionProps> = ({
  items,
  mode = 'collapsible',
  onClick,
  onConfirmUnfollow,
}) => {
  const t = useT();
  const sortedItems = useMemo(() => [...items].sort(compareActivityDateDesc), [items]);

  const statusText = useMemo(
    () => ({
      upcoming: t('profile.activities.status.upcoming'),
      registered: t('profile.activities.status.registered'),
      attended: t('profile.activities.status.attended'),
      completed: t('profile.activities.status.completed'),
    }),
    [t],
  );

  const eventFallback = t('common.eventFallback');

  const emptyState = (
    <View className="s-profile-section__empty">
      <View className="s-profile-section__empty-icon s-profile-section__empty-icon--activities">
        <Ticket size={22} />
      </View>
      <Text className="s-profile-section__empty-title">
        {t('profile.activities.emptyTitle')}
      </Text>
      <Text className="s-profile-section__empty-hint">
        {t('profile.activities.emptyHint')}
      </Text>
    </View>
  );

  const renderCard = (item: ProfileActivityItem) => (
    <ProfileActivityCard
      key={item.id}
      item={item}
      statusText={statusText}
      eventFallback={eventFallback}
      onClick={onClick}
      subscribeControls={mode === 'list'}
      onConfirmUnfollow={mode === 'list' ? onConfirmUnfollow : undefined}
    />
  );

  const listBody = (
    <>
      {sortedItems.length === 0
        ? emptyState
        : sortedItems.map((item) => renderCard(item))}
    </>
  );

  if (mode === 'list') {
    return (
      <View className="s-profile-section__body s-profile-section__body--standalone">
        {listBody}
      </View>
    );
  }

  return (
    <ProfileCollapsibleSection
      variant="activities"
      icon={<Ticket size={14} />}
      title={t('profile.activities.title')}
      items={sortedItems}
      renderEmpty={() => emptyState}
    >
      {(pageItems) => pageItems.map((item) => renderCard(item))}
    </ProfileCollapsibleSection>
  );
};

export default ProfileActivitiesSection;
