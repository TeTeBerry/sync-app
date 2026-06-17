import {
  BUDDY_POST_CTA,
  GENERATE_ITINERARY_CTA,
  GENERATE_TRAVEL_GUIDE_CTA,
  ITINERARY_TITLE,
  TRAVEL_GUIDE_TITLE,
  VIEW_ITINERARY_CTA,
  VIEW_TRAVEL_GUIDE_CTA,
} from '@/constants/aiCtaLabels';

export type FestivalPlanTaskKey =
  | 'travel_guide'
  | 'itinerary'
  | 'buddy_post'
  | 'registration';

export const FESTIVAL_PLAN_TASK_ORDER: readonly FestivalPlanTaskKey[] = [
  'travel_guide',
  'itinerary',
  'buddy_post',
  'registration',
] as const;

export type FestivalPlanTaskDef = {
  title: string;
  actionLabel: string;
  doneLabel: string;
  viewLabel: string;
};

export const FESTIVAL_PLAN_TASK_DEFS: Record<FestivalPlanTaskKey, FestivalPlanTaskDef> =
  {
    travel_guide: {
      title: TRAVEL_GUIDE_TITLE,
      actionLabel: GENERATE_TRAVEL_GUIDE_CTA,
      doneLabel: '攻略已生成',
      viewLabel: VIEW_TRAVEL_GUIDE_CTA,
    },
    itinerary: {
      title: ITINERARY_TITLE,
      actionLabel: GENERATE_ITINERARY_CTA,
      doneLabel: '行程已生成',
      viewLabel: VIEW_ITINERARY_CTA,
    },
    buddy_post: {
      title: '组队帖',
      actionLabel: BUDDY_POST_CTA,
      doneLabel: '组队帖已发',
      viewLabel: '查看组队帖',
    },
    registration: {
      title: '确认报名',
      actionLabel: '去报名',
      doneLabel: '已报名',
      viewLabel: '查看活动',
    },
  };
