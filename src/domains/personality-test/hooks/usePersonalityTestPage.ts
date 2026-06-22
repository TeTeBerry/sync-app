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
import { invalidateUser } from '@/utils/queryInvalidation';
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
import { labelMatchesKey } from '@/i18n';
import { useStackPageMainHeight } from '@/hooks/useTabPageMainHeight';
import { applyScrollTop } from '@/utils/scrollToCenter';
import { useT } from '@/hooks/useI18n';
import { prefetchPersonalityQuestionMedia } from '../utils/personalityAudioPrefetch';

export type PersonalityTestPhase =
  | 'loading'
  | 'quiz'
  | 'submitting'
  | 'result'
  | 'error';

function resolveQuestionIds(questions: PersonalityQuestion[]): string[] {
  return questions.map((question) => question.id);
}

function resolveLoadError(error: unknown, t: (key: string) => string): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return t('personality.testServiceNotAvailable');
    }
  }
  return t('personality.loadFailed');
}

function resolveErrorRequiresLogin(error: unknown, message: string): boolean {
  if (error instanceof ApiError && error.status === 401) {
    return true;
  }
  return (
    labelMatchesKey(message, 'personality.loginRequired') ||
    message.includes('登录') ||
    message.toLowerCase().includes('sign in')
  );
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
  const [errorRequiresLogin, setErrorRequiresLogin] = useState(false);
  const [shareTeaser, setShareTeaser] = useState<PersonalityTestShareTeaser | null>(
    null,
  );
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [welcomeNicknameUsage, setWelcomeNicknameUsage] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState<number | undefined>(0);
  const t = useT();

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
    setErrorRequiresLogin(false);
    try {
      await loadPersonalityTestCatalog({ force: true });
      const payload: PersonalityTestQuestionsResponse =
        await fetchPersonalityTestQuestions();
      if (!payload.questions?.length) {
        throw new Error('empty question set');
      }
      applyQuestionSet(payload.questions);
      void prefetchPersonalityQuestionMedia(payload.questions);
      setPhase('quiz');
    } catch (error) {
      const message = resolveLoadError(error, t);
      setErrorMessage(message);
      setErrorRequiresLogin(resolveErrorRequiresLogin(error, message));
      setPhase('error');
    }
  }, [applyQuestionSet, t]);

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
        setErrorMessage(t('personality.noTestResult'));
        setErrorRequiresLogin(false);
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
  }, [loadQuestions, router.params, t]);

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

      void Taro.showToast({ title: t('personality.nicknameSaved'), icon: 'success' });
    },
    [t],
  );

  const loginToSaveNickname = useCallback(() => {
    const current = result;
    if (!current?.raverNickname?.trim()) {
      return;
    }

    setWelcomeModalOpen(false);
    requireAuth(() => {
      void persistNicknameAfterLogin(current).catch(() => {
        void Taro.showToast({ title: t('personality.saveFailed'), icon: 'none' });
      });
    }, 'general');
  }, [persistNicknameAfterLogin, result, t]);

  const submitAnswers = useCallback(
    async (finalAnswers: PersonalityTestAnswers) => {
      setPhase('submitting');
      setErrorMessage('');
      setErrorRequiresLogin(false);
      try {
        const next = await submitPersonalityTest(finalAnswers, questionIds);
        applyResult(next);
        await invalidateUser();
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim()
            ? error.message.trim()
            : t('personality.submitFailed');
        setErrorMessage(message);
        setErrorRequiresLogin(resolveErrorRequiresLogin(error, message));
        setPhase('error');
      }
    },
    [applyResult, questionIds, t],
  );

  const goNextQuestion = useCallback(() => {
    if (!currentQuestion || !selectedOptionId) {
      void Taro.showToast({ title: t('personality.pleaseSelectOption'), icon: 'none' });
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
    t,
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
    setErrorRequiresLogin(false);
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
    errorRequiresLogin,
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
