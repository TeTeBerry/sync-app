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

/**
 * Whether a comment was left by the post author (for reply eligibility).
 * Prefer userId match; name fallback only when both sides lack userId.
 */
export function isCommentByPostAuthor(
  commentAuthorName?: string | null,
  commentUserId?: string,
  postAuthorName?: string | null,
  postAuthorUserId?: string,
): boolean {
  const postUid = postAuthorUserId?.trim();
  const commentUid = commentUserId?.trim();
  if (postUid && commentUid) {
    return postUid === commentUid;
  }

  const postName = postAuthorName?.trim() ?? '';
  const commentName = commentAuthorName?.trim() ?? '';
  if (!postUid && !commentUid && postName && commentName) {
    return authorNameMatches(postName, commentName);
  }

  return false;
}
