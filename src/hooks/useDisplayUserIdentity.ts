import { useMemo } from 'react';
import type { ProfileDisplayUser } from '../components/profile/profileSummaryUtils';
import { applyPersonalityTestIdentity } from '../utils/displayUserIdentity';
import { useResolvedProfile } from './useResolvedProfile';

export function useDisplayUserIdentity(): ProfileDisplayUser {
  const profile = useResolvedProfile();

  return useMemo(() => applyPersonalityTestIdentity(profile), [profile]);
}
