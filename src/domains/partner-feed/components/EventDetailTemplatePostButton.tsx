import { ChevronRight, Users } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';

type EventDetailTemplatePostButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function EventDetailTemplatePostButton({
  disabled,
  onClick,
}: EventDetailTemplatePostButtonProps) {
  return (
    <View className="s-event-detail__template-post">
      <Button
        className="s-event-detail__itinerary-card s-event-detail__itinerary-card--template"
        hoverClass="s-event-detail__itinerary-card--pressed"
        disabled={disabled}
        aria-label="模板发帖"
        onClick={onClick}
      >
        <View
          className="s-event-detail__itinerary-card__icon s-event-detail__itinerary-card__icon--template"
          aria-hidden
        >
          <Users size={20} color="#64d2ff" />
        </View>
        <View className="s-event-detail__itinerary-card__body">
          <Text className="s-event-detail__itinerary-card__title">模板发帖</Text>
          <Text className="s-event-detail__itinerary-card__sub">
            填写日期、地点与联系方式
          </Text>
        </View>
        <ChevronRight
          size={18}
          color="#64d2ff"
          className="s-event-detail__itinerary-card__chevron"
          aria-hidden
        />
      </Button>
    </View>
  );
}
