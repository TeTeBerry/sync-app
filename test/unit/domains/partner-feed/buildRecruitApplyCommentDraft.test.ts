import { describe, expect, it } from 'vitest';
import { buildRecruitApplyCommentDraft } from '@/domains/partner-feed/utils/buildRecruitApplyCommentDraft';

const basePost = {
  location: '深圳',
  departureCity: '上海',
  body: '组队，2人',
  bodyPreview: '组队，2人',
};

describe('buildRecruitApplyCommentDraft', () => {
  it('prefers travel guide departure and headcount', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: basePost,
        userLocation: '北京',
        travelGuide: { departure: '杭州', headcount: 3 },
      }),
    ).toBe('想加入，3人，杭州出发，时间可配合');
  });

  it('falls back to user profile location', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: basePost,
        userLocation: '北京',
      }),
    ).toBe('想加入，2人，北京出发，时间可配合');
  });

  it('falls back to post departure city', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: basePost,
      }),
    ).toBe('想加入，2人，上海出发，时间可配合');
  });

  it('uses post location when departure city is empty', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: { ...basePost, departureCity: '' },
      }),
    ).toBe('想加入，2人，深圳出发，时间可配合');
  });

  it('returns minimal template when no departure is available', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: { location: '', departureCity: '', body: '', bodyPreview: '' },
      }),
    ).toBe('想加入，时间可配合');
  });
});
