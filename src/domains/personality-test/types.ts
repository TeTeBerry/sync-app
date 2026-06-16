export type RaverPersonalityType =
  | 'rager'
  | 'connoisseur'
  | 'vibe_curator'
  | 'zen_raver'
  | 'documentarian';

export type MatchDimension = 'E' | 'M' | 'S' | 'C';

export type RecommendationTier = 'must_see' | 'recommended' | 'challenge';

export type PersonalityLineupDj = {
  id: string;
  name: string;
  genre: string;
  genreLabel: string;
  stage: 'main' | 'bass' | 'late' | 'outdoor';
  popularity: number;
  genreColor: string;
};

export type PersonalityQuestionOption = {
  id: string;
  label: string;
  weights: Partial<Record<RaverPersonalityType, number>>;
};

export type PersonalityQuestionMedia = {
  type: 'audio';
  assetKey: string;
  caption?: string;
};

export type PersonalityQuestion = {
  id: string;
  prompt: string;
  options: PersonalityQuestionOption[];
  /** Final question uses higher weights. */
  media?: PersonalityQuestionMedia;
  weightMultiplier?: number;
};

export type PersonalityScoreResult = {
  primaryType: RaverPersonalityType;
  secondaryType?: RaverPersonalityType;
  scores: Record<RaverPersonalityType, number>;
  blendRatio?: { primary: number; secondary: number };
};

export type DjFeatureVector = {
  E: number;
  M: number;
  S: number;
  C: number;
};

export type DjRecommendation = {
  djId: string;
  djName: string;
  genreLabel: string;
  matchScore: number;
  soulSimilarity: number;
  tier: RecommendationTier;
  dimensionBreakdown: Record<MatchDimension, number>;
  highlight?: string;
};

export type RecommendDjLineupResult = {
  soulMatch: DjRecommendation;
  mustSee: DjRecommendation[];
  recommended: DjRecommendation[];
  challenge: DjRecommendation[];
};

export type SpiritConnection = {
  role: 'soul' | 'aligned';
  djName: string;
};

export type PersonalityNarrative = {
  tagline: string;
  aiAnalysis: string;
  spiritConnections: SpiritConnection[];
};

export type PersonalityEventRecommendation = {
  activityLegacyId: number;
  name: string;
  dateLabel: string;
  location?: string;
  matchScore: number;
  matchedDjs: string[];
  reason: string;
};

export type PersonalityTypeMeta = {
  type: RaverPersonalityType;
  emoji: string;
  label: string;
  labelEn: string;
  description: string;
  genreTags: string[];
  primaryColor: string;
  targetVector: Record<MatchDimension, number>;
  dimensionWeights: Record<MatchDimension, number>;
};

export type DjSoulProfile = {
  signatureTrack: string;
  spiritMoments: [string, string, string];
  visualSymbol:
    | 'plus'
    | 'sawTeeth'
    | 'waves'
    | 'wings'
    | 'orbits'
    | 'grid'
    | 'bubble'
    | 'mandala'
    | 'waveform';
  primaryColor: string;
  secondaryColor: string;
};

export type PersonalityTestAnswers = Record<string, string>;

export type PersonalityTestResult = {
  version: 1;
  completedAt: string;
  answers: PersonalityTestAnswers;
  score: PersonalityScoreResult;
  recommendations: RecommendDjLineupResult;
  recommendedEvents: PersonalityEventRecommendation[];
  narrative: PersonalityNarrative;
};
