import { describe, expect, it } from 'vitest';
import {
  extractBuddyPostMatchSignals,
  pickBestMatchingBuddyPost,
  scoreBuddyPostMatch,
} from './buddyPostMatch.util';

describe('buddyPostMatch.util', () => {
  const host = extractBuddyPostMatchSignals({
    body: '上海出发，求同路同行',
    tags: ['#同路', '#虹桥'],
    contentTypes: ['carpool'],
    location: '上海',
  });

  it('scores higher when content types and tags overlap', () => {
    const carpool = extractBuddyPostMatchSignals({
      body: '找同路伙伴',
      tags: ['#同路'],
      contentTypes: ['carpool'],
      location: '上海',
    });
    const team = extractBuddyPostMatchSignals({
      body: '找组队',
      tags: ['#组队'],
      contentTypes: ['team'],
    });
    expect(scoreBuddyPostMatch(host, carpool)).toBeGreaterThan(
      scoreBuddyPostMatch(host, team),
    );
  });

  it('picks the best recruiting post for the host post', () => {
    const best = pickBestMatchingBuddyPost(host, [
      {
        id: 'team',
        ...extractBuddyPostMatchSignals({
          body: '找组队',
          contentTypes: ['team'],
        }),
      },
      {
        id: 'carpool',
        ...extractBuddyPostMatchSignals({
          body: '同路去现场',
          tags: ['#同路', '#虹桥'],
          contentTypes: ['carpool'],
          location: '上海',
        }),
        createdAt: '2026-01-01',
      },
    ]);
    expect(best?.id).toBe('carpool');
  });
});
