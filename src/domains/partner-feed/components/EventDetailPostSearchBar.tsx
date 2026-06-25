import { Search, Sparkles, X } from '../../../components/icons';
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
  preferenceSummary?: string | null;
  hasPreferenceRanking?: boolean;
  travelGuidePrefillHint?: boolean;
};

export function EventDetailPostSearchBar({
  value,
  onChange,
  onClear,
  isSearching = false,
  matchedCount,
  usedLocalFallback = false,
  parsedSummary,
  preferenceSummary,
  hasPreferenceRanking = false,
  travelGuidePrefillHint = false,
}: EventDetailPostSearchBarProps) {
  const t = useT();
  const showMeta = value.trim().length > 0;
  const parsedLine = parsedSummary?.trim();
  const insightLine = preferenceSummary?.trim();
  const showPreferenceRanking =
    hasPreferenceRanking && !usedLocalFallback && !isSearching;
  const showPrefillHint = travelGuidePrefillHint && value.trim().length > 0;

  return (
    <View className="s-event-detail-post-search">
      <View
        className={
          showPrefillHint
            ? 's-event-detail-post-search__field s-event-detail-post-search__field--prefilled'
            : 's-event-detail-post-search__field'
        }
      >
        <View className="s-event-detail-post-search__badge" aria-hidden>
          <Sparkles size={10} color="#ff0066" strokeWidth={2.25} />
          <Text className="s-event-detail-post-search__badge-text">
            {t('eventDetail.aiFindTeamKicker')}
          </Text>
        </View>
        <View className="s-event-detail-post-search__field-divider" aria-hidden />
        <Search size={14} color="#8e8e93" aria-hidden />
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
      {showPrefillHint ? (
        <Text className="s-event-detail-post-search__prefill-hint">
          {t('eventDetail.searchTravelGuidePrefillHint')}
        </Text>
      ) : null}
      {showMeta ? (
        <View className="s-event-detail-post-search__meta-wrap">
          <Text className="s-event-detail-post-search__meta">
            {isSearching
              ? t('eventDetail.searching')
              : usedLocalFallback
                ? t('eventDetail.localMatch', { count: matchedCount ?? 0 })
                : showPreferenceRanking
                  ? t('eventDetail.matchFoundWithPrefs', { count: matchedCount ?? 0 })
                  : t('eventDetail.matchFound', { count: matchedCount ?? 0 })}
          </Text>
          {!isSearching && insightLine ? (
            <Text className="s-event-detail-post-search__insight">
              {t('eventDetail.preferenceInsightLabel', { summary: insightLine })}
            </Text>
          ) : null}
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
