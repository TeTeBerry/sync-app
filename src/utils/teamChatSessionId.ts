const TEAM_CHAT_SESSION_SEP = '__';

/** Canonical team-chat thread id: post + applicant (not "peer"). */
export function buildTeamChatSessionId(
  postId: string,
  applicantUserId: string,
): string {
  return `chat${TEAM_CHAT_SESSION_SEP}${encodeURIComponent(postId.trim())}${TEAM_CHAT_SESSION_SEP}${encodeURIComponent(applicantUserId.trim())}`;
}

export function parseTeamChatSessionId(
  sessionId: string,
): { postId: string; applicantUserId: string } | null {
  const raw = sessionId.trim();
  const parts = raw.split(TEAM_CHAT_SESSION_SEP);
  if (parts.length !== 3 || parts[0] !== 'chat') {
    return parseLegacyTeamChatSessionId(raw);
  }
  try {
    const postId = decodeURIComponent(parts[1] ?? '').trim();
    const applicantUserId = decodeURIComponent(parts[2] ?? '').trim();
    if (!postId || !applicantUserId) return null;
    return { postId, applicantUserId };
  } catch {
    return null;
  }
}

/** Legacy `chat-{postId}-{applicantUserId}` (ambiguous when postId contains `-`). */
function parseLegacyTeamChatSessionId(
  sessionId: string,
): { postId: string; applicantUserId: string } | null {
  if (!sessionId.startsWith('chat-')) return null;
  const rest = sessionId.slice(5);
  const splitAt = rest.lastIndexOf('-');
  if (splitAt <= 0) return null;
  const postId = rest.slice(0, splitAt).trim();
  const applicantUserId = rest.slice(splitAt + 1).trim();
  if (!postId || !applicantUserId) return null;
  return { postId, applicantUserId };
}
