import type { EventDetailPost } from '@/types/backend';

export type BuildRecruitApplyCommentDraftInput = {
  post: Pick<EventDetailPost, 'location' | 'departureCity' | 'body' | 'bodyPreview'>;
  userLocation?: string;
  travelGuide?: { departure?: string; headcount?: number };
  t: (key: string, params?: Record<string, string | number>) => string;
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
  const { t } = input;

  const detailLine = departure
    ? t('plur.applyTemplate.lineWithDeparture', { headcount, departure })
    : t('plur.applyTemplate.lineWithoutDeparture', { headcount });

  return [
    t('plur.applyTemplate.greeting'),
    detailLine,
    t('plur.applyTemplate.publicFooter'),
  ].join('\n');
}
