import { apiPost } from '../../utils/apiClient';
import type { FeedbackPayload, FeedbackResult } from '../../types/backend';
import { ownerQueryParams } from '../requestContext';

export function submitUserFeedback(payload: FeedbackPayload) {
  return apiPost<FeedbackResult>('/feedback', payload, ownerQueryParams());
}
