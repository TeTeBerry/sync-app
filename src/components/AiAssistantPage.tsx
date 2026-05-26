import "./AiAssistantPage.scss";
import React, { type FC, type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import BottomNav from "./BottomNav";
import ImagePreviewLightbox from "./ImagePreviewLightbox";
import PageNavigation from "./PageNavigation";
import { Button, Input, cn } from "./ui";
import { ImagePlusIcon, SendIcon, SparklesIcon, XIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Taro, { useDidShow } from "@tarojs/taro";
import { useQueryClient } from "@tanstack/react-query";
import type { ChatUiMessage } from "../types/aiChat";
import { useAiChatStream } from "../hooks/useAiChatStream";
import { invalidatePostQueries } from "../hooks/useSyncApi";
import { ChatImageTooLargeError, pickAndCompressChatImage } from "../utils/chatImage";
import { useNavigationStore } from "../stores";
import { normalizeAiShortcutTag } from "../utils/aiShortcutTags";
import { goBack, goEventDetail, ROUTES } from "../utils/route";

const quickReplyKeys = [`findBuddy`, `nearEvents`] as const;

function AiAssistantChat({
  initialMessage,
  activityLegacyId,
  onInitialMessageSent,
}: {
  initialMessage?: string | null;
  activityLegacyId?: number;
  onInitialMessageSent?: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [input, setInput] = useState(``);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialMessageSentRef = useRef<string | null>(null);

  const mockReply = useCallback(
    (query: string) =>
      t(`aiAssistant.chat.searching`, {
        query,
        count: Math.floor(Math.random() * 5 + 3),
      }),
    [t],
  );

  const { messages, isStreaming, isLoadingHistory, send } = useAiChatStream({
    welcomeText: t(`aiAssistant.chat.welcome`),
    mockReply,
    streamErrorText: t(`aiAssistant.chat.streamError`),
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
    bottomRef.current?.scrollIntoView({ behavior: `smooth` });
  }, [messages]);

  useEffect(() => {
    if (!initialMessage) {
      initialMessageSentRef.current = null;
      return;
    }

    const trimmed = initialMessage.trim();
    if (!trimmed || isLoadingHistory || isStreaming) return;
    if (initialMessageSentRef.current === trimmed) return;

    initialMessageSentRef.current = trimmed;
    void send({ text: trimmed });
    onInitialMessageSent?.();
  }, [initialMessage, isLoadingHistory, isStreaming, onInitialMessageSent, send]);

  const submit = useCallback(
    (text: string, image?: string | null) => {
      const trimmed = text.trim();
      const attachment = image ?? pendingImage;
      if ((!trimmed && !attachment) || isStreaming) return;
      setInput(``);
      setPendingImage(null);
      void send({ text: trimmed, image: attachment ?? undefined });
    },
    [isStreaming, pendingImage, send],
  );

  const handlePickImage = useCallback(async () => {
    if (isStreaming) return;
    try {
      const dataUrl = await pickAndCompressChatImage();
      if (dataUrl) setPendingImage(dataUrl);
    } catch (error) {
      if (error instanceof ChatImageTooLargeError) {
        void Taro.showToast({ title: t("aiAssistant.chat.imageTooLarge"), icon: "none" });
        return;
      }
      void Taro.showToast({ title: t("common.requestFailed"), icon: "none" });
    }
  }, [isStreaming, t]);

  const handleRemoveImage = useCallback(() => {
    setPendingImage(null);
  }, []);

  const openImagePreview = useCallback((src: string) => {
    setPreviewImage(src);
  }, []);

  const closeImagePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === `Enter`) {
        e.preventDefault();
        submit(input);
      }
    },
    [input, submit],
  );

  const canSend = Boolean(input.trim() || pendingImage) && !isStreaming;

  return (
    <div className="s-ai-assistant-chat">
      <div className="s-ai-assistant-chat__scroll">
        {isLoadingHistory ? (
          <p className="s-ai-assistant__hint">{t(`common.loading`)}</p>
        ) : null}
        {messages.map((msg: ChatUiMessage) => (
          <div
            key={msg.id}
            className={`s-ai-assistant-chat__row${msg.from === `user` ? ` s-ai-assistant-chat__row--from-user` : ``}`}
          >
            <div className={`s-ai-assistant-chat__avatar${msg.from === `ai` ? `` : ` s-ai-assistant-chat__avatar--hidden`}`}>
              <SparklesIcon size={13} />
            </div>
            <div className={cn(`s-ai-assistant-chat__content`, msg.from === `user` && `s-ai-assistant-chat__content--from-user`)}>
              <div
                className={cn(
                  `s-ai-assistant-chat__bubble`,
                  msg.from === `ai` ? `s-ai-assistant-chat__bubble--from-ai` : `s-ai-assistant-chat__bubble--from-user`,
                  msg.streaming && `s-ai-assistant-chat__bubble--streaming`,
                  msg.streaming && !msg.text && `s-ai-assistant-chat__bubble--waiting`,
                )}
              >
                {msg.streaming && !msg.text ? (
                  <span className="s-ai-assistant-chat__typing" aria-label={t(`aiAssistant.chat.thinking`)}>
                    <span />
                    <span />
                    <span />
                  </span>
                ) : (
                  <>
                    {msg.imagePreview ? (
                      <button
                        type="button"
                        className="s-ai-assistant-chat__bubble-image-btn"
                        aria-label={t("aiAssistant.chat.viewImage")}
                        onClick={() => openImagePreview(msg.imagePreview!)}
                      >
                        <img
                          className="s-ai-assistant-chat__bubble-image"
                          src={msg.imagePreview}
                          alt={t("aiAssistant.chat.uploadedImageAlt")}
                        />
                      </button>
                    ) : null}
                    {msg.text ? <span>{msg.text}</span> : null}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="s-ai-assistant-chat__quick-row s-scrollbar-none">
        {quickReplyKeys.map((key) => (
          <Button
            key={key}
            className="s-ai-assistant-chat__quick-chip"
            disabled={isStreaming}
            onClick={() =>
              submit(normalizeAiShortcutTag(t(`aiAssistant.chat.quickReplies.${key}`)))
            }
          >
            {t(`aiAssistant.chat.quickReplies.${key}`)}
          </Button>
        ))}
      </div>

      <div className="s-ai-assistant-chat__composer">
        {pendingImage ? (
          <div className="s-ai-assistant-chat__attach-preview">
            <button
              type="button"
              className="s-ai-assistant-chat__attach-preview-btn"
              aria-label={t("aiAssistant.chat.viewImage")}
              onClick={() => openImagePreview(pendingImage)}
            >
              <img src={pendingImage} alt={t("aiAssistant.chat.uploadedImageAlt")} />
            </button>
            <button
              type="button"
              className="s-ai-assistant-chat__attach-remove"
              aria-label={t("aiAssistant.chat.removeImage")}
              onClick={handleRemoveImage}
            >
              <XIcon size={14} />
            </button>
          </div>
        ) : null}
        <div className="s-ai-assistant-chat__composer-inner">
          <button
            type="button"
            className="s-ai-assistant-chat__attach-btn"
            disabled={isStreaming}
            aria-label={t("aiAssistant.chat.uploadImage")}
            onClick={() => void handlePickImage()}
          >
            <ImagePlusIcon size={18} />
          </button>
          <Input
            variant="ai-assistant-chat"
            type="text"
            value={input}
            disabled={isStreaming}
            placeholder={t(`aiAssistant.chat.placeholder`)}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
          <Button
            className="s-ai-assistant-chat__send"
            disabled={!canSend}
            onClick={() => submit(input)}
          >
            <SendIcon size={14} color="#fff" />
          </Button>
        </div>
      </div>

      <ImagePreviewLightbox
        open={previewImage != null}
        src={previewImage}
        alt={t("aiAssistant.chat.uploadedImageAlt")}
        onClose={closeImagePreview}
      />
    </div>
  );
}

const AiAssistantPage: FC = () => {
  const { t } = useTranslation();
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);
  const [activityLegacyId, setActivityLegacyId] = useState<number | undefined>(undefined);
  const consumeAiAssistantIntent = useNavigationStore((state) => state.consumeAiAssistantIntent);

  const applyAiAssistantIntent = useCallback(() => {
    const intent = consumeAiAssistantIntent();
    if (intent?.initialMessage?.trim()) {
      setPendingInitialMessage(intent.initialMessage.trim());
    }
    if (intent?.activityLegacyId != null && !Number.isNaN(intent.activityLegacyId)) {
      setActivityLegacyId(intent.activityLegacyId);
    }
  }, [consumeAiAssistantIntent]);

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
        <PageNavigation title={t("aiAssistant.title")} onBack={handleBack} />
      </header>

      <div className="s-ai-assistant__body">
        <div className="s-ai-assistant__panel">
          <AiAssistantChat
            initialMessage={pendingInitialMessage}
            activityLegacyId={activityLegacyId}
            onInitialMessageSent={() => setPendingInitialMessage(null)}
          />
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AiAssistantPage;
