import type {
  TravelPlanCategory,
  TravelPlanNode as ContractTravelPlanNode,
  TravelPlanNodeSource,
} from '@/types/travelPlan';

export type { TravelPlanCategory, TravelPlanNodeSource };

/** UI node: contract fields plus required source and display label. */
export type TravelPlanNode = ContractTravelPlanNode & {
  source: TravelPlanNodeSource;
  timeLabel: string;
};

export type TravelPlanStats = {
  nodeCount: number;
  estimatedCost: number;
  splitCount: number;
  splitEligibleCost: number;
  estimatedPerPerson: number | null;
};
