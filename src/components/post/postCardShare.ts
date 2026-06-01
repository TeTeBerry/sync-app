import type { PostSharePayload } from '../../utils/postShare';

export type BuildPostSharePayloadInput = {
  postId: string;
  activityLegacyId?: number;
  body?: string;
  eventTitle?: string;
  authorName?: string;
  images?: string[];
  avatar?: string;
};

export function buildPostSharePayload(
  input: BuildPostSharePayloadInput,
): PostSharePayload {
  return {
    postId: input.postId,
    activityLegacyId: input.activityLegacyId,
    body: input.body,
    eventTitle: input.eventTitle,
    authorName: input.authorName,
    images: input.images,
    imageUrl: input.images?.[0] ?? input.avatar,
  };
}
