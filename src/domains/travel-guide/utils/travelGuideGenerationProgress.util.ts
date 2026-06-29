import type { TravelGuideGenerationJobProgress } from '@/types/travelGuide';

/** Visible steps in the loading UI (queued is implicit). */
export const TRAVEL_GUIDE_GENERATION_STEP_ORDER = [
  'validating',
  'map_poi',
  'quotes_hotels',
  'quotes_flights',
  'ai_writing',
  'assembling',
  'finishing',
] as const;

export type TravelGuideGenerationVisibleStep =
  (typeof TRAVEL_GUIDE_GENERATION_STEP_ORDER)[number];

/** Keep in sync with backend TRAVEL_GUIDE_PROGRESS percents. */
const TRAVEL_GUIDE_STEP_PERCENT: Record<
  TravelGuideGenerationJobProgress['step'],
  number
> = {
  queued: 2,
  validating: 8,
  map_poi: 22,
  quotes_hotels: 36,
  quotes_flights: 50,
  quotes: 36,
  ai_writing: 66,
  assembling: 84,
  finishing: 94,
  completed: 100,
};

const TAIL_STEP_DISPLAY_MS = 360;
const COMPLETED_HOLD_MS = 480;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function travelGuideProgressPercent(
  step: TravelGuideGenerationJobProgress['step'],
): number {
  return TRAVEL_GUIDE_STEP_PERCENT[step] ?? 0;
}

/** Steps to replay when the job finishes before the UI caught up (e.g. after ai_writing). */
export function travelGuideTailStepsAfter(
  lastProgress: TravelGuideGenerationJobProgress | undefined,
): TravelGuideGenerationJobProgress[] {
  const lastIdx =
    lastProgress?.step === 'completed'
      ? TRAVEL_GUIDE_GENERATION_STEP_ORDER.length
      : resolveTravelGuideGenerationStepIndex(lastProgress);

  const steps: TravelGuideGenerationJobProgress[] = [];
  for (let i = lastIdx + 1; i < TRAVEL_GUIDE_GENERATION_STEP_ORDER.length; i++) {
    const step = TRAVEL_GUIDE_GENERATION_STEP_ORDER[i]!;
    steps.push({ step, percent: travelGuideProgressPercent(step) });
  }
  steps.push({ step: 'completed', percent: 100 });
  return steps;
}

export async function animateTravelGuideGenerationTail(
  lastProgress: TravelGuideGenerationJobProgress | undefined,
  onProgress: (progress: TravelGuideGenerationJobProgress) => void,
): Promise<void> {
  const steps = travelGuideTailStepsAfter(lastProgress);
  for (const progress of steps) {
    onProgress(progress);
    await sleep(
      progress.step === 'completed' ? COMPLETED_HOLD_MS : TAIL_STEP_DISPLAY_MS,
    );
  }
}

const LEGACY_STEP_INDEX: Partial<
  Record<TravelGuideGenerationJobProgress['step'], TravelGuideGenerationVisibleStep>
> = {
  quotes: 'quotes_hotels',
};

export function resolveTravelGuideGenerationPercent(
  progress: TravelGuideGenerationJobProgress | null | undefined,
): number {
  if (!progress) return 4;
  return Math.min(100, Math.max(0, Math.round(progress.percent)));
}

export function resolveTravelGuideGenerationStepIndex(
  progress: TravelGuideGenerationJobProgress | null | undefined,
): number {
  if (!progress) return -1;
  if (progress.step === 'completed') {
    return TRAVEL_GUIDE_GENERATION_STEP_ORDER.length;
  }
  const normalizedStep =
    LEGACY_STEP_INDEX[progress.step] ??
    (progress.step as TravelGuideGenerationVisibleStep);
  const idx = TRAVEL_GUIDE_GENERATION_STEP_ORDER.indexOf(normalizedStep);
  return idx >= 0 ? idx : -1;
}

export function travelGuideGenerationStepKey(
  step: TravelGuideGenerationVisibleStep,
): `travelGuide.genStep${Capitalize<string>}` {
  const map: Record<
    TravelGuideGenerationVisibleStep,
    `travelGuide.genStep${Capitalize<string>}`
  > = {
    validating: 'travelGuide.genStepValidating',
    map_poi: 'travelGuide.genStepMapPoi',
    quotes_hotels: 'travelGuide.genStepQuotesHotels',
    quotes_flights: 'travelGuide.genStepQuotesFlights',
    ai_writing: 'travelGuide.genStepAiWriting',
    assembling: 'travelGuide.genStepAssembling',
    finishing: 'travelGuide.genStepFinishing',
  };
  return map[step];
}

export function resolveTravelGuideGenerationStepLabel(
  progress: TravelGuideGenerationJobProgress | null | undefined,
  t: (key: string) => string,
): string {
  if (!progress) return t('travelGuide.genStepQueued');
  if (progress.step === 'completed') return t('travelGuide.genStepCompleted');
  if (progress.step === 'queued') return t('travelGuide.genStepQueued');
  const normalizedStep =
    LEGACY_STEP_INDEX[progress.step] ??
    (progress.step as TravelGuideGenerationVisibleStep);
  const idx = TRAVEL_GUIDE_GENERATION_STEP_ORDER.indexOf(normalizedStep);
  if (idx >= 0) {
    return t(travelGuideGenerationStepKey(TRAVEL_GUIDE_GENERATION_STEP_ORDER[idx]!));
  }
  return t('travelGuide.generating');
}
