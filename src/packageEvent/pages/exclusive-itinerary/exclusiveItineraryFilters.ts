export type ExclusiveItineraryFilterChip = { id: string; label: string };

const STAGE_LABELS: Record<string, string> = {
  main: '主舞台',
  bass: 'Bass 舞台',
  late: '深夜舞台',
  outdoor: '户外舞台',
};

const STYLE_TOKEN_SPLIT = /\s*[·/]\s*/g;

/** Canonical primary categories for festival lineup filters. */
const PRIMARY_GENRE_LABELS: Record<string, string> = {
  house: 'House',
  techno: 'Techno',
  trance: 'Trance',
  dubstep: 'Dubstep',
  'drum & bass': 'Drum & Bass',
  'drum n bass': 'Drum & Bass',
  dnb: 'Drum & Bass',
  hardstyle: 'Hardstyle',
  bass: 'Bass',
  trap: 'Bass',
  'future bass': 'Bass',
};

/** Sub-genre values stored in `genre` → primary filter bucket. */
const SUBGENRE_TO_PRIMARY: Record<string, string> = {
  'bass house': 'House',
  'big room': 'House',
  'tech house': 'House',
  'deep house': 'House',
  'progressive house': 'House',
  'electro house': 'House',
  'afro house': 'House',
  'melodic house': 'House',
  'disco house': 'House',
  'funky house': 'House',
  'uk garage': 'House',
  'hard techno': 'Techno',
  'melodic techno': 'Techno',
  'industrial techno': 'Techno',
  'acid techno': 'Techno',
  'peak time techno': 'Techno',
  'neo rave': 'Techno',
  'progressive trance': 'Trance',
  'uplifting trance': 'Trance',
  'melodic trance': 'Trance',
  brostep: 'Dubstep',
  riddim: 'Dubstep',
  'jump up': 'Drum & Bass',
  neurofunk: 'Drum & Bass',
  rawstyle: 'Hardstyle',
  'uk hardcore': 'Hardstyle',
  'happy hardcore': 'Hardstyle',
};

/** Collapse lineup `genre` to a primary category for per-event filter chips. */
export function resolvePrimaryGenreCategory(genre: string): string {
  const trimmed = genre?.trim() ?? '';
  if (!trimmed || trimmed === '风格待补充') {
    return '';
  }

  const key = trimmed.toLowerCase();
  if (SUBGENRE_TO_PRIMARY[key]) {
    return SUBGENRE_TO_PRIMARY[key];
  }
  if (PRIMARY_GENRE_LABELS[key]) {
    return PRIMARY_GENRE_LABELS[key];
  }

  if (key.includes('house') || key.includes('garage')) {
    return 'House';
  }
  if (key.includes('techno') || key.includes('rave')) {
    return 'Techno';
  }
  if (key.includes('trance')) {
    return 'Trance';
  }
  if (key.includes('dubstep') || key.includes('riddim')) {
    return 'Dubstep';
  }
  if (key.includes('hardstyle') || key.includes('hardcore')) {
    return 'Hardstyle';
  }
  if (
    (key.includes('drum') && key.includes('bass')) ||
    key.includes('jungle') ||
    key === 'dnb'
  ) {
    return 'Drum & Bass';
  }
  if (key.includes('trap') || key.includes('future bass')) {
    return 'Bass';
  }

  return trimmed;
}

