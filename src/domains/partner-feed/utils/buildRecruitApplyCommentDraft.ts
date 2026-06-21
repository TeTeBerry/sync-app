import type { EventDetailPost } from '@/types/backend';

export type BuildRecruitApplyCommentDraftInput = {
  post: Pick<EventDetailPost, 'location' | 'departureCity' | 'body' | 'bodyPreview'>;
  userLocation?: string;
  travelGuide?: { departure?: string; headcount?: number };
};

const DEFAULT_HEADCOUNT = 2;

function resolveHeadcount(travelGuide?: { headcount?: number }): number {
  const headcount = travelGuide?.headcount;
  if (headcount != null && Number.isFinite(headcount) && headcount > 0) {
    return Math.round(headcount);
  }
  return DEFAULT_HEADCOUNT;
}

function resolveDeparture(
  input: BuildRecruitApplyCommentDraftInput,
): string | undefined {
  const fromGuide = input.travelGuide?.departure?.trim();
  if (fromGuide) return fromGuide;

  const fromUser = input.userLocation?.trim();
  if (fromUser) return fromUser;

  const fromPost =
    input.post.departureCity?.trim() || input.post.location?.trim() || undefined;
  return fromPost;
}

export function buildRecruitApplyCommentDraft(
  input: BuildRecruitApplyCommentDraftInput,
): string {
  const headcount = resolveHeadcount(input.travelGuide);
  const departure = resolveDeparture(input);

  if (departure) {
    return `想加入，${headcount}人，${departure}出发，时间可配合`;
  }

  return '想加入，时间可配合';
}
