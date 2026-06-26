import { t } from '@/i18n';
import type { SetVoteLeaderboardEntry, SetVotePick } from '@/types/activity';
import { buildPlurPeaceShareImageUrl } from '@/utils/plurShareImage.util';
import { ROUTES } from '@/utils/route';
import { buildQueryString } from '@/utils/queryString';
import {
  encodeSelectedDjList,
  parseSelectedDjList,
} from '@/domains/performance-itinerary/utils/itineraryBanner';

export type SetVoteShareQuery = {
  activityLegacyId: number;
  voterPicks: string[];
};

export type SetVoteShareTeaser = {
  activityLegacyId: number;
  activityName: string;
  voterPickNames: string[];
  topEntries: SetVoteLeaderboardEntry[];
};

export function buildSetVoteShareTitle(activityName: string): string {
  return t('setVote.shareTitle', { activityName });
}

export function buildSetVoteSharePath(input: {
  activityLegacyId: number;
  voterPicks: string[];
}): string {
  const query: Record<string, string | undefined> = {
    share: '1',
    id: String(input.activityLegacyId),
    activityLegacyId: String(input.activityLegacyId),
    voterPicks: encodeSelectedDjList(input.voterPicks),
    voteMode: '1',
  };
  const qs = buildQueryString(query);
  return qs ? `${ROUTES.ACTIVITY_LINEUP}?${qs}` : ROUTES.ACTIVITY_LINEUP;
}

export function buildSetVoteShareAppMessage(input: {
  activityName: string;
  activityLegacyId: number;
  voterPicks: string[];
}) {
  return {
    title: buildSetVoteShareTitle(input.activityName),
    path: buildSetVoteSharePath(input),
    imageUrl: buildPlurPeaceShareImageUrl(),
  };
}

export function buildSetVoteShareTimeline(input: {
  activityName: string;
  activityLegacyId: number;
  voterPicks: string[];
}) {
  const query = buildSetVoteSharePath(input).split('?')[1] ?? '';
  return {
    title: buildSetVoteShareTitle(input.activityName),
    query,
    imageUrl: buildPlurPeaceShareImageUrl(),
  };
}

export function parseSetVoteShareQuery(
  params: Record<string, string | undefined>,
): SetVoteShareQuery | null {
  if (params.share !== '1') {
    return null;
  }
  const legacyRaw = params.activityLegacyId?.trim();
  const activityLegacyId = legacyRaw ? Number(legacyRaw) : NaN;
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    return null;
  }
  const voterPicks = parseSelectedDjList(params.voterPicks);
  if (!voterPicks.length) {
    return null;
  }
  return { activityLegacyId, voterPicks };
}

export function resolveSetVoteShareTeaser(input: {
  activityName: string;
  shareQuery: SetVoteShareQuery;
  djNameById: Map<string, string>;
  topEntries: SetVoteLeaderboardEntry[];
}): SetVoteShareTeaser {
  const voterPickNames = input.shareQuery.voterPicks.map(
    (id) => input.djNameById.get(id) ?? id,
  );
  return {
    activityLegacyId: input.shareQuery.activityLegacyId,
    activityName: input.activityName,
    voterPickNames,
    topEntries: input.topEntries.slice(0, 3),
  };
}

export function resolveSetVotePickNames(picks: SetVotePick[]): string[] {
  return picks.map((pick) => pick.artistName);
}
