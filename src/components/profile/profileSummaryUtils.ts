import type { ProfileSummary } from '../../types/backend';
import { profileUser } from './mockData';

export type ProfileDisplayUser = typeof profileUser;

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
  const stats = data.stats ?? profileUser.stats;
  return {
    name: trimProfileField(data.name) ?? profileUser.name,
    handle: trimProfileField(data.handle) ?? profileUser.handle,
    location: trimProfileField(data.location) ?? profileUser.location,
    bio: trimProfileField(data.bio) ?? profileUser.bio,
    avatar: trimProfileField(data.avatar) ?? profileUser.avatar,
    verified:
      'verified' in data && typeof data.verified === 'boolean'
        ? data.verified
        : profileUser.verified,
    stats: {
      events: Number(stats.events) || 0,
      likes: Number(stats.likes) || 0,
      posts: Number(stats.posts) || 0,
    },
  };
}
