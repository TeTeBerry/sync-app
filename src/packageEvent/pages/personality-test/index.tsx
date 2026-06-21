import './personality-test.scss';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { PersonalityQuestionStep } from '@/domains/personality-test/components/PersonalityQuestionStep';
import { PersonalityResultView } from '@/domains/personality-test/components/PersonalityResultView';
import { PersonalityWelcomeModal } from '@/domains/personality-test/components/PersonalityWelcomeModal';
import { usePersonalityTestPage } from '@/domains/personality-test/hooks/usePersonalityTestPage';
import { PERSONALITY_POSTER_CANVAS_ID } from '@/domains/personality-test';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { useT } from '@/hooks/useI18n';
import { Canvas, ScrollView, Text, View } from '@tarojs/components';

const PersonalityTestPage = () => {
  useEndRouteTransitionOnShow();
  const page = usePersonalityTestPage();
  const t = useT();
  const contentReady =
    page.phase === 'quiz' || page.phase === 'result' || page.phase === 'error';
  usePageRouteReady(contentReady);

  return (
    <View data-cmp="PersonalityTest" className="s-personality-test">
      <PageNavigation
        title={t('personality.raverPersonality')}
        fallback={page.navFallback}
      />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        scrollTop={page.scrollTop}
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
              {page.shareTeaser ? (
                <View className="s-personality-test__share-teaser">
                  <Text className="s-personality-test__share-teaser-kicker">
                    {t('personality.friendShare')}
                  </Text>
                  <Text className="s-personality-test__share-teaser-title">
                    {t('personality.friendIs', {
                      emoji: page.shareTeaser.typeEmoji,
                      label: page.shareTeaser.typeLabel,
                    })}
                  </Text>
                  {page.shareTeaser.soulDjName ? (
                    <Text className="s-personality-test__share-teaser-dj">
                      {t('personality.soulDj', { djName: page.shareTeaser.soulDjName })}
                    </Text>
                  ) : null}
                  <Text className="s-personality-test__share-teaser-cta">
                    {t('personality.takeTestToo')}
                  </Text>
                </View>
              ) : null}
              <Text className="s-personality-test__intro-kicker">
                {t('personality.sceneQuestions')}
              </Text>
              <Text className="s-personality-test__intro-title">
                {t('personality.raverPersonality')}
              </Text>
              <Text className="s-personality-test__intro-desc">
                {t('personality.testDesc')}
              </Text>
            </View>
          ) : null}

          {page.phase === 'loading' || page.phase === 'submitting' ? (
            <ThemedPageLoader
              variant="spinner"
              label={
                page.phase === 'submitting'
                  ? t('personality.aiInterpreting')
                  : t('personality.loadQuestions')
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
                {page.errorMessage.includes('登录')
                  ? t('personality.loginFirst')
                  : t('common.clickRetry')}
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
            <PersonalityResultView
              result={page.result}
              onRestart={page.restart}
              isWeapp={page.isWeapp}
            />
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

      <PersonalityWelcomeModal
        open={page.welcomeModalOpen}
        nickname={page.result?.raverNickname?.trim() ?? ''}
        userCount={page.welcomeNicknameUsage}
        onClose={page.closeWelcomeModal}
        onLoginSave={page.loginToSaveNickname}
      />
    </View>
  );
};

export default PersonalityTestPage;
