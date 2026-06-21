import type { PersonalityTestResult } from '@/domains/personality-test/types';
import { goPersonalityTest } from '@/utils/route';
import { ChevronRight, Sparkles } from '../../components/icons';
import { Button } from '../ui';
import { useT } from '@/hooks/useI18n';
import { Text, View } from '@tarojs/components';
import './AiPersonalityResultCard.scss';

export type AiPersonalityResultCardProps = {
  result: PersonalityTestResult;
  disabled?: boolean;
};

export function AiPersonalityResultCard({
  result,
  disabled = false,
}: AiPersonalityResultCardProps) {
  const t = useT();
  const openDetail = () => {
    if (disabled) return;
    goPersonalityTest({ viewResult: true });
  };

  return (
    <View className="s-ai-personality-result">
      <Button
        className="s-ai-personality-result__card"
        disabled={disabled}
        hoverClass="s-ai-personality-result__card--pressed"
        aria-label={t('ai.viewFullResult')}
        onClick={openDetail}
      >
        <View className="s-ai-personality-result__card-head">
          <View className="s-ai-personality-result__card-icon" aria-hidden>
            <Sparkles size={16} color="#f472b6" />
          </View>
          <Text className="s-ai-personality-result__card-kicker">
            {t('ai.raverPersonality')}
          </Text>
        </View>

        <Text className="s-ai-personality-result__card-title">
          {result.narrative.tagline}
        </Text>
        <Text className="s-ai-personality-result__card-sub">
          {t('ai.soulDj', { djName: result.recommendations.soulMatch.djName })}
        </Text>

        <View className="s-ai-personality-result__foot">
          <Text className="s-ai-personality-result__foot-label">
            {t('ai.viewFullResult')}
          </Text>
          <ChevronRight size={14} color="#f472b6" />
        </View>
      </Button>
    </View>
  );
}
