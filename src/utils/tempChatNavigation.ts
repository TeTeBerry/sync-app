import type {
  EventDetailPost,
  PostApplicationItem,
  ProfilePostItem,
} from '../types/backend';
import type { TeamApplyBuddyPreview } from './teamApplyBuddyPreview';
import { getClientUserId } from './session';
import { useTempChatStore } from '../stores/tempChatStore';
import { buildTeamChatSessionId } from './teamChatSessionId';
import { buddyPreviewFromEventPost } from './teamApplyBuddyPreview';
import { resolveApplicantBuddyInfo } from './tempChatApplicantBuddy';

function resolveApplicationBuddyPreview(
  application: PostApplicationItem,
): TeamApplyBuddyPreview {
  return application.buddyPreview ?? resolveApplicantBuddyInfo(application.userId);
}

/** Post owner opens chat with an applicant (mock / local path). */
export function openTempChatWithApplicant(
  post: Pick<ProfilePostItem, 'id' | 'title' | 'status' | 'activityLegacyId'>,
  application: PostApplicationItem,
): string {
  useTempChatStore.getState().hydrate();
  return useTempChatStore.getState().openSessionFromApplication({
    postId: post.id,
    postTitle: post.title,
    activityLegacyId: post.activityLegacyId,
    applicantUserId: application.userId,
    peerUserId: application.userId,
    peerName: application.name,
    peerAvatar: application.avatar,
    applicationMessage: application.message,
    buddyInfo: resolveApplicationBuddyPreview(application),
    applicationStatus: application.status,
    postRecruitmentStatus: post.status === '已组队' ? '已组队' : '招募中',
    isOwner: true,
  });
}

/** Applicant opens chat with the post owner (mock / local path). */
export function openTempChatAsApplicant(
  post: EventDetailPost,
  activityLegacyId: number,
): string {
  const applicantUserId = getClientUserId().trim();
  useTempChatStore.getState().hydrate();
  return useTempChatStore.getState().openSessionFromApplication({
    postId: post.id,
    postTitle: post.body.trim().slice(0, 32) || '组队帖',
    activityLegacyId,
    applicantUserId,
    peerUserId: post.userId ?? '',
    peerName: post.name,
    peerAvatar: post.avatar,
    applicationMessage: undefined,
    buddyInfo: buddyPreviewFromEventPost(post),
    applicationStatus: 'pending',
    postRecruitmentStatus: post.status === '招募中' ? '招募中' : '已组队',
    isOwner: false,
  });
}

export function buildTempChatRouteSessionId(
  postId: string,
  applicantUserId: string,
): string {
  return buildTeamChatSessionId(postId, applicantUserId);
}
