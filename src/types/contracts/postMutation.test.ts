import { describe, expect, it } from 'vitest';
import { isPostMutationResponse, unwrapPostMutation } from './postMutation';

describe('postMutation contract helpers', () => {
  it('unwrapPostMutation accepts wrapped response', () => {
    const post = {
      id: 'p1',
      likes: 2,
      liked: true,
      comments: 0,
      body: 'hi',
    };
    expect(unwrapPostMutation({ post })).toEqual(post);
  });

  it('unwrapPostMutation accepts legacy bare post', () => {
    const post = { id: 'p1', likes: 1, liked: false, comments: 3 };
    expect(unwrapPostMutation(post)).toEqual(post);
  });

  it('isPostMutationResponse validates shape', () => {
    expect(
      isPostMutationResponse({
        post: { id: 'a', likes: 0, liked: false, comments: 0 },
      }),
    ).toBe(true);
    expect(isPostMutationResponse({ id: 'a', likes: 0 })).toBe(false);
  });
});
