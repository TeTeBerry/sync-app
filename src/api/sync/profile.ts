import { apiGet, apiPost } from '../../utils/apiClient';
import type {
  ConsumeProfileEntitlementPayload,
  ConsumeProfileEntitlementResult,
  EventPackageEntitlement,
  PackageCatalog,
  ProfileActivityItem,
  ProfilePostItem,
  ProfileSummary,
  PurchaseProfilePackagePayload,
  PurchaseProfilePackageResult,
} from '../../types/backend';
import { ownerQueryParams, ownerQueryParamsWithActivity } from '../requestContext';

export function fetchProfileSummary(activityLegacyId?: number) {
  return apiGet<ProfileSummary>(
    '/profile',
    ownerQueryParamsWithActivity(activityLegacyId),
  );
}

export function fetchProfilePackages() {
  return apiGet<PackageCatalog>('/profile/packages', ownerQueryParams());
}

export function fetchProfileEntitlements(activityLegacyId?: number) {
  return apiGet<EventPackageEntitlement[]>(
    '/profile/entitlements',
    ownerQueryParamsWithActivity(activityLegacyId),
  );
}

export function purchaseProfilePackage(payload: PurchaseProfilePackagePayload) {
  return apiPost<PurchaseProfilePackageResult>(
    '/profile/packages/purchase',
    payload,
    ownerQueryParams(),
  );
}

export function consumeProfileAiMatch(payload: ConsumeProfileEntitlementPayload) {
  return apiPost<ConsumeProfileEntitlementResult>(
    '/profile/entitlements/consume/ai-match',
    payload,
    ownerQueryParams(),
  );
}

export function consumeProfileContactUnlock(payload: ConsumeProfileEntitlementPayload) {
  return apiPost<ConsumeProfileEntitlementResult>(
    '/profile/entitlements/consume/contact-unlock',
    payload,
    ownerQueryParams(),
  );
}

export function fetchProfileActivities() {
  return apiGet<ProfileActivityItem[]>('/profile/activities', ownerQueryParams());
}

export function fetchProfilePosts() {
  return apiGet<ProfilePostItem[]>('/profile/posts', ownerQueryParams());
}

export function fetchUserPosts(ownerUserId: string, ownerAuthorName?: string) {
  const params: Record<string, string> = { userId: ownerUserId.trim() };
  const name = ownerAuthorName?.trim();
  if (name) {
    params.authorName = name;
  }
  return apiGet<ProfilePostItem[]>('/profile/posts', params);
}
