import { isLoggedIn } from '@/utils/authStorage';
import {
  loadPersonalityTestResult,
  restorePersonalityTestResultFromServer,
} from './personalityTestStorage';

/** Resolve soul DJ name for home / entry cards; restores from server when logged in. */
export async function resolvePersonalityTestSoulDjName(): Promise<string | null> {
  const result = isLoggedIn()
    ? await restorePersonalityTestResultFromServer()
    : loadPersonalityTestResult();
  const soulDj = result?.recommendations.soulMatch.djName?.trim();
  return soulDj || null;
}
