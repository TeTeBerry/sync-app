import type { PersonalityTestResult } from '@/domains/personality-test/types';
import { goPersonalityTest } from '@/utils/route';
import { ChevronRight, Sparkles } from '../../components/icons';
import { Button } from '../ui';
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
        aria-label="查看 Raver 人格测试结果"
        onClick={openDetail}
      >
        <View className="s-ai-personality-result__card-head">
          <View className="s-ai-personality-result__card-icon" aria-hidden>
            <Sparkles size={16} color="#f472b6" />
          </View>
          <Text className="s-ai-personality-result__card-kicker">Raver 人格</Text>
        </View>

        <Text className="s-ai-personality-result__card-title">
          {result.narrative.tagline}
        </Text>
        <Text className="s-ai-personality-result__card-sub">
          灵魂 DJ：{result.recommendations.soulMatch.djName}
        </Text>

        <View className="s-ai-personality-result__foot">
          <Text className="s-ai-personality-result__foot-label">查看完整结果</Text>
          <ChevronRight size={14} color="#f472b6" />
        </View>
      </Button>
    </View>
  );
}
