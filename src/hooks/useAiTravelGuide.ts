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
import { saveTravelGuideDetail } from '../domains/travel-guide/utils/travelGuideDetailStorage';
import { isApiEnabled } from '../constants/api';
import { isAuthGated, requireAuth } from '../utils/authGate';

const PLANNING_TEXT = 'AI 正在为你规划...';
const PLANNING_STAGE_TEXTS = [
  '正在检索场馆周边酒店与夜宵...',
  '正在规划交通与预算...',
  'AI 正在润色攻略文案...',
];
const PLANNING_STAGE_INTERVAL_MS = 3_500;

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
  sessionIdRef: MutableRefObject<string>;
  onPlanningMessagesShown?: () => void;
}) {
  const {
    activityLegacyId,
    activityTitle,
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
    requireAuth(() => {
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
    }, 'ai_assistant');
  }, [activityLegacyId, isStreaming]);

  const runGeneration = useCallback(
    async (
      form: AiGuidePlanFormValues,
      options?: { skipUserBubble?: boolean; userBubbleText?: string },
    ) => {
      if (activityLegacyId == null || Number.isNaN(activityLegacyId)) return;
      if (generatingRef.current) return;

      const execute = async () => {
        const title = activityTitle?.trim() || '本场活动';
        generatingRef.current = true;
        setIsGenerating(true);
        lastFormRef.current = form;

        const userMsg: ChatUiMessage | null = options?.skipUserBubble
          ? null
          : {
              id: createMessageId(),
              from: 'user',
              text: options?.userBubbleText?.trim() || buildUserSummary(form, title),
            };
        const aiMsgId = createMessageId();
        const planningMsg: ChatUiMessage = {
          id: aiMsgId,
          from: 'ai',
          text: PLANNING_TEXT,
          streaming: true,
        };

        const base = options?.skipUserBubble
          ? [...messagesRef.current, planningMsg]
          : [...messagesRef.current, userMsg!, planningMsg];
        messagesRef.current = base;
        setMessages(base);
        Taro.nextTick(() => onPlanningMessagesShown?.());

        let planningStageIndex = 0;
        const planningStageTimer = setInterval(() => {
          planningStageIndex = Math.min(
            planningStageIndex + 1,
            PLANNING_STAGE_TEXTS.length - 1,
          );
          const stageText = PLANNING_STAGE_TEXTS[planningStageIndex];
          messagesRef.current = messagesRef.current.map((m) =>
            m.id === aiMsgId && m.streaming ? { ...m, text: stageText } : m,
          );
          setMessages([...messagesRef.current]);
        }, PLANNING_STAGE_INTERVAL_MS);

        try {
          if (!isApiEnabled()) {
            throw new Error('请先配置 API 地址');
          }

          const { plan } = await generateTravelGuide(activityLegacyId, form);
          const guideId = aiMsgId;
          saveTravelGuideDetail(guideId, {
            plan,
            form,
            activityLegacyId,
          });

          const doneMsg: ChatUiMessage = {
            id: aiMsgId,
            from: 'ai',
            text: '已为你生成出行攻略，点击查看完整方案～',
            streaming: false,
            travelGuide: { guideId, plan, form },
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
          clearInterval(planningStageTimer);
          generatingRef.current = false;
          setIsGenerating(false);
        }
      };

      if (isAuthGated()) {
        requireAuth(() => void execute(), 'ai_assistant');
        return;
      }
      await execute();
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
    requireAuth(() => {
      setSheetInitialValues(form);
      setSheetOpen(true);
    }, 'ai_assistant');
  }, []);

  return {
    sheetOpen,
    setSheetOpen,
    isGenerating,
    openGuideSheet,
    handleSheetSubmit,
    handleRegenerate,
    sheetInitialValues,
    defaultNights: options.defaultNights,
  };
}
