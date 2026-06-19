import React, { useMemo } from 'react';
import { Calendar, MapPin, Ticket } from '../../components/icons';
import { ImageWithFallback } from '../ImageWithFallback';
import { MetaRow } from '../MetaRow';
import { ProfileCollapsibleSection } from './ProfileCollapsibleSection';
import type { ProfileActivityItem } from '../../types/backend';
import { compareActivityDateDesc } from '../../utils/activityStatus';
import { safeTrim } from '../../utils/safeString';
import { Text, View } from '@tarojs/components';

function activityTitleFallback(title: unknown): string {
  const trimmed = safeTrim(title);
  return trimmed.slice(0, 2) || '活动';
}

const EVENT_STATUS_TEXT: Record<string, string> = {
  upcoming: '即将参加',
  registered: '已选择',
  attended: '已参加',
  completed: '已结束',
};

export type ProfileActivitiesSectionProps = {
  items: ProfileActivityItem[];
  /** `list` renders all items without collapsible chrome (detail sub-page). */
  mode?: 'collapsible' | 'list';
};

const ProfileActivitiesSection: React.FC<ProfileActivitiesSectionProps> = ({
  items,
  mode = 'collapsible',
}) => {
  const sortedItems = useMemo(() => [...items].sort(compareActivityDateDesc), [items]);

  const listBody = (
    <>
      {sortedItems.length === 0 ? (
        <View className="s-profile-section__empty">
          <View className="s-profile-section__empty-icon s-profile-section__empty-icon--activities">
            <Ticket size={22} />
          </View>
          <Text className="s-profile-section__empty-title">还没有选择活动</Text>
          <Text className="s-profile-section__empty-hint">
            在首页或活动页进入活动详情后，会显示在这里
          </Text>
        </View>
      ) : (
        sortedItems.map((item) => (
          <View key={item.id} className="s-profile-activity">
            <ImageWithFallback
              src={item.image}
              alt=""
              imageClassName="s-profile-activity__thumb"
              placeholderClassName="s-profile-activity__thumb s-profile-activity__thumb--placeholder"
              fallback={activityTitleFallback(item.title)}
            />
            <View className="s-profile-activity__content">
              <View className="s-profile-activity__top">
                <Text className="s-profile-activity__title">{item.title}</Text>
                <Text className="s-profile-activity__status">
                  {EVENT_STATUS_TEXT[item.status] ?? item.status}
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
      )}
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
      title="我的活动"
      items={sortedItems}
      renderEmpty={() => (
        <View className="s-profile-section__empty">
          <View className="s-profile-section__empty-icon s-profile-section__empty-icon--activities">
            <Ticket size={22} />
          </View>
          <Text className="s-profile-section__empty-title">还没有选择活动</Text>
          <Text className="s-profile-section__empty-hint">
            在首页或活动页进入活动详情后，会显示在这里
          </Text>
        </View>
      )}
    >
      {(pageItems) =>
        pageItems.map((item) => (
          <View key={item.id} className="s-profile-activity">
            <ImageWithFallback
              src={item.image}
              alt=""
              imageClassName="s-profile-activity__thumb"
              placeholderClassName="s-profile-activity__thumb s-profile-activity__thumb--placeholder"
              fallback={activityTitleFallback(item.title)}
            />
            <View className="s-profile-activity__content">
              <View className="s-profile-activity__top">
                <Text className="s-profile-activity__title">{item.title}</Text>
                <Text className="s-profile-activity__status">
                  {EVENT_STATUS_TEXT[item.status] ?? item.status}
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
