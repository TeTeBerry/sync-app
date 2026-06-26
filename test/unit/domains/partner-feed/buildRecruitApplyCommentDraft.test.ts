import { describe, expect, it } from 'vitest';
import { buildRecruitApplyCommentDraft } from '@/domains/partner-feed/utils/buildRecruitApplyCommentDraft';

const basePost = {
  location: '深圳',
  departureCity: '上海',
  body: '组队，2人',
  bodyPreview: '组队，2人',
};

const mockT = (key: string, params?: Record<string, string | number>) => {
  switch (key) {
    case 'plur.applyTemplate.greeting':
      return '你好，我也去这场，想一起 Rave。';
    case 'plur.applyTemplate.lineWithDeparture':
      return `人数：${params?.headcount} 人 · 出发：${params?.departure} · 时间可配合。`;
    case 'plur.applyTemplate.lineWithoutDeparture':
      return `人数：${params?.headcount} 人 · 时间可配合。`;
    case 'plur.applyTemplate.publicFooter':
      return '（公开回复，请勿留联系方式）';
    default:
      return key;
  }
};

describe('buildRecruitApplyCommentDraft', () => {
  it('prefers travel guide departure and headcount', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: basePost,
        userLocation: '北京',
        travelGuide: { departure: '杭州', headcount: 3 },
        t: mockT,
      }),
    ).toBe(
      [
        '你好，我也去这场，想一起 Rave。',
        '人数：3 人 · 出发：杭州 · 时间可配合。',
        '（公开回复，请勿留联系方式）',
      ].join('\n'),
    );
  });

  it('falls back to user profile location', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: basePost,
        userLocation: '北京',
        t: mockT,
      }),
    ).toBe(
      [
        '你好，我也去这场，想一起 Rave。',
        '人数：2 人 · 出发：北京 · 时间可配合。',
        '（公开回复，请勿留联系方式）',
      ].join('\n'),
    );
  });

  it('falls back to post departure city', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: basePost,
        t: mockT,
      }),
    ).toBe(
      [
        '你好，我也去这场，想一起 Rave。',
        '人数：2 人 · 出发：上海 · 时间可配合。',
        '（公开回复，请勿留联系方式）',
      ].join('\n'),
    );
  });

  it('uses post location when departure city is empty', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: { ...basePost, departureCity: '' },
        t: mockT,
      }),
    ).toBe(
      [
        '你好，我也去这场，想一起 Rave。',
        '人数：2 人 · 出发：深圳 · 时间可配合。',
        '（公开回复，请勿留联系方式）',
      ].join('\n'),
    );
  });

  it('returns template without departure when none is available', () => {
    expect(
      buildRecruitApplyCommentDraft({
        post: { location: '', departureCity: '', body: '', bodyPreview: '' },
        t: mockT,
      }),
    ).toBe(
      [
        '你好，我也去这场，想一起 Rave。',
        '人数：2 人 · 时间可配合。',
        '（公开回复，请勿留联系方式）',
      ].join('\n'),
    );
  });
});
