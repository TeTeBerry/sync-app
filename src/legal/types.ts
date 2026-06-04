export type LegalDocId = 'user-agreement' | 'privacy-policy' | 'community-guidelines';

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  id: LegalDocId;
  title: string;
  version: string;
  updatedAt: string;
  preamble?: string;
  sections: LegalSection[];
}
