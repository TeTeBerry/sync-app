import type { LegalDocId } from '../legal';
import { ROUTES, go } from './route';

export function goLegalDocument(doc: LegalDocId): void {
  go(`${ROUTES.LEGAL_DOCUMENT}?doc=${doc}`);
}
