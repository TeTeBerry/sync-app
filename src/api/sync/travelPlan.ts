import { apiGet, apiPost } from '../../utils/apiClient';
import {
  CLOUD_RUN_MAX_TIMEOUT_MS,
  isWeappCloudRunTransportEnabled,
} from '../../constants/cloud';
import type {
  RecognizeTravelPlanReceiptPayload,
  RecognizeTravelPlanReceiptResult,
  SavedTravelPlanResult,
  SaveTravelPlanPayload,
  SaveTravelPlanResult,
  TravelPlanReceiptRecognizeJobResult,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';
import { assertReceiptImageRefForTransport } from '@/domains/travel-plan/utils/buildTravelPlanReceiptImageRef';

export function fetchSavedTravelPlan(activityLegacyId: number) {
  return apiGet<SavedTravelPlanResult>(
    `/activities/${activityLegacyId}/travel-plan/saved`,
    ownerQueryParams(),
  );
}

export function saveTravelPlan(
  activityLegacyId: number,
  payload: SaveTravelPlanPayload,
) {
  return apiPost<SaveTravelPlanResult>(
    `/activities/${activityLegacyId}/travel-plan/save`,
    payload,
    ownerQueryParams(),
  );
}

const RECEIPT_RECOGNIZE_POLL_INTERVAL_MS = 2_000;
const RECEIPT_RECOGNIZE_POLL_MAX_ATTEMPTS = 45;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function recognizeTravelPlanReceipt(
  activityLegacyId: number,
  payload: RecognizeTravelPlanReceiptPayload,
) {
  assertReceiptImageRefForTransport(payload.image);
  if (isWeappCloudRunTransportEnabled()) {
    return recognizeTravelPlanReceiptViaJob(activityLegacyId, payload);
  }

  return apiPost<RecognizeTravelPlanReceiptResult>(
    `/activities/${activityLegacyId}/travel-plan/recognize-receipt`,
    payload,
    ownerQueryParams(),
  );
}

async function recognizeTravelPlanReceiptViaJob(
  activityLegacyId: number,
  payload: RecognizeTravelPlanReceiptPayload,
): Promise<RecognizeTravelPlanReceiptResult> {
  const { jobId } = await apiPost<{ jobId: string }>(
    `/activities/${activityLegacyId}/travel-plan/recognize-receipt-async`,
    payload,
    ownerQueryParams(),
    { timeoutMs: CLOUD_RUN_MAX_TIMEOUT_MS, maxRetries: 0 },
  );

  for (let attempt = 0; attempt < RECEIPT_RECOGNIZE_POLL_MAX_ATTEMPTS; attempt += 1) {
    const job = await apiGet<TravelPlanReceiptRecognizeJobResult>(
      `/activities/${activityLegacyId}/travel-plan/receipt-recognize-jobs/${jobId}`,
      ownerQueryParams(),
      { timeoutMs: CLOUD_RUN_MAX_TIMEOUT_MS, maxRetries: 0 },
    );

    if (job.status === 'completed' && job.result) {
      return job.result;
    }
    if (job.status === 'failed') {
      throw new Error(job.errorMessage ?? '截图识别失败，请稍后重试');
    }

    await sleep(RECEIPT_RECOGNIZE_POLL_INTERVAL_MS);
  }

  throw new Error('截图识别超时，请稍后重试');
}
