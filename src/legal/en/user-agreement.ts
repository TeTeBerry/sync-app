import { LEGAL_CONSENT_VERSION } from '../constants';
import type { LegalDocument } from '../types';

export const LEGAL_UPDATED_LABEL_EN = 'June 18, 2026';

export const userAgreementEn: LegalDocument = {
  id: 'user-agreement',
  title: 'User Agreement',
  version: LEGAL_CONSENT_VERSION,
  updatedAt: LEGAL_UPDATED_LABEL_EN,
  preamble:
    'Welcome to the SYNC WeChat Mini Program (“Service”). Please read this agreement carefully. By agreeing or using the Service, you accept these terms.',
  sections: [
    {
      title: '1. Scope',
      paragraphs: [
        'SYNC provides free festival information and planning tools: event browsing and selection, lineups and schedules, AI assistant, travel guides and itineraries, structured buddy posts, personality test, notifications, profile, and reporting.',
        'We do not sell tickets or charge service fees in the mini program. Selecting an event records your interest only; entry rules follow organizers and official ticketing channels.',
      ],
    },
    {
      title: '2. Account',
      paragraphs: [
        'You may sign in with WeChat authorization. Keep your account secure. We may restrict accounts that violate guidelines or pose risk.',
      ],
    },
    {
      title: '3. User content',
      paragraphs: [
        'You are responsible for text you post or send to AI. Buddy posts use structured fields only. Do not use the Service for scalping, fraud, harassment, or illegal activity.',
        'We may review, filter, or remove content and cooperate with regulators when required.',
      ],
    },
    {
      title: '4. AI services',
      paragraphs: [
        'AI outputs are for reference only—not professional legal, medical, or safety advice. Verify travel and spending decisions yourself.',
      ],
    },
    {
      title: '5. Offline participation',
      paragraphs: [
        'Offline meet-ups between users are at users’ own risk. We do not guarantee safety or fulfillment of offline arrangements.',
      ],
    },
  ],
};
