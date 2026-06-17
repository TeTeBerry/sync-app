import { isLiveApi } from '../../constants/api';
import { isLoggedIn } from '../../utils/authStorage';
import { fetchFestivalPlanProgress } from '../../api/sync/festivalPlanProgress';
import { useApiQuery } from '../useApiQuery';

export function useFestivalPlanProgressQuery(
  activityLegacyId: number | null | undefined,
) {
  const enabled =
    isLiveApi() &&
    isLoggedIn() &&
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  return useApiQuery({
    queryKey: ['festival-plan', 'progress', activityLegacyId ?? undefined],
    queryFn: () => fetchFestivalPlanProgress(activityLegacyId!),
    enabled,
    staleTime: 30_000,
  });
}
