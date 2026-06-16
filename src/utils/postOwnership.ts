import { getAuthUserId, getResolvedAuthUserId } from './authStorage';
import { getClientUserId, getClientUserName } from './session';

function authorNameMatches(stored: string, client?: string): boolean {
  const author = stored.trim();
  const name = client?.trim();
  if (!name || !author) return false;
  if (author === name) return true;
  const clientFirst = name.split(/\s+/)[0] ?? '';
  const authorFirst = author.split(/\s+/)[0] ?? '';
  return (
    clientFirst === authorFirst ||
    name.startsWith(`${authorFirst} `) ||
    author.startsWith(`${clientFirst} `)
  );
}

/**
 * Whether a feed/event post was authored by the current client user.
 * When `authorUserId` is present, only compares ids (ignores display name).
 * `authorName` fallback is for legacy rows without stored userId.
 */
export function isCurrentUserPostAuthor(
  authorName?: string | null,
  authorUserId?: string,
): boolean {
  const clientUserId =
    getResolvedAuthUserId()?.trim() ||
    getAuthUserId()?.trim() ||
    getClientUserId().trim();
  const clientUserName = getClientUserName().trim();
  const postUserId = authorUserId?.trim();
  const normalizedAuthorName = authorName?.trim() ?? '';

  if (postUserId && clientUserId) {
    return postUserId === clientUserId;
  }

  if (
    clientUserName &&
    normalizedAuthorName &&
    authorNameMatches(normalizedAuthorName, clientUserName)
  ) {
    return true;
  }

  return false;
}
