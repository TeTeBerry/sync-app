import React, { useMemo } from 'react';
import { Calendar, MapPin, Ticket } from '../../components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import { MetaRow } from '../MetaRow';
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection';
import type { ProfileActivityItem } from '../../types/backend';
import { compareActivityDateDesc } from '../../utils/activityStatus';
import { safeTrim } from '../../utils/safeString';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

function activityTitleFallback(title: unknown, fallback: string): string {
  const trimmed = safeTrim(title);
  return trimmed.slice(0, 2) || fallback;
}

export type ProfileActivitiesSectionProps = {
  items: ProfileActivityItem[];
  /** `list` renders all items without collapsible chrome (detail sub-page). */
  mode?: 'collapsible' | 'list';
};

const ProfileActivitiesSection: React.FC<ProfileActivitiesSectionProps> = ({
  items,
  mode = 'collapsible',
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

  const listBody = (
    <>
      {sortedItems.length === 0
        ? emptyState
        : sortedItems.map((item) => (
            <View key={item.id} className="s-profile-activity">
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
                  <Text className="s-profile-activity__status">
                    {statusText[item.status as keyof typeof statusText] ?? item.status}
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
                    {item.location}
                  </MetaRow>
                </View>
              </View>
            </View>
          ))}
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
      {(pageItems) =>
        pageItems.map((item) => (
          <View key={item.id} className="s-profile-activity">
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
                <Text className="s-profile-activity__status">
                  {statusText[item.status as keyof typeof statusText] ?? item.status}
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
                  {item.location}
                </MetaRow>
              </View>
            </View>
          </View>
        ))
      }
    </ProfileCollapsibleSection>
  );
};

export default ProfileActivitiesSection;
