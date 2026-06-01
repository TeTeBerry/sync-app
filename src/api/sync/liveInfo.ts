import { apiDelete, apiGet, apiPost } from '../../utils/apiClient';
import type {
  LiveInfoSnapshot,
  PublishLiveInfoPayload,
  SubmitLiveInfoWristbandPayload,
  SubmitLiveInfoWristbandResult,
} from '../../types/backend';
import { ownerQueryParams } from '../requestContext';
import { uploadImageFile } from '../../utils/uploadImage';

export function fetchLiveInfoSnapshot(activityLegacyId: number) {
  return apiGet<LiveInfoSnapshot>(
    `/activities/${activityLegacyId}/live-info`,
    ownerQueryParams(),
  );
}

export function uploadImage(filePath: string) {
  return uploadImageFile(filePath);
}

export function submitLiveInfoWristband(
  activityLegacyId: number,
  payload: SubmitLiveInfoWristbandPayload,
) {
  return apiPost<SubmitLiveInfoWristbandResult>(
    `/activities/${activityLegacyId}/live-info/wristband`,
    payload,
    ownerQueryParams(),
  );
}

export function clearLiveInfoWristband(activityLegacyId: number) {
  return apiDelete<{ ok: true; viewer: LiveInfoSnapshot['viewer'] }>(
    `/activities/${activityLegacyId}/live-info/wristband`,
    ownerQueryParams(),
  );
}

export function publishLiveInfoUpdate(
  activityLegacyId: number,
  payload: PublishLiveInfoPayload,
) {
  return apiPost<{ ok: true; update: LiveInfoSnapshot['feed'][number] }>(
    `/activities/${activityLegacyId}/live-info/updates`,
    payload,
    ownerQueryParams(),
  );
}

export function toggleLiveInfoUpdateLike(activityLegacyId: number, updateId: string) {
  return apiPost<{ ok: true; update: LiveInfoSnapshot['feed'][number] }>(
    `/activities/${activityLegacyId}/live-info/updates/${updateId}/like`,
    {},
    ownerQueryParams(),
  );
}
