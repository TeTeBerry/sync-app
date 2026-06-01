/** 住宿预算/晚 */
export type TravelGuideBudgetTier = 'economy' | 'standard' | 'comfort';

export type AiGuidePlanFormValues = {
  departure: string;
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

export interface TravelGuideSpotItem {
  name: string;
  note: string;
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
  accommodation: { title: string; hotels: TravelGuideHotelItem[] };
  parking?: { title: string; lines: string[] };
  nightlife: { title: string; spots: TravelGuideSpotItem[] };
  tips: { title: string; items: string[] };
}

export interface GenerateTravelGuideResult {
  plan: TravelGuidePlan;
}

export type TravelGuideChatPayload = {
  imagePath: string;
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
