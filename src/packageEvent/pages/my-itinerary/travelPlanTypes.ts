export type TravelPlanCategory = 'flight' | 'transport' | 'hotel' | 'dining' | 'event';

export type TravelPlanNodeSource = 'activity' | 'user';

export type TravelPlanNode = {
  id: string;
  source: TravelPlanNodeSource;
  category: TravelPlanCategory;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  timeLabel: string;
  duration?: string;
  title: string;
  subtitle: string;
  detail?: string;
  price?: number;
  confirmed: boolean;
};

export type TravelPlanStats = {
  nodeCount: number;
  estimatedCost: number;
  confirmedCount: number;
};
