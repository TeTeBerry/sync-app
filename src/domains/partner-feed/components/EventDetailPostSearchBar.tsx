import { Search, X } from '../../../components/icons';
import { Input } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

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
  const t = useT();
  const showMeta = value.trim().length > 0;

  return (
    <View className="s-event-detail-post-search">
      <View className="s-event-detail-post-search__field">
        <Search size={16} color="#8e8e93" aria-hidden />
        <Input
          className="s-event-detail-post-search__input"
          value={value}
          placeholder={t('eventDetail.searchPlaceholder')}
          placeholderClass="s-event-detail-post-search__placeholder"
          confirmType="search"
          onInput={(event) => onChange(event.detail.value)}
          onConfirm={() => undefined}
        />
        {value ? (
          <View
            className="s-event-detail-post-search__clear"
            onClick={onClear}
            aria-label={t('eventDetail.clearSearch')}
          >
            <X size={16} color="#8e8e93" aria-hidden />
          </View>
        ) : null}
      </View>
      {showMeta ? (
        <Text className="s-event-detail-post-search__meta">
          {isSearching
            ? t('eventDetail.searching')
            : usedLocalFallback
              ? t('eventDetail.localMatch', { count: matchedCount ?? 0 })
              : t('eventDetail.matchFound', { count: matchedCount ?? 0 })}
        </Text>
      ) : null}
    </View>
  );
}
