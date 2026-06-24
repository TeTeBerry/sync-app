import { describe, expect, it } from 'vitest';
import {
  MAX_SET_VOTE_SELECTION,
  toggleSetVoteSelection,
} from '@/domains/set-vote/utils/setVoteSelection';

describe('setVoteSelection', () => {
  it('adds and removes selections', () => {
    const first = toggleSetVoteSelection([], 'a');
    expect(first.next).toEqual(['a']);

    const second = toggleSetVoteSelection(first.next, 'b');
    expect(second.next).toEqual(['a', 'b']);

    const removed = toggleSetVoteSelection(second.next, 'a');
    expect(removed.next).toEqual(['b']);
  });

  it('rejects selection beyond max', () => {
    const current = ['a', 'b', 'c'];
    const result = toggleSetVoteSelection(current, 'd', MAX_SET_VOTE_SELECTION);
    expect(result.rejected).toBe(true);
    expect(result.next).toEqual(current);
  });
});
