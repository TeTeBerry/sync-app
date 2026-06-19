import type { ProfileDisplayUser } from '../components/profile/profileSummaryUtils';
import { normalizeProfileUserData } from '../components/profile/profileSummaryUtils';
import type { ProfileSummary } from '../types/backend';
import { loadPersonalityTestResult } from '../domains/personality-test/utils/personalityTestStorage';

/** Profile identity shown in UI, including local Raver nickname/avatar overlay. */
export function applyPersonalityTestIdentity(
  profile: ProfileDisplayUser,
): ProfileDisplayUser {
  const localResult = loadPersonalityTestResult();
  const next = { ...profile };

  if (localResult?.raverNickname?.trim()) {
    next.name = localResult.raverNickname.trim();
  }
  if (localResult?.raverAvatarKey?.trim()) {
    next.avatar = localResult.raverAvatarKey.trim();
  }

  return next;
}

export function resolveDisplayUserIdentity(
  summary?: ProfileSummary | ProfileDisplayUser | null,
): ProfileDisplayUser {
  return applyPersonalityTestIdentity(
    normalizeProfileUserData((summary ?? {}) as ProfileSummary),
  );
}
