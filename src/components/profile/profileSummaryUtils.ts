import type { ProfileSummary } from '../../types/backend';
import { EMPTY_PROFILE_DISPLAY_USER, type ProfileDisplayUser } from './profileTypes';

export type { ProfileDisplayUser };

function trimProfileField(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeProfileUserData(
  data: ProfileSummary | ProfileDisplayUser,
): ProfileDisplayUser {
  const stats = data.stats ?? EMPTY_PROFILE_DISPLAY_USER.stats;
  return {
    name: trimProfileField(data.name) ?? EMPTY_PROFILE_DISPLAY_USER.name,
    handle: trimProfileField(data.handle) ?? EMPTY_PROFILE_DISPLAY_USER.handle,
    location: trimProfileField(data.location) ?? EMPTY_PROFILE_DISPLAY_USER.location,
    bio: trimProfileField(data.bio) ?? EMPTY_PROFILE_DISPLAY_USER.bio,
    avatar: trimProfileField(data.avatar) ?? EMPTY_PROFILE_DISPLAY_USER.avatar,
    verified:
      'verified' in data && typeof data.verified === 'boolean'
        ? data.verified
        : EMPTY_PROFILE_DISPLAY_USER.verified,
    stats: {
      events: Number(stats.events) || 0,
      likes: Number(stats.likes) || 0,
      posts: Number(stats.posts) || 0,
    },
  };
}
