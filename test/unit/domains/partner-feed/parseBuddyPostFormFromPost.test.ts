import { describe, expect, it } from 'vitest';
import {
  parseBuddyPostDateShort,
  parseBuddyPostFormFromPost,
} from '@/domains/partner-feed/utils/parseBuddyPostFormFromPost';

describe('parseBuddyPostDateShort', () => {
  it('parses single-day and range formats', () => {
    expect(parseBuddyPostDateShort('6.13', 2026)).toEqual({
      dateStart: '2026-06-13',
      dateEnd: '2026-06-13',
    });
    expect(parseBuddyPostDateShort('6.13-14', 2026)).toEqual({
      dateStart: '2026-06-13',
      dateEnd: '2026-06-14',
    });
    expect(parseBuddyPostDateShort('6.13-7.14', 2026)).toEqual({
      dateStart: '2026-06-13',
      dateEnd: '2026-07-14',
    });
  });
});

describe('parseBuddyPostFormFromPost', () => {
  it('maps structured buddy post back to form values', () => {
    const form = parseBuddyPostFormFromPost(
      {
        body: '组队，6.13-6.14，上海，2人，女生优先\n\n#组队',
        location: '上海',
        tags: ['#组队'],
        slotsTotal: 2,
      },
      '06/13-14/2026',
    );

    expect(form).toEqual({
      dateStart: '2026-06-13',
      dateEnd: '2026-06-14',
      location: '上海',
      headcount: '2人',
      tags: ['team'],
      recruitUnityTags: [],
      note: '女生优先',
    });
  });

  it('restores recruit unity tags from post metadata', () => {
    const form = parseBuddyPostFormFromPost(
      {
        body: '组队，6.13-6.14，上海，2人',
        location: '上海',
        tags: ['#组队'],
        recruitUnityTags: ['welcome_newbie', 'women_friendly'],
      },
      '06/13-14/2026',
    );

    expect(form?.recruitUnityTags).toEqual(['welcome_newbie', 'women_friendly']);
  });

  it('falls back to slots fields when headcount segment is missing', () => {
    const form = parseBuddyPostFormFromPost(
      {
        body: '组队，6.13，上海',
        location: '上海',
        tags: ['#组队'],
        slotsFilled: 1,
        slotsTotal: 3,
      },
      '06/13-14/2026',
    );

    expect(form?.headcount).toBe('1/3');
  });

  it('strips trailing 出发 when loading location for edit', () => {
    const form = parseBuddyPostFormFromPost(
      {
        body: '组队，10.17-10.18，南京雨花口腔医院出发，2人',
        location: '南京雨花口腔医院出发',
        tags: ['#组队'],
        slotsTotal: 2,
      },
      '10/17-18/2026',
    );

    expect(form?.location).toBe('南京雨花口腔医院');
  });
});
