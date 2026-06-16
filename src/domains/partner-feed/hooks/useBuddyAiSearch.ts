import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import { searchBuddyPostsWithAi } from '../../../api/sync/posts';
import { ApiError } from '../../../utils/apiClient';
import {
  normalizeEventPostList,
  type EventPostListItem,
} from '../utils/eventPostNormalize';

export const BUDDY_AI_SEARCH_EXAMPLE_QUERY =
  '比如：喜欢 Techno，白天在场，找 2 个同逛舞台的搭子';

export function useBuddyAiSearch(activityLegacyId?: number) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [resultItems, setResultItems] = useState<EventPostListItem[]>([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [totalScanned, setTotalScanned] = useState(0);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      void Taro.showToast({ title: '请输入检索需求', icon: 'none' });
      return;
    }
    if (
      activityLegacyId == null ||
      Number.isNaN(activityLegacyId) ||
      activityLegacyId <= 0
    ) {
      void Taro.showToast({ title: '请先绑定活动场次', icon: 'none' });
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchBuddyPostsWithAi(trimmed, activityLegacyId);
      setSearchTerms(result.parsed.searchTerms ?? []);
      setResultItems(normalizeEventPostList(result.items));
      setTotalMatched(result.totalMatched);
      setTotalScanned(result.totalScanned);
      setHasSearched(true);
    } catch (error) {
      const title =
        error instanceof ApiError && error.status === 404
          ? '检索服务暂未上线'
          : error instanceof ApiError && error.message.includes('超时')
            ? '检索超时，请稍后重试'
            : '检索失败，请稍后重试';
      void Taro.showToast({ title, icon: 'none' });
    } finally {
      setIsSearching(false);
    }
  }, [activityLegacyId, query]);

  const handleUseExample = useCallback(() => {
    setQuery(BUDDY_AI_SEARCH_EXAMPLE_QUERY);
  }, []);

  const resetSearch = useCallback(() => {
    setQuery('');
    setHasSearched(false);
    setSearchTerms([]);
    setResultItems([]);
    setTotalMatched(0);
    setTotalScanned(0);
  }, []);

  return {
    query,
    setQuery,
    isSearching,
    hasSearched,
    searchTerms,
    resultItems,
    totalMatched,
    totalScanned,
    handleSearch,
    handleUseExample,
    resetSearch,
    exampleQuery: BUDDY_AI_SEARCH_EXAMPLE_QUERY,
  };
}
