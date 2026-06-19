/** @handle 展示：Mia → @mia，Zara Chen → @zara.chen */
export function formatEventPostHandle(name?: string): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '@user';
  const slug = trimmed
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '');
  return `@${slug || 'user'}`;
}

/** Prefer profile handle; fall back to slug from display name. */
export function formatPostHandle(name?: string, handle?: string): string {
  const trimmedHandle = handle?.trim();
  if (trimmedHandle) {
    return trimmedHandle.startsWith('@') ? trimmedHandle : `@${trimmedHandle}`;
  }
  return formatEventPostHandle(name);
}
