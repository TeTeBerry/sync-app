/**
 * Canonical: `sync-app-backend/src/shared/travel-plan/index.ts`
 * Do not duplicate shapes here — re-export only.
 */
export type {
  RecognizeTravelPlanReceiptPayload,
  RecognizeTravelPlanReceiptResult,
  SaveTravelPlanPayload,
  SaveTravelPlanResult,
  SavedTravelPlanNode,
  SavedTravelPlanResult,
  TravelPlanCategory,
  TravelPlanNode,
  TravelPlanNodePayload,
  TravelPlanNodeRecord,
  TravelPlanNodeSource,
  TravelPlanReceiptCategory,
  TravelPlanReceiptRecognizeForm,
} from '@sync/travel-plan-contracts';

export {
  TRAVEL_PLAN_RECEIPT_CATEGORIES,
  applyActivityNodeOverrides,
  filterUserTravelPlanNodes,
  isActivityTravelPlanNodeId,
  mergeTravelPlanNodes,
  normalizeHiddenActivityNodeIds,
  sortTravelPlanNodes,
} from '@sync/travel-plan-contracts';
