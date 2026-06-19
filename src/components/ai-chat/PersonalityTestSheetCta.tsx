import { Sparkles } from '../../components/icons';
import { Button } from '../ui';
import { getPersonalityTestSheetActionLabel } from '../../utils/personalityTestPromptMessage';
import { Text, View } from '@tarojs/components';
import './PersonalityTestSheetCta.scss';
import { useT } from '@/hooks/useI18n';

export function PersonalityTestSheetCta({
  disabled,
  onOpenSheet,
}: {
  disabled?: boolean;
  onOpenSheet: () => void;
}) {
  const t = useT();
  const label = getPersonalityTestSheetActionLabel();

  return (
    <Button
      className="s-personality-test-sheet-cta"
      disabled={disabled}
      hoverClass="s-personality-test-sheet-cta--pressed"
      aria-label={label}
      onClick={onOpenSheet}
    >
      <Sparkles size={18} color="#fff" />
      <View className="s-personality-test-sheet-cta__text">
        <Text className="s-personality-test-sheet-cta__title">{label}</Text>
        <Text className="s-personality-test-sheet-cta__sub">
          {t('ai.personalityTestSheetSub')}
        </Text>
      </View>
    </Button>
  );
}
