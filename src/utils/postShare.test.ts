import { describe, expect, it } from 'vitest';
import { buildPostSharePagePath, buildPostShareTitle } from './postShare';

describe('buildPostShareTitle', () => {
  it('prefers body snippet', () => {
    expect(
      buildPostShareTitle({
        body: '求组队 #组队',
        eventTitle: '演唱会',
        authorName: '小明',
      }),
    ).toBe('求组队');
  });

  it('falls back to event title', () => {
    expect(
      buildPostShareTitle({
        body: '   ',
        eventTitle: '草莓音乐节',
      }),
    ).toBe('草莓音乐节 · 组队帖');
  });
});

describe('buildPostSharePagePath', () => {
  it('links to event detail with post highlight', () => {
    expect(buildPostSharePagePath({ postId: 'abc', activityLegacyId: 42 })).toBe(
      '/packageEvent/pages/event-detail/index?id=42&activityLegacyId=42&postId=abc',
    );
  });

  it('links to home when activity id is missing', () => {
    expect(buildPostSharePagePath({ postId: 'abc' })).toBe('/pages/index/index');
  });
});
