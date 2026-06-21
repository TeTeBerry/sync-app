import './AiAssistantChatCollapse.scss';
import { useEffect, useState, type FC, type ReactNode } from 'react';
import { Button, cn } from '@/components/ui';
import { ChevronDown, ChevronUp } from '@/components/icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import {
  isChatSectionCollapsible,
  resolveDefaultChatExpanded,
} from './aiAssistantChatCollapse.util';
import { ChatCollapseExpandedProvider } from './chatCollapseExpandedContext';

export { AI_CHAT_COLLAPSED_PX } from './aiAssistantChatCollapse.util';

type AiAssistantChatCollapseProps = {
  activityLegacyId?: number;
  onLayoutChange?: () => void;
  children: ReactNode;
};

export const AiAssistantChatCollapse: FC<AiAssistantChatCollapseProps> = ({
  activityLegacyId,
  onLayoutChange,
  children,
}) => {
  const t = useT();
  const collapsible = isChatSectionCollapsible(activityLegacyId);
  const [expanded, setExpanded] = useState(() =>
    resolveDefaultChatExpanded(activityLegacyId),
  );

  useEffect(() => {
    setExpanded(resolveDefaultChatExpanded(activityLegacyId));
  }, [activityLegacyId]);

  useEffect(() => {
    if (!collapsible) return;
    onLayoutChange?.();
  }, [collapsible, expanded, onLayoutChange]);

  if (!collapsible) {
    return (
      <ChatCollapseExpandedProvider expanded>
        <View className="s-ai-assistant-chat-collapse s-ai-assistant-chat-collapse--bare">
          <View className="s-ai-assistant-chat-collapse__messages">{children}</View>
        </View>
      </ChatCollapseExpandedProvider>
    );
  }

  const toggleLabel = expanded ? t('ai.chatCollapse') : t('ai.chatExpand');

  return (
    <ChatCollapseExpandedProvider expanded={expanded}>
      <View className="s-ai-assistant-chat-collapse">
        <Button
          className="s-ai-assistant-chat-collapse__header"
          hoverClass="s-ai-assistant-chat-collapse__header--pressed"
          aria-expanded={expanded}
          aria-label={toggleLabel}
          onClick={() => setExpanded((value) => !value)}
        >
          <View className="s-ai-assistant-chat-collapse__header-main">
            <Text className="s-ai-assistant-chat-collapse__title">
              {t('ai.chatSectionTitle')}
            </Text>
            {!expanded ? (
              <Text className="s-ai-assistant-chat-collapse__hint">
                {t('ai.chatCollapsedHint')}
              </Text>
            ) : null}
          </View>
          {expanded ? (
            <ChevronUp size={14} color="var(--muted-foreground)" aria-hidden />
          ) : (
            <ChevronDown size={14} color="var(--muted-foreground)" aria-hidden />
          )}
        </Button>
        <View
          className={cn(
            's-ai-assistant-chat-collapse__messages',
            !expanded && 's-ai-assistant-chat-collapse__messages--collapsed',
          )}
        >
          {children}
        </View>
      </View>
    </ChatCollapseExpandedProvider>
  );
};
