import { describe, expect, it } from 'vitest';
import type { AiBuddyPostFormValues } from '@/types/buddyPost';
import {
  buildBuddyPostBody,
  buildBuddyPostUserSummary,
  buddyPostContentTypes,
  buddyPostHashTags,
  defaultBuddyPostForm,
  defaultBuddyPostFormWithTag,
} from '@/utils/buddyPostForm';

const sampleForm: AiBuddyPostFormValues = {
  dateStart: '2026-06-13',
  dateEnd: '2026-06-14',
  location: '上海',
  headcount: '2人',
  contact: 'wx_sync_team',
  tags: ['team', 'accommodation'],
  note: '女生优先',
};

describe('buddyPostForm', () => {
  it('defaultBuddyPostForm uses activity date range', () => {
    const form = defaultBuddyPostForm('06/13-14/2026');
    expect(form?.dateStart).toBe('2026-06-13');
    expect(form?.dateEnd).toBe('2026-06-14');
    expect(form?.tags).toEqual(['team']);
  });

  it('defaultBuddyPostFormWithTag preselects buddy tag', () => {
    const form = defaultBuddyPostFormWithTag('accommodation', '06/13-14/2026');
    expect(form?.tags).toEqual(['accommodation']);
    expect(form?.dateStart).toBe('2026-06-13');
  });

  it('buildBuddyPostBody uses intent, short date, location, headcount, contact, note', () => {
    const body = buildBuddyPostBody(sampleForm);
    expect(body).toBe(
      '组队、拼房，6.13-6.14，上海，2人，联系方式：wx_sync_team，女生优先',
    );
  });

  it('buildBuddyPostBody single team tag', () => {
    const body = buildBuddyPostBody({
      ...sampleForm,
      tags: ['team'],
      headcount: '1',
      contact: '13800138000',
      note: undefined,
    });
    expect(body).toBe('组队，6.13-6.14，上海，1人，联系方式：13800138000');
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
      '发布「风暴电音节」组队帖 · 组队、拼房，6.13-6.14，上海，2人，联系方式：wx_sync_team，女生优先',
    );
  });
});
