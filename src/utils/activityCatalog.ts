import { resolveCatalogActivityImage } from '../constants/activityCatalogImages';
import type { BackendActivity, HomeSummary } from '../types/backend';

export function withCatalogActivityImage(activity: BackendActivity): BackendActivity {
  return {
    ...activity,
    image: resolveCatalogActivityImage(activity.legacyId, activity.image),
  };
}

export function withCatalogActivities(
  activities: BackendActivity[],
): BackendActivity[] {
  return activities.map(withCatalogActivityImage);
}

export function withCatalogHomeSummary(summary: HomeSummary): HomeSummary {
  if (!summary.signupEvents?.length) {
    return summary;
  }
  return {
    ...summary,
    signupEvents: summary.signupEvents.map((event) => ({
      ...event,
      image: resolveCatalogActivityImage(event.id, event.image),
    })),
  };
}
