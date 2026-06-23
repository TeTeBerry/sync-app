import { LINEUP_OTHER_GENRE_ID } from './groupLineupByPrimaryGenre';

export const LINEUP_GENRE_NAV_DOM_ID = 'lineup-genre-nav';

export function lineupGenreSectionDomId(groupId: string): string {
  return lineupGenreDomId('lineup-genre', groupId, 'section');
}

export function lineupGenreHeadDomId(groupId: string): string {
  return lineupGenreDomId('lineup-genre-head', groupId, 'head');
}

function lineupGenreDomId(
  prefix: string,
  groupId: string,
  fallbackSlug: string,
): string {
  if (groupId === LINEUP_OTHER_GENRE_ID) {
    return `${prefix}-other`;
  }

  const slug = groupId
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${prefix}-${slug || fallbackSlug}`;
}
