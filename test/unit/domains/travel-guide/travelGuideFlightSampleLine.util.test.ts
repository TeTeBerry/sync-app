import { describe, expect, it } from 'vitest';
import {
  filterTransportLinesForFlightOffers,
  isTravelGuideFlightSampleLine,
} from '@/domains/travel-guide/utils/travelGuideFlightSampleLine.util';

describe('travelGuideFlightSampleLine.util', () => {
  it('detects RollingGo round-trip sample lines', () => {
    expect(
      isTravelGuideFlightSampleLine(
        '去程 KMG 23:30→HND 22:50（1次中转） · 返程 HND 02:00→KMG 22:10（1次中转） · 约 ¥3342/人',
      ),
    ).toBe(true);
  });

  it('filters sample lines when flight offers are shown', () => {
    const lines = [
      '建议从昆明搭乘国际航班飞往东京',
      '去程 KMG 23:30→HND 22:50（1次中转） · 返程 HND 02:00→KMG 22:10（1次中转） · 约 ¥3342/人',
    ];
    expect(
      filterTransportLinesForFlightOffers(lines, [{ pricePerAdult: 3342 }]),
    ).toEqual(['建议从昆明搭乘国际航班飞往东京']);
  });
});
