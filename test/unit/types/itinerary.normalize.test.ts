import { describe, expect, it } from 'vitest';
import type { ItineraryDay } from '@/types/backend';
import { normalizeItineraryDaysForSave } from '@/types/itinerary';

describe('normalizeItineraryDaysForSave', () => {
  it('normalizes clock time and coerces dot colors', () => {
    const days = normalizeItineraryDaysForSave([
      {
        id: 'jun13',
        label: '6月13日',
        bannerDateLabel: '6月13日',
        nodeCount: 1,
        items: [
          {
            id: 'a',
            time: '20:30-22:00',
            dotColor: 'invalid' as 'pink',
            title: '  MARSHMELLO  ',
            timeTag: ' 20:30-22:00 ',
            timeTagColor: 'invalid' as 'pink',
          },
        ],
      },
    ]);

    expect(days[0].items[0]).toMatchObject({
      time: '20:30',
      dotColor: 'pink',
      timeTag: '20:30-22:00',
      timeTagColor: 'pink',
      title: 'MARSHMELLO',
    });
  });

  it('normalizes pill variant and trims field lengths', () => {
    const long = 'x'.repeat(300);
    const days = normalizeItineraryDaysForSave([
      {
        id: '',
        label: '',
        items: [
          {
            id: ` ${'id'.repeat(40)} `,
            time: '21:00',
            dotColor: 'cyan',
            title: long,
            subtitle: long,
            pill: { label: '  重点  ', variant: 'invalid' as 'green' },
          },
        ],
      } as ItineraryDay,
    ]);

    expect(days[0].id).toBe('day-0');
    expect(days[0].label).toBe('day-0');
    expect(days[0].bannerDateLabel).toBe('day-0');
    expect(days[0].nodeCount).toBe(1);
    expect(days[0].items[0].id.length).toBeLessThanOrEqual(64);
    expect(days[0].items[0].title.length).toBeLessThanOrEqual(200);
    expect(days[0].items[0].subtitle?.length).toBeLessThanOrEqual(500);
    expect(days[0].items[0].pill).toEqual({ label: '重点', variant: 'green' });
  });

  it('preserves purple dot and omits empty optional fields', () => {
    const input: ItineraryDay[] = [
      {
        id: 'jun14',
        label: '6月14日',
        bannerDateLabel: '6月14日',
        nodeCount: 1,
        items: [
          {
            id: 'perf',
            time: '20:30',
            dotColor: 'purple',
            title: 'ILLENIUM',
          },
        ],
      },
    ];

    const days = normalizeItineraryDaysForSave(input);
    expect(days[0].items[0].dotColor).toBe('purple');
    expect(days[0].items[0]).not.toHaveProperty('subtitle');
    expect(days[0].items[0]).not.toHaveProperty('pill');
  });
});
