import { describe, expect, it } from 'vitest';
import type { TravelGuidePlan } from '@/types/travelGuide';
import { measureTravelGuideWallpaperHeight } from '@/components/ai-chat/travelGuideWallpaper/travelGuideWallpaperDraw';

function longPlan(): TravelGuidePlan {
  const longLine =
    '这是一段很长的交通说明，需要换行多次才能完整展示，包含地铁、高铁、打车等多种接驳方式与时间节点。'.repeat(
      4,
    );
  return {
    activityName: '风暴电音节 深圳站',
    venue: '深圳国际会展中心 17 号馆',
    eventDates: '06/13-14',
    departure: '上海',
    headcount: 2,
    budgetLabel: '舒适 ¥300-600/晚',
    accommodationNights: 2,
    selfDrive: false,
    transport: { title: '交通方案', lines: [longLine, longLine] },
    accommodation: {
      title: '住宿推荐',
      hotels: Array.from({ length: 4 }, (_, i) => ({
        name: `酒店${i + 1}`,
        note: '约 ¥300-450/晚 · 距会场 800m · 评分 4.0 · 2 晚 · 双床',
        bookingHint: '高德地图 / 携程',
      })),
    },
    nightlife: {
      title: '散场 夜宵',
      spots: Array.from({ length: 4 }, (_, i) => ({
        name: `夜宵店${i + 1}`,
        note: '距会场约 500m · 评分 4.0 · 适合散场后前往 · 详细地址说明'.repeat(2),
      })),
    },
    tips: {
      title: '小贴士',
      items: ['建议提前购票', '注意防晒与补水', '散场后结伴出行'],
    },
  };
}

describe('travelGuideWallpaperDraw', () => {
  it('measures height above naive line-count estimate for wrapped content', () => {
    const plan = longPlan();
    const naive =
      80 +
      plan.transport.lines.length * 36 +
      plan.accommodation.hotels.length * 72 +
      plan.nightlife.spots.length * 72;
    const measured = measureTravelGuideWallpaperHeight(plan);
    expect(measured).toBeGreaterThan(naive);
    expect(measured).toBeGreaterThanOrEqual(2000);
  });
});
