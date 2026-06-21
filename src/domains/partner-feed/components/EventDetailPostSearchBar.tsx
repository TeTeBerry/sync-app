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
  parsedSummary?: string | null;
};

export function EventDetailPostSearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
  matchedCount,
  usedLocalFallback = false,
  parsedSummary,
}: EventDetailPostSearchBarProps) {
  const t = useT();
  const showMeta = value.trim().length > 0;
  const parsedLine = parsedSummary?.trim();

  return (
    <View className="s-event-detail-post-search">
      <Text className="s-event-detail-post-search__kicker">
        {t('eventDetail.aiFindTeamKicker')}
      </Text>
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
        <View className="s-event-detail-post-search__meta-wrap">
          <Text className="s-event-detail-post-search__meta">
            {isSearching
              ? t('eventDetail.searching')
              : usedLocalFallback
                ? t('eventDetail.localMatch', { count: matchedCount ?? 0 })
                : t('eventDetail.matchFound', { count: matchedCount ?? 0 })}
          </Text>
          {!isSearching && parsedLine ? (
            <Text className="s-event-detail-post-search__parsed">
              {t('eventDetail.searchParsedLabel', { summary: parsedLine })}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
