import { apiGet, apiPost } from '../../utils/apiClient';
import type {
  SetVoteLeaderboardResult,
  SetVoteMeResult,
  SetVoteSubmitResult,
} from '../../types/activity';
import { ownerQueryParams } from '../requestContext';

export function submitSetVote(
  activityLegacyId: number,
  artistIds: string[],
  options?: { syncGenres?: boolean },
) {
  return apiPost<SetVoteSubmitResult>(
    `/activities/${activityLegacyId}/set-votes`,
    {
      artistIds,
      syncGenres: options?.syncGenres,
    },
    ownerQueryParams(),
  );
}

export function fetchSetVoteLeaderboard(activityLegacyId: number) {
  return apiGet<SetVoteLeaderboardResult>(
    `/activities/${activityLegacyId}/set-votes/leaderboard`,
    ownerQueryParams(),
  );
}

export function fetchMySetVote(activityLegacyId: number) {
  return apiGet<SetVoteMeResult>(
    `/activities/${activityLegacyId}/set-votes/me`,
    ownerQueryParams(),
  );
}
