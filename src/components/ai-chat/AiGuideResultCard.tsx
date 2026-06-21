import {
  getRegenerateCta,
  getTravelGuideTitle,
  getViewTravelGuideCta,
} from '@/constants/aiCtaLabels';
import type { AiGuidePlanFormValues, TravelGuidePlan } from '@/types/travelGuide';
import { goAiTravelGuide } from '@/utils/route';
import {
  findTravelGuideTotalBudgetItem,
  shortTravelGuideBudgetLabel,
  travelGuideBudgetPerPersonRange,
} from '@/domains/travel-guide/utils/travelGuideBudgetDisplay.util';
import { ChevronRight, Map, RefreshCw, Sparkles, Users } from '../../components/icons';
import { TravelPlanReceiptOcrTip } from '@/domains/travel-plan';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import './AiGuideResultCard.scss';

export type AiGuideResultCardProps = {
  guideId: string;
  plan: TravelGuidePlan;
  form: AiGuidePlanFormValues;
  activityLegacyId?: number;
  disabled?: boolean;
  onRegenerate: () => void;
  onBuddyPostFromGuide?: () => void;
};

function previewHighlights(
  plan: TravelGuidePlan,
  t: (key: string, params?: Record<string, string | number>) => string,
): string[] {
  const highlights: string[] = [];
  const transport = plan.transport.lines[0]?.trim();
  if (transport) highlights.push(transport);

  const schemes = plan.accommodation.schemes;
  if (schemes?.length) {
    highlights.push(
      t('travelPlan.accommodation', { label: schemes.map((s) => s.label).join(' / ') }),
    );
  } else if (plan.accommodation.hotels[0]?.name) {
    highlights.push(
      t('travelPlan.accommodation', { label: plan.accommodation.hotels[0].name }),
    );
  }

  return highlights.slice(0, 2);
}

export function AiGuideResultCard({
  guideId,
  plan,
  disabled = false,
  activityLegacyId,
  onRegenerate,
  onBuddyPostFromGuide,
}: AiGuideResultCardProps) {
  const t = useT();
  const highlights = previewHighlights(plan, t);
  const total = findTravelGuideTotalBudgetItem(plan);

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
        aria-label={getViewTravelGuideCta()}
        onClick={openDetail}
      >
        <View className="s-ai-guide-result__card-head">
          <View className="s-ai-guide-result__card-icon" aria-hidden>
            <Sparkles size={16} color="#ff69b4" />
          </View>
          <Text className="s-ai-guide-result__card-kicker">
            {getTravelGuideTitle()}
          </Text>
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
          <Text className="s-ai-guide-result__chip">
            {t('travelPlan.headcountUnit', { count: plan.headcount })}
          </Text>
          <Text className="s-ai-guide-result__chip">
            {shortTravelGuideBudgetLabel(plan.budgetLabel)}
          </Text>
          <Text className="s-ai-guide-result__chip">
            {plan.selfDrive ? t('travelPlan.driveYes') : t('travelPlan.driveNo')}
          </Text>
        </View>

        {total ? (
          <View className="s-ai-guide-result__budget-strip">
            <Text className="s-ai-guide-result__budget-strip-label">
              {t('travelPlan.totalLabel')}
            </Text>
            <Text className="s-ai-guide-result__budget-strip-value">{total.range}</Text>
            {plan.headcount > 1 ? (
              <Text className="s-ai-guide-result__budget-strip-sub">
                {(() => {
                  const perPerson = travelGuideBudgetPerPersonRange(
                    total.range || '',
                    plan.headcount,
                  );
                  if (!perPerson) return '';
                  return t('travelPlan.budgetPerPerson', { amount: perPerson });
                })()}
              </Text>
            ) : null}
          </View>
        ) : null}

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
          <Text className="s-ai-guide-result__cta-label">
            {getViewTravelGuideCta()}
          </Text>
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
            <Text className="s-ai-guide-result__buddy-cta-title">
              {t('travelPlan.buddyCtaTitle')}
            </Text>
            <Text className="s-ai-guide-result__buddy-cta-sub">
              {t('travelPlan.buddyCtaHint')}
            </Text>
          </View>
        </Button>
      ) : null}

      <TravelPlanReceiptOcrTip
        activityLegacyId={activityLegacyId}
        disabled={disabled}
      />

      <View className="s-ai-guide-result__actions">
        <Button
          className="s-ai-guide-result__action"
          disabled={disabled}
          hoverClass="s-ai-guide-result__action--pressed"
          onClick={onRegenerate}
        >
          <RefreshCw size={16} color="#fff" />
          <Text className="s-ai-guide-result__action-label">{getRegenerateCta()}</Text>
        </Button>
      </View>
    </View>
  );
}
