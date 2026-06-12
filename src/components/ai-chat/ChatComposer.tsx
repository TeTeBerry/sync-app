import React, { useCallback, useMemo } from 'react';
import { Send, Trash2 } from '../../components/icons';
import { Button, Input, cn } from '../ui';
import { HOME_FESTIVAL_SHORTCUT_CHIPS } from '../../constants/homeFestivalShortcuts';
import { useAiChatStore } from '../../stores/aiChatStore';
import { BUDDY_POST_TAG_OPTIONS } from '../../types/buddyPost';
import type { BuddyPostTagId } from '../../types/buddyPost';
import { AiGuideShortcutChip } from './AiGuideShortcutChip';
import {
  ScrollView,
  Text,
  View,
  type InputProps as TaroInputProps,
} from '@tarojs/components';

const AI_GUIDE_CHIP = {
  key: 'aiGuide',
  label: 'AI出行攻略',
  submitText: 'AI出行攻略',
} as const;

function readComposerInputValue(
  event: Parameters<NonNullable<TaroInputProps['onInput']>>[0],
): string {
  return event.detail?.value ?? '';
}

type QuickChip = {
  key: string;
  label: string;
  submitText: string;
  buddyPostTagId?: BuddyPostTagId;
};

export function ChatComposer({
  input,
  isStreaming,
  activityLegacyId,
  activityTitle,
  onInputChange,
  onSubmit,
  onClearChat,
  clearDisabled = false,
  isLoadingHistory = false,
  onAiGuideClick,
  onBuddyPostTagClick,
}: {
  input: string;
  isStreaming: boolean;
  activityLegacyId?: number;
  activityTitle?: string;
  onInputChange: (value: string) => void;
  onSubmit: (text: string) => void;
  onClearChat?: () => void | Promise<void>;
  clearDisabled?: boolean;
  isLoadingHistory?: boolean;
  onAiGuideClick?: () => void;
  onBuddyPostTagClick?: (tagId: BuddyPostTagId) => void;
}) {
  const conversationFlow = useAiChatStore((state) =>
    state.activeScopeKey
      ? state.buckets[state.activeScopeKey]?.conversationState?.flow
      : undefined,
  );

  const scopedToActivity = activityLegacyId != null && !Number.isNaN(activityLegacyId);
  const trimmedActivityTitle = activityTitle?.trim();

  const inputPlaceholder = (() => {
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

  const quickChips = useMemo((): QuickChip[] => {
    if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
      return [
        {
          key: AI_GUIDE_CHIP.key,
          label: AI_GUIDE_CHIP.label,
          submitText: AI_GUIDE_CHIP.submitText,
        },
        ...BUDDY_POST_TAG_OPTIONS.map((opt) => ({
          key: `buddy-${opt.id}`,
          label: opt.label,
          submitText: opt.label,
          buddyPostTagId: opt.id,
        })),
      ];
    }

    return HOME_FESTIVAL_SHORTCUT_CHIPS.map((chip) => ({
      key: chip.key,
      label: chip.label,
      submitText: chip.submitText,
    }));
  }, [activityLegacyId]);

  const isBusy = isStreaming;
  const isComposerDisabled = isStreaming || isLoadingHistory;

  const handleQuickChipClick = useCallback(
    (chip: QuickChip) => {
      if (isBusy) return;
      if (chip.key === AI_GUIDE_CHIP.key) {
        if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
          onAiGuideClick?.();
          return;
        }
      }
      if (chip.buddyPostTagId) {
        onBuddyPostTagClick?.(chip.buddyPostTagId);
        return;
      }
      onSubmit(chip.submitText);
    },
    [activityLegacyId, isBusy, onAiGuideClick, onBuddyPostTagClick, onSubmit],
  );

  const canSend = Boolean(input.trim()) && !isComposerDisabled;

  return (
    <>
      <ScrollView
        scrollX
        enhanced
        showScrollbar={false}
        className="s-ai-assistant-chat__quick-scroll s-scrollbar-none"
      >
        <View className="s-ai-assistant-chat__quick-row">
          {quickChips.map((chip) =>
            chip.key === AI_GUIDE_CHIP.key ? (
              <AiGuideShortcutChip
                key={chip.key}
                disabled={isBusy}
                onClick={() => handleQuickChipClick(chip)}
              />
            ) : (
              <Button
                key={chip.key}
                className="s-ai-assistant-chat__quick-chip"
                disabled={isBusy}
                onClick={() => handleQuickChipClick(chip)}
              >
                <Text className="s-btn-label">{chip.label}</Text>
              </Button>
            ),
          )}
        </View>
      </ScrollView>

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
