import type { LegalDocId, LegalDocument } from './types';
import type { AppLocale } from '@/i18n/types';
import { DEFAULT_LOCALE } from '@/i18n/types';
import { translate } from '@/i18n/translate';
import { LEGAL_CONSENT_VERSION } from './constants';

export {
  APP_DISPLAY_NAME,
  LEGAL_CONSENT_VERSION,
  LEGAL_UPDATED_LABEL,
} from './constants';
export { LEGAL_CONTACT_EMAIL, LEGAL_OPERATOR_NAME } from '../constants/legal';
export type { LegalDocId, LegalDocument, LegalSection } from './types';

const LEGAL_DOC_IDS: LegalDocId[] = [
  'user-agreement',
  'privacy-policy',
  'community-guidelines',
];

type LegalDocLoader = () => Promise<LegalDocument>;

const LEGAL_LOADERS: Record<AppLocale, Record<LegalDocId, LegalDocLoader>> = {
  'zh-CN': {
    'user-agreement': () =>
      import('./user-agreement').then((module) => module.userAgreement),
    'privacy-policy': () =>
      import('./privacy-policy').then((module) => module.privacyPolicy),
    'community-guidelines': () =>
      import('./community-guidelines').then((module) => module.communityGuidelines),
  },
  'en-US': {
    'user-agreement': () =>
      import('./en/user-agreement').then((module) => module.userAgreementEn),
    'privacy-policy': () =>
      import('./en/privacy-policy').then((module) => module.privacyPolicyEn),
    'community-guidelines': () =>
      import('./en/community-guidelines').then(
        (module) => module.communityGuidelinesEn,
      ),
  },
};

const legalDocumentCache: Partial<
  Record<AppLocale, Partial<Record<LegalDocId, LegalDocument>>>
> = {};

export function getLegalDocList(locale: AppLocale = DEFAULT_LOCALE): LegalDocument[] {
  return LEGAL_DOC_IDS.map((id) => ({
    id,
    title: translate(`legal.docTitles.${id}`, locale),
    version: LEGAL_CONSENT_VERSION,
    updatedAt: translate('legal.updatedLabel', locale),
    sections: [],
  }));
}

export async function loadLegalDocument(
  id: LegalDocId,
  locale: AppLocale = DEFAULT_LOCALE,
): Promise<LegalDocument | null> {
  const cached = legalDocumentCache[locale]?.[id];
  if (cached) return cached;

  const loader = LEGAL_LOADERS[locale]?.[id];
  if (!loader) return null;

  const document = await loader();
  legalDocumentCache[locale] = { ...legalDocumentCache[locale], [id]: document };
  return document;
}

export function getLegalDocument(
  id: string | undefined,
  locale: AppLocale = DEFAULT_LOCALE,
): LegalDocument | null {
  if (!id) return null;
  const docId = id as LegalDocId;
  return legalDocumentCache[locale]?.[docId] ?? null;
}

export function getLegalDocTitle(id: LegalDocId, locale: AppLocale): string {
  return translate(`legal.docTitles.${id}`, locale);
}
