import type { EventDetailPost } from '../backend';

/** Matches `contracts/post-mutation.contract.json` — unified write responses from POST mutations. */
export type PostMutationResponse = {
  post: EventDetailPost;
};

export function isPostMutationResponse(value: unknown): value is PostMutationResponse {
  if (!value || typeof value !== 'object') return false;
  const post = (value as PostMutationResponse).post;
  return (
    post != null &&
    typeof post === 'object' &&
    typeof post.id === 'string' &&
    typeof post.likes === 'number'
  );
}

/** Accept legacy bare post or wrapped `{ post }` during API migration. */
export function unwrapPostMutation(value: unknown): EventDetailPost {
  if (isPostMutationResponse(value)) return value.post;
  return value as EventDetailPost;
}
