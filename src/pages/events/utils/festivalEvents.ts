import { ACTIVITY_TYPE_LABELS } from '../../../constants/activityType';
import type { EventCardUi } from '../../../utils/apiMappers';
import {
  compareActivitiesNearestFirst,
  compareActivityDateAsc,
} from '../../../utils/activityStatus';

export function isFestivalEvent(event: Pick<EventCardUi, 'category'>): boolean {
  return event.category === ACTIVITY_TYPE_LABELS.festival;
}

/** All outdoor festivals (电音节), earliest start date first. */
export function sortFestivalEventsByDate(events: EventCardUi[]): EventCardUi[] {
  return [...events].filter(isFestivalEvent).sort(compareActivityDateAsc);
}

/** All catalog activities: upcoming/ongoing first, ended after (recent past first). */
export function sortAllEventsByDate(events: EventCardUi[]): EventCardUi[] {
  return [...events].sort(compareActivitiesNearestFirst);
}
