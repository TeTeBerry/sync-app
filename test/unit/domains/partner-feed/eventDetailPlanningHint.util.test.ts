import { describe, expect, it } from 'vitest';
import { resolvePrepNudge } from '@/domains/partner-feed/utils/eventDetailPlanningHint.util';
import { buildFestivalPlanChecklist } from '@/domains/festival-plan/buildFestivalPlanChecklist';

const t = (key: string, params?: Record<string, string | number>) => {
  if (key === 'festivalPlan.nextStep' && params?.label) {
    return `下一步：${params.label}`;
  }
  if (key === 'festivalPlan.prepNudge.newReplies' && params?.count != null) {
    return `你的招募有 ${params.count} 条新公开回复`;
  }
  if (key === 'festivalPlan.prepNudge.newRepliesMax') {
    return '你的招募有 99+ 条新公开回复';
  }
  if (key === 'festivalPlan.prepNudge.postRecruit') {
    return '还差：发一条公开招募';
  }
  if (key === 'festivalPlan.prepNudge.browseWithPrefs') {
    return '已参考你的偏好，去看看公开招募';
  }
  if (key === 'festivalPlan.prepNudge.scheduleReady') {
    return '时间表已出，去排你的专属 set';
  }
  if (key === 'festivalPlan.prepNudge.lineupPending') {
    return '阵容尚未官宣，可订阅提醒；找队可先浏览公开招募';
  }
  if (key === 'festivalPlan.allComplete') {
    return '本场准备已完成';
  }
  if (key === 'eventDetail.festivalPrepHint') {
    return '攻略 · 演出表 · 招募';
  }
  if (key === 'eventDetail.festivalPrepHintGuest') {
    return '出行攻略 · 演出表';
  }
  return key;
};

describe('resolvePrepNudge', () => {
  it('prioritizes unread replies on an existing recruit post', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasBuddyPost: true,
      buddyPostId: 'post-1',
      hasItinerary: false,
    });

    const nudge = resolvePrepNudge({
      showFestivalPlan: true,
      checklist,
      lineupPublished: false,
      unreadReplyCount: 3,
      t,
    });

    expect(nudge.text).toBe('你的招募有 3 条新公开回复');
    expect(nudge.action).toEqual({ type: 'open_post_replies', postId: 'post-1' });
  });

  it('nudges posting when no recruit exists', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasBuddyPost: false,
      hasItinerary: false,
    });

    const nudge = resolvePrepNudge({
      showFestivalPlan: true,
      checklist,
      favorGenres: ['Techno'],
      t,
    });

    expect(nudge.text).toBe('还差：发一条公开招募');
    expect(nudge.action).toEqual({ type: 'open_buddy_post_sheet' });
  });

  it('nudges browsing recruits when personality prefs exist and recruit is posted', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasBuddyPost: true,
      buddyPostId: 'post-1',
      hasItinerary: false,
    });

    const nudge = resolvePrepNudge({
      showFestivalPlan: true,
      checklist,
      favorGenres: ['Techno'],
      unreadReplyCount: 0,
      lineupPublished: true,
      t,
    });

    expect(nudge.text).toBe('已参考你的偏好，去看看公开招募');
    expect(nudge.action).toEqual({ type: 'scroll_to_recruits' });
  });

  it('nudges itinerary when lineup is published and itinerary is missing', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasBuddyPost: true,
      buddyPostId: 'post-1',
      hasItinerary: false,
    });

    const nudge = resolvePrepNudge({
      showFestivalPlan: true,
      checklist,
      lineupPublished: true,
      unreadReplyCount: 0,
      t,
    });

    expect(nudge.text).toBe('时间表已出，去排你的专属 set');
    expect(nudge.action).toEqual({ type: 'open_itinerary' });
  });

  it('weakens itinerary nudge when lineup is pending', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasBuddyPost: true,
      buddyPostId: 'post-1',
      hasItinerary: false,
    });

    const nudge = resolvePrepNudge({
      showFestivalPlan: true,
      checklist,
      lineupPublished: false,
      unreadReplyCount: 0,
      t,
    });

    expect(nudge.text).toBe('阵容尚未官宣，可订阅提醒；找队可先浏览公开招募');
    expect(nudge.action).toEqual({ type: 'scroll_to_subscribe' });
  });

  it('falls back to the next checklist task when higher rules do not apply', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: false,
      hasBuddyPost: true,
      buddyPostId: 'post-1',
      hasItinerary: true,
      itineraryDayCount: 2,
    });

    const nudge = resolvePrepNudge({
      showFestivalPlan: true,
      checklist,
      lineupPublished: true,
      unreadReplyCount: 0,
      t,
    });

    expect(nudge.text).toBe('下一步：出行攻略');
    expect(nudge.action).toEqual({ type: 'open_travel_guide' });
  });

  it('skips itinerary in fallback when lineup is not published', () => {
    const checklist = buildFestivalPlanChecklist({
      hasTravelGuide: true,
      hasBuddyPost: true,
      buddyPostId: 'post-1',
      hasItinerary: false,
    });

    const nudge = resolvePrepNudge({
      showFestivalPlan: true,
      checklist,
      lineupPublished: false,
      unreadReplyCount: 0,
      favorGenres: [],
      t,
    });

    expect(nudge.text).toBe('阵容尚未官宣，可订阅提醒；找队可先浏览公开招募');
    expect(nudge.action?.type).not.toBe('open_itinerary');
  });

  it('falls back to guest hint when plan is hidden', () => {
    expect(
      resolvePrepNudge({
        showFestivalPlan: false,
        checklist: null,
        t,
      }).text,
    ).toBe('出行攻略 · 演出表');
  });
});
