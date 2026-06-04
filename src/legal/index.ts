import { communityGuidelines } from './community-guidelines';
import { privacyPolicy } from './privacy-policy';
import { userAgreement } from './user-agreement';
import type { LegalDocId, LegalDocument } from './types';

export {
  APP_DISPLAY_NAME,
  LEGAL_CONSENT_VERSION,
  LEGAL_UPDATED_LABEL,
} from './constants';
export { LEGAL_CONTACT_EMAIL, LEGAL_OPERATOR_NAME } from '../constants/legal';
export type { LegalDocId, LegalDocument, LegalSection } from './types';

const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  'user-agreement': userAgreement,
  'privacy-policy': privacyPolicy,
  'community-guidelines': communityGuidelines,
};

export const LEGAL_DOC_LIST: LegalDocument[] = [
  userAgreement,
  privacyPolicy,
  communityGuidelines,
];

export function getLegalDocument(id: string | undefined): LegalDocument | null {
  if (!id) return null;
  return LEGAL_DOCUMENTS[id as LegalDocId] ?? null;
}
