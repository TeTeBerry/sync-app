/**
 * 组队业务全链路（前端编排层）：发帖 payload → 申请卡片匹配 → 申请 API 形状
 * 与后端 post-lifecycle-full-flow.spec 场景对齐，便于前后端联调回归。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreatePost = vi.fn();
const mockApplyToPost = vi.fn();

vi.mock('../api/sync/posts', () => ({
  createPost: (...args: unknown[]) => mockCreatePost(...args),
  applyToPost: (...args: unknown[]) => mockApplyToPost(...args),
}));

vi.mock('./postOwnership', () => ({
  isCurrentUserPostAuthor: (_name: string, userId?: string) => userId === 'applicant',
}));

import { publishBuddyPostFromForm } from './publishBuddyPost';
import { resolveUserBuddyPreviewForTargetPost } from './teamApplyBuddyPreview';
import { applyToPost } from '../api/sync/posts';
import type { EventDetailPost } from '../types/backend';

const ACTIVITY_ID = 4;

function hostPost(): EventDetailPost {
  return {
    id: 'post-host',
    userId: 'owner',
    name: '帖主',
    location: '上海',
    createdAt: '2026-06-01T10:00:00.000Z',
    body: '上海出发求拼车',
    tags: ['#拼车'],
    contentTypes: ['carpool'],
    likes: 0,
    comments: 0,
    avatar: '',
    status: '招募中',
  };
}

function applicantPost(
  id: string,
  overrides: Partial<EventDetailPost>,
): EventDetailPost {
  return {
    id,
    userId: 'applicant',
    name: '申请人',
    location: '上海',
    createdAt: '2026-06-01T09:00:00.000Z',
    body: '默认',
    tags: [],
    likes: 0,
    comments: 0,
    avatar: '',
    status: '招募中',
    ...overrides,
  };
}

describe('post lifecycle (frontend orchestration)', () => {
  beforeEach(() => {
    mockCreatePost.mockReset();
    mockApplyToPost.mockReset();
    mockCreatePost.mockImplementation(async (payload: { contentTypes?: string[] }) => ({
      id: payload.contentTypes?.includes('carpool')
        ? 'post-applicant-carpool'
        : 'post-applicant-team',
      name: '申请人',
      location: '上海',
      body: 'mock',
      tags: payload.contentTypes?.includes('carpool') ? ['#拼车'] : ['#组队'],
      contentTypes: payload.contentTypes,
      likes: 0,
      comments: 0,
      avatar: '',
      status: '招募中',
    }));
    mockApplyToPost.mockResolvedValue({ ok: true, alreadyApplied: false });
  });

  it('1–2: both users publish recruiting posts via REST payload', async () => {
    await publishBuddyPostFromForm({
      form: {
        dateStart: '2026-06-13',
        dateEnd: '2026-06-14',
        location: '上海',
        headcount: '2人',
        tags: ['carpool'],
        note: '拼车去场馆',
      },
      activityLegacyId: ACTIVITY_ID,
      activityTitle: '测试活动',
      authorName: '申请人',
    });

    expect(mockCreatePost).toHaveBeenCalledWith(
      expect.objectContaining({
        activityLegacyId: ACTIVITY_ID,
        contentTypes: ['carpool'],
        listedInFeed: true,
      }),
    );
  });

  it('3: apply sheet picks applicant carpool post when host seeks carpool', async () => {
    const host = hostPost();
    const feed = [
      host,
      applicantPost('post-team', {
        body: '找队友',
        tags: ['#组队'],
        contentTypes: ['team'],
      }),
      applicantPost('post-carpool', {
        body: '拼车同行',
        tags: ['#拼车'],
        contentTypes: ['carpool'],
      }),
    ];

    const preview = resolveUserBuddyPreviewForTargetPost(host, ACTIVITY_ID, feed, []);

    expect(preview?.body).toContain('拼车');
    expect(preview?.tags.some((t) => t.includes('拼车'))).toBe(true);
  });

  it('4: submit application calls POST applications with optional message', async () => {
    await applyToPost('post-host', { message: '你好，可以一起拼车吗？' });

    expect(mockApplyToPost).toHaveBeenCalledWith('post-host', {
      message: '你好，可以一起拼车吗？',
    });
  });
});
