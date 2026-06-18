/**
 * REST surface for sync backend. Implementation is split by domain under `api/sync/`.
 * Request identity is centralized in `api/requestContext.ts` (Bearer via `getAuthHeaders`).
 */
export * from './sync';
export type { FetchPostsByActivityPageOptions } from './sync/posts';
export {
  ownerQueryParams,
  mergeOwnerQueryParams,
  resolveRequestUserId,
  type OwnerQueryParams,
} from './requestContext';
