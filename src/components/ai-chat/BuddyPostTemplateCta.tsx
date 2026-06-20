import './BuddyPostTemplateCta.scss';
import { Text, View } from '@tarojs/components';
import { getBuddyPostSheetActionLabel } from '../../utils/buddyPostPromptMessage';
import { useT } from '@/hooks/useI18n';

export type BuddyPostTemplateCtaProps = {
  onPress: () => void;
  disabled?: boolean;
  onOpenSheet?: () => void;
};

export function BuddyPostTemplateCta({ onPress }: BuddyPostTemplateCtaProps) {
  useT();
  const label = getBuddyPostSheetActionLabel();

  return (
    <View
      className="s-buddy-post-template-cta"
      hoverClass="s-buddy-post-template-cta--pressed"
      onClick={onPress}
      role="button"
      aria-label={label}
    >
      <View className="s-buddy-post-template-cta__inner">
        <Text className="s-buddy-post-template-cta__sparkle" aria-hidden>
          ✨
        </Text>
        <Text className="s-buddy-post-template-cta__label">{label}</Text>
      </View>
    </View>
  );
}
