import "./AiAssistantPage.scss";
import React, { type FC, useCallback, useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import ImagePreviewLightbox from "./ImagePreviewLightbox";
import {
  ChevronLeftIcon,
  SparklesIcon,
  Trash2Icon,
  ZapIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Taro, { useDidShow } from "@tarojs/taro";
import { useQueryClient } from "@tanstack/react-query";
import { useAiChatStream } from "../hooks/useAiChatStream";
import { useResolvedProfile } from "../hooks/useResolvedProfile";
import { invalidatePostQueries } from "../hooks/useSyncApi";
import { useNavigationStore } from "../stores";
import { goBack, goEventDetail, ROUTES } from "../utils/route";
import { ChatMessageList } from "./ai-chat/ChatMessageList";
import { ChatComposer } from "./ai-chat/ChatComposer";
import { DegradedMatchBanner } from "./ai-chat/DegradedMatchBanner";

function AiAssistantChat({
  initialMessage,
  activityLegacyId,
  onInitialMessageSent,
  onClearReady,
  onMessageCountChange,
  userAvatar,
  userName,
}: {
  initialMessage?: string | null;
  activityLegacyId?: number;
  onInitialMessageSent?: () => void;
  onClearReady?: (clear: () => Promise<void>, isBusy: boolean) => void;
  onMessageCountChange?: (count: number) => void;
  userAvatar?: string;
  userName: string;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const initialMessageSentRef = React.useRef<string | null>(null);
  const initialMessageHandledRef = React.useRef(false);
  const submitLockRef = React.useRef(false);

  const mockReply = useCallback(
    (query: string) =>
      t("aiAssistant.chat.searching", {
        query,
        count: Math.floor(Math.random() * 5 + 3),
      }),
    [t],
  );

  const { messages, isStreaming, isLoadingHistory, send, clearChat } =
    useAiChatStream({
      welcomeText: t("aiAssistant.chat.welcome"),
      mockReply,
      streamErrorText: t("aiAssistant.chat.streamError"),
      activityLegacyId,
      onPostCreated: async (event) => {
        await invalidatePostQueries(queryClient);
        const scopedId = event.activityLegacyId ?? activityLegacyId;
        if (scopedId != null) {
          await queryClient.invalidateQueries({
            queryKey: ["posts", "activity", scopedId],
          });
        }
        void Taro.showToast({
          title: t("aiAssistant.chat.postCreated"),
          icon: "success",
        });
      },
      onExistingPost: () => {
        void Taro.showToast({
          title: t("aiAssistant.chat.existingPostHint"),
          icon: "none",
          duration: 2500,
        });
      },
    });

  useEffect(() => {
    onMessageCountChange?.(messages.length);
  }, [messages.length, onMessageCountChange]);

  useEffect(() => {
    if (!initialMessage) {
      return;
    }
    if (initialMessageHandledRef.current) {
      return;
    }

    const trimmed = initialMessage.trim();
    if (!trimmed || isLoadingHistory || isStreaming) return;

    initialMessageHandledRef.current = true;
    initialMessageSentRef.current = trimmed;
    void send({ text: trimmed });
    onInitialMessageSent?.();
  }, [initialMessage, isLoadingHistory, isStreaming, onInitialMessageSent, send]);

  const submit = useCallback(
    async (text: string, images?: string[]) => {
      if (submitLockRef.current) return;
      const trimmed = text.trim();
      const hasImages = images && images.length > 0;
      if ((!trimmed && !hasImages) || isStreaming) return;

      submitLockRef.current = true;
      try {
        setInput("");
        setPendingImages([]);
        await send({ text: trimmed, images: images?.length ? images : undefined });
      } finally {
        submitLockRef.current = false;
      }
    },
    [isStreaming, send],
  );

  const handleClearChat = useCallback(async () => {
    if (isStreaming) return;
    await clearChat();
  }, [clearChat, isStreaming]);

  useEffect(() => {
    onClearReady?.(handleClearChat, isStreaming || isLoadingHistory);
  }, [handleClearChat, isLoadingHistory, isStreaming, onClearReady]);

  const handleSelectSuggestedReply = useCallback(
    async (reply: string) => {
      if (submitLockRef.current || isStreaming) return;
      submitLockRef.current = true;
      try {
        await send({ text: reply });
      } finally {
        submitLockRef.current = false;
      }
    },
    [isStreaming, send],
  );

  return (
    <div className="s-ai-assistant-chat">
      {isLoadingHistory ? (
        <p className="s-ai-assistant__hint">{t("common.loading")}</p>
      ) : null}
      <DegradedMatchBanner />
      <ChatMessageList
        messages={messages}
        isStreaming={isStreaming}
        userAvatar={userAvatar}
        userName={userName}
        onOpenImagePreview={setPreviewImage}
        onSelectSuggestedReply={handleSelectSuggestedReply}
      />
      <ChatComposer
        input={input}
        pendingImages={pendingImages}
        isStreaming={isStreaming}
        activityLegacyId={activityLegacyId}
        onInputChange={setInput}
        onSubmit={submit}
        onPendingImagesChange={setPendingImages}
        onOpenImagePreview={setPreviewImage}
      />
      <ImagePreviewLightbox
        open={previewImage != null}
        src={previewImage}
        alt={t("aiAssistant.chat.uploadedImageAlt")}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}

const AiAssistantPage: FC = () => {
  const { t } = useTranslation();
  const [pendingInitialMessage, setPendingInitialMessage] = useState<
    string | null
  >(null);
  const [clearChatFn, setClearChatFn] = useState<(() => Promise<void>) | null>(
    null,
  );
  const [clearBusy, setClearBusy] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const consumeAiAssistantIntent = useNavigationStore(
    (state) => state.consumeAiAssistantIntent,
  );
  const activityLegacyId = useNavigationStore(
    (state) => state.activeActivityLegacyId ?? undefined,
  );
  const setActiveActivityLegacyId = useNavigationStore(
    (state) => state.setActiveActivityLegacyId,
  );

  const profileUserData = useResolvedProfile();

  const handleClearReady = useCallback(
    (clear: () => Promise<void>, isBusy: boolean) => {
      setClearChatFn(() => clear);
      setClearBusy(isBusy);
    },
    [],
  );

  const handleInitialMessageSent = useCallback(() => {
    setPendingInitialMessage(null);
  }, []);

  const applyAiAssistantIntent = useCallback(() => {
    const intent = consumeAiAssistantIntent();
    if (intent?.initialMessage?.trim()) {
      setPendingInitialMessage(intent.initialMessage.trim());
    }
    if (intent?.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      setActiveActivityLegacyId(intent.activityLegacyId);
    }
  }, [consumeAiAssistantIntent, setActiveActivityLegacyId]);

  useEffect(() => {
    applyAiAssistantIntent();
  }, [applyAiAssistantIntent]);

  useDidShow(applyAiAssistantIntent);

  const handleBack = useCallback(() => {
    const pages = Taro.getCurrentPages();
    if (pages.length <= 1) {
      if (activityLegacyId != null && !Number.isNaN(activityLegacyId)) {
        goEventDetail(activityLegacyId);
        return;
      }
      goBack(ROUTES.HOME);
      return;
    }
    goBack();
  }, [activityLegacyId]);

  return (
    <div data-cmp="AiAssistant" className="s-ai-assistant">
      <header className="s-ai-assistant__header">
        <button
          type="button"
          className="s-ai-assistant__back-btn"
          onClick={handleBack}
        >
          <ChevronLeftIcon size={20} />
        </button>

        <div className="s-ai-assistant__header-main">
          <div className="s-ai-assistant__header-avatar" aria-hidden>
            <SparklesIcon size={18} />
            <span className="s-ai-assistant__header-online" />
          </div>
          <div className="s-ai-assistant__header-text">
            <div className="s-ai-assistant__header-title-row">
              <h1 className="s-ai-assistant__header-title">
                {t("aiAssistant.title")}
              </h1>
              <span className="s-ai-assistant__ai-badge">
                <ZapIcon size={10} aria-hidden />
                {t("aiAssistant.chat.aiBadge")}
              </span>
            </div>
            <p className="s-ai-assistant__header-status">
              {t("aiAssistant.chat.onlineStatus")}
            </p>
          </div>
        </div>

        <div className="s-ai-assistant__header-actions">
          {messageCount > 0 ? (
            <span className="s-ai-assistant__message-count" aria-hidden>
              {messageCount}
            </span>
          ) : null}
          <button
            type="button"
            className="s-ai-assistant__clear-btn"
            disabled={clearBusy || !clearChatFn}
            aria-label={t("aiAssistant.chat.clearConversation")}
            onClick={() => void clearChatFn?.()}
          >
            <Trash2Icon size={16} />
          </button>
        </div>
      </header>

      <div className="s-ai-assistant__body">
        <div className="s-ai-assistant__panel">
          <AiAssistantChat
            initialMessage={pendingInitialMessage}
            activityLegacyId={activityLegacyId}
            onInitialMessageSent={handleInitialMessageSent}
            onClearReady={handleClearReady}
            onMessageCountChange={setMessageCount}
            userAvatar={profileUserData.avatar}
            userName={profileUserData.name}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AiAssistantPage;
