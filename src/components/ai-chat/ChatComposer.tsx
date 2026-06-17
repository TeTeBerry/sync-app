import React, { useCallback, useMemo } from 'react';
import { ImagePlus, Send, Trash2, X } from '../../components/icons';
import { Button, Input, cn } from '../ui';
import {
  filterActiveHomeFestivalShortcutChips,
  resolveActiveActivityChipKey,
} from '../../constants/homeFestivalShortcuts';
import { useActivitiesQuery } from '../../hooks/sync/activities';
import { useAiChatStore } from '../../stores/aiChatStore';
import { openSingleImagePreview } from '../../utils/openImagePreview';
import {
  ScrollView,
  Text,
  View,
  Image,
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
  pendingImages,
  isStreaming,
  activityLegacyId,
  activityTitle,
  activityCode,
  activeChipKey,
  onInputChange,
  onSubmit,
  onPickImages,
  onRemoveImage,
  onClearChat,
  clearDisabled = false,
  isLoadingHistory = false,
  onActivityChipClick,
}: {
  input: string;
  pendingImages?: string[];
  isStreaming: boolean;
  activityLegacyId?: number;
  activityTitle?: string;
  activityCode?: string;
  activeChipKey?: string;
  onInputChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onPickImages?: () => void;
  onRemoveImage?: (index: number) => void;
  onClearChat?: () => void | Promise<void>;
  clearDisabled?: boolean;
  isLoadingHistory?: boolean;
  onActivityChipClick?: (keyword: string) => void;
}) {
  const conversationFlow = useAiChatStore((state) =>
    state.activeScopeKey
      ? state.buckets[state.activeScopeKey]?.conversationState?.flow
      : undefined,
  );
  const { data: activities } = useActivitiesQuery();
  const attachments = pendingImages ?? [];

  const scopedToActivity = activityLegacyId != null && !Number.isNaN(activityLegacyId);
  const trimmedActivityTitle = activityTitle?.trim();

  const inputPlaceholder = (() => {
    if (attachments.length > 0) {
      return '补充说明（可选）';
    }
    if (conversationFlow === 'collect_post_body') {
      return scopedToActivity && trimmedActivityTitle
        ? `描述你在「${trimmedActivityTitle}」的组队需求…`
        : '描述你的组队需求，如出发地、人数、日期…';
    }
    if (scopedToActivity && trimmedActivityTitle) {
      return `聊聊「${trimmedActivityTitle}」相关问题…`;
    }
    return '说说你想去哪、有什么想了解的…';
  })();

  const activityChips = useMemo((): ActivityChip[] => {
    const resolvedActiveKey =
      activeChipKey ??
      resolveActiveActivityChipKey({
        activityLegacyId,
        activityCode,
        activityTitle: trimmedActivityTitle,
      });

    return filterActiveHomeFestivalShortcutChips(activities).map((chip) => ({
      key: chip.key,
      label: chip.label,
      keyword: chip.submitText,
      active: chip.key === resolvedActiveKey,
    }));
  }, [activeChipKey, activities, activityCode, activityLegacyId, trimmedActivityTitle]);

  const isBusy = isStreaming;
  const isComposerDisabled = isStreaming || isLoadingHistory;
  const canSend =
    (Boolean(input.trim()) || attachments.length > 0) && !isComposerDisabled;

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

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSubmit(input);
  }, [canSend, input, onSubmit]);

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
        {attachments.length > 0 ? (
          <View className="s-ai-assistant-chat__attach-preview-list">
            {attachments.map((src, index) => (
              <View
                key={`${src}-${index}`}
                className="s-ai-assistant-chat__attach-thumb"
              >
                <Button
                  className="s-ai-assistant-chat__attach-preview-btn"
                  onClick={() => openSingleImagePreview(src)}
                >
                  <Image
                    className="s-ai-assistant-chat__attach-preview-image"
                    src={src}
                    mode="aspectFill"
                  />
                </Button>
                <Button
                  className="s-ai-assistant-chat__attach-remove"
                  disabled={isComposerDisabled}
                  aria-label="移除图片"
                  onClick={() => onRemoveImage?.(index)}
                >
                  <X size={12} color="#fff" />
                </Button>
              </View>
            ))}
          </View>
        ) : null}

        <View className="s-ai-assistant-chat__composer-inner">
          <Button
            className="s-ai-assistant-chat__attach-btn"
            disabled={isComposerDisabled || !onPickImages}
            aria-label="添加图片"
            onClick={() => onPickImages?.()}
          >
            <ImagePlus size={18} />
          </Button>
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
            onConfirm={handleSend}
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
            onClick={handleSend}
          >
            <Send size={16} />
          </Button>
        </View>
      </View>
    </>
  );
}
