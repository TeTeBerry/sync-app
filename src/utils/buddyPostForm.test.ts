import { describe, expect, it } from 'vitest';
import {
  buildBuddyPostBody,
  buildBuddyPostUserSummary,
  buddyPostContentTypes,
  buddyPostHashTags,
  defaultBuddyPostForm,
} from './buddyPostForm';

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

  it('buildBuddyPostBody includes time, location, headcount, tags, note', () => {
    const body = buildBuddyPostBody(sampleForm, '风暴电音节');
    expect(body).toContain('6月13日-14日');
    expect(body).toContain('地点：上海');
    expect(body).toContain('人数：2人');
    expect(body).toContain('#组队');
    expect(body).toContain('#拼房');
    expect(body).toContain('备注：女生优先');
  });

  it('maps tags to hashTags and contentTypes', () => {
    expect(buddyPostHashTags(['team', 'carpool'])).toEqual(['#组队', '#拼车']);
    expect(buddyPostContentTypes(['team', 'accommodation'])).toEqual([
      'team',
      'accommodation',
    ]);
    expect(buddyPostContentTypes([])).toEqual(['team']);
  });

  it('buildBuddyPostUserSummary for chat bubble', () => {
    const summary = buildBuddyPostUserSummary(sampleForm, '风暴电音节');
    expect(summary).toContain('风暴电音节');
    expect(summary).toContain('上海');
    expect(summary).toContain('2人');
  });
});
