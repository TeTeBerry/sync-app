/**
 * REST surface for sync backend. Implementation is split by domain under `api/sync/`.
 * Request identity (demo Query params) is centralized in `api/requestContext.ts`.
 */
export * from './sync';
export type { FetchPostsByActivityPageOptions } from './sync/posts';
export {
  ownerQueryParams,
  mergeOwnerQueryParams,
  resolveRequestUserId,
  type OwnerQueryParams,
} from './requestContext';
