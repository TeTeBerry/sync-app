import { ChevronUp } from '../icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import './ChatHistoryHint.scss';

export type ChatHistoryHintProps = {
  loading: boolean;
  hiddenCount: number;
  hasHiddenMessages: boolean;
  hasMoreHistory: boolean;
  onPress: () => void;
};

export function ChatHistoryHint({
  loading,
  hiddenCount,
  hasHiddenMessages,
  hasMoreHistory,
  onPress,
}: ChatHistoryHintProps) {
  const t = useT();
  const detail = (() => {
    if (loading) {
      return { mode: 'loading' as const, text: t('common.loadingMore') };
    }
    if (hasHiddenMessages && hiddenCount > 0) {
      return { mode: 'count' as const, count: hiddenCount };
    }
    if (hasHiddenMessages || hasMoreHistory) {
      return { mode: 'plain' as const, text: t('common.viewMore') };
    }
    return { mode: 'plain' as const, text: t('common.viewMore') };
  })();

  return (
    <View
      className={['s-chat-history-hint', loading && 's-chat-history-hint--loading']
        .filter(Boolean)
        .join(' ')}
      onClick={onPress}
      role="button"
      aria-label={
        loading
          ? t('common.loadingMore')
          : detail.mode === 'count'
            ? t('common.viewMoreWithCount', { count: detail.count })
            : t('common.viewMore')
      }
    >
      <View className="s-chat-history-hint__icon" aria-hidden>
        <ChevronUp size={14} color="#8e8e93" />
      </View>
      <View className="s-chat-history-hint__text">
        {detail.mode === 'loading' ? (
          <Text className="s-chat-history-hint__loading">{detail.text}</Text>
        ) : (
          <>
            <Text className="s-chat-history-hint__action">
              {t('common.swipeUpOrClick')}
            </Text>
            <Text className="s-chat-history-hint__sep">·</Text>
            {detail.mode === 'count' ? (
              <Text className="s-chat-history-hint__label">
                {t('common.andMore')}
                <Text className="s-chat-history-hint__count">{detail.count}</Text>
                {t('common.viewMore')}
              </Text>
            ) : (
              <Text className="s-chat-history-hint__label">{detail.text}</Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}
