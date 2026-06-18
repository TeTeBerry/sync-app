import { ChevronUp } from '../icons';
import { Text, View } from '@tarojs/components';
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
  const detail = (() => {
    if (loading) {
      return { mode: 'loading' as const, text: '正在加载更早消息' };
    }
    if (hasHiddenMessages && hiddenCount > 0) {
      return { mode: 'count' as const, count: hiddenCount };
    }
    if (hasHiddenMessages || hasMoreHistory) {
      return { mode: 'plain' as const, text: '查看更早消息' };
    }
    return { mode: 'plain' as const, text: '查看更早消息' };
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
          ? '正在加载更早消息'
          : detail.mode === 'count'
            ? `查看更早的 ${detail.count} 条消息`
            : '查看更早消息'
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
            <Text className="s-chat-history-hint__action">上滑或点击</Text>
            <Text className="s-chat-history-hint__sep">·</Text>
            {detail.mode === 'count' ? (
              <Text className="s-chat-history-hint__label">
                还有
                <Text className="s-chat-history-hint__count">{detail.count}</Text>条
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
