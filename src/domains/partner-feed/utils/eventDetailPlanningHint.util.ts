import type { FestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';
import type { FestivalPlanTaskKey } from '@/domains/festival-plan/festivalPlanTaskDefs';

export type PrepNudgeAction =
  | { type: 'open_post_replies'; postId: string }
  | { type: 'open_buddy_post_sheet' }
  | { type: 'scroll_to_recruits' }
  | { type: 'open_itinerary' }
  | { type: 'open_travel_guide' }
  | { type: 'festival_plan_task'; taskKey: FestivalPlanTaskKey }
  | { type: 'scroll_to_subscribe' };

export type PrepNudge = {
  text: string;
  accent: boolean;
  action?: PrepNudgeAction;
};

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function taskDone(checklist: FestivalPlanChecklist, key: FestivalPlanTaskKey): boolean {
  return Boolean(checklist.tasks.find((task) => task.key === key)?.done);
}

function actionForTaskKey(taskKey: FestivalPlanTaskKey): PrepNudgeAction {
  switch (taskKey) {
    case 'travel_guide':
      return { type: 'open_travel_guide' };
    case 'buddy_post':
      return { type: 'open_buddy_post_sheet' };
    case 'itinerary':
      return { type: 'open_itinerary' };
  }
}

function resolveEffectiveNextTaskKey(
  checklist: FestivalPlanChecklist,
  lineupPublished: boolean,
): FestivalPlanTaskKey | undefined {
  if (lineupPublished) {
    return checklist.nextTaskKey;
  }
  const pending = checklist.tasks.find(
    (task) => !task.done && task.key !== 'itinerary',
  );
  return pending?.key;
}

function resolveChecklistFallbackNudge(
  checklist: FestivalPlanChecklist,
  lineupPublished: boolean,
  t: TranslateFn,
): PrepNudge | null {
  const nextTaskKey = resolveEffectiveNextTaskKey(checklist, lineupPublished);
  if (!nextTaskKey) {
    return null;
  }

  const nextTask = checklist.tasks.find((task) => task.key === nextTaskKey);
  if (!nextTask) {
    return null;
  }

  return {
    text: t('festivalPlan.nextStep', {
      label: nextTask.done ? nextTask.label : nextTask.title,
    }),
    accent: true,
    action: actionForTaskKey(nextTaskKey),
  };
}

export function resolvePrepNudge({
  showFestivalPlan,
  checklist,
  lineupPublished,
  favorGenres,
  unreadReplyCount = 0,
  t,
}: {
  showFestivalPlan: boolean;
  checklist?: FestivalPlanChecklist | null;
  lineupPublished?: boolean;
  favorGenres?: string[];
  unreadReplyCount?: number;
  t: TranslateFn;
}): PrepNudge {
  if (!showFestivalPlan || !checklist) {
    return {
      text: showFestivalPlan
        ? t('eventDetail.festivalPrepHint')
        : t('eventDetail.festivalPrepHintGuest'),
      accent: false,
    };
  }

  const hasBuddyPost = taskDone(checklist, 'buddy_post');
  const hasItinerary = taskDone(checklist, 'itinerary');
  const buddyPostId = checklist.buddyPostId?.trim();
  const hasFavorGenres = Boolean(favorGenres?.length);
  const lineupReady = lineupPublished !== false;

  if (hasBuddyPost && unreadReplyCount > 0 && buddyPostId) {
    const countLabel =
      unreadReplyCount > 99
        ? t('festivalPlan.prepNudge.newRepliesMax')
        : t('festivalPlan.prepNudge.newReplies', { count: unreadReplyCount });
    return {
      text: countLabel,
      accent: true,
      action: { type: 'open_post_replies', postId: buddyPostId },
    };
  }

  if (!hasBuddyPost) {
    return {
      text: t('festivalPlan.prepNudge.postRecruit'),
      accent: true,
      action: { type: 'open_buddy_post_sheet' },
    };
  }

  if (hasFavorGenres && hasBuddyPost && unreadReplyCount === 0) {
    return {
      text: t('festivalPlan.prepNudge.browseWithPrefs'),
      accent: true,
      action: { type: 'scroll_to_recruits' },
    };
  }

  if (lineupReady && !hasItinerary) {
    return {
      text: t('festivalPlan.prepNudge.scheduleReady'),
      accent: true,
      action: { type: 'open_itinerary' },
    };
  }

  if (!lineupReady && !hasItinerary) {
    return {
      text: t('festivalPlan.prepNudge.lineupPending'),
      accent: true,
      action: { type: 'scroll_to_subscribe' },
    };
  }

  const fallback = resolveChecklistFallbackNudge(checklist, lineupReady, t);
  if (fallback) {
    return fallback;
  }

  return {
    text: t('festivalPlan.allComplete'),
    accent: false,
  };
}

/** @deprecated Use resolvePrepNudge for US-Q2-34 prep nudge rules. */
export function resolvePrepCollapsedHint(params: {
  showFestivalPlan: boolean;
  checklist?: FestivalPlanChecklist | null;
  t: TranslateFn;
}): string {
  return resolvePrepNudge(params).text;
}
