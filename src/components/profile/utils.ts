import type { ProfileActivityItem } from '../../types/backend';
import { safeTrim } from '../../utils/safeString';

/** Registered activities the user is still participating in. */
export function countOngoingActivities(items: ProfileActivityItem[]): number {
  return items.filter((item) => item.status === 'registered').length;
}

export function deriveInterestTag(bio?: string | null): string | null {
  const trimmed = safeTrim(bio);
  if (!trimmed) return null;
  if (trimmed.includes('电音')) return '电音';
  return null;
}
