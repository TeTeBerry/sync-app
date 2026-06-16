import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import Taro from '@tarojs/taro';
import { searchBuddyPostsWithAi } from '../api/sync/posts';
import { ApiError } from '../utils/apiClient';
import { createMessageId } from './ai-chat/createMessageId';
import type { ChatUiMessage, RecommendedPostCard } from '../types/aiChat';
import type { EventDetailPost } from '../types/backend';
import { stripPostBodyContact } from '../utils/postBodyContact';

export function eventDetailPostsToRecommendedCards(
  posts: EventDetailPost[],
  activityLegacyId: number,
  activityTitle: string,
): RecommendedPostCard[] {
  const title = activityTitle.trim() || '本场活动';
  return posts.map((post) => ({
    postId: post.id,
    snippet: stripPostBodyContact(post.body),
    authorName: post.name?.trim() || '用户',
    authorAvatar: post.avatar,
    eventTitle: title,
    location: post.location,
    tags: post.tags,
    activityLegacyId,
  }));
}

export function buildBuddySearchReplyText(params: {
  searchTerms: string[];
  totalScanned: number;
  totalMatched: number;
}): string {
  const lines: string[] = [];
  if (params.searchTerms.length) {
    lines.push(`解析关键词：${params.searchTerms.join('、')}`);
  }
  lines.push(
    `在 ${params.totalScanned} 条公开结伴帖中找到 ${params.totalMatched} 条。`,
  );
  if (params.totalMatched === 0) {
    lines.push('暂无匹配结果，可调整描述后重试。');
  } else {
    lines.push('以下按发布时间从新到旧排列：');
  }
  return lines.join('\n');
}

export function buildBuddySearchWelcomeText(activityTitle?: string): string {
  const title = activityTitle?.trim();
  if (title) {
    return `描述你在「${title}」的结伴需求。我会拆解关键词，在全部公开结伴帖里筛选，结果按发布时间排序，不做个性化推荐。`;
  }
  return '请先点下方活动名绑定场次，再用自然语言描述结伴需求。';
}

export function useAiBuddySearchChat(options: {
  activityLegacyId?: number;
  activityTitle?: string;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  onMessagesUpdated?: () => void;
}) {
  const { activityLegacyId, activityTitle, setMessages, onMessagesUpdated } = options;
  const [buddySearchActive, setBuddySearchActive] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchingRef = useRef(false);

  const buddySearchWelcomeText = useMemo(
    () => buildBuddySearchWelcomeText(activityTitle),
    [activityTitle],
  );

  const enterBuddySearchMode = useCallback(() => {
    setBuddySearchActive(true);
    const welcome: ChatUiMessage = {
      id: createMessageId(),
      from: 'ai',
      text: buddySearchWelcomeText,
    };
    setMessages([welcome]);
    onMessagesUpdated?.();
  }, [buddySearchWelcomeText, onMessagesUpdated, setMessages]);

  const exitBuddySearchMode = useCallback(() => {
    setBuddySearchActive(false);
  }, []);

  const handleSearchSubmit = useCallback(
    async (text: string): Promise<boolean> => {
      if (!buddySearchActive || searchingRef.current) return false;

      const trimmed = text.trim();
      if (!trimmed) return true;

      if (
        activityLegacyId == null ||
        Number.isNaN(activityLegacyId) ||
        activityLegacyId <= 0
      ) {
        void Taro.showToast({ title: '请先绑定活动场次', icon: 'none' });
        return true;
      }

      searchingRef.current = true;
      setIsSearching(true);

      const userMsgId = createMessageId();
      const aiMsgId = createMessageId();
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, from: 'user', text: trimmed },
        { id: aiMsgId, from: 'ai', text: '', streaming: true },
      ]);
      onMessagesUpdated?.();

      try {
        const result = await searchBuddyPostsWithAi(trimmed, activityLegacyId);
        const searchTerms = result.parsed.searchTerms ?? [];
        const matchedPosts = eventDetailPostsToRecommendedCards(
          result.items,
          activityLegacyId,
          activityTitle ?? '',
        );
        const replyText = buildBuddySearchReplyText({
          searchTerms,
          totalScanned: result.totalScanned,
          totalMatched: result.totalMatched,
        });

        setMessages((prev) =>
          prev.map((message) =>
            message.id === aiMsgId
              ? {
                  ...message,
                  text: replyText,
                  streaming: false,
                  matchedPosts: matchedPosts.length ? matchedPosts : undefined,
                }
              : message,
          ),
        );
      } catch (error) {
        const fallback = '检索失败，请稍后重试。';
        let text = fallback;
        if (error instanceof ApiError) {
          if (error.status === 404) {
            text = '检索服务暂未上线，请稍后重试或联系管理员更新后端。';
          } else if (error.message.includes('超时')) {
            text = '检索超时，请稍后重试。';
          } else if (error.message.trim()) {
            text = error.message.trim();
          }
        }
        setMessages((prev) =>
          prev.map((message) =>
            message.id === aiMsgId
              ? {
                  ...message,
                  text,
                  streaming: false,
                }
              : message,
          ),
        );
      } finally {
        searchingRef.current = false;
        setIsSearching(false);
        onMessagesUpdated?.();
      }

      return true;
    },
    [
      activityLegacyId,
      activityTitle,
      buddySearchActive,
      onMessagesUpdated,
      setMessages,
    ],
  );

  return {
    buddySearchActive,
    isSearching,
    enterBuddySearchMode,
    exitBuddySearchMode,
    handleSearchSubmit,
  };
}
