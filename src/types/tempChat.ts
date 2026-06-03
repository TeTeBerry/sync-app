import type { PostApplicationStatus } from './backend';
import type { TeamApplyBuddyPreview } from '../utils/teamApplyBuddyPreview';

export type TempChatMessageRole = 'peer' | 'me';

export type TempChatPostRecruitmentStatus = '招募中' | '已组队';

export interface TempChatMessage {
  id: string;
  sessionId: string;
  role: TempChatMessageRole;
  body: string;
  createdAt: string;
}

export interface TempChatSession {
  id: string;
  /** Applicant on this team-apply thread (canonical thread key with postId). */
  applicantUserId: string;
  peerUserId: string;
  peerName: string;
  peerAvatar?: string;
  postId: string;
  postTitle: string;
  buddyInfo: TeamApplyBuddyPreview;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  applicationStatus: PostApplicationStatus;
  postRecruitmentStatus: TempChatPostRecruitmentStatus;
  activityLegacyId?: number;
  /** ISO — last day of the festival. */
  activityEndAt?: string;
  /** ISO — when this temp session is purged (event end + retention days). */
  destroysAt?: string;
  /** Post owner viewing the thread (default true for local-only mock). */
  isOwner?: boolean;
}

export type OpenTempChatSessionInput = {
  postId: string;
  postTitle: string;
  activityLegacyId?: number;
  /** Applicant user id (always the applicant, not the post owner). */
  applicantUserId: string;
  peerUserId: string;
  peerName: string;
  peerAvatar?: string;
  applicationMessage?: string;
  buddyInfo: TeamApplyBuddyPreview;
  applicationStatus?: PostApplicationStatus;
  postRecruitmentStatus?: TempChatPostRecruitmentStatus;
  isOwner?: boolean;
};
