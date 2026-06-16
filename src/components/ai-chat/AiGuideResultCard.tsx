import type { AiGuidePlanFormValues, TravelGuidePlan } from '@/types/travelGuide';
import { goAiTravelGuide } from '@/utils/route';
import { ChevronRight, Map, RefreshCw, Sparkles, Users } from '../../components/icons';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import './AiGuideResultCard.scss';

export type AiGuideResultCardProps = {
  guideId: string;
  plan: TravelGuidePlan;
  form: AiGuidePlanFormValues;
  disabled?: boolean;
  onRegenerate: () => void;
  onBuddyPostFromGuide?: () => void;
};

function previewHighlights(plan: TravelGuidePlan): string[] {
  const highlights: string[] = [];
  const transport = plan.transport.lines[0]?.trim();
  if (transport) highlights.push(transport);

  const schemes = plan.accommodation.schemes;
  if (schemes?.length) {
    highlights.push(`住宿：${schemes.map((s) => s.label).join(' / ')}`);
  } else if (plan.accommodation.hotels[0]?.name) {
    highlights.push(`住宿：${plan.accommodation.hotels[0].name}`);
  }

  const total = plan.budget?.items.find((item) => item.label.includes('合计'));
  if (total) {
    highlights.push(`预算 ${total.range}`);
  }

  return highlights.slice(0, 3);
}

export function AiGuideResultCard({
  guideId,
  plan,
  disabled = false,
  onRegenerate,
  onBuddyPostFromGuide,
}: AiGuideResultCardProps) {
  const highlights = previewHighlights(plan);

  const openDetail = () => {
    if (disabled) return;
    goAiTravelGuide(guideId);
  };

  return (
    <View className="s-ai-guide-result">
      <Button
        className="s-ai-guide-result__card"
        disabled={disabled}
        hoverClass="s-ai-guide-result__card--pressed"
        aria-label="查看 AI 出行攻略"
        onClick={openDetail}
      >
        <View className="s-ai-guide-result__card-head">
          <View className="s-ai-guide-result__card-icon" aria-hidden>
            <Sparkles size={16} color="#ff69b4" />
          </View>
          <Text className="s-ai-guide-result__card-kicker">AI 出行攻略</Text>
        </View>

        <Text className="s-ai-guide-result__card-title">{plan.activityName}</Text>

        <View className="s-ai-guide-result__card-meta">
          <Text className="s-ai-guide-result__card-meta-line">
            📅 {plan.eventDates}
          </Text>
          <View className="s-ai-guide-result__card-meta-row">
            <Map size={12} color="#64d2ff" />
            <Text className="s-ai-guide-result__card-meta-line">{plan.venue}</Text>
          </View>
        </View>

        <View className="s-ai-guide-result__chips">
          <Text className="s-ai-guide-result__chip">{plan.departure}</Text>
          <Text className="s-ai-guide-result__chip">{plan.headcount}人</Text>
          <Text className="s-ai-guide-result__chip">{plan.budgetLabel}</Text>
          <Text className="s-ai-guide-result__chip">
            {plan.selfDrive ? '自驾' : '公共交通'}
          </Text>
        </View>

        {highlights.length ? (
          <View className="s-ai-guide-result__preview">
            {highlights.map((line) => (
              <Text key={line} className="s-ai-guide-result__preview-line">
                · {line}
              </Text>
            ))}
          </View>
        ) : null}

        <View className="s-ai-guide-result__cta">
          <Text className="s-ai-guide-result__cta-label">查看完整攻略</Text>
          <ChevronRight size={16} color="#ff69b4" aria-hidden />
        </View>
      </Button>

      {onBuddyPostFromGuide ? (
        <Button
          className="s-ai-guide-result__buddy-cta"
          disabled={disabled}
          hoverClass="s-ai-guide-result__buddy-cta--pressed"
          onClick={onBuddyPostFromGuide}
        >
          <Users size={18} color="#fff" />
          <View className="s-ai-guide-result__buddy-cta-text">
            <Text className="s-ai-guide-result__buddy-cta-title">一键发帖</Text>
            <Text className="s-ai-guide-result__buddy-cta-sub">
              用攻略里的出发地、人数预填发帖
            </Text>
          </View>
        </Button>
      ) : null}

      <View className="s-ai-guide-result__actions">
        <Button
          className="s-ai-guide-result__action"
          disabled={disabled}
          hoverClass="s-ai-guide-result__action--pressed"
          onClick={onRegenerate}
        >
          <RefreshCw size={16} color="#fff" />
          <Text className="s-ai-guide-result__action-label">重新规划</Text>
        </Button>
      </View>
    </View>
  );
}
