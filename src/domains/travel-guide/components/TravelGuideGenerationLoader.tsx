import './TravelGuideGenerationLoader.scss';
import { Text, View } from '@tarojs/components';
import { useMemo } from 'react';
import { useT } from '@/hooks/useI18n';
import type { TravelGuideGenerationJobProgress } from '@/types/travelGuide';
import {
  resolveTravelGuideGenerationPercent,
  resolveTravelGuideGenerationStepIndex,
  resolveTravelGuideGenerationStepLabel,
  TRAVEL_GUIDE_GENERATION_STEP_ORDER,
  travelGuideGenerationStepKey,
} from '../utils/travelGuideGenerationProgress.util';

type TravelGuideGenerationLoaderProps = {
  progress?: TravelGuideGenerationJobProgress | null;
  minHeight?: number;
};

function StepMarker({ state }: { state: 'done' | 'active' | 'pending' }) {
  return (
    <View
      className={[
        's-travel-guide-gen-loader__step-marker',
        state === 'done' ? 's-travel-guide-gen-loader__step-marker--done' : '',
        state === 'active' ? 's-travel-guide-gen-loader__step-marker--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      {state === 'done' ? (
        <Text className="s-travel-guide-gen-loader__step-check">✓</Text>
      ) : state === 'active' ? (
        <View className="s-travel-guide-gen-loader__step-pulse" />
      ) : null}
    </View>
  );
}

export function TravelGuideGenerationLoader({
  progress,
  minHeight = 320,
}: TravelGuideGenerationLoaderProps) {
  const t = useT();
  const percent = resolveTravelGuideGenerationPercent(progress);
  const activeIndex = resolveTravelGuideGenerationStepIndex(progress);
  const headline = resolveTravelGuideGenerationStepLabel(progress, t);

  const steps = useMemo(
    () =>
      TRAVEL_GUIDE_GENERATION_STEP_ORDER.map((step, index) => {
        let state: 'done' | 'active' | 'pending' = 'pending';
        if (activeIndex >= index) {
          state = activeIndex === index ? 'active' : 'done';
        }
        if (progress?.step === 'completed') {
          state = 'done';
        }
        return {
          step,
          label: t(travelGuideGenerationStepKey(step)),
          state,
        };
      }),
    [activeIndex, progress?.step, t],
  );

  return (
    <View
      className="s-travel-guide-gen-loader"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('travelGuide.genProgressAria', {
        percent: String(percent),
        step: headline,
      })}
    >
      <View className="s-travel-guide-gen-loader__hero" aria-hidden>
        <View
          className="s-travel-guide-gen-loader__ring"
          style={
            {
              '--gen-progress-deg': `${percent * 3.6}deg`,
            } as Record<string, string>
          }
        />
        <Text className="s-travel-guide-gen-loader__percent">{percent}%</Text>
      </View>

      <Text className="s-travel-guide-gen-loader__title">
        {t('travelGuide.generating')}
      </Text>
      <Text className="s-travel-guide-gen-loader__headline">{headline}</Text>

      <View className="s-travel-guide-gen-loader__bar" aria-hidden>
        <View
          className="s-travel-guide-gen-loader__bar-fill"
          style={{ width: `${percent}%` }}
        />
      </View>

      <View className="s-travel-guide-gen-loader__steps">
        {steps.map((item) => (
          <View
            key={item.step}
            className={[
              's-travel-guide-gen-loader__step',
              item.state === 'active' ? 's-travel-guide-gen-loader__step--active' : '',
              item.state === 'done' ? 's-travel-guide-gen-loader__step--done' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <StepMarker state={item.state} />
            <Text className="s-travel-guide-gen-loader__step-label">{item.label}</Text>
          </View>
        ))}
      </View>

      <Text className="s-travel-guide-gen-loader__hint">
        {t('travelGuide.genProgressHint')}
      </Text>
    </View>
  );
}
