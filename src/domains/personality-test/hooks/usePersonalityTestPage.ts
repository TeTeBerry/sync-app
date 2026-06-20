import Taro, {
  useDidShow,
  useRouter,
  useShareAppMessage,
  useShareTimeline,
} from '@tarojs/taro';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchPersonalityTestQuestions,
  fetchPersonalityNicknameUsage,
  persistPersonalityTestResultToServer,
  submitPersonalityTest,
  type PersonalityTestQuestionsResponse,
} from '@/api/sync/personalityTest';
import {
  getCachedPersonalityTestCatalog,
  loadPersonalityTestCatalog,
} from '@/domains/personality-test/personalityTestCatalog';
import {
  loadPersonalityTestResult,
  restorePersonalityTestResultFromServer,
  savePersonalityTestResult,
} from '@/domains/personality-test/utils/personalityTestStorage';
import { ensurePersonalityResultIdentity } from '../utils/personalityResultIdentity.util';
import {
  buildPersonalityTestShareAppMessage,
  buildPersonalityTestShareFallback,
  buildPersonalityTestShareTimeline,
  buildPersonalityTestShareTitle,
  buildPersonalityTestTimelineFallback,
  parsePersonalityTestShareQuery,
  resolvePersonalityShareTeaser,
  type PersonalityTestShareTeaser,
} from '@/domains/personality-test/utils/personalityWechatShare.util';
import type {
  PersonalityQuestion,
  PersonalityTestAnswers,
  PersonalityTestResult,
} from '@/domains/personality-test/types';
import { ROUTES } from '@/utils/route';
import { ApiError } from '@/utils/apiClient';
import { isLoggedIn } from '@/utils/authStorage';
import { requireAuth } from '@/utils/authGate';
import { useStackPageMainHeight } from '@/hooks/useTabPageMainHeight';
import { applyScrollTop } from '@/utils/scrollToCenter';

export type PersonalityTestPhase =
  | 'loading'
  | 'quiz'
  | 'submitting'
  | 'result'
  | 'error';

function resolveQuestionIds(questions: PersonalityQuestion[]): string[] {
  return questions.map((question) => question.id);
}

function resolveLoadError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return '测试服务暂未上线，请稍后再试';
    }
  }
  return '加载失败，请检查网络后重试';
}

