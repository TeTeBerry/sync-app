import { LEGAL_CONSENT_VERSION, LEGAL_UPDATED_LABEL } from '../constants';
import type { LegalDocument } from '../types';

export const plurCultureEn: LegalDocument = {
  id: 'plur-culture',
  title: 'PLUR Culture',
  version: LEGAL_CONSENT_VERSION,
  updatedAt: LEGAL_UPDATED_LABEL,
  preamble:
    'PLUR is a widely shared rave community ethos. SYNC encourages this attitude in public recruit posts and replies — not a promise of offline meetups or teaming.',
  sections: [
    {
      title: 'Peace',
      paragraphs: [
        'Leave conflict at the door. On the floor: no pushing, arguing, spot-grabbing, or targeting strangers; step back when bumps happen. A floor without fights or standoffs is the baseline.',
      ],
    },
    {
      title: 'Love',
      paragraphs: [
        'Lead with warmth and kindness toward everyone. Help someone up, share water, watch a bag, comfort a low moment — love for the music, the floor, and the people around you.',
      ],
    },
    {
      title: 'Unity',
      paragraphs: [
        'We share one beat; the floor is one body. We Are One — we gather for the same event. SYNC’s find-team path is Unity: browse or post public recruits so ravers at the same show can see each other (no matching, no DMs).',
      ],
    },
    {
      title: 'Respect',
      paragraphs: [
        'Respect people and the rules. No unwanted touch, no creepshots, no forced chat; respect DJs, the venue, and differences. Public replies stay contact-free and boundary-safe.',
      ],
    },
    {
      title: 'Responsibility (PLURR)',
      paragraphs: [
        'Party with care for yourself, others nearby, and the space. Pre-show you can note hydration, telling someone your plan, earplugs and shoes, exit transport, leave no trace, and looking out for your crew — personal reminders only; the platform does not guarantee on-site safety.',
      ],
    },
  ],
};
