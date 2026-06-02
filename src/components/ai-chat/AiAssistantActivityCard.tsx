import './AiAssistantActivityCard.scss';
import { Calendar, MapPin } from '../../components/icons';
import type { FC } from 'react';
import type { RecommendedActivityCard } from '../../types/aiChat';
import { goEventDetail } from '../../utils/route';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';

export type AiAssistantActivityCardProps = {
  activity: RecommendedActivityCard;
};

export const AiAssistantActivityCard: FC<AiAssistantActivityCardProps> = ({
  activity,
}) => {
  const handleOpen = () => {
    const id = activity.activityLegacyId;
    if (id != null && !Number.isNaN(id)) {
      goEventDetail(id);
    }
  };

  return (
    <Button className="s-ai-assistant-activity-card" onClick={handleOpen}>
      <Text className="s-ai-assistant-activity-card__title">{activity.title}</Text>
      {activity.date ? (
        <View className="s-ai-assistant-activity-card__row">
          <Calendar size={12} color="#64d2ff" />
          <Text className="s-ai-assistant-activity-card__meta">{activity.date}</Text>
        </View>
      ) : null}
      {activity.venue ? (
        <View className="s-ai-assistant-activity-card__row">
          <MapPin size={12} color="#64d2ff" />
          <Text className="s-ai-assistant-activity-card__meta">{activity.venue}</Text>
        </View>
      ) : null}
      <View className="s-ai-assistant-activity-card__cta">
        <Text className="s-ai-assistant-activity-card__cta-label">进入活动</Text>
      </View>
    </Button>
  );
};

export default AiAssistantActivityCard;
