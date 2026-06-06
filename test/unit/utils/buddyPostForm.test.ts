import { describe, expect, it } from 'vitest';
import {
  buildBuddyPostBody,
  buildBuddyPostUserSummary,
  buddyPostContentTypes,
  buddyPostHashTags,
  defaultBuddyPostForm,
} from '@/utils/buddyPostForm';

const sampleForm = {
  dateStart: '2026-06-13',
  dateEnd: '2026-06-14',
  location: '上海',
  headcount: '2人',
  tags: ['team', 'accommodation'] as const,
  note: '女生优先',
};

describe('buddyPostForm', () => {
  it('defaultBuddyPostForm uses activity date range', () => {
    const form = defaultBuddyPostForm('06/13-14/2026');
    expect(form?.dateStart).toBe('2026-06-13');
    expect(form?.dateEnd).toBe('2026-06-14');
    expect(form?.tags).toEqual(['team']);
  });

  it('buildBuddyPostBody uses intent, short date, location, headcount, note', () => {
    const body = buildBuddyPostBody(sampleForm);
    expect(body).toBe('找组队、找拼房，6.13-6.14，上海，2人，女生优先');
  });

  it('buildBuddyPostBody single team tag', () => {
    const body = buildBuddyPostBody({
      ...sampleForm,
      tags: ['team'],
      headcount: '1',
      note: undefined,
    });
    expect(body).toBe('找组队，6.13-6.14，上海，1人');
  });

  it('maps tags to hashTags and contentTypes', () => {
    expect(buddyPostHashTags(['team', 'carpool'])).toEqual(['#组队', '#同路']);
    expect(buddyPostContentTypes(['team', 'accommodation'])).toEqual([
      'team',
      'accommodation',
    ]);
    expect(buddyPostContentTypes([])).toEqual(['team']);
  });

  it('buildBuddyPostUserSummary for chat bubble', () => {
    const summary = buildBuddyPostUserSummary(sampleForm, '风暴电音节');
    expect(summary).toBe(
      '发布「风暴电音节」组队帖 · 找组队、找拼房，6.13-6.14，上海，2人，女生优先',
    );
  });
});
