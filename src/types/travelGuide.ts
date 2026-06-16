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
}

export interface GenerateTravelGuideResult {
  plan: TravelGuidePlan;
}

export type TravelGuideChatPayload = {
  guideId: string;
  plan: TravelGuidePlan;
  form: AiGuidePlanFormValues;
};

export const TRAVEL_GUIDE_BUDGET_OPTIONS: Array<{
  id: TravelGuideBudgetTier;
  label: string;
  hint: string;
}> = [
  { id: 'economy', label: '经济', hint: '¥150-300' },
  { id: 'standard', label: '舒适', hint: '¥300-600' },
  { id: 'comfort', label: '豪华', hint: '¥600+' },
];

export function travelGuideBudgetLabel(tier: TravelGuideBudgetTier): string {
  const opt = TRAVEL_GUIDE_BUDGET_OPTIONS.find((o) => o.id === tier);
  return opt ? `${opt.label}(${opt.hint})` : tier;
}
