import {
  apiPost,
  LONG_RUNNING_REQUEST_TIMEOUT_MS,
  type ApiFetchInit,
} from '../../utils/apiClient';
import type { SceneRunRequest, SceneRunResponse } from '@sync/scene-contracts';
import { ownerQueryParams } from '../requestContext';

export function runScene(payload: SceneRunRequest, init?: ApiFetchInit) {
  return apiPost<SceneRunResponse>('/ai/scene-run', payload, ownerQueryParams(), {
    timeoutMs: LONG_RUNNING_REQUEST_TIMEOUT_MS,
    maxRetries: 0,
    ...init,
  });
}
