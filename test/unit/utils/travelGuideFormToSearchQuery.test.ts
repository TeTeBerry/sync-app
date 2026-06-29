import { beforeEach, describe, expect, it } from 'vitest';
import { travelGuideFormToSearchQuery } from '@/utils/travelGuideToBuddyPost';
import { useLocaleStore } from '@/i18n/localeStore';

const mockT = (key: string, params?: Record<string, string | number>) => {
  const table: Record<string, string> = {
    'travelPlan.budgetEconomy': '经济',
    'travelPlan.budgetEconomyHint': '青旅/民宿',
    'travelPlan.budgetStandard': '标准',
    'travelPlan.budgetStandardHint': '三星',
    'travelPlan.budgetComfort': '舒适',
    'travelPlan.budgetComfortHint': '四星',
    'travelGuide.departureSuffix': '出发',
    'travelGuide.searchSlotsNeeded': `差 ${params?.count ?? ''} 人`,
    'common.listSeparator': '，',
  };
  return table[key] ?? key;
};

describe('travelGuideFormToSearchQuery', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'zh-CN' });
  });

  it('builds departure, date and slots-needed query from guide form', () => {
    expect(
      travelGuideFormToSearchQuery(
        {
          departure: '上海',
          headcount: 2,
          budgetTier: 'standard',
          accommodationNights: 2,
        },
        '06/13-14/2026',
        mockT,
      ),
    ).toBe('上海出发，6.13-6.14，差 1 人，标准(三星)');
  });

  it('uses departureCity when departure is empty', () => {
    expect(
      travelGuideFormToSearchQuery(
        {
          departure: '',
          departureCity: '杭州',
          headcount: 1,
          budgetTier: 'economy',
          accommodationNights: 1,
        },
        '06/13-14/2026',
      ),
    ).toBe('杭州出发，6.13-6.14，差 1 人，经济(¥150-300)');
  });

  it('keeps departure text when it already ends with 出发', () => {
    expect(
      travelGuideFormToSearchQuery(
        {
          departure: '上海出发',
          headcount: 3,
          budgetTier: 'comfort',
          accommodationNights: 2,
        },
        '06/13-14/2026',
      ),
    ).toBe('上海出发，6.13-6.14，差 2 人，豪华(¥600+)');
  });
});
