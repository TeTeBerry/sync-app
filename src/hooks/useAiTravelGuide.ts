import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import Taro from '@tarojs/taro';
import { generateTravelGuide } from '../api/sync/travelGuide';
import { createMessageId } from './ai-chat/createMessageId';
import type { ChatUiMessage } from '../types/aiChat';
import type { AiGuidePlanFormValues } from '../types/travelGuide';
import { travelGuideBudgetLabel } from '../types/travelGuide';
import {
  renderTravelGuideImage,
  shareTravelGuideImage,
} from '../components/ai-chat/travelGuideWallpaper/renderTravelGuideImage';
import { isApiEnabled } from '../constants/api';

const PLANNING_TEXT = 'AI 正在为你规划...';

function buildUserSummary(form: AiGuidePlanFormValues, activityTitle: string): string {
  const budget = travelGuideBudgetLabel(form.budgetTier);
  const drive = form.selfDrive ? '自驾' : '非自驾';
  return `生成「${activityTitle}」AI 攻略：${form.departure}出发，${form.headcount}人，住${form.accommodationNights}晚，${budget}，${drive}`;
}

export function useAiTravelGuide(options: {
  activityLegacyId?: number;
  activityTitle?: string;
  defaultNights: number;
  setMessages: Dispatch<SetStateAction<ChatUiMessage[]>>;
  messagesRef: MutableRefObject<ChatUiMessage[]>;
  isStreaming: boolean;
  /** Fired after user +「正在规划」气泡写入列表，用于滚动到底部 */
  onPlanningMessagesShown?: () => void;
}) {
  const {
    activityLegacyId,
    activityTitle,
    defaultNights,
    setMessages,
    messagesRef,
    isStreaming,
    onPlanningMessagesShown,
  } = options;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sheetInitialValues, setSheetInitialValues] =
    useState<AiGuidePlanFormValues | null>(null);
  const lastFormRef = useRef<AiGuidePlanFormValues | null>(null);
  const generatingRef = useRef(false);

  const openGuideSheet = useCallback(() => {
    if (isStreaming || generatingRef.current) {
      void Taro.showToast({ title: '请等待当前操作完成', icon: 'none' });
      return;
    }
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({ title: '请先进入活动后再生成攻略', icon: 'none' });
      return;
    }
    setSheetInitialValues(lastFormRef.current);
    setSheetOpen(true);
  }, [activityLegacyId, isStreaming]);

  /** 自然语言触发：展示用户话术 + 引导语，并打开规划表单 */
  const openGuideSheetFromText = useCallback(
    (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed) {
        openGuideSheet();
        return;
      }
      if (isStreaming || generatingRef.current) {
        void Taro.showToast({ title: '请等待当前操作完成', icon: 'none' });
        return;
      }
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
        void Taro.showToast({ title: '请先进入活动后再生成攻略', icon: 'none' });
        return;
      }

      const userMsg: ChatUiMessage = {
        id: createMessageId(),
        from: 'user',
        text: trimmed,
      };
      const aiMsg: ChatUiMessage = {
        id: createMessageId(),
        from: 'ai',
        text: '好的，请填写下方出行信息，我来为你生成可分享的攻略长图～',
      };
      const next = [...messagesRef.current, userMsg, aiMsg];
      messagesRef.current = next;
      setMessages(next);
      setSheetInitialValues(lastFormRef.current);
      setSheetOpen(true);
    },
    [activityLegacyId, isStreaming, messagesRef, openGuideSheet, setMessages],
  );

  const runGeneration = useCallback(
    async (form: AiGuidePlanFormValues) => {
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
      if (generatingRef.current) return;

      const title = activityTitle?.trim() || '本场活动';
      generatingRef.current = true;
      setIsGenerating(true);
      lastFormRef.current = form;

      const userMsg: ChatUiMessage = {
        id: createMessageId(),
        from: 'user',
        text: buildUserSummary(form, title),
      };
      const aiMsgId = createMessageId();
      const planningMsg: ChatUiMessage = {
        id: aiMsgId,
        from: 'ai',
        text: PLANNING_TEXT,
        streaming: true,
      };

      const base = [...messagesRef.current, userMsg, planningMsg];
      messagesRef.current = base;
      setMessages(base);
      Taro.nextTick(() => onPlanningMessagesShown?.());

      try {
        if (!isApiEnabled()) {
          throw new Error('请先配置 API 地址');
        }

        const { plan } = await generateTravelGuide(activityLegacyId, form);
        const imagePath = await renderTravelGuideImage(plan);

        const doneMsg: ChatUiMessage = {
          id: aiMsgId,
          from: 'ai',
          text: '已为你生成出行攻略，可保存或分享给同行伙伴～',
          streaming: false,
          travelGuide: { imagePath, plan, form },
        };

        messagesRef.current = messagesRef.current.map((m) =>
          m.id === aiMsgId ? doneMsg : m,
        );
        setMessages(messagesRef.current);
        Taro.nextTick(() => onPlanningMessagesShown?.());
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '攻略生成失败，请稍后重试';
        messagesRef.current = messagesRef.current.map((m) =>
          m.id === aiMsgId ? { ...m, text: message, streaming: false } : m,
        );
        setMessages(messagesRef.current);
        void Taro.showToast({ title: message, icon: 'none' });
      } finally {
        generatingRef.current = false;
        setIsGenerating(false);
      }
    },
    [
      activityLegacyId,
      activityTitle,
      messagesRef,
      onPlanningMessagesShown,
      setMessages,
    ],
  );

  const handleSheetSubmit = useCallback(
    (form: AiGuidePlanFormValues) => {
      setSheetOpen(false);
      void runGeneration(form);
    },
    [runGeneration],
  );

  const handleRegenerate = useCallback((form: AiGuidePlanFormValues) => {
    setSheetInitialValues(form);
    setSheetOpen(true);
  }, []);

  const handleShareGuide = useCallback(async (imagePath: string) => {
    try {
      await shareTravelGuideImage(imagePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : '分享失败，请稍后重试';
      if (/取消|cancel/i.test(message)) {
        return;
      }
      void Taro.showToast({ title: message, icon: 'none' });
    }
  }, []);

  return {
    sheetOpen,
    setSheetOpen,
    isGenerating,
    openGuideSheet,
    openGuideSheetFromText,
    handleSheetSubmit,
    handleRegenerate,
    handleShareGuide,
    sheetInitialValues,
    defaultNights,
  };
}
