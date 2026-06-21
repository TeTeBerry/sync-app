import { useCallback, useEffect, useState } from 'react';
import {
  addPostComment,
  deletePost,
  deletePostComment,
  fetchPostComments,
} from '../../api/sync/posts';
import type { PostCommentItem } from '../../types/backend';
import { POST_COMMENTS_PAGE_SIZE } from '../../constants/listPerf';
import { removePostFromCaches } from '../../cache/postCache';
import { invalidateAllPosts } from '../../utils/queryInvalidation';
import { STALE_POST_COMMENTS_MS } from '../../constants/queryCache';
import { invalidateCache, useApiQuery } from '../useApiQuery';
import { isLiveApi } from '../../constants/api';

export async function invalidatePostQueries() {
  await invalidateAllPosts();
}

export async function deletePostAndInvalidate(postId: string) {
  await deletePost(postId);
  removePostFromCaches(postId);
  await invalidatePostQueries();
}

export function usePostCommentsQuery(postId: string, enabled: boolean) {
  const apiEnabled = isLiveApi();
  const queryEnabled = apiEnabled && enabled && Boolean(postId);
  const [extraItems, setExtraItems] = useState<PostCommentItem[]>([]);
  const [tailCursor, setTailCursor] = useState<string | undefined>();
  const [tailHasMore, setTailHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const query = useApiQuery({
    queryKey: ['posts', postId, 'comments'],
    queryFn: () => fetchPostComments(postId, { limit: POST_COMMENTS_PAGE_SIZE }),
    enabled: queryEnabled,
    staleTime: STALE_POST_COMMENTS_MS,
  });

  useEffect(() => {
    setExtraItems([]);
    setTailCursor(undefined);
    setTailHasMore(false);
  }, [postId]);

  useEffect(() => {
    setExtraItems([]);
    setTailCursor(undefined);
    setTailHasMore(false);
  }, [query.data]);

  const hasMore = extraItems.length > 0 ? tailHasMore : (query.data?.hasMore ?? false);

  const loadMore = useCallback(async () => {
    if (!queryEnabled || loadingMore || !hasMore) return;
    const cursor = extraItems.length > 0 ? tailCursor : query.data?.nextCursor;
    if (!cursor) return;

    setLoadingMore(true);
    try {
      const page = await fetchPostComments(postId, {
        limit: POST_COMMENTS_PAGE_SIZE,
        cursor,
      });
      setExtraItems((prev) => [...prev, ...page.items]);
      setTailCursor(page.nextCursor);
      setTailHasMore(page.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [
    extraItems.length,
    hasMore,
    loadingMore,
    postId,
    query.data?.nextCursor,
    queryEnabled,
    tailCursor,
  ]);

  const items = [...(query.data?.items ?? []), ...extraItems];

  return {
    ...query,
    data: items,
    hasMore,
    loadingMore,
    loadMore,
  };
}

export function invalidatePostComments(postId: string) {
  invalidateCache(['posts', postId, 'comments']);
}

export async function commentPostAndInvalidate(
  postId: string,
  body: string,
  parentCommentId?: string,
) {
  const updated = await addPostComment(postId, body, parentCommentId);
  invalidatePostComments(postId);
  return updated;
}

export async function deleteCommentAndInvalidate(postId: string, commentId: string) {
  const updated = await deletePostComment(postId, commentId);
  invalidatePostComments(postId);
  return updated;
}
