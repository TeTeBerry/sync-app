import React, { useCallback, useMemo } from 'react';
import { Send, Trash2 } from '../../components/icons';
import { Button, Input, cn } from '../ui';
import {
  filterActiveHomeFestivalShortcutChips,
  resolveActiveActivityChipKey,
} from '../../constants/homeFestivalShortcuts';
import { useActivitiesQuery } from '../../hooks/sync/activities';
import {
  ScrollView,
  Text,
  View,
  type InputProps as TaroInputProps,
} from '@tarojs/components';

function readComposerInputValue(
  event: Parameters<NonNullable<TaroInputProps['onInput']>>[0],
): string {
  return event.detail?.value ?? '';
}

type ActivityChip = {
  key: string;
  label: string;
  keyword: string;
  active?: boolean;
};

export function ChatComposer({
  input,
  isStreaming,
  activityLegacyId,
  activityTitle,
  activityCode,
  onInputChange,
  onSubmit,
  onClearChat,
  clearDisabled = false,
  isLoadingHistory = false,
  onActivityChipClick,
}: {
  input: string;
  isStreaming: boolean;
  activityLegacyId?: number;
  activityTitle?: string;
  activityCode?: string;
  onInputChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onClearChat?: () => void | Promise<void>;
  clearDisabled?: boolean;
  isLoadingHistory?: boolean;
  onActivityChipClick?: (keyword: string) => void;
}) {
  const { data: activities } = useActivitiesQuery();

  const scopedToActivity = activityLegacyId != null && !Number.isNaN(activityLegacyId);
  const trimmedActivityTitle = activityTitle?.trim();

  const inputPlaceholder =
    scopedToActivity && trimmedActivityTitle
      ? `聊聊「${trimmedActivityTitle}」相关问题…`
      : '说说你想去哪、有什么想了解的…';

  const activityChips = useMemo((): ActivityChip[] => {
    const activeKey = resolveActiveActivityChipKey({
      activityLegacyId,
      activityCode,
      activityTitle: trimmedActivityTitle,
    });

    return filterActiveHomeFestivalShortcutChips(activities).map((chip) => ({
      key: chip.key,
      label: chip.label,
      keyword: chip.submitText,
      active: chip.key === activeKey,
    }));
  }, [activities, activityCode, activityLegacyId, trimmedActivityTitle]);

  const isBusy = isStreaming;
  const isComposerDisabled = isStreaming || isLoadingHistory;

  const handleActivityChipClick = useCallback(
    (chip: ActivityChip) => {
      if (isBusy) return;
      if (onActivityChipClick) {
        onActivityChipClick(chip.keyword);
        return;
      }
      onSubmit(chip.keyword);
    },
    [isBusy, onActivityChipClick, onSubmit],
  );

  const canSend = Boolean(input.trim()) && !isComposerDisabled;

  return (
    <>
      {activityChips.length > 0 ? (
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className="s-ai-assistant-chat__quick-scroll s-scrollbar-none"
        >
          <View className="s-ai-assistant-chat__quick-row">
            {activityChips.map((chip) => (
              <Button
                key={chip.key}
                className={cn(
                  's-ai-assistant-chat__quick-chip',
                  chip.active && 's-ai-assistant-chat__quick-chip--active',
                )}
                disabled={isBusy}
                onClick={() => handleActivityChipClick(chip)}
              >
                <Text className="s-btn-label">{chip.label}</Text>
              </Button>
            ))}
          </View>
        </ScrollView>
      ) : null}

      <View className="s-ai-assistant-chat__composer">
        <View className="s-ai-assistant-chat__composer-inner">
          <Input
            variant="ai-assistant-chat"
            type="text"
            value={input}
            disabled={isComposerDisabled}
            placeholder={inputPlaceholder}
            adjustPosition={false}
            cursorSpacing={12}
            confirmType="send"
            onInput={(e) => onInputChange(readComposerInputValue(e))}
            onConfirm={() => {
              if (canSend) onSubmit(input);
            }}
          />
          <Button
            className="s-ai-assistant-chat__clear-btn"
            disabled={clearDisabled}
            aria-label="清空对话"
            onClick={() => void onClearChat?.()}
          >
            <Trash2 size={16} color="#ef4444" />
          </Button>
          <Button
            className={cn(
              's-ai-assistant-chat__send',
              canSend && 's-ai-assistant-chat__send--active',
            )}
            disabled={!canSend}
            onClick={() => onSubmit(input)}
          >
            <Send size={16} />
          </Button>
        </View>
      </View>
    </>
  );
}
