/** Matches backend `team-chat-applicant-messaging.ts`. */
export const APPLICANT_MESSAGING_LIMIT_HINT =
  '对方回复你之前，24小时内最多只能发1条文字消息';

export const APPLICANT_MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000;

export type TeamChatMessageLike = {
  role: 'peer' | 'me';
  createdAt: string;
};

/** Client-side fallback when session API omits `canSendMessage`. */
export function canApplicantSendTeamChatMessage(input: {
  messages: TeamChatMessageLike[];
  canSendMessage?: boolean;
}): boolean {
  if (input.messages.some((message) => message.role === 'peer')) {
    return true;
  }

  if (input.canSendMessage !== undefined) {
    return input.canSendMessage;
  }

  const since = Date.now() - APPLICANT_MESSAGING_WINDOW_MS;
  const recentMine = input.messages.filter(
    (message) =>
      message.role === 'me' && new Date(message.createdAt).getTime() >= since,
  );
  return recentMine.length < 1;
}

export function applicantMessagingHint(input: {
  isOwner?: boolean;
  canSendMessage?: boolean;
  messagingHint?: string;
  messages: TeamChatMessageLike[];
}): string | undefined {
  if (input.isOwner) return undefined;
  if (input.messages.some((message) => message.role === 'peer')) {
    return undefined;
  }
  if (input.messagingHint) return input.messagingHint;
  const canSend = canApplicantSendTeamChatMessage({
    messages: input.messages,
    canSendMessage: input.canSendMessage,
  });
  return canSend ? undefined : APPLICANT_MESSAGING_LIMIT_HINT;
}
