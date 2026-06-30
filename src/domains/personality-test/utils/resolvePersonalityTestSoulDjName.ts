import { resolvePersonalityTestResult } from './personalityTestStorage';

/** Resolve soul DJ name for home / entry cards; restores from server when logged in. */
export async function resolvePersonalityTestSoulDjName(): Promise<string | null> {
  const result = await resolvePersonalityTestResult();
  const soulDj = result?.recommendations.soulMatch.djName?.trim();
  return soulDj || null;
}
