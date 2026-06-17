const CONTACT_PREFIX = '联系方式：';

/** Remove the fixed team hashtag from visible post text. */
export function stripTeamHashtags(text?: string): string {
  if (!text?.trim()) return '';
  return text
    .replace(/#组队/g, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Remove structured contact segment from post body for display and publish. */
export function stripPostBodyContact(body: string | undefined): string {
  const normalized = stripTeamHashtags(body ?? '').trim();
  if (!normalized) {
    return '';
  }

  const contactIndex = normalized.lastIndexOf(CONTACT_PREFIX);
  if (contactIndex < 0) {
    return normalized;
  }

  const before = normalized.slice(0, contactIndex).replace(/，$/, '').trim();
  const afterPrefix = normalized.slice(contactIndex + CONTACT_PREFIX.length);
  const contactValueMatch = afterPrefix.match(/^[^\n，]+/);
  const skipLen = contactValueMatch?.[0].length ?? 0;
  let rest = afterPrefix.slice(skipLen);
  if (rest.startsWith('，')) {
    rest = rest.slice(1).trim();
  } else {
    rest = rest.trim();
  }

  if (!rest) {
    return before;
  }

  return before ? `${before}，${rest}` : rest;
}
