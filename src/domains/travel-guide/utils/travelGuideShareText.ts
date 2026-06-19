import { TRAVEL_GUIDE_TITLE } from '@/constants/aiCtaLabels';
import { AI_TRAVEL_GUIDE_DISCLAIMER } from '@/constants/aiDisclosure';
import type { TravelGuidePlan } from '@/types/travelGuide';

export function buildTravelGuideShareText(plan: TravelGuidePlan): string {
  const lines: string[] = [
    `【${plan.activityName}】${TRAVEL_GUIDE_TITLE}`,
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
    const featured = new Set(schemes.map((s) => s.name));
    for (const hotel of plan.accommodation.hotels.filter(
      (h) => !featured.has(h.name),
    )) {
      lines.push(`  · 备选：${hotel.name}`);
      if (hotel.reason) lines.push(`    ${hotel.reason}`);
    }
  } else {
    lines.push(`▸ ${plan.accommodation.title}`);
    for (const hotel of plan.accommodation.hotels.slice(0, 6)) {
      lines.push(`  · ${hotel.name}：${hotel.note}`);
      if (hotel.reason) lines.push(`    ${hotel.reason}`);
    }
  }
  lines.push('');

  if (plan.nightlife.spots.length) {
    lines.push(`▸ ${plan.nightlife.title}`);
    for (const spot of plan.nightlife.spots.slice(0, 6)) {
      lines.push(`  · ${spot.name}：${spot.note}`);
      if (spot.reason) lines.push(`    ${spot.reason}`);
    }
    lines.push('');
  }

  if (plan.budget?.items.length) {
    lines.push(`▸ ${plan.budget.title}`);
    for (const item of plan.budget.items) {
      lines.push(`  · ${item.label} ${item.range}`);
    }
    lines.push('');
  }

  lines.push(`— Sync · ${TRAVEL_GUIDE_TITLE}`);
  lines.push('');
  lines.push(AI_TRAVEL_GUIDE_DISCLAIMER);
  return lines.join('\n');
}
