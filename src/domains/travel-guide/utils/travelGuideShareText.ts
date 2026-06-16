import type { TravelGuidePlan } from '@/types/travelGuide';

export function buildTravelGuideShareText(plan: TravelGuidePlan): string {
  const lines: string[] = [
    `【${plan.activityName}】AI 出行攻略`,
    `📅 ${plan.eventDates}`,
    `📍 ${plan.venue}`,
    `🚩 ${plan.departure}出发 · ${plan.headcount}人 · 住${plan.accommodationNights}晚 · ${plan.budgetLabel}`,
    '',
  ];

  if (plan.documents?.items.length) {
    lines.push(`▸ ${plan.documents.title}`);
    for (const item of plan.documents.items.slice(0, 4)) {
      lines.push(`  · ${item}`);
    }
    lines.push('');
  }

  if (plan.tickets?.channels.length) {
    lines.push(`▸ ${plan.tickets.title}`);
    for (const ch of plan.tickets.channels.slice(0, 3)) {
      lines.push(`  · ${ch.name}：${ch.note}`);
    }
    lines.push('');
  }

  lines.push(`▸ ${plan.transport.title}`);
  for (const line of plan.transport.lines.slice(0, 3)) {
    lines.push(`  · ${line}`);
  }
  lines.push('');

  const schemes = plan.accommodation.schemes;
  if (schemes?.length) {
    lines.push(`▸ ${plan.accommodation.title}`);
    for (const scheme of schemes) {
      lines.push(`  · ${scheme.label}：${scheme.name}`);
      lines.push(`    ${scheme.reason}`);
    }
  } else {
    lines.push(`▸ ${plan.accommodation.title}`);
    for (const hotel of plan.accommodation.hotels.slice(0, 2)) {
      lines.push(`  · ${hotel.name}：${hotel.note}`);
    }
  }
  lines.push('');

  if (plan.budget?.items.length) {
    lines.push(`▸ ${plan.budget.title}`);
    for (const item of plan.budget.items) {
      lines.push(`  · ${item.label} ${item.range}`);
    }
    lines.push('');
  }

  lines.push('— Sync · AI 出行攻略');
  return lines.join('\n');
}
