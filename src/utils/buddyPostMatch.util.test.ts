import { describe, expect, it } from 'vitest';
import {
  extractBuddyPostMatchSignals,
  pickBestMatchingBuddyPost,
  scoreBuddyPostMatch,
} from './buddyPostMatch.util';

describe('buddyPostMatch.util', () => {
  const host = extractBuddyPostMatchSignals({
    body: '上海出发，求拼车同行',
    tags: ['#拼车', '#虹桥'],
    contentTypes: ['carpool'],
    location: '上海',
  });

  it('scores higher when content types and tags overlap', () => {
    const carpool = extractBuddyPostMatchSignals({
      body: '找拼车',
      tags: ['#拼车'],
      contentTypes: ['carpool'],
      location: '上海',
    });
    const team = extractBuddyPostMatchSignals({
      body: '找队友',
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
          body: '找队友',
          contentTypes: ['team'],
        }),
      },
      {
        id: 'carpool',
        ...extractBuddyPostMatchSignals({
          body: '拼车去现场',
          tags: ['#拼车', '#虹桥'],
          contentTypes: ['carpool'],
          location: '上海',
        }),
        createdAt: '2026-01-01',
      },
    ]);
    expect(best?.id).toBe('carpool');
  });
});
