import { describe, expect, it } from 'vitest';
import {
  extractBudgetLevelFromPostText,
  scoreEventDetailPostPreferenceMatch,
  sortEventDetailPostsByPreference,
} from '../../../../src/domains/partner-feed/utils/buddyPostPreferenceMatch';
import type { EventDetailPost } from '../../../../src/types/backend';

function samplePost(overrides: Partial<EventDetailPost> = {}): EventDetailPost {
  return {
    id: 'p1',
    body: '10.3 白天在场，喜欢 Techno，找 2 人同逛舞台',
    location: '主舞台',
    tags: ['#组队'],
    createdAt: '2026-10-01T10:00:00Z',
    comments: [],
    ...overrides,
  } as EventDetailPost;
}

describe('buddyPostPreferenceMatch', () => {
  it('scores city and genre matches', () => {
    const post = samplePost({
      body: '上海出发 Techno 组队',
      departureCity: '上海',
    });
    expect(
      scoreEventDetailPostPreferenceMatch(post, {
        city: '上海',
        favorGenres: ['Techno'],
      }),
    ).toBe(65);
  });

  it('scores budget exact match higher than adjacent tier', () => {
    const comfort = samplePost({ body: '组队 住宿舒适档' });
    const economy = samplePost({ body: '组队 住宿经济档' });
    const profile = { budgetLevel: 'medium' };

    expect(scoreEventDetailPostPreferenceMatch(comfort, profile)).toBe(20);
    expect(scoreEventDetailPostPreferenceMatch(economy, profile)).toBe(10);
  });

  it('extracts budget level from post text', () => {
    expect(extractBudgetLevelFromPostText('舒适(¥300-600)')).toBe('medium');
    expect(extractBudgetLevelFromPostText('经济档住宿')).toBe('low');
  });

  it('sorts posts by preference score then recency', () => {
    const older = samplePost({
      id: 'older',
      body: '广州 Techno',
      departureCity: '广州',
      createdAt: '2026-09-01T10:00:00Z',
    });
    const newer = samplePost({
      id: 'newer',
      body: '上海 Techno',
      departureCity: '上海',
      createdAt: '2026-10-02T10:00:00Z',
    });

    const sorted = sortEventDetailPostsByPreference([older, newer], {
      city: '上海',
      favorGenres: ['Techno'],
    });
    expect(sorted.map((post) => post.id)).toEqual(['newer', 'older']);
  });

  it('matches drum and bass preferences against dnb post text', () => {
    const post = samplePost({
      body: '上海出发 drum and bass 组队',
      departureCity: '上海',
    });
    expect(
      scoreEventDetailPostPreferenceMatch(post, {
        city: '上海',
        favorGenres: ['Drum and Bass'],
      }),
    ).toBeGreaterThanOrEqual(65);
  });
});
