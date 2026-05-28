import { getClientUserId, getClientUserName } from "./session";

/** Matches backend DEFAULT_PROFILE_EXTERNAL_ID (demo owner). */
const DEMO_OWNER_USER_ID = "demo-zara";

function authorNameMatches(stored: string, client?: string): boolean {
  const author = stored.trim();
  const name = client?.trim();
  if (!name || !author) return false;
  if (author === name) return true;
  const clientFirst = name.split(/\s+/)[0] ?? "";
  const authorFirst = author.split(/\s+/)[0] ?? "";
  return (
    clientFirst === authorFirst ||
    name.startsWith(`${authorFirst} `) ||
    author.startsWith(`${clientFirst} `)
  );
}

function isDemoOwnerClient(userId?: string): boolean {
  return userId?.trim() === DEMO_OWNER_USER_ID;
}

/** Whether a feed/event post was authored by the current client user. */
export function isCurrentUserPostAuthor(
  authorName: string,
  authorUserId?: string,
): boolean {
  const clientUserId = getClientUserId().trim();
  const clientUserName = getClientUserName().trim();
  const postUserId = authorUserId?.trim();

  if (clientUserId && postUserId && postUserId === clientUserId) {
    return true;
  }

  if (
    clientUserName &&
    authorName.trim() &&
    authorNameMatches(authorName, clientUserName)
  ) {
    return true;
  }

  if (isDemoOwnerClient(clientUserId) && postUserId === DEMO_OWNER_USER_ID) {
    return true;
  }

  return false;
}
