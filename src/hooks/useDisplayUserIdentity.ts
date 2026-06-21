import { useMemo } from 'react';
import type { ProfileDisplayUser } from '../components/profile/profileSummaryUtils';
import { applyPersonalityTestIdentity } from '../utils/displayUserIdentity';
import { usePersonalityTestResult } from './usePersonalityTestResult';
import { useResolvedProfile } from './useResolvedProfile';

export function useDisplayUserIdentity(): ProfileDisplayUser {
  const profile = useResolvedProfile();
  const personalityResult = usePersonalityTestResult();

  return useMemo(
    () => applyPersonalityTestIdentity(profile, personalityResult),
    [personalityResult, profile],
  );
}