export function usePersonalityTestPage() {
  const router = useRouter();
  const mainScrollHeight = useStackPageMainHeight();
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;
  const shareRef = useRef<PersonalityTestResult | null>(null);

  const [phase, setPhase] = useState<PersonalityTestPhase>('loading');
  const [questions, setQuestions] = useState<PersonalityQuestion[]>([]);
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<PersonalityTestAnswers>({});
  const [result, setResult] = useState<PersonalityTestResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [shareTeaser, setShareTeaser] = useState<PersonalityTestShareTeaser | null>(
    null,
  );
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [welcomeNicknameUsage, setWelcomeNicknameUsage] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState<number | undefined>(0);

  const scrollToTop = useCallback(() => {
    applyScrollTop(setScrollTop, 0);
  }, []);

  const applyQuestionSet = useCallback((nextQuestions: PersonalityQuestion[]) => {
    setQuestions(nextQuestions);
    setQuestionIds(resolveQuestionIds(nextQuestions));
    setCurrentIndex(0);
    setAnswers({});
  }, []);

  const loadQuestions = useCallback(async () => {
    setPhase('loading');
    setErrorMessage('');
    try {
      await loadPersonalityTestCatalog({ force: true });
      const payload: PersonalityTestQuestionsResponse =
        await fetchPersonalityTestQuestions();
      if (!payload.questions?.length) {
        throw new Error('empty question set');
      }
      applyQuestionSet(payload.questions);
      setPhase('quiz');
    } catch (error) {
      setErrorMessage(resolveLoadError(error));
      setPhase('error');
    }
  }, [applyQuestionSet]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      let cached = loadPersonalityTestResult();
      if (!cached && isLoggedIn()) {
        cached = await restorePersonalityTestResultFromServer();
      }

      if (cancelled) {
        return;
      }

      if (router.params.view === 'result') {
        if (cached) {
          setResult(cached);
          setPhase('result');
          void loadPersonalityTestCatalog().catch(() => undefined);
          return;
        }
        setErrorMessage('暂无测试结果，请先完成测试');
        setPhase('error');
        return;
      }

      const shareSeed = parsePersonalityTestShareQuery(router.params);
      if (shareSeed) {
        try {
          const catalog = await loadPersonalityTestCatalog({ force: true });
          if (!cancelled) {
            setShareTeaser(resolvePersonalityShareTeaser(catalog, shareSeed));
          }
        } catch {
          if (!cancelled) {
            setShareTeaser(null);
          }
        }
      }

      if (cancelled) {
        return;
      }

      void loadQuestions();
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [loadQuestions, router.params]);

  useEffect(() => {
    shareRef.current = phase === 'result' && result ? result : null;
  }, [phase, result]);

  useEffect(() => {
    if (phase === 'result' && result) {
      scrollToTop();
    }
  }, [phase, result, scrollToTop]);

  useDidShow(() => {
    if (phase === 'result' && result) {
      scrollToTop();
    }

    if (!isWeapp) return;
    void Taro.showShareMenu({
      showShareItems: ['shareAppMessage', 'shareTimeline'],
    }).catch(() => undefined);
  });

  useShareAppMessage(() => {
    const current = shareRef.current;
    if (!current) {
      return buildPersonalityTestShareFallback();
    }
    const catalog = getCachedPersonalityTestCatalog();
    return {
      title: buildPersonalityTestShareTitle(current, catalog),
      path: buildPersonalityTestShareAppMessage(current).path,
    };
  });

  useShareTimeline(() => {
    const current = shareRef.current;
    if (!current) {
      return buildPersonalityTestTimelineFallback();
    }
    return buildPersonalityTestShareTimeline(current);
  });

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const selectedOptionId = currentQuestion ? answers[currentQuestion.id] : undefined;

  const selectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    },
    [currentQuestion],
  );

  const goBackQuestion = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  const applyResult = useCallback((next: PersonalityTestResult) => {
    const withIdentity = ensurePersonalityResultIdentity(next);
    setResult(withIdentity);
    savePersonalityTestResult(withIdentity);
    setPhase('result');

    const nickname = withIdentity.raverNickname?.trim();
    if (!isLoggedIn() && nickname) {
      setWelcomeModalOpen(true);
      setWelcomeNicknameUsage(null);
      void fetchPersonalityNicknameUsage(nickname)
        .then(({ userCount }) => setWelcomeNicknameUsage(userCount))
        .catch(() => setWelcomeNicknameUsage(0));
    }
  }, []);

  const closeWelcomeModal = useCallback(() => {
    setWelcomeModalOpen(false);
  }, []);

  const persistNicknameAfterLogin = useCallback(
    async (current: PersonalityTestResult) => {
      const saved = await persistPersonalityTestResultToServer(current);
      savePersonalityTestResult(saved);
      setResult(saved);

      const nickname = saved.raverNickname?.trim();
      if (nickname) {
        const { userCount } = await fetchPersonalityNicknameUsage(nickname);
        setWelcomeNicknameUsage(userCount);
      }

      void Taro.showToast({ title: '昵称已保存', icon: 'success' });
    },
    [],
  );

  const loginToSaveNickname = useCallback(() => {
    const current = result;
    if (!current?.raverNickname?.trim()) {
      return;
    }

    setWelcomeModalOpen(false);
    requireAuth(() => {
      void persistNicknameAfterLogin(current).catch(() => {
        void Taro.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      });
    }, 'general');
  }, [persistNicknameAfterLogin, result]);

  const submitAnswers = useCallback(
    async (finalAnswers: PersonalityTestAnswers) => {
      setPhase('submitting');
      setErrorMessage('');
      try {
        const next = await submitPersonalityTest(finalAnswers, questionIds);
        applyResult(next);
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message.trim()
            : '提交失败，请稍后重试';
        setErrorMessage(message);
        setPhase('error');
      }
    },
    [applyResult, questionIds],
  );

  const goNextQuestion = useCallback(() => {
    if (!currentQuestion || !selectedOptionId) {
      void Taro.showToast({ title: '请选择一个选项', icon: 'none' });
      return;
    }
    if (currentIndex >= totalQuestions - 1) {
      void submitAnswers({ ...answers, [currentQuestion.id]: selectedOptionId });
      return;
    }
    setCurrentIndex((index) => index + 1);
  }, [
    answers,
    currentIndex,
    currentQuestion,
    selectedOptionId,
    submitAnswers,
    totalQuestions,
  ]);

  const retrySubmit = useCallback(() => {
    void submitAnswers(answers);
  }, [answers, submitAnswers]);

  const retryError = useCallback(() => {
    if (answers && Object.keys(answers).length > 0 && questions.length > 0) {
      void submitAnswers(answers);
      return;
    }
    void loadQuestions();
  }, [answers, loadQuestions, questions.length, submitAnswers]);

  const restart = useCallback(() => {
    setResult(null);
    setShareTeaser(null);
    setErrorMessage('');
    setWelcomeModalOpen(false);
    setWelcomeNicknameUsage(null);
    scrollToTop();
    void loadQuestions();
  }, [loadQuestions, scrollToTop]);

  return {
    navFallback: ROUTES.HOME,
    mainScrollHeight,
    scrollTop,
    phase,
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    progressPercent,
    selectedOptionId,
    answers,
    result,
    errorMessage,
    shareTeaser,
    welcomeModalOpen,
    welcomeNicknameUsage,
    isWeapp,
    selectOption,
    goBackQuestion,
    goNextQuestion,
    retrySubmit,
    retryError,
    restart,
    closeWelcomeModal,
    loginToSaveNickname,
    reload: loadQuestions,
  };
}
