/**
 * Canonical: `@sync/travel-plan-contracts` (workspace package)
 * Do not duplicate shapes here — re-export only.
 */
export type {
  RecognizeTravelPlanReceiptPayload,
  RecognizeTravelPlanReceiptResult,
  SaveTravelPlanPayload,
  SaveTravelPlanResult,
  SavedTravelPlanNode,
  SavedTravelPlanResult,
  TravelPlanBillLineItem,
  TravelPlanCategory,
  TravelPlanNode,
  TravelPlanNodePayload,
  TravelPlanNodeRecord,
  TravelPlanNodeSource,
  TravelPlanReceiptCategory,
  TravelPlanReceiptRecognizeForm,
  TravelPlanReceiptRecognizeJobResult,
  TravelPlanReceiptRecognizeJobStatus,
} from '@sync/travel-plan-contracts';

export {
  applyActivityNodeOverrides,
  mergeTravelPlanNodes,
  normalizeHiddenActivityNodeIds,
  sortTravelPlanNodes,
} from '@sync/travel-plan-contracts';
