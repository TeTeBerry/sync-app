import type { AiBuddyPostFormValues, BuddyPostTagId } from '@/types/buddyPost';
import type { EventDetailPost } from '@/types/backend';
import { BUDDY_POST_TAG_OPTIONS } from '@/types/buddyPost';
import { boundsToIsoDate, parseActivityDateBounds } from '@/utils/activityDateBounds';
import { defaultBuddyPostForm } from '@/utils/buddyPostForm';
import { stripPostBodyContact } from '@/utils/postBodyContact';

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** Reverse `formatBuddyPostDateShort` using activity year when available. */
export function parseBuddyPostDateShort(
  short: string,
  yearHint?: number,
): { dateStart: string; dateEnd: string } | null {
  const trimmed = short.trim();
  if (!trimmed) return null;

  const year = yearHint ?? new Date().getFullYear();
  const crossMonth = trimmed.match(/^(\d+)\.(\d+)-(\d+)\.(\d+)$/);
  if (crossMonth) {
    const monthStart = Number(crossMonth[1]);
    const dayStart = Number(crossMonth[2]);
    const monthEnd = Number(crossMonth[3]);
    const dayEnd = Number(crossMonth[4]);
    return {
      dateStart: `${year}-${pad2(monthStart)}-${pad2(dayStart)}`,
      dateEnd: `${year}-${pad2(monthEnd)}-${pad2(dayEnd)}`,
    };
  }

  const sameMonth = trimmed.match(/^(\d+)\.(\d+)-(\d+)$/);
  if (sameMonth) {
    const month = Number(sameMonth[1]);
    const dayStart = Number(sameMonth[2]);
    const dayEnd = Number(sameMonth[3]);
    return {
      dateStart: `${year}-${pad2(month)}-${pad2(dayStart)}`,
      dateEnd: `${year}-${pad2(month)}-${pad2(dayEnd)}`,
    };
  }

  const single = trimmed.match(/^(\d+)\.(\d+)$/);
  if (single) {
    const month = Number(single[1]);
    const day = Number(single[2]);
    const iso = `${year}-${pad2(month)}-${pad2(day)}`;
    return { dateStart: iso, dateEnd: iso };
  }

  return null;
}

function resolveTagsFromPost(post: Pick<EventDetailPost, 'tags'>): BuddyPostTagId[] {
  const hashTags = post.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [];
  const matched = BUDDY_POST_TAG_OPTIONS.filter((opt) =>
    hashTags.some((tag) => tag === opt.hashTag),
  ).map((opt) => opt.id);
  return matched.length ? matched : ['team'];
}

function resolveHeadcountFromPost(
  post: Pick<EventDetailPost, 'slotsTotal' | 'slotsFilled'>,
): string {
  if (post.slotsFilled != null && post.slotsTotal != null) {
    return `${post.slotsFilled}/${post.slotsTotal}`;
  }
  if (post.slotsTotal != null) {
    return String(post.slotsTotal);
  }
  return '';
}

/** Parse a structured buddy post back into sheet form values for editing. */
export function parseBuddyPostFormFromPost(
  post: Pick<
    EventDetailPost,
    'body' | 'bodyPreview' | 'location' | 'tags' | 'slotsTotal' | 'slotsFilled'
  >,
  activityDate?: string,
): AiBuddyPostFormValues | null {
  const bounds = parseActivityDateBounds(activityDate);
  const base = defaultBuddyPostForm(activityDate);
  if (!base) return null;

  const mainBody =
    stripPostBodyContact(post.bodyPreview || post.body || '')
      .split(/\n\n/)[0]
      ?.trim() ?? '';
  const segments = mainBody
    .split('，')
    .map((segment) => segment.trim())
    .filter(Boolean);

  let dateStart = base.dateStart;
  let dateEnd = base.dateEnd;
  let location = post.location?.trim() || '';
  let headcount = resolveHeadcountFromPost(post);
  let note = '';

  const yearHint = bounds?.year;
  const dateSegment = segments[1];
  if (dateSegment) {
    const parsedDate = parseBuddyPostDateShort(dateSegment, yearHint);
    if (parsedDate) {
      dateStart = parsedDate.dateStart;
      dateEnd = parsedDate.dateEnd;
    }
  } else if (bounds) {
    dateStart = boundsToIsoDate(bounds, bounds.dayStart);
    dateEnd = boundsToIsoDate(bounds, bounds.dayEnd);
  }

  if (!location && segments[2]) {
    location = segments[2];
  }

  if (segments[3]) {
    headcount = segments[3];
    note = segments.slice(4).join('，');
  }

  return {
    dateStart,
    dateEnd,
    location,
    headcount,
    tags: resolveTagsFromPost(post),
    note,
  };
}
