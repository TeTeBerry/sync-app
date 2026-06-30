export type {
  DjFeatureVector,
  DjRecommendation,
  DjSoulProfile,
  MatchDimension,
  PersonalityLineupDj,
  PersonalityNarrative,
  PersonalityQuestion,
  PersonalityQuestionOption,
  PersonalityScoreResult,
  PersonalityTestAnswers,
  PersonalityTestResult,
  PersonalityTypeMeta,
  RaverPersonalityType,
  RecommendDjLineupResult,
  RecommendationTier,
} from './types';

export type { PersonalityTestCatalog } from './personalityTestCatalog';

export {
  buildTypeMetaMap,
  getCachedPersonalityTestCatalog,
  getDjSoulProfile,
  getPersonalityMeta,
  loadPersonalityTestCatalog,
} from './personalityTestCatalog';

export {
  ensurePersonalityResultIdentity,
  ensurePersonalityResultNickname,
} from './utils/personalityResultIdentity.util';

export {
  generatePersonalityNickname,
  PERSONALITY_NICKNAME_CORES,
} from './utils/personalityNickname.util';

export {
  generatePersonalityRaverAvatarKey,
  RAVER_AVATAR_ASSET_KEYS,
} from './utils/personalityRaverAvatar.util';

export {
  clearPersonalityTestResult,
  loadPersonalityTestResult,
  resolvePersonalityTestResult,
  restorePersonalityTestResultFromServer,
  savePersonalityTestResult,
  PERSONALITY_TEST_STORAGE_KEY,
} from './utils/personalityTestStorage';

export { resolvePersonalityTestSoulDjName } from './utils/resolvePersonalityTestSoulDjName';

export {
  savePersonalityPoster,
  sharePersonalityPoster,
} from './utils/personalityPosterShare';

export { PERSONALITY_POSTER_CANVAS_ID } from './utils/personalityPosterCanvas';

export {
  buildPersonalityBuddyPostPrefill,
  type PersonalityBuddyPostPrefill,
} from './utils/buildPersonalityBuddyPostPrefill';

export { prefetchPersonalityTestAudioMedia } from './utils/personalityAudioPrefetch';

export { PersonalityQuestionStep } from './components/PersonalityQuestionStep';
export { PersonalityResultView } from './components/PersonalityResultView';
export { PersonalityWelcomeModal } from './components/PersonalityWelcomeModal';
export { usePersonalityTestPage } from './hooks/usePersonalityTestPage';
