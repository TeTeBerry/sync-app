import { getTravelGuideTitle } from '@/constants/aiCtaLabels';
import { getAiTravelGuideDisclaimer } from '@/constants/aiDisclosure';
import { t } from '@/i18n';
import type { TravelGuidePlan } from '@/types/travelGuide';
import { formatTravelGuideDepartureLabel } from '@/utils/travelGuideDepartureSuggestions';

export function buildTravelGuideShareText(plan: TravelGuidePlan): string {
  const tripMeta = [
    plan.departure
      ? t('travelGuide.departureChip', {
          departure: formatTravelGuideDepartureLabel(plan.departure),
        })
      : null,
    plan.headcount > 0
      ? t('travelGuide.headcountChip', { count: plan.headcount })
      : null,
    plan.accommodationNights > 0
      ? t('travelGuide.stayNightsChip', { count: plan.accommodationNights })
      : null,
    plan.accommodationNights > 0 && plan.budgetLabel ? plan.budgetLabel : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const lines: string[] = [
    `【${plan.activityName}】${getTravelGuideTitle()}`,
    `📅 ${plan.eventDates}`,
    `📍 ${plan.venue}`,
    `🚩 ${tripMeta}`,
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
  const hasAccommodation =
    Boolean(schemes?.length) || plan.accommodation.hotels.length > 0;
  if (hasAccommodation) {
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
        lines.push(`  · ${t('travelGuide.shareAlternateHotel', { name: hotel.name })}`);
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
  }

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

  const disclaimer = getAiTravelGuideDisclaimer();
  lines.push(`— Sync · ${getTravelGuideTitle()}`);
  lines.push('');
  lines.push(disclaimer);
  return lines.join('\n');
}
