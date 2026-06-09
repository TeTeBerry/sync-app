import React, { useCallback, useMemo, useState } from 'react';
import { Send, Trash2 } from '../../components/icons';
import { Button, Input, cn } from '../ui';
import { HOME_FESTIVAL_SHORTCUT_CHIPS } from '../../constants/homeFestivalShortcuts';
import {
  getTopAiShortcutTags,
  normalizeAiShortcutTag,
  recordAiShortcutTagUse,
  type AiShortcutTag,
} from '../../utils/aiShortcutTags';
import { useAiChatStore } from '../../stores/aiChatStore';
import { AiBuddyPostShortcutChip } from './AiBuddyPostShortcutChip';
import { AiGuideShortcutChip } from './AiGuideShortcutChip';
import { AiMatchQuotaBanner } from './AiMatchQuotaBanner';
import {
  ScrollView,
  Text,
  View,
  type InputProps as TaroInputProps,
} from '@tarojs/components';

const SHORTCUT_TAG_LABELS: Record<AiShortcutTag, string> = {
  找组队: '找组队',
  找拼房: '找拼房',
  找卡座: '找卡座',
};

const AI_GUIDE_CHIP = {
  key: 'aiGuide',
  label: 'AI攻略',
  submitText: 'AI攻略',
} as const;

const BUDDY_POST_CHIP = {
  key: 'buddyPost',
  label: '组队发帖',
  submitText: '组队发帖',
} as const;

const activityActionChips = [
  AI_GUIDE_CHIP,
  { key: 'searchPosts', label: '查组队帖', submitText: '看看有没有组队帖' },
] as const;

function readComposerInputValue(
  event: Parameters<NonNullable<TaroInputProps['onInput']>>[0],
): string {
  return event.detail?.value ?? '';
}

type QuickChip = {
  key: string;
  label: string;
  submitText: string;
  isShortcutTag?: boolean;
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
  onBuddyPostClick,
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
  onBuddyPostClick?: () => void;
}) {
  const [shortcutTags, setShortcutTags] = useState(() => getTopAiShortcutTags());
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
      return `为「${trimmedActivityTitle}」找组队…`;
    }
    return '说说你想去哪、想找什么样的同行…';
  })();

  const quickChips = useMemo((): QuickChip[] => {
    if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
      const tagChips: QuickChip[] = shortcutTags.map((tag) => {
        const label = SHORTCUT_TAG_LABELS[tag as AiShortcutTag] ?? tag;
        return {
          key: `tag-${tag}`,
          label,
          submitText: normalizeAiShortcutTag(tag),
          isShortcutTag: true,
        };
      });

      const actionChips: QuickChip[] = activityActionChips.map((chip) => ({
        key: chip.key,
        label: chip.label,
        submitText: chip.submitText,
      }));

      return [
        actionChips[0],
        {
          key: BUDDY_POST_CHIP.key,
          label: BUDDY_POST_CHIP.label,
          submitText: BUDDY_POST_CHIP.submitText,
        },
        ...tagChips,
        ...actionChips.slice(1),
      ];
    }

    return HOME_FESTIVAL_SHORTCUT_CHIPS.map((chip) => ({
      key: chip.key,
      label: chip.label,
      submitText: chip.submitText,
    }));
  }, [activityLegacyId, shortcutTags]);

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
      if (chip.key === BUDDY_POST_CHIP.key) {
        if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
          onBuddyPostClick?.();
          return;
        }
      }
      if (chip.isShortcutTag) {
        recordAiShortcutTagUse(chip.submitText);
        setShortcutTags(getTopAiShortcutTags());
      }
      onSubmit(chip.submitText);
    },
    [activityLegacyId, isBusy, onAiGuideClick, onBuddyPostClick, onSubmit],
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
            ) : chip.key === BUDDY_POST_CHIP.key ? (
              <AiBuddyPostShortcutChip
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

      <AiMatchQuotaBanner />

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
            onInput={(e) => onInputChange(readComposerInputValue(e))}
            onConfirm={() => onSubmit(input)}
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
