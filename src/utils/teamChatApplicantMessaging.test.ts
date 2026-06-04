import { describe, expect, it } from 'vitest';
import {
  APPLICANT_MESSAGING_LIMIT_HINT,
  applicantMessagingHint,
  canApplicantSendTeamChatMessage,
} from './teamChatApplicantMessaging';

describe('teamChatApplicantMessaging', () => {
  it('blocks when applicant already sent apply message and peer silent', () => {
    expect(
      canApplicantSendTeamChatMessage({
        messages: [
          {
            role: 'me',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    ).toBe(false);
  });

  it('allows after peer replies', () => {
    expect(
      canApplicantSendTeamChatMessage({
        messages: [
          { role: 'me', createdAt: new Date().toISOString() },
          { role: 'peer', createdAt: new Date().toISOString() },
        ],
      }),
    ).toBe(true);
  });

  it('returns hint for blocked applicant', () => {
    expect(
      applicantMessagingHint({
        isOwner: false,
        messages: [{ role: 'me', createdAt: new Date().toISOString() }],
      }),
    ).toBe(APPLICANT_MESSAGING_LIMIT_HINT);
  });
});
