import { Plus } from '../../../components/icons';
import { Button } from '../../../components/ui';
import { View } from '@tarojs/components';
import { useT } from '../../../hooks/useI18n';

type EventDetailTemplatePostFabProps = {
  disabled?: boolean;
  onClick: () => void;
};

export function EventDetailTemplatePostFab({
  disabled,
  onClick,
}: EventDetailTemplatePostFabProps) {
  const t = useT();
  return (
    <View className="s-event-detail__post-fab">
      <Button
        className="s-event-detail__post-fab-btn"
        hoverClass="s-event-detail__post-fab-btn--pressed"
        disabled={disabled}
        aria-label={t('eventDetail.templatePost')}
        onClick={onClick}
      >
        <Plus size={24} color="#fff" strokeWidth={2.5} aria-hidden />
      </Button>
    </View>
  );
}
