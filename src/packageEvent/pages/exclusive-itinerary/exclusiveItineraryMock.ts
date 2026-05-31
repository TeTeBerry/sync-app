export type ExclusiveItineraryStage = "main" | "bass" | "late" | "outdoor";

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

export const EXCLUSIVE_ITINERARY_STAGES = [
  { id: "all", label: "全部舞台" },
  { id: "main", label: "主舞台" },
] as const;

export const EXCLUSIVE_ITINERARY_GENRES = [
  { id: "all", label: "全部风格" },
  { id: "Future Bass", label: "Future Bass" },
  { id: "Techno", label: "Techno" },
  { id: "Dubstep", label: "Dubstep" },
  { id: "House", label: "House" },
  { id: "Drum & Bass", label: "Drum & Bass" },
] as const;

export const EXCLUSIVE_ITINERARY_MAX_SELECTION = 5;

/** Default selection — Day1 headliner + Day2 headliner. */
export const EXCLUSIVE_ITINERARY_DEFAULT_SELECTED_IDS = ["marshmello", "illenium"];

/** 风暴电音节 深圳站 2026 — 可选国际阵容（与 backend seed 一致）。 */
export const EXCLUSIVE_ITINERARY_DJS: ExclusiveItineraryDj[] = [
  {
    id: "marshmello",
    name: "MARSHMELLO",
    genre: "Future Bass",
    genreLabel: "Trap · Dubstep · Pop · Future Bass",
    stage: "main",
    popularity: 98,
    avatarSeed: "marshmello",
    genreColor: "#ff2d55",
  },
  {
    id: "illenium",
    name: "ILLENIUM",
    genre: "Dubstep",
    genreLabel: "Melodic Dubstep · Future Bass",
    stage: "main",
    popularity: 96,
    avatarSeed: "illenium",
    genreColor: "#7b61ff",
  },
  {
    id: "excision",
    name: "EXCISION",
    genre: "Dubstep",
    genreLabel: "Brostep",
    stage: "main",
    popularity: 95,
    avatarSeed: "excision",
    genreColor: "#f97316",
  },
  {
    id: "eric-prydz",
    name: "ERIC PRYDZ",
    genre: "House",
    genreLabel: "Progressive House · Electro",
    stage: "main",
    popularity: 94,
    avatarSeed: "eric-prydz",
    genreColor: "#60a5fa",
  },
  {
    id: "andy-c",
    name: "ANDY C",
    genre: "Drum & Bass",
    genreLabel: "D&B · Jungle",
    stage: "main",
    popularity: 90,
    avatarSeed: "andy-c",
    genreColor: "#22c55e",
  },
  {
    id: "odd-mob",
    name: "ODD MOB",
    genre: "House",
    genreLabel: "Tech House · Bass House",
    stage: "main",
    popularity: 89,
    avatarSeed: "odd-mob",
    genreColor: "#3b82f6",
  },
  {
    id: "ghengar",
    name: "GHENGAR (GHASTLY)",
    genre: "Dubstep",
    genreLabel: "Heavy Dubstep · Riddim",
    stage: "main",
    popularity: 88,
    avatarSeed: "ghengar",
    genreColor: "#ef4444",
  },
  {
    id: "julian-jordan",
    name: "JULIAN JORDAN",
    genre: "House",
    genreLabel: "Electro House · Bass House · Future House",
    stage: "main",
    popularity: 87,
    avatarSeed: "julian-jordan",
    genreColor: "#a855f7",
  },
  {
    id: "vidojean",
    name: "VIDOJEAN (VJ X OL)",
    genre: "House",
    genreLabel: "Afro House · Deep House · Funky House",
    stage: "main",
    popularity: 84,
    avatarSeed: "vidojean",
    genreColor: "#eab308",
  },
  {
    id: "blondex",
    name: "BLONDEX",
    genre: "Techno",
    genreLabel: "Techno · Acid · Trance",
    stage: "main",
    popularity: 82,
    avatarSeed: "blondex",
    genreColor: "#22d3ee",
  },
];

/** Offline conflict preview — single main stage has no overlaps; use API when enabled. */
export const EXCLUSIVE_ITINERARY_MOCK_CONFLICT_SLOTS: Array<{
  artistId: string;
  artistName: string;
  dateKey: string;
  startMinutes: number;
  endMinutes: number;
  startTime: string;
  endTime: string;
  stageLabel: string;
}> = [];
