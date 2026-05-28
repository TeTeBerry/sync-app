import React, { useMemo } from "react";
import { Calendar, MapPin, Ticket } from "lucide-react-taro";
import { ImageWithFallback } from "../../../components/ImageWithFallback";
import { MetaRow } from "../../../components/MetaRow";
import { ProfileCollapsibleSection } from "../../../components/profile/ProfileCollapsibleSection";
import type { ProfileActivityItem } from "../../../types/backend";
import { compareActivityDateDesc } from "../../../utils/activityStatus";
import { Text, View } from '@tarojs/components';

const EVENT_STATUS_TEXT: Record<string, string> = {
  upcoming: "即将参加",
  registered: "已报名",
  attended: "已参加",
  completed: "已结束",
};

export type ProfileActivitiesSectionProps = {
  items: ProfileActivityItem[];
};

const ProfileActivitiesSection: React.FC<ProfileActivitiesSectionProps> = ({
  items,
}) => {
  const sortedItems = useMemo(
    () => [...items].sort(compareActivityDateDesc),
    [items],
  );

  return (
    <ProfileCollapsibleSection
      variant="activities"
      icon={<Ticket size={14} />}
      title="我的活动"
      items={sortedItems}>
      {(pageItems) =>
        pageItems.map((item) => (
          <View key={item.id} className="s-profile-activity">
            <ImageWithFallback
              src={item.image}
              alt=""
              imageClassName="s-profile-activity__thumb"
              placeholderClassName="s-profile-activity__thumb s-profile-activity__thumb--placeholder"
              fallback={item.title.slice(0, 2)}
            />
            <View className="s-profile-activity__content">
              <View className="s-profile-activity__top">
                <Text className="s-profile-activity__title">{item.title}</Text>
                <Text className="s-profile-activity__status">
                  {EVENT_STATUS_TEXT[item.status] ?? item.status}
                </Text>
              </View>

              <View className="s-profile-activity__meta">
                <MetaRow className="s-profile-activity__meta-item" icon={<Calendar size={12} />}>
                  {item.date}
                </MetaRow>
                <MetaRow className="s-profile-activity__meta-item" icon={<MapPin size={12} />}>
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
