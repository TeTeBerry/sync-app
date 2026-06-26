import { parsePersonalityTestShareQuery } from '@/domains/personality-test/utils/personalityWechatShare.util';
import { parseSetVoteShareQuery } from '@/domains/set-vote/utils/setVoteWechatShare.util';

export type ShareLandingParams = Record<string, string | undefined>;

function hasEventDetailDeepLink(params: ShareLandingParams): boolean {
  const legacyRaw = params.activityLegacyId?.trim() || params.id?.trim();
  if (!legacyRaw) {
    return false;
  }
  const legacyId = Number(legacyRaw);
  return Number.isFinite(legacyId) && legacyId > 0;
}

function hasRecruitDeepLink(params: ShareLandingParams): boolean {
  return params.focusPosts === '1' || params.openBuddyPost === '1';
}

/**
 * Returns true when the home page should skip L1/L2 first-run overlays
 * so share / deep-link landings are not blocked.
 */
export function shouldBypassFirstRunOverlays(params: ShareLandingParams): boolean {
  if (params.share === '1') {
    return true;
  }
  if (parsePersonalityTestShareQuery(params)) {
    return true;
  }
  if (parseSetVoteShareQuery(params)) {
    return true;
  }
  if (hasRecruitDeepLink(params)) {
    return true;
  }
  if (hasEventDetailDeepLink(params)) {
    return true;
  }
  return false;
}
