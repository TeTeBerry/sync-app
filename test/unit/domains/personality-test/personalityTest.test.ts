import { describe, expect, it } from 'vitest';
import {
  buildTypeMetaMap,
  getDjSoulProfile,
  getPersonalityMeta,
  type PersonalityTestCatalog,
} from '@/domains/personality-test/personalityTestCatalog';

const CATALOG_FIXTURE: PersonalityTestCatalog = {
  version: 1,
  types: [
    {
      type: 'rager',
      emoji: '🔥',
      label: '主舞台拳皇',
      labelEn: 'The Rager',
      description: '追求能量、前排战士',
      genreTags: ['Big Room', 'Hardstyle', 'Dubstep'],
      primaryColor: '#ff2d55',
      targetVector: { E: 90, M: 20, S: 70, C: 95 },
      dimensionWeights: { E: 0.4, M: 0.1, S: 0.25, C: 0.25 },
    },
  ],
  fallbackLineup: [
    {
      id: 'tiesto',
      name: 'TIËSTO',
      genre: 'House',
      genreLabel: 'Big Room · Progressive House',
      stage: 'main',
      popularity: 98,
      genreColor: '#ff2d55',
    },
  ],
  soulProfiles: {
    tiesto: {
      signatureTrack: 'Red Lights',
      spiritMoments: ['Red Lights', 'Adagio for Strings', '现场烟花'],
      visualSymbol: 'plus',
      primaryColor: '#ff2d55',
      secondaryColor: '#ffffff',
    },
  },
  defaultSoulProfile: {
    signatureTrack: 'Mainstage Anthem',
    spiritMoments: ['招牌 Drop', '现场能量', 'Raver 共鸣'],
    visualSymbol: 'waveform',
    primaryColor: '#ff0066',
    secondaryColor: '#7b61ff',
  },
};

describe('personalityTestCatalog', () => {
  it('builds type meta map from catalog payload', () => {
    const map = buildTypeMetaMap(CATALOG_FIXTURE);
    expect(map.rager.label).toBe('主舞台拳皇');
    expect(map.rager.primaryColor).toBe('#ff2d55');
  });

  it('resolves personality meta and soul profile from catalog', () => {
    expect(getPersonalityMeta(CATALOG_FIXTURE, 'rager').emoji).toBe('🔥');
    expect(getDjSoulProfile(CATALOG_FIXTURE, 'tiesto').signatureTrack).toBe(
      'Red Lights',
    );
    expect(getDjSoulProfile(CATALOG_FIXTURE, 'unknown-dj').visualSymbol).toBe(
      'waveform',
    );
  });
});
