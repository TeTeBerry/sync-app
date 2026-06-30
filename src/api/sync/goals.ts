import { apiDelete, apiGet, apiPost } from '../../utils/apiClient';
import { ownerQueryParams } from '../requestContext';

export type UserGoalKind = 'watch_lineup';

export type UserGoalStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface UserGoalParams {
  notifyWechat?: boolean;
  draftRecruitOnLineup?: boolean;
  departureCity?: string;
}

export interface UserGoal {
  _id: string;
  userId: string;
  activityLegacyId: number;
  kind: UserGoalKind;
  status: UserGoalStatus;
  params?: UserGoalParams;
  lastRunAt?: string;
  lastResult?: {
    changeSummary?: string;
    artifactId?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type CreateUserGoalPayload = {
  activityLegacyId: number;
  kind: UserGoalKind;
  params?: UserGoalParams;
};

export function createUserGoal(payload: CreateUserGoalPayload) {
  return apiPost<UserGoal>('/goals', payload, ownerQueryParams());
}

export function fetchUserGoals(activityLegacyId?: number) {
  const query =
    activityLegacyId != null && Number.isFinite(activityLegacyId)
      ? { activityLegacyId: String(activityLegacyId) }
      : undefined;
  return apiGet<UserGoal[]>('/goals', query, ownerQueryParams());
}

export function fetchGoalArtifact(artifactId: string) {
  return apiGet<{
    artifactId: string;
    payload?: {
      candidates?: Array<{ id: string; text: string }>;
      disclaimer?: string;
    };
  }>(
    `/goals/artifacts/${encodeURIComponent(artifactId)}`,
    undefined,
    ownerQueryParams(),
  );
}

export function deleteUserGoal(goalId: string) {
  return apiDelete<void>(`/goals/${encodeURIComponent(goalId)}`, ownerQueryParams());
}
