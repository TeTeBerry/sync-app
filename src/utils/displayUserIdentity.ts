import type { ProfileDisplayUser } from '../components/profile/profileSummaryUtils';
import { normalizeProfileUserData } from '../components/profile/profileSummaryUtils';
import type { PersonalityTestResult } from '../domains/personality-test/types';
import { loadPersonalityTestResult } from '../domains/personality-test/utils/personalityTestStorage';
import type { ProfileSummary } from '../types/backend';

/** Profile identity shown in UI, including local Raver nickname/avatar overlay. */
export function applyPersonalityTestIdentity(
  profile: ProfileDisplayUser,
  localResult?: PersonalityTestResult | null,
): ProfileDisplayUser {
  const resolvedResult = localResult ?? loadPersonalityTestResult();
  const next = { ...profile };

  if (resolvedResult?.raverNickname?.trim()) {
    next.name = resolvedResult.raverNickname.trim();
  }
  if (resolvedResult?.raverAvatarKey?.trim()) {
    next.avatar = resolvedResult.raverAvatarKey.trim();
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
