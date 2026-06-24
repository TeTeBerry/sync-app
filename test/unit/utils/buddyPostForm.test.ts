import { describe, expect, it } from 'vitest';
import type { AiBuddyPostFormValues } from '@/types/buddyPost';
import {
  buildBuddyPostBody,
  buildBuddyPostUserSummary,
  buildRecruitFieldsFromBuddyForm,
  buddyPostHashTags,
  defaultBuddyPostForm,
  defaultBuddyPostFormWithTag,
} from '@/utils/buddyPostForm';

const sampleForm: AiBuddyPostFormValues = {
  dateStart: '2026-06-13',
  dateEnd: '2026-06-14',
  location: '上海',
  headcount: '2人',
  tags: ['team'],
  note: '女生优先',
};

describe('buddyPostForm', () => {
  it('defaultBuddyPostForm uses activity date range', () => {
    const form = defaultBuddyPostForm('06/13-14/2026');
    expect(form?.dateStart).toBe('2026-06-13');
    expect(form?.dateEnd).toBe('2026-06-14');
    expect(form?.tags).toEqual(['team']);
  });

  it('defaultBuddyPostFormWithTag always uses team tag', () => {
    const form = defaultBuddyPostFormWithTag('team', '06/13-14/2026');
    expect(form?.tags).toEqual(['team']);
    expect(form?.dateStart).toBe('2026-06-13');
  });

  it('buildBuddyPostBody uses intent, short date, location, headcount, note', () => {
    const body = buildBuddyPostBody(sampleForm);
    expect(body).toBe('组队，6.13-6.14，上海出发，2人，女生优先');
  });

  it('buildBuddyPostBody single team tag', () => {
    const body = buildBuddyPostBody({
      ...sampleForm,
      headcount: '1',
      note: undefined,
    });
    expect(body).toBe('组队，6.13-6.14，上海出发，1人');
  });

  it('buildBuddyPostBody keeps location when it already ends with 出发', () => {
    const body = buildBuddyPostBody({
      ...sampleForm,
      location: '上海出发',
    });
    expect(body).toBe('组队，6.13-6.14，上海出发，2人，女生优先');
  });

  it('maps tags to hashTags', () => {
    expect(buddyPostHashTags(['team'])).toEqual(['#组队']);
    expect(buddyPostHashTags([])).toEqual([]);
  });

  it('buildBuddyPostUserSummary for chat bubble', () => {
    const summary = buildBuddyPostUserSummary(sampleForm, '风暴电音节');
    expect(summary).toBe(
      '发布「风暴电音节」组队帖 · 组队，6.13-6.14，上海出发，2人，女生优先',
    );
  });

  it('buildRecruitFieldsFromBuddyForm maps headcount to slots', () => {
    expect(buildRecruitFieldsFromBuddyForm(sampleForm)).toEqual({
      recruitStatus: 'open',
      slotsTotal: 2,
    });
    expect(
      buildRecruitFieldsFromBuddyForm({
        ...sampleForm,
        headcount: '1/3',
      }),
    ).toEqual({
      recruitStatus: 'open',
      slotsFilled: 1,
      slotsTotal: 3,
    });
  });
});
