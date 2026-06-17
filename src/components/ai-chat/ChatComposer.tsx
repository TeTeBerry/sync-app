import React, { useCallback } from 'react';
import { Send, Trash2 } from '../../components/icons';
import { Button, Input, cn } from '../ui';
import { useAiChatStore } from '../../stores/aiChatStore';
import { View, type InputProps as TaroInputProps } from '@tarojs/components';

function readComposerInputValue(
  event: Parameters<NonNullable<TaroInputProps['onInput']>>[0],
): string {
  return event.detail?.value ?? '';
}

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

  const isComposerDisabled = isStreaming || isLoadingHistory;
  const canSend = Boolean(input.trim()) && !isComposerDisabled;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    onSubmit(input);
  }, [canSend, input, onSubmit]);

  return (
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
  );
}
