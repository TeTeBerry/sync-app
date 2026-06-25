import type { RouterInfo } from '@tarojs/taro';
import { useNavigationStore } from '../../../stores';
import { parseSelectedDjList } from '@/domains/performance-itinerary';
import { resolveEventDetailIdFromQuery } from '../../../utils/route';

export type ExclusiveItineraryRouteSelection = {
  selectedDjIds: string[];
  selectedDjNames: string[];
  focusDjName: string;
};

export function readExclusiveItineraryRouteSelection(
  routerParams: RouterInfo['params'],
  activeActivityLegacyId: number | null | undefined,
): ExclusiveItineraryRouteSelection {
  const activityLegacyId = resolveEventDetailIdFromQuery(
    routerParams,
    activeActivityLegacyId,
  );
  const intent = useNavigationStore.getState().consumeExclusiveItineraryIntent();
  if (
    intent &&
    activityLegacyId != null &&
    !Number.isNaN(activityLegacyId) &&
    intent.activityLegacyId === activityLegacyId
  ) {
    return {
      selectedDjIds: intent.selectedDjIds,
      selectedDjNames:
        intent.selectedDjNames.length > 0
          ? intent.selectedDjNames
          : intent.selectedDjIds,
      focusDjName: intent.focusDjName?.trim() ?? '',
    };
  }

  const selectedDjIds = parseSelectedDjList(routerParams.selectedDjIds);
  const selectedDjNames = parseSelectedDjList(routerParams.selectedDjNames);

  return {
    selectedDjIds,
    selectedDjNames: selectedDjNames.length > 0 ? selectedDjNames : selectedDjIds,
    focusDjName: routerParams.focusDjName?.trim() ?? '',
  };
}
