import type { GenerateItineraryResult } from '@/types/itinerary';
import { goMyItinerary } from '@/utils/route';
import { useItineraryStore } from '@/domains/performance-itinerary/store';
import { ChevronRight, Music2 } from '../../components/icons';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import './AiItineraryResultCard.scss';

export type AiItineraryResultCardProps = {
  activityLegacyId: number;
  selectedDjIds: string[];
  result: GenerateItineraryResult;
  disabled?: boolean;
};

export function AiItineraryResultCard({
  activityLegacyId,
  selectedDjIds,
  result,
  disabled = false,
}: AiItineraryResultCardProps) {
  const dayCount = result.itinerary.days.length;
  const conflictCount = result.conflicts.length;

  const openDetail = () => {
    if (disabled) return;
    useItineraryStore
      .getState()
      .setFromGenerateResult(activityLegacyId, selectedDjIds, result);
    goMyItinerary(activityLegacyId);
  };

  return (
    <View className="s-ai-itinerary-result">
      <Button
        className="s-ai-itinerary-result__card"
        disabled={disabled}
        hoverClass="s-ai-itinerary-result__card--pressed"
        aria-label="查看专属演出行程"
        onClick={openDetail}
      >
        <View className="s-ai-itinerary-result__card-head">
          <View className="s-ai-itinerary-result__card-icon" aria-hidden>
            <Music2 size={16} color="#a855f7" />
          </View>
          <Text className="s-ai-itinerary-result__card-kicker">专属演出行程</Text>
        </View>

        <Text className="s-ai-itinerary-result__card-title">
          {result.itinerary.eventMeta}
        </Text>

        <View className="s-ai-itinerary-result__chips">
          <Text className="s-ai-itinerary-result__chip">{dayCount} 天行程</Text>
          <Text className="s-ai-itinerary-result__chip">
            已选 {selectedDjIds.length} 位 DJ
          </Text>
          {conflictCount > 0 ? (
            <Text className="s-ai-itinerary-result__chip s-ai-itinerary-result__chip--warn">
              {conflictCount} 处冲突
            </Text>
          ) : null}
        </View>

        <View className="s-ai-itinerary-result__foot">
          <Text className="s-ai-itinerary-result__foot-label">查看完整行程</Text>
          <ChevronRight size={14} color="#a855f7" />
        </View>
      </Button>
    </View>
  );
}
