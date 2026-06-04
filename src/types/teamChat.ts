import type { PostApplicationStatus } from './backend';
import type { TeamApplyBuddyPreview } from '../utils/teamApplyBuddyPreview';

export type TeamChatPostRecruitmentStatus = '招募中' | '已组队' | '已隐藏';

export type TeamChatMessageRole = 'peer' | 'me';

export interface TeamChatMessage {
  id: string;
  senderUserId: string;
  body: string;
  createdAt: string;
  role: TeamChatMessageRole;
}

export interface TeamChatSession {
  sessionId: string;
  postId: string;
  applicantUserId: string;
  postTitle: string;
  activityLegacyId?: number;
  activityEndAt?: string;
  destroysAt?: string;
  peerUserId: string;
  peerName: string;
  peerAvatar?: string;
  buddyPreview: TeamApplyBuddyPreview;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  applicationStatus: PostApplicationStatus;
  postRecruitmentStatus: TeamChatPostRecruitmentStatus;
  isOwner: boolean;
  canSendMessage: boolean;
  messagingHint?: string;
}
