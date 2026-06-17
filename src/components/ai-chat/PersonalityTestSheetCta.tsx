import { Sparkles } from '../../components/icons';
import { Button } from '../ui';
import { PERSONALITY_TEST_SHEET_ACTION_LABEL } from '../../utils/personalityTestPromptMessage';
import { Text, View } from '@tarojs/components';
import './PersonalityTestSheetCta.scss';

export function PersonalityTestSheetCta({
  disabled,
  onOpenSheet,
}: {
  disabled?: boolean;
  onOpenSheet: () => void;
}) {
  return (
    <Button
      className="s-personality-test-sheet-cta"
      disabled={disabled}
      hoverClass="s-personality-test-sheet-cta--pressed"
      aria-label={PERSONALITY_TEST_SHEET_ACTION_LABEL}
      onClick={onOpenSheet}
    >
      <Sparkles size={18} color="#fff" />
      <View className="s-personality-test-sheet-cta__text">
        <Text className="s-personality-test-sheet-cta__title">
          {PERSONALITY_TEST_SHEET_ACTION_LABEL}
        </Text>
        <Text className="s-personality-test-sheet-cta__sub">
          约 2 分钟，推荐契合 DJ 与活动
        </Text>
      </View>
    </Button>
  );
}
