import { Search, X } from '../../../components/icons';
import { Input } from '../../../components/ui';
import { Text, View } from '@tarojs/components';

type EventDetailPostSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  matchedCount?: number;
  usedLocalFallback?: boolean;
};

export function EventDetailPostSearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
  matchedCount,
  usedLocalFallback = false,
}: EventDetailPostSearchBarProps) {
  const showMeta = value.trim().length > 0;

  return (
    <View className="s-event-detail-post-search">
      <View className="s-event-detail-post-search__field">
        <Search size={16} color="#8e8e93" aria-hidden />
        <Input
          className="s-event-detail-post-search__input"
          value={value}
          placeholder="搜索日期、内容、标签或地点"
          placeholderClass="s-event-detail-post-search__placeholder"
          confirmType="search"
          onInput={(event) => onChange(event.detail.value)}
          onConfirm={() => undefined}
        />
        {value ? (
          <View
            className="s-event-detail-post-search__clear"
            onClick={onClear}
            aria-label="清除搜索"
          >
            <X size={16} color="#8e8e93" aria-hidden />
          </View>
        ) : null}
      </View>
      {showMeta ? (
        <Text className="s-event-detail-post-search__meta">
          {isSearching
            ? '搜索中…'
            : usedLocalFallback
              ? `已改为本地匹配，找到 ${matchedCount ?? 0} 条`
              : `找到 ${matchedCount ?? 0} 条匹配`}
        </Text>
      ) : null}
    </View>
  );
}