export function extractDjStyleTokens(genreLabel?: string): string[] {
  const trimmed = genreLabel?.trim() ?? '';
  if (!trimmed || trimmed === '风格待补充') {
    return [];
  }

  return trimmed
    .split(STYLE_TOKEN_SPLIT)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function buildGenreFilterOptions(
  djs: Array<{ genre: string }>,
): ExclusiveItineraryFilterChip[] {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const dj of djs) {
    const primary = resolvePrimaryGenreCategory(dj.genre);
    if (!primary) {
      continue;
    }
    const key = primary.toLowerCase();
    if (!labels.has(key)) {
      labels.set(key, primary);
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const styles = [...counts.keys()].sort((a, b) => {
    const countDiff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    if (countDiff !== 0) {
      return countDiff;
    }
    return (labels.get(a) ?? a).localeCompare(labels.get(b) ?? b, 'en');
  });

  return [
    { id: 'all', label: '全部风格' },
    ...styles.map((key) => ({
      id: labels.get(key) ?? key,
      label: labels.get(key) ?? key,
    })),
  ];
}

/** Common shorthand → expanded tokens for fuzzy style search. */
const STYLE_SEARCH_ALIASES: Record<string, string[]> = {
  dnb: ['drum n bass', 'drum & bass', 'dnb'],
  prog: ['progressive'],
  tech: ['techno', 'tech house'],
};

export function normalizeStyleSearchQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

function styleSearchHaystack(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandStyleSearchQueries(query: string): string[] {
  const normalized = normalizeStyleSearchQuery(query);
  if (!normalized) {
    return [];
  }
  const aliases = STYLE_SEARCH_ALIASES[normalized] ?? [];
  return [
    ...new Set([normalized, ...aliases.map((item) => styleSearchHaystack(item))]),
  ];
}

/** Fuzzy match: substring, word prefix, or alias (e.g. dnb → Drum n Bass). */
export function fuzzyStyleTextMatches(text: string, query: string): boolean {
  const queries = expandStyleSearchQueries(query);
  if (!queries.length) {
    return true;
  }

  const haystack = styleSearchHaystack(text);
  if (!haystack) {
    return false;
  }

  return queries.some((q) => {
    if (haystack.includes(q)) {
      return true;
    }
    return haystack.split(' ').some((word) => word.startsWith(q));
  });
}

export function djMatchesStyleFilter(dj: { genre: string }, styleId: string): boolean {
  if (styleId === 'all') {
    return true;
  }

  const selected = resolvePrimaryGenreCategory(styleId);
  const artistPrimary = resolvePrimaryGenreCategory(dj.genre);
  if (!selected || !artistPrimary) {
    return false;
  }
  return artistPrimary.toLowerCase() === selected.toLowerCase();
}

export function djMatchesStyleSearch(
  dj: { genreLabel: string },
  query: string,
): boolean {
  const normalized = normalizeStyleSearchQuery(query);
  if (!normalized) {
    return true;
  }

  const label = dj.genreLabel?.trim() ?? '';
  if (!label || label === '风格待补充') {
    return false;
  }
  if (label === '国内艺人') {
    return fuzzyStyleTextMatches('国内艺人', normalized);
  }

  if (fuzzyStyleTextMatches(label, normalized)) {
    return true;
  }

  return extractDjStyleTokens(label).some((token) =>
    fuzzyStyleTextMatches(token, normalized),
  );
}

export function filterGenreOptionsBySearch(
  options: ExclusiveItineraryFilterChip[],
  query: string,
): ExclusiveItineraryFilterChip[] {
  const normalized = normalizeStyleSearchQuery(query);
  if (!normalized) {
    return options;
  }

  const allChip = options.find((option) => option.id === 'all');
  const matched = options.filter(
    (option) => option.id !== 'all' && fuzzyStyleTextMatches(option.label, normalized),
  );

  return allChip ? [allChip, ...matched] : matched;
}

export function buildStageFilterOptions(
  djs: Array<{ stage: string; stageLabel?: string }>,
): ExclusiveItineraryFilterChip[] {
  const stageLabels = new Map<string, string>();
  for (const dj of djs) {
    const stage = dj.stage?.trim();
    if (!stage) {
      continue;
    }
    if (!stageLabels.has(stage)) {
      stageLabels.set(stage, dj.stageLabel?.trim() || STAGE_LABELS[stage] || stage);
    }
  }

  const ordered = [...stageLabels.keys()].sort((a, b) => {
    if (a === 'main') return -1;
    if (b === 'main') return 1;
    return (stageLabels.get(a) ?? a).localeCompare(stageLabels.get(b) ?? b, 'en');
  });

  return [
    { id: 'all', label: '全部舞台' },
    ...ordered.map((stage) => ({
      id: stage,
      label: stageLabels.get(stage) ?? stage,
    })),
  ];
}

export function isValidFilterId(
  options: ExclusiveItineraryFilterChip[],
  filterId: string,
): boolean {
  return options.some((option) => option.id === filterId);
}
