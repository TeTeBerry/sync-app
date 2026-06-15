export type ExclusiveItineraryFilterChip = { id: string; label: string };

const STAGE_LABELS: Record<string, string> = {
  main: '主舞台',
  bass: 'Bass 舞台',
  late: '深夜舞台',
  outdoor: '户外舞台',
};

const STYLE_TOKEN_SPLIT = /\s*[·/]\s*/g;

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
    const genre = dj.genre?.trim() ?? '';
    if (!genre || genre === '风格待补充') {
      continue;
    }
    const key = genre.toLowerCase();
    if (!labels.has(key)) {
      labels.set(key, genre);
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

  const normalized = styleId.trim().toLowerCase();
  const genre = dj.genre?.trim().toLowerCase() ?? '';
  return genre === normalized;
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
  djs: Array<{ stage: string }>,
): ExclusiveItineraryFilterChip[] {
  const stages = new Set<string>();
  for (const dj of djs) {
    const stage = dj.stage?.trim();
    if (stage) stages.add(stage);
  }

  const ordered = [...stages].sort((a, b) => {
    if (a === 'main') return -1;
    if (b === 'main') return 1;
    return a.localeCompare(b, 'en');
  });

  return [
    { id: 'all', label: '全部舞台' },
    ...ordered.map((stage) => ({
      id: stage,
      label: STAGE_LABELS[stage] ?? stage,
    })),
  ];
}

export function isValidFilterId(
  options: ExclusiveItineraryFilterChip[],
  filterId: string,
): boolean {
  return options.some((option) => option.id === filterId);
}
