import { describe, expect, it } from 'vitest';
import { buildTeamChatSessionId, parseTeamChatSessionId } from './teamChatSessionId';

describe('teamChatSessionId', () => {
  it('round-trips post id and applicant user id', () => {
    const id = buildTeamChatSessionId('post-3', 'demo-luna');
    expect(id).toBe('chat__post-3__demo-luna');
    expect(parseTeamChatSessionId(id)).toEqual({
      postId: 'post-3',
      applicantUserId: 'demo-luna',
    });
  });
});
