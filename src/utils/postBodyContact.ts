import { stripContentTypeHashtags } from './postContentTypeDisplay';

const CONTACT_PREFIX = '联系方式：';

export type SplitPostBodyContactResult = {
  publicBody: string;
  contact?: string;
};

/** Hide contact in feed; keep note segments that follow the contact line. */
export function splitPostBodyContact(
  body: string | undefined,
): SplitPostBodyContactResult {
  const normalized = stripContentTypeHashtags(body ?? '').trim();
  if (!normalized) {
    return { publicBody: '' };
  }

  const contactIndex = normalized.lastIndexOf(CONTACT_PREFIX);
  if (contactIndex < 0) {
    return { publicBody: normalized };
  }

  const before = normalized.slice(0, contactIndex).replace(/，$/, '').trim();
  const afterPrefix = normalized.slice(contactIndex + CONTACT_PREFIX.length).trim();
  const commaIndex = afterPrefix.indexOf('，');
  const contact = (
    commaIndex >= 0 ? afterPrefix.slice(0, commaIndex) : afterPrefix
  ).trim();
  const trailingNote = commaIndex >= 0 ? afterPrefix.slice(commaIndex + 1).trim() : '';

  const publicBody = [before, trailingNote].filter(Boolean).join('，');

  return {
    publicBody,
    contact: contact || undefined,
  };
}
