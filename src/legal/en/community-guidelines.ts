import { LEGAL_CONSENT_VERSION } from '../constants';
import type { LegalDocument } from '../types';
import { LEGAL_UPDATED_LABEL_EN } from './user-agreement';

export const communityGuidelinesEn: LegalDocument = {
  id: 'community-guidelines',
  title: 'Community Guidelines',
  version: LEGAL_CONSENT_VERSION,
  updatedAt: LEGAL_UPDATED_LABEL_EN,
  preamble:
    'Help keep SYNC safe and useful for ravers. Violations may lead to content removal or account restrictions.',
  sections: [
    {
      title: '0. PLUR Community Spirit',
      paragraphs: [
        'SYNC encourages the rave culture PLUR spirit—attitudes we expect in public recruit posts and replies. This reflects community expectations, not any platform promise about offline meetups or team-ups.',
        'Peace: Stay calm online and offline. No harassment, baiting, or flame wars.',
        'Love: Lead with kindness in public posts. Welcome newcomers and offer helpful, supportive language.',
        'Unity: Public recruit posts and replies are for ravers attending the same event—we are one on the dance floor.',
        'Respect: Do not share contact info, take non-consensual photos, or judge others’ taste or identity. Honor boundaries.',
      ],
    },
    {
      title: '1. Encouraged',
      paragraphs: [
        'Honest buddy posts and helpful festival tips; respectful discussion about lineups and logistics.',
      ],
    },
    {
      title: '2. Prohibited',
      paragraphs: [
        'Ticket scalping, fraud, harassment, hate, violence, gambling, spam, unauthorized ads or contact harvesting, impersonation, and illegal content.',
        'Do not use buddy posts to collect payments or run paid groups outside platform rules.',
      ],
    },
    {
      title: '3. Enforcement',
      paragraphs: [
        'We may delete content, limit posting, or suspend accounts. Serious cases may be reported to authorities.',
        'For pre-show responsibility checklists, see Event detail · Festival prep · PLURR.',
      ],
    },
  ],
};
