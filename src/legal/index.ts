import { communityGuidelines } from './community-guidelines';
import { communityGuidelinesEn } from './en/community-guidelines';
import { privacyPolicyEn } from './en/privacy-policy';
import { userAgreementEn } from './en/user-agreement';
import { privacyPolicy } from './privacy-policy';
import { userAgreement } from './user-agreement';
import type { LegalDocId, LegalDocument } from './types';
import type { AppLocale } from '@/i18n/types';
import { DEFAULT_LOCALE } from '@/i18n/types';

export {
  APP_DISPLAY_NAME,
  LEGAL_CONSENT_VERSION,
  LEGAL_UPDATED_LABEL,
} from './constants';
export { LEGAL_CONTACT_EMAIL, LEGAL_OPERATOR_NAME } from '../constants/legal';
export type { LegalDocId, LegalDocument, LegalSection } from './types';

const LEGAL_DOCUMENTS_ZH: Record<LegalDocId, LegalDocument> = {
  'user-agreement': userAgreement,
  'privacy-policy': privacyPolicy,
  'community-guidelines': communityGuidelines,
};

const LEGAL_DOCUMENTS_EN: Record<LegalDocId, LegalDocument> = {
  'user-agreement': userAgreementEn,
  'privacy-policy': privacyPolicyEn,
  'community-guidelines': communityGuidelinesEn,
};

function documentsForLocale(locale: AppLocale): Record<LegalDocId, LegalDocument> {
  return locale === 'en-US' ? LEGAL_DOCUMENTS_EN : LEGAL_DOCUMENTS_ZH;
}

export function getLegalDocList(locale: AppLocale = DEFAULT_LOCALE): LegalDocument[] {
  const docs = documentsForLocale(locale);
  return [docs['user-agreement'], docs['privacy-policy'], docs['community-guidelines']];
}

/** @deprecated Use getLegalDocList(locale) */
export const LEGAL_DOC_LIST: LegalDocument[] = getLegalDocList('zh-CN');

export function getLegalDocument(
  id: string | undefined,
  locale: AppLocale = DEFAULT_LOCALE,
): LegalDocument | null {
  if (!id) return null;
  return documentsForLocale(locale)[id as LegalDocId] ?? null;
}

export function getLegalDocTitle(id: LegalDocId, locale: AppLocale): string {
  const doc = documentsForLocale(locale)[id];
  return doc?.title ?? id;
}
