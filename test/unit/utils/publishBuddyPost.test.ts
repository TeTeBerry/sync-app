import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreatePost = vi.fn();

vi.mock('@/api/sync/posts', () => ({
  createPost: (...args: unknown[]) => mockCreatePost(...args),
}));

import type { AiBuddyPostFormValues } from '@/types/buddyPost';
import { publishBuddyPostFromForm } from '@/utils/publishBuddyPost';

describe('publishBuddyPostFromForm', () => {
  beforeEach(() => {
    mockCreatePost.mockReset();
    mockCreatePost.mockResolvedValue({
      id: 'post-1',
      name: '风暴电音节',
      location: '上海',
      body: 'mock',
      tags: ['#组队'],
      likes: 0,
      comments: 0,
      avatar: '',
    });
  });

  it('calls createPost with structured payload from form', async () => {
    const form: AiBuddyPostFormValues = {
      dateStart: '2026-06-13',
      dateEnd: '2026-06-14',
      location: '上海',
      headcount: '2人',
      tags: ['team', 'accommodation'],
      note: '',
    };

    const { card } = await publishBuddyPostFromForm({
      form,
      activityLegacyId: 9,
      activityTitle: '风暴电音节',
      authorName: 'Berry',
      authorAvatar: 'av.png',
    });

    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        activityLegacyId: 9,
        eventTitle: '风暴电音节',
        location: '上海',
        tags: ['#组队', '#拼房'],
        contentTypes: ['team', 'accommodation'],
        body: expect.stringMatching(/组队、拼房，6\.13-6\.14，上海，2人/),
      }),
    );
    expect(card.postId).toBe('post-1');
    expect(card.authorName).toBe('Berry');
    expect(card.activityLegacyId).toBe(9);
  });
});
