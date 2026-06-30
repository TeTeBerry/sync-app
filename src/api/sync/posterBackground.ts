import { apiPost } from '../../utils/apiClient';
import { ownerQueryParams } from '../requestContext';

export type PosterBackgroundKind =
  | 'set_vote'
  | 'personality_test'
  | 'recruit_post'
  | 'countdown';

export type GeneratePosterBackgroundInput = {
  kind: PosterBackgroundKind;
  activityLegacyId?: number;
  activityName?: string;
  personalityType?: string;
};

export type GeneratePosterBackgroundResponse = {
  available: boolean;
  imageUrl?: string;
  source?: 'cache' | 'generated';
};

export function generatePosterBackground(input: GeneratePosterBackgroundInput) {
  return apiPost<GeneratePosterBackgroundResponse>(
    '/poster-backgrounds/generate',
    input,
    ownerQueryParams(),
    { timeoutMs: 90_000 },
  );
}
