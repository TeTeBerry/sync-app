import { Users } from '../../components/icons';
import { Button } from '../ui';
import { BUDDY_POST_SHEET_ACTION_LABEL } from '../../utils/buddyPostPromptMessage';
import { Text, View } from '@tarojs/components';
import './BuddyPostTemplateCta.scss';

export function BuddyPostTemplateCta({
  disabled,
  onOpenSheet,
}: {
  disabled?: boolean;
  onOpenSheet: () => void;
}) {
  return (
    <Button
      className="s-buddy-post-template-cta"
      disabled={disabled}
      hoverClass="s-buddy-post-template-cta--pressed"
      aria-label={BUDDY_POST_SHEET_ACTION_LABEL}
      onClick={onOpenSheet}
    >
      <Users size={18} color="#fff" />
      <View className="s-buddy-post-template-cta__text">
        <Text className="s-buddy-post-template-cta__title">
          {BUDDY_POST_SHEET_ACTION_LABEL}
        </Text>
        <Text className="s-buddy-post-template-cta__sub">
          用表单填写活动时间、集合点与人数
        </Text>
      </View>
    </Button>
  );
}
