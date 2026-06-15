/**
 * Post-related types for UI and API layers.
 *
 * Source of truth for API shapes remains `types/backend.ts`.
 * Import post types from here in components, pages, and hooks — not from `pages/**`.
 */

export type {
  CreatePostPayload,
  EventDetailPost,
  EventPostsPage,
  HomeFeedPost,
  HomeFeedPostAuthorGender,
  PostContentType,
  ProfilePostItem,
} from './backend';
