import React, { memo, useCallback, useEffect, useState } from 'react';
import { Send, Trash2 } from '../../components/icons';
import { Button, Input, cn } from '../ui';
import { useAiChatStore } from '../../stores/aiChatStore';
import { AI_ASSISTANT_DISCLAIMER } from '../../constants/aiDisclosure';
import { useT } from '@/hooks/useI18n';
import { Text, View, type InputProps as TaroInputProps } from '@tarojs/components';

function readComposerInputValue(
  event: Parameters<NonNullable<TaroInputProps['onInput']>>[0],
): string {
  return event.detail?.value ?? '';
}

export const ChatComposer = memo(function ChatComposer({
  isStreaming,
  activityLegacyId,
  activityTitle,
  onSubmit,
  onClearChat,
  clearDisabled = false,
  resetKey = 0,
}: {
  isStreaming: boolean;
  activityLegacyId?: number;
  activityTitle?: string;
  onSubmit: (text: string) => void | Promise<void>;
  onClearChat?: () => void | Promise<void>;
  clearDisabled?: boolean;
  /** Bump after clear-chat so the local draft resets without lifting input state. */
  resetKey?: number;
}) {
  const [input, setInput] = useState('');
  const t = useT();

  useEffect(() => {
    setInput('');
  }, [resetKey]);

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
        ? t('ai.composerPlaceholderBound', { title: trimmedActivityTitle })
        : t('ai.composerPlaceholderUnbound');
    }
    if (scopedToActivity && trimmedActivityTitle) {
      return t('ai.composerPlaceholderActivity', { title: trimmedActivityTitle });
    }
    return t('ai.composerPlaceholderDefault');
  })();

  const isComposerDisabled = isStreaming;
  const canSend = Boolean(input.trim()) && !isComposerDisabled;

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isComposerDisabled) return;
    setInput('');
    void Promise.resolve(onSubmit(trimmed));
  }, [input, isComposerDisabled, onSubmit]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

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
          holdKeyboard
          confirmType="send"
          onInput={(e) => handleInputChange(readComposerInputValue(e))}
          onConfirm={handleSend}
        />
        <Button
          className="s-ai-assistant-chat__clear-btn"
          disabled={clearDisabled}
          aria-label={t('ai.clearConversation')}
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
      <Text className="s-ai-assistant-chat__composer-disclaimer">
        {AI_ASSISTANT_DISCLAIMER}
      </Text>
    </View>
  );
});
