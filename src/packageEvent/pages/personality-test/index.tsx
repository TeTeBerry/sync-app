import './personality-test.scss';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { PersonalityQuestionStep } from '@/domains/personality-test/components/PersonalityQuestionStep';
import { PersonalityResultView } from '@/domains/personality-test/components/PersonalityResultView';
import { usePersonalityTestPage } from '@/domains/personality-test/hooks/usePersonalityTestPage';
import { PERSONALITY_POSTER_CANVAS_ID } from '@/domains/personality-test';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { Canvas, ScrollView, Text, View } from '@tarojs/components';

const PersonalityTestPage = () => {
  useEndRouteTransitionOnShow();
  const page = usePersonalityTestPage();
  const contentReady =
    page.phase === 'quiz' || page.phase === 'result' || page.phase === 'error';
  usePageRouteReady(contentReady);

  return (
    <View data-cmp="PersonalityTest" className="s-personality-test">
      <PageNavigation title="电音人格测试" fallback={page.navFallback} />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-personality-test__scroll s-scrollbar-none"
        style={
          page.mainScrollHeight != null
            ? { height: `${page.mainScrollHeight}px` }
            : undefined
        }
      >
        <View className="s-personality-test__inner">
          {page.phase !== 'result' ? (
            <View className="s-personality-test__intro">
              <Text className="s-personality-test__intro-kicker">
                场景题 · 无标准答案
              </Text>
              <Text className="s-personality-test__intro-title">电音人格测试</Text>
              <Text className="s-personality-test__intro-desc">
                8 道题测出你的 Raver 人格（每次题目随机），含听感与 VJ
                视觉题，再匹配本命 DJ 与适合你的电音节活动。
              </Text>
            </View>
          ) : null}

          {page.phase === 'loading' || page.phase === 'submitting' ? (
            <ThemedPageLoader
              variant="spinner"
              label={
                page.phase === 'submitting' ? 'AI 正在解读你的 Raver DNA…' : '加载题目…'
              }
              minHeight={220}
            />
          ) : null}

          {page.phase === 'error' ? (
            <View className="s-personality-test__error">
              <Text className="s-personality-test__error-text">
                {page.errorMessage}
              </Text>
              <Text
                className="s-personality-test__error-retry"
                onClick={page.retryError}
                role="button"
              >
                {page.errorMessage.includes('登录') ? '去登录' : '点击重试'}
              </Text>
            </View>
          ) : null}

          {page.phase === 'quiz' && page.currentQuestion ? (
            <PersonalityQuestionStep
              question={page.currentQuestion}
              currentIndex={page.currentIndex}
              totalQuestions={page.totalQuestions}
              progressPercent={page.progressPercent}
              selectedOptionId={page.selectedOptionId}
              onSelect={page.selectOption}
              onBack={page.currentIndex > 0 ? page.goBackQuestion : undefined}
              onNext={page.goNextQuestion}
            />
          ) : null}

          {page.phase === 'result' && page.result ? (
            <PersonalityResultView result={page.result} onRestart={page.restart} />
          ) : null}
        </View>
      </ScrollView>

      <Canvas
        type="2d"
        id={PERSONALITY_POSTER_CANVAS_ID}
        canvasId={PERSONALITY_POSTER_CANVAS_ID}
        className="s-personality-test__poster-canvas"
        aria-hidden
      />

      <LoginInterceptHost />
    </View>
  );
};

export default PersonalityTestPage;
