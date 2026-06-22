import { describe, expect, it } from 'vitest';
import { resolvePrepCollapsedHint } from '@/domains/partner-feed/utils/eventDetailPlanningHint.util';
import { buildFestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';

const t = (key: string, params?: Record<string, string>) => {
  if (key === 'festivalPlan.nextStep' && params?.label) {
    return `下一步：${params.label}`;
  }
  if (key === 'eventDetail.festivalPrepHint') {
    return '攻略 · 演出表 · 招募';
  }
  if (key === 'eventDetail.festivalPrepHintGuest') {
    return '出行攻略 · 演出表';
  }
  return key;
};

describe('resolvePrepCollapsedHint', () => {
  it('surfaces next checklist task when festival plan is active', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasItinerary: false,
      hasBuddyPost: false,
    });

    expect(
      resolvePrepCollapsedHint({
        showFestivalPlan: true,
        checklist,
        t,
      }),
    ).toBe('下一步：专属演出表');
  });

  it('falls back to guest hint when plan is hidden', () => {
    expect(
      resolvePrepCollapsedHint({
        showFestivalPlan: false,
        checklist: null,
        t,
      }),
    ).toBe('出行攻略 · 演出表');
  });
});
