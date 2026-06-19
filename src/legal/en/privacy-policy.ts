import { LEGAL_CONSENT_VERSION } from '../constants';
import type { LegalDocument } from '../types';
import { LEGAL_UPDATED_LABEL_EN } from './user-agreement';

export const privacyPolicyEn: LegalDocument = {
  id: 'privacy-policy',
  title: 'Privacy Policy',
  version: LEGAL_CONSENT_VERSION,
  updatedAt: LEGAL_UPDATED_LABEL_EN,
  preamble:
    'This policy explains how SYNC collects, uses, and protects your personal information.',
  sections: [
    {
      title: '1. Information we collect',
      paragraphs: [
        'Account identifiers from WeChat (e.g. openid), optional nickname and avatar, profile fields you provide, buddy posts and comments, AI messages and uploaded images, itinerary and guide data, personality test results, and device/log data for security.',
      ],
    },
    {
      title: '2. How we use information',
      paragraphs: [
        'To operate the Service: sign-in, event selection, content display, notifications, guides and itineraries, moderation, and account safety.',
        'AI features may send your prompts and images to model providers to generate responses.',
      ],
    },
    {
      title: '3. Sharing',
      paragraphs: [
        'We use WeChat and cloud providers as required to run the mini program. We do not sell your personal information.',
      ],
    },
    {
      title: '4. Your choices',
      paragraphs: [
        'You may update profile fields, sign out, or request account deletion per in-app instructions.',
      ],
    },
  ],
};
