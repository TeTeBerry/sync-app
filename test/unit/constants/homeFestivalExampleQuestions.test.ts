import { describe, expect, it } from 'vitest';
import { buildHomeFestivalExampleQuestions } from '@/constants/homeFestivalExampleQuestions';
import type { BackendActivity } from '@/types/backend';
import { t } from '@/i18n';

function activity(
  partial: Pick<BackendActivity, 'code' | 'date' | 'name'>,
): BackendActivity {
  return {
    _id: partial.code,
    legacyId: 1,
    code: partial.code,
    name: partial.name,
    date: partial.date,
  };
}

describe('buildHomeFestivalExampleQuestions', () => {
  it('returns tomorrowland, edc, and near examples when festivals are active', () => {
    const questions = buildHomeFestivalExampleQuestions(
      undefined,
      new Date(2026, 5, 15, 12, 0, 0, 0),
    );

    expect(questions.map((item) => item.key)).toEqual([
      'tomorrowland-when',
      'edc-lineup',
      'near',
    ]);
    expect(questions[0]?.label).toBe(t('home.exampleTomorrowlandWhen'));
  });

  it('hides tomorrowland example when festival has ended', () => {
    const questions = buildHomeFestivalExampleQuestions(
      undefined,
      new Date(2026, 11, 20, 12, 0, 0, 0),
    );

    expect(questions.map((item) => item.key)).toEqual(['edc-lineup', 'near']);
  });

  it('uses catalog dates when filtering ended festivals', () => {
    const questions = buildHomeFestivalExampleQuestions(
      [
        activity({
          code: 'tomorrowland',
          name: 'Tomorrowland Thailand 2026',
          date: '12/11-13',
        }),
      ],
      new Date(2026, 11, 20, 12, 0, 0, 0),
    );

    expect(questions.map((item) => item.key)).not.toContain('tomorrowland-when');
    expect(questions.map((item) => item.key)).toContain('near');
  });
});
