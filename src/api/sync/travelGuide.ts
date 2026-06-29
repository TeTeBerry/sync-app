import { ApiError, apiGet, apiPatch, apiPost } from '../../utils/apiClient';
import { CLOUD_RUN_MAX_TIMEOUT_MS } from '../../constants/cloud';
import type {
  GenerateTravelGuidePayload,
  GenerateTravelGuideResult,
  TravelGuideBudgetTier,
  TravelGuideGenerationJobProgress,
  TravelGuideGenerationJobResult,
  TravelGuidePlaceSuggestion,
  TravelGuidePlanReadResult,
} from '../../types/travelGuide';
import { animateTravelGuideGenerationTail } from '@/domains/travel-guide/utils/travelGuideGenerationProgress.util';
import { ownerQueryParams } from '../requestContext';
import { t } from '@/i18n';

export type {
  TravelGuidePlaceSuggestion,
  TravelGuideGenerationJobStatus,
  TravelGuideGenerationJobProgress,
  TravelGuideGenerationJobResult,
} from '../../types/travelGuide';

const TRAVEL_GUIDE_POLL_MAX_ATTEMPTS = 60;

function travelGuideGenerationProgressSignature(
  progress: TravelGuideGenerationJobProgress,
): string {
  return `${progress.step}:${progress.percent}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Adaptive poll interval — catch fast early steps, backoff on long jobs. */
function travelGuidePollDelayMs(attempt: number, elapsedMs: number): number {
  if (attempt < 8) return 500;
  if (attempt < 12) return 1_000;
  if (elapsedMs < 20_000) return 2_000;
  return 5_000;
}

export function fetchTravelGuidePlaceSuggestions(keyword: string, region?: string) {
  const params: Record<string, string> = {};
  if (keyword.trim()) params.keyword = keyword.trim();
  if (region?.trim()) params.region = region.trim();
  return apiGet<{ data: TravelGuidePlaceSuggestion[] }>(
    '/travel-guide/place-suggestions',
    params,
    { timeoutMs: 3_500, maxRetries: 0 },
  );
}

export function fetchReverseGeocodeLabel(lat: number, lng: number) {
  return apiGet<{ label: string | null }>('/travel-guide/reverse-geocode', {
    lat: String(lat),
    lng: String(lng),
  });
}

export async function fetchTravelGuidePlan(
  guideId: string,
): Promise<TravelGuidePlanReadResult | null> {
  const id = guideId.trim();
  if (!id) return null;

  try {
    return await apiGet<TravelGuidePlanReadResult>(
      `/travel-guide/plans/${encodeURIComponent(id)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export function patchTravelGuideBudgetTier(
  guideId: string,
  budgetTier: TravelGuideBudgetTier,
) {
  return apiPatch<TravelGuidePlanReadResult>(
    `/travel-guide/plans/${encodeURIComponent(guideId)}/budget-tier`,
    { budgetTier },
    ownerQueryParams(),
  );
}

export function generateTravelGuide(
  activityLegacyId: number,
  payload: GenerateTravelGuidePayload,
  options?: {
    onProgress?: (progress: TravelGuideGenerationJobProgress) => void;
  },
) {
  return generateTravelGuideViaJob(activityLegacyId, payload, options?.onProgress);
}

export async function pollTravelGuideGenerationJob(
  jobId: string,
  onProgress?: (progress: TravelGuideGenerationJobProgress) => void,
): Promise<GenerateTravelGuideResult['plan']> {
  const startedAt = Date.now();
  let lastProgressSignature: string | undefined;
  let lastEmittedProgress: TravelGuideGenerationJobProgress | undefined;

  for (let attempt = 0; attempt < TRAVEL_GUIDE_POLL_MAX_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      const elapsedMs = Date.now() - startedAt;
      await sleep(travelGuidePollDelayMs(attempt, elapsedMs));
    }

    const job = await apiGet<TravelGuideGenerationJobResult>(
      `/travel-guide/generation-jobs/${jobId}`,
      ownerQueryParams(),
      { timeoutMs: CLOUD_RUN_MAX_TIMEOUT_MS, maxRetries: 0 },
    );

    if (job.progress && onProgress) {
      const signature = travelGuideGenerationProgressSignature(job.progress);
      if (signature !== lastProgressSignature) {
        lastProgressSignature = signature;
        lastEmittedProgress = job.progress;
        onProgress(job.progress);
      }
    }

    if (job.status === 'completed' && job.plan) {
      if (onProgress) {
        await animateTravelGuideGenerationTail(lastEmittedProgress, onProgress);
      }
      return job.plan;
    }
    if (job.status === 'failed') {
      throw new Error(job.errorMessage || t('travelPlan.guideGenerationFailed'));
    }
  }

  throw new Error(t('travelPlan.guideGenerationTimeout'));
}

async function generateTravelGuideViaJob(
  activityLegacyId: number,
  payload: GenerateTravelGuidePayload,
  onProgress?: (progress: TravelGuideGenerationJobProgress) => void,
): Promise<GenerateTravelGuideResult> {
  const { jobId } = await apiPost<{ jobId: string }>(
    `/activities/${activityLegacyId}/travel-guide/generate-async`,
    payload,
    ownerQueryParams(),
    { timeoutMs: CLOUD_RUN_MAX_TIMEOUT_MS, maxRetries: 0 },
  );

  const plan = await pollTravelGuideGenerationJob(jobId, onProgress);
  return { plan, guideId: payload.guideId };
}
