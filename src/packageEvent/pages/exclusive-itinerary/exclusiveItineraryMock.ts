export type ExclusiveItineraryStage = 'main' | 'bass' | 'late' | 'outdoor';

export type ExclusiveItineraryDj = {
  id: string;
  name: string;
  genre: string;
  genreLabel: string;
  stage: ExclusiveItineraryStage;
  popularity: number;
  avatarSeed: string;
  genreColor: string;
};

/** 风暴电音节 深圳站 2026 — 可选国际阵容（与 backend seed 一致）。 */
export const EXCLUSIVE_ITINERARY_DJS: ExclusiveItineraryDj[] = [
  {
    id: 'marshmello',
    name: 'MARSHMELLO',
    genre: 'Future Bass',
    genreLabel: 'Trap · Dubstep · Pop · Future Bass',
    stage: 'main',
    popularity: 98,
    avatarSeed: 'marshmello',
    genreColor: '#ff2d55',
  },
  {
    id: 'illenium',
    name: 'ILLENIUM',
    genre: 'Dubstep',
    genreLabel: 'Melodic Dubstep · Future Bass',
    stage: 'main',
    popularity: 96,
    avatarSeed: 'illenium',
    genreColor: '#7b61ff',
  },
  {
    id: 'excision',
    name: 'EXCISION',
    genre: 'Dubstep',
    genreLabel: 'Brostep',
    stage: 'main',
    popularity: 95,
    avatarSeed: 'excision',
    genreColor: '#f97316',
  },
  {
    id: 'eric-prydz',
    name: 'ERIC PRYDZ',
    genre: 'House',
    genreLabel: 'Progressive House · Electro',
    stage: 'main',
    popularity: 94,
    avatarSeed: 'eric-prydz',
    genreColor: '#60a5fa',
  },
  {
    id: 'andy-c',
    name: 'ANDY C',
    genre: 'Drum & Bass',
    genreLabel: 'D&B · Jungle',
    stage: 'main',
    popularity: 90,
    avatarSeed: 'andy-c',
    genreColor: '#22c55e',
  },
  {
    id: 'odd-mob',
    name: 'ODD MOB',
    genre: 'House',
    genreLabel: 'Tech House · Bass House',
    stage: 'main',
    popularity: 89,
    avatarSeed: 'odd-mob',
    genreColor: '#3b82f6',
  },
  {
    id: 'ghengar',
    name: 'GHENGAR (GHASTLY)',
    genre: 'Dubstep',
    genreLabel: 'Heavy Dubstep · Riddim',
    stage: 'main',
    popularity: 88,
    avatarSeed: 'ghengar',
    genreColor: '#ef4444',
  },
  {
    id: 'julian-jordan',
    name: 'JULIAN JORDAN',
    genre: 'House',
    genreLabel: 'Electro House · Bass House · Future House',
    stage: 'main',
    popularity: 87,
    avatarSeed: 'julian-jordan',
    genreColor: '#a855f7',
  },
  {
    id: 'vidojean',
    name: 'VIDOJEAN (VJ X OL)',
    genre: 'House',
    genreLabel: 'Afro House · Deep House · Funky House',
    stage: 'main',
    popularity: 84,
    avatarSeed: 'vidojean',
    genreColor: '#eab308',
  },
  {
    id: 'blondex',
    name: 'BLONDEX',
    genre: 'Techno',
    genreLabel: 'Techno · Acid · Trance',
    stage: 'main',
    popularity: 82,
    avatarSeed: 'blondex',
    genreColor: '#22d3ee',
  },
];

/**
 * Offline conflict preview — overlaps aligned with festival seed times.
 * marshmello + illenium has no conflict; add eric-prydz or excision to demo overlaps.
 */
export const EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS: Array<{
  artistId: string;
  artistName: string;
  dateKey: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  stageLabel: string;
}> = [
  {
    artistId: 'excision',
    artistName: 'EXCISION',
    dateKey: 'jun13',
    startMinutes: 19 * 60,
    endMinutes: 20 * 60 + 45,
    startTime: '19:00',
    endTime: '20:45',
    stageLabel: '主舞台',
  },
  {
    artistId: 'marshmello',
    artistName: 'MARSHMELLO',
    dateKey: 'jun13',
    startMinutes: 20 * 60 + 30,
    endMinutes: 22 * 60,
    startTime: '20:30',
    endTime: '22:00',
    stageLabel: '主舞台',
  },
  {
    artistId: 'eric-prydz',
    artistName: 'ERIC PRYDZ',
    dateKey: 'jun14',
    startMinutes: 19 * 60,
    endMinutes: 20 * 60 + 45,
    startTime: '19:00',
    endTime: '20:45',
    stageLabel: '主舞台',
  },
  {
    artistId: 'illenium',
    artistName: 'ILLENIUM',
    dateKey: 'jun14',
    startMinutes: 20 * 60 + 20,
    endMinutes: 22 * 60,
    startTime: '20:20',
    endTime: '22:00',
    stageLabel: '主舞台',
  },
];
