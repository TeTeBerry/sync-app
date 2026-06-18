import type { PersonalityTestResult } from '../types';
import {
  ensurePersonalityResultAvatar,
  generatePersonalityRaverAvatarKey,
} from './personalityRaverAvatar.util';
import { ensurePersonalityResultNickname } from './personalityNickname.util';

export const PERSONALITY_RESULT_IDENTITY_VERSION = 2;

function stampIdentityVersion(result: PersonalityTestResult): PersonalityTestResult {
  if (result.raverIdentityVersion === PERSONALITY_RESULT_IDENTITY_VERSION) {
    return result;
  }
  return { ...result, raverIdentityVersion: PERSONALITY_RESULT_IDENTITY_VERSION };
}

export function ensurePersonalityResultIdentity(
  result: PersonalityTestResult,
): PersonalityTestResult {
  const currentVersion = result.raverIdentityVersion ?? 1;

  if (currentVersion >= PERSONALITY_RESULT_IDENTITY_VERSION) {
    return stampIdentityVersion(
      ensurePersonalityResultAvatar(ensurePersonalityResultNickname(result)),
    );
  }

  const withNickname = ensurePersonalityResultNickname(result);
  return stampIdentityVersion({
    ...withNickname,
    raverAvatarKey: generatePersonalityRaverAvatarKey(),
  });
}

export { ensurePersonalityResultNickname } from './personalityNickname.util';
export {
  generatePersonalityRaverAvatarKey,
  RAVER_AVATAR_ASSET_KEYS,
} from './personalityRaverAvatar.util';
