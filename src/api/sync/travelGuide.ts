import {
  LONG_RUNNING_REQUEST_TIMEOUT_MS,
  ApiError,
  apiGet,
  apiPost,
} from '../../utils/apiClient';
import {
  CLOUD_RUN_MAX_TIMEOUT_MS,
  isWeappCloudRunTransportEnabled,
} from '../../constants/cloud';
import type {
  GenerateTravelGuidePayload,
  GenerateTravelGuideResult,
  TravelGuidePlanReadResult,
} from '../../types/travelGuide';
import { ownerQueryParams } from '../requestContext';

export type TravelGuidePlaceSuggestion = {
  title: string;
  address: string;
  city?: string;
};

export type TravelGuideGenerationJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed';

export type TravelGuideGenerationJobResult = {
  jobId: string;
  status: TravelGuideGenerationJobStatus;
  plan?: GenerateTravelGuideResult['plan'];
  errorMessage?: string;
};

const TRAVEL_GUIDE_POLL_INTERVAL_MS = 1_000;
const TRAVEL_GUIDE_POLL_MAX_ATTEMPTS = 60;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function fetchTravelGuidePlaceSuggestions(keyword: string, region?: string) {
  const params: Record<string, string> = {};
  if (keyword.trim()) params.keyword = keyword.trim();
  if (region?.trim()) params.region = region.trim();
  return apiGet<{ data: TravelGuidePlaceSuggestion[] }>(
    '/travel-guide/place-suggestions',
    params,
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

export function generateTravelGuide(
  activityLegacyId: number,
  payload: GenerateTravelGuidePayload,
) {
  if (isWeappCloudRunTransportEnabled()) {
    return generateTravelGuideViaJob(activityLegacyId, payload);
  }

  return apiPost<GenerateTravelGuideResult>(
    `/activities/${activityLegacyId}/travel-guide/generate`,
    payload,
    ownerQueryParams(),
    { timeoutMs: LONG_RUNNING_REQUEST_TIMEOUT_MS, maxRetries: 0 },
  );
}

export async function pollTravelGuideGenerationJob(
  jobId: string,
): Promise<GenerateTravelGuideResult['plan']> {
  for (let attempt = 0; attempt < TRAVEL_GUIDE_POLL_MAX_ATTEMPTS; attempt += 1) {
    if (attempt > 0) {
      await sleep(TRAVEL_GUIDE_POLL_INTERVAL_MS);
    }

    const job = await apiGet<TravelGuideGenerationJobResult>(
      `/travel-guide/generation-jobs/${jobId}`,
      ownerQueryParams(),
      { timeoutMs: CLOUD_RUN_MAX_TIMEOUT_MS, maxRetries: 0 },
    );

    if (job.status === 'completed' && job.plan) {
      return job.plan;
    }
    if (job.status === 'failed') {
      throw new Error(job.errorMessage || '攻略生成失败，请稍后重试');
    }
  }

  throw new Error('攻略生成超时，请稍后重试');
}

async function generateTravelGuideViaJob(
  activityLegacyId: number,
  payload: GenerateTravelGuidePayload,
): Promise<GenerateTravelGuideResult> {
  const { jobId } = await apiPost<{ jobId: string }>(
    `/activities/${activityLegacyId}/travel-guide/generate-async`,
    payload,
    ownerQueryParams(),
    { timeoutMs: CLOUD_RUN_MAX_TIMEOUT_MS, maxRetries: 0 },
  );

  const plan = await pollTravelGuideGenerationJob(jobId);
  return { plan, guideId: payload.guideId };
}
