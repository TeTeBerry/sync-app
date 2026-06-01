/**
 * REST surface for sync backend. Implementation is split by domain under `api/sync/`.
 * Request identity (demo Query params) is centralized in `api/requestContext.ts`.
 */
export { loginWithDev, loginWithWechat } from '../utils/auth';
export * from './sync';
export type { FetchPostsByActivityPageOptions } from './sync/posts';
export {
  ownerQueryParams,
  mergeOwnerQueryParams,
  ownerQueryParamsWithActivity,
  resolveRequestUserId,
  type OwnerQueryParams,
} from './requestContext';
