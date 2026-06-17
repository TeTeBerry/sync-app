import './AiGuidePlanSheet.scss';
import './AiActivityPickerSheet.scss';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, X } from '../icons';
import { Button } from '../ui';
import { ListState } from '../ListState';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import { useActivitiesQuery } from '../../hooks/sync/activities';
import { filterActivitiesForPicker } from '../../utils/filterActivitiesForPicker';
import type { BackendActivity } from '../../types/backend';
import { Input, ScrollView, Text, View } from '@tarojs/components';

function formatActivityMeta(activity: BackendActivity): string {
  const parts = [activity.date?.trim(), activity.location?.trim()].filter(Boolean);
  return parts.join(' · ');
}

export function AiActivityPickerSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (activity: BackendActivity) => void;
}) {
  useOverlayLock(open);
  const [query, setQuery] = useState('');
  const { data, isLoading, isError, refetch } = useActivitiesQuery({ enabled: open });

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const items = useMemo(() => filterActivitiesForPicker(data, query), [data, query]);

  if (!open) {
    return null;
  }

  return (
    <View
      className="s-overlay s-overlay--sheet s-ai-guide-plan-sheet s-ai-activity-picker-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-ai-guide-plan-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-activity-picker-title"
      >
        <View className="s-ai-guide-plan-sheet__handle" aria-hidden />
        <View className="s-ai-guide-plan-sheet__top">
          <View className="s-ai-guide-plan-sheet__title-row">
            <View className="s-ai-guide-plan-sheet__title-icon" aria-hidden>
              <CalendarDays size={16} color="#64d2ff" aria-hidden />
            </View>
            <Text
              id="ai-activity-picker-title"
              className="s-ai-guide-plan-sheet__title"
            >
              选择电音节
            </Text>
          </View>
          <Button
            className="s-ai-guide-plan-sheet__close"
            hoverClass="s-ai-guide-plan-sheet__close--pressed"
            aria-label="关闭"
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <View className="s-ai-activity-picker-sheet__search-wrap">
          <Input
            className="s-ai-activity-picker-sheet__search"
            type="text"
            value={query}
            placeholder="搜索活动名称"
            confirmType="search"
            onInput={(event) => setQuery(event.detail?.value ?? '')}
          />
        </View>

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-ai-activity-picker-sheet__scroll s-scrollbar-none"
        >
          <ListState
            isLoading={isLoading && !data}
            isError={isError}
            isEmpty={!isLoading && !isError && items.length === 0}
            loadingText="加载活动中…"
            errorText="活动列表加载失败"
            emptyText={query.trim() ? '没有匹配的活动' : '暂无进行中的活动'}
            onRetry={() => void refetch()}
            retryText="重试"
            stateClassName="s-ai-activity-picker-sheet__state"
          >
            <View className="s-ai-activity-picker-sheet__list">
              {items.map((activity) => {
                const meta = formatActivityMeta(activity);
                return (
                  <Button
                    key={activity.legacyId}
                    className="s-ai-activity-picker-sheet__row"
                    hoverClass="s-ai-activity-picker-sheet__row--pressed"
                    onClick={() => onSelect(activity)}
                  >
                    <Text className="s-ai-activity-picker-sheet__row-title">
                      {activity.name}
                    </Text>
                    {meta ? (
                      <Text className="s-ai-activity-picker-sheet__row-meta">
                        {meta}
                      </Text>
                    ) : null}
                  </Button>
                );
              })}
            </View>
          </ListState>
        </ScrollView>
      </View>
    </View>
  );
}
