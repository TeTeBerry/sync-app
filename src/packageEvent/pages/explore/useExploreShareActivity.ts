import { useMemo } from 'react';
import { useCurrentUserQuery, useFeaturedEvents } from '../../../hooks/useSyncApi';
import { useProfileActivityLegacyId } from '../../../hooks/useProfileActivityLegacyId';
import {
  EXPLORE_DEFAULT_ACTIVITY_LEGACY_ID,
  EXPLORE_DEFAULT_EVENT_TITLE,
  EXPLORE_DEFAULT_LOCATION,
} from '../../../constants/exploreShare';
import { parseActivityLegacyId } from '../../../utils/activityLegacyId';

export function useExploreShareActivity() {
  const profileActivityLegacyId = useProfileActivityLegacyId();
  const { data: currentUser } = useCurrentUserQuery();
  const { items: featuredEvents } = useFeaturedEvents();

  return useMemo(() => {
    const activityLegacyId =
      profileActivityLegacyId ?? EXPLORE_DEFAULT_ACTIVITY_LEGACY_ID;
    const featured = featuredEvents.find(
      (event) => parseActivityLegacyId(event.id) === activityLegacyId,
    );

    return {
      activityLegacyId,
      eventTitle: featured?.title?.trim() || EXPLORE_DEFAULT_EVENT_TITLE,
      location:
        currentUser?.location?.trim() ||
        featured?.venue?.trim() ||
        EXPLORE_DEFAULT_LOCATION,
    };
  }, [currentUser?.location, featuredEvents, profileActivityLegacyId]);
}
