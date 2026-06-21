/** 住宿预算/晚 */
export type TravelGuideBudgetTier = 'economy' | 'standard' | 'comfort';

export type AiGuidePlanFormValues = {
  departure: string;
  /** 选 POI 时高德返回的城市/区县，用于地理编码 region（非活动举办城市） */
  departureCity?: string;
  headcount: number;
  budgetTier: TravelGuideBudgetTier;
  selfDrive?: boolean;
  /** 住宿晚数，默认与活动天数一致 */
  accommodationNights: number;
};

export interface TravelGuideHotelItem {
  name: string;
  note: string;
  reason?: string;
  bookingHint?: string;
}

export interface TravelGuideAccommodationScheme {
  label: string;
  name: string;
  note: string;
  reason: string;
  bookingHint?: string;
}

export interface TravelGuideSpotItem {
  name: string;
  note: string;
  reason?: string;
}

export interface TravelGuideTicketChannel {
  name: string;
  note: string;
}

export interface TravelGuideVenueTransportOption {
  label: string;
  lines: string[];
}

export interface TravelGuideBudgetItem {
  label: string;
  range: string;
  note?: string;
}

export interface TravelGuidePlan {
  activityName: string;
  venue: string;
  eventDates: string;
  departure: string;
  headcount: number;
  budgetLabel: string;
  accommodationNights: number;
  selfDrive: boolean;
  transport: { title: string; lines: string[] };
  accommodation: {
    title: string;
    hotels: TravelGuideHotelItem[];
    schemes?: TravelGuideAccommodationScheme[];
  };
  parking?: { title: string; lines: string[] };
  nightlife: { title: string; spots: TravelGuideSpotItem[] };
  tips: { title: string; items: string[] };
  documents?: { title: string; items: string[] };
  tickets?: { title: string; channels: TravelGuideTicketChannel[] };
  essentials?: {
    title: string;
    network: string[];
    payment: string[];
    apps: string[];
  };
  venueTransport?: { title: string; options: TravelGuideVenueTransportOption[] };
  budget?: { title: string; items: TravelGuideBudgetItem[] };
  itinerary?: { title: string; days: Array<{ label: string; lines: string[] }> };
}

export interface GenerateTravelGuideResult {
  plan: TravelGuidePlan;
  guideId?: string;
}

export type TravelGuidePlanReadResult = {
  guideId: string;
  activityLegacyId: number;
  form: AiGuidePlanFormValues;
  plan: TravelGuidePlan;
  createdAt: string;
};

export type GenerateTravelGuidePayload = AiGuidePlanFormValues & {
  guideId?: string;
};

export type TravelGuideChatPayload = {
  guideId: string;
  plan: TravelGuidePlan;
  form: AiGuidePlanFormValues;
};

export function getTravelGuideBudgetOptions(t: (key: string) => string): Array<{
  id: TravelGuideBudgetTier;
  label: string;
  hint: string;
}> {
  return [
    {
      id: 'economy',
      label: t('travelPlan.budgetEconomy'),
      hint: t('travelPlan.budgetEconomyHint'),
    },
    {
      id: 'standard',
      label: t('travelPlan.budgetStandard'),
      hint: t('travelPlan.budgetStandardHint'),
    },
    {
      id: 'comfort',
      label: t('travelPlan.budgetComfort'),
      hint: t('travelPlan.budgetComfortHint'),
    },
  ];
}

export function travelGuideBudgetLabel(
  tier: TravelGuideBudgetTier,
  t: (key: string) => string,
): string {
  const opt = getTravelGuideBudgetOptions(t).find((o) => o.id === tier);
  return opt ? `${opt.label}(${opt.hint})` : tier;
}
