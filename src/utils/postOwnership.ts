import { getClientUserName } from "./session";

/** Whether a feed post was authored by the current client user (mock name match). */
export function isCurrentUserPostAuthor(authorName: string): boolean {
  const current = getClientUserName().trim();
  const author = authorName.trim();
  if (!current || !author) return false;
  if (current === author) return true;
  return current.startsWith(`${author} `) || author === current.split(/\s+/)[0];
}
