import { stripContentTypeHashtags } from './postContentTypeDisplay';

const CONTACT_PREFIX = '联系方式：';

/** Remove structured contact segment from post body for display and publish. */
export function stripPostBodyContact(body: string | undefined): string {
  const normalized = stripContentTypeHashtags(body ?? '').trim();
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
