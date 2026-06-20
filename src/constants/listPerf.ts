/** Event detail posts: render window before loading next API page. */
export const EVENT_POSTS_INITIAL_RENDER = 6;

export const EVENT_POSTS_RENDER_STEP = 6;

/** Max post cards mounted at once (sliding window). */
export const EVENT_POSTS_MAX_MOUNTED = 12;

/** Items above/below scroll focal index inside the sliding window. */
export const EVENT_POSTS_SLIDE_BUFFER = 3;

/** Rough px height per post card for scroll focal estimation. */
export const EVENT_POST_ESTIMATED_HEIGHT_PX = 320;

/** Comments: initial visible rows before local window growth. */
export const POST_COMMENTS_INITIAL_RENDER = 8;

export const POST_COMMENTS_RENDER_STEP = 8;

export const POST_COMMENTS_MAX_VISIBLE = 24;

/** Profile / notification lists: initial mount window. */
export const PROFILE_LIST_INITIAL_RENDER = 8;

export const PROFILE_LIST_RENDER_STEP = 8;

export const PROFILE_LIST_MAX_VISIBLE = 32;

/** Nested replies shown before "show more replies". */
export const POST_COMMENT_REPLIES_PREVIEW = 3;

/** Comments loaded per page on post detail. */
export const POST_COMMENTS_PAGE_SIZE = 20;
