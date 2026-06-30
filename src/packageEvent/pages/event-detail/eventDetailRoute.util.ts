export function parseEventDetailRouteFlags(params: Record<string, string | undefined>) {
  return {
    highlightPostId: params.postId?.trim() ?? '',
    focusPostsOnMount: params.focusPosts === '1',
    openBuddyPostOnMount: params.openBuddyPost === '1' || params.openBuddySheet === '1',
    openCommentsOnMount: params.openComments === '1',
    openGuideOnMount: params.openGuide === '1',
    artifactId: params.artifactId?.trim() ?? '',
  };
}

export function shouldWarmEventDetailAi(deferredReady: boolean): boolean {
  return deferredReady;
}
