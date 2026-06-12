import { useState } from 'react';
import { Search, X } from '../../../components/icons';
import { useOverlayLock } from '../../../hooks/useOverlayLock';
import { Button, Input } from '../../../components/ui';
import { Text, View } from '@tarojs/components';

type EventDetailBoardSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
};

export function EventDetailBoardSearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
}: EventDetailBoardSearchBarProps) {
  const [inputFocused, setInputFocused] = useState(false);
  useOverlayLock(inputFocused);

  const trimmed = value.trim();
  const showSummary =
    trimmed.length > 0 &&
    typeof resultCount === 'number' &&
    typeof totalCount === 'number';

  return (
    <View className="s-event-detail-board-search">
      <View className="s-event-detail-board-search__field">
        <Search
          size={16}
          color="#8e8e93"
          className="s-event-detail-board-search__icon"
        />
        <Input
          className="s-event-detail-board-search__input"
          value={value}
          placeholder="搜索留言、昵称、标签…"
          confirmType="search"
          onInput={(event) => onChange(event.detail.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
        {trimmed ? (
          <Button
            className="s-event-detail-board-search__clear"
            aria-label="清空搜索"
            onClick={() => onChange('')}
          >
            <X size={14} color="#8e8e93" aria-hidden />
          </Button>
        ) : null}
      </View>
      {showSummary ? (
        <Text className="s-event-detail-board-search__summary">
          找到 {resultCount} / {totalCount} 条留言
        </Text>
      ) : null}
    </View>
  );
}
