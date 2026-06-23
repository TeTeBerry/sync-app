import './HomeAiEntry.scss';
import type { FC } from 'react';
import { useMemo } from 'react';
import { Bot, ChevronRight, Users } from '../../../components/icons';
import { buildHomeFestivalExampleQuestions } from '../../../constants/homeFestivalExampleQuestions';
import { resolveExampleChipSearchQuery } from '../../../constants/homeFestivalExampleQuestions';
import { useActivitiesQuery } from '../../../hooks/sync/activities';
import {
  goEventDetail,
  goEventsListTab,
  goEventsWithSearch,
} from '../../../utils/route';
import { Text, View } from '@tarojs/components';
import { useT, useLocale } from '@/hooks/useI18n';

export type HomeAiEntryProps = {
  findTeamActivityId?: number;
};

export const HomeAiEntry: FC<HomeAiEntryProps> = ({ findTeamActivityId }) => {
  const t = useT();
  const locale = useLocale();
  const { data: activities } = useActivitiesQuery();

  const exampleQuestions = useMemo(() => {
    void locale;
    return buildHomeFestivalExampleQuestions(activities);
  }, [activities, locale]);

  const handleLookupFestival = () => {
    goEventsListTab();
  };

  const handleExampleQuestion = (key: string) => {
    if (key === 'near') {
      goEventsListTab();
      return;
    }
    const query = resolveExampleChipSearchQuery(key);
    if (query) {
      goEventsWithSearch(query);
      return;
    }
    goEventsListTab();
  };

  const handleFindTeam = () => {
    if (findTeamActivityId != null) {
      goEventDetail(findTeamActivityId, { focusPosts: true });
      return;
    }
    goEventsListTab();
  };

  return (
    <View className="s-home-ai" aria-label={t('home.dualCtaTitle')}>
      <View className="s-home-ai__head">
        <Text className="s-home-ai__title">{t('home.dualCtaTitle')}</Text>
        <Text className="s-home-ai__badge">{t('home.dualCtaBadge')}</Text>
      </View>

      <View className="s-home-ai__grid">
        <View
          className="s-home-ai__card s-home-ai__card--lookup"
          onClick={handleLookupFestival}
          role="button"
          aria-label={t('home.lookupFestivalTitle')}
        >
          <View
            className="s-home-ai__card-glow s-home-ai__card-glow--lookup"
            aria-hidden
          />
          <View className="s-home-ai__card-top">
            <View
              className="s-home-ai__icon-wrap s-home-ai__icon-wrap--lookup"
              aria-hidden
            >
              <Bot size={22} color="#4cc9f0" />
            </View>
            <View className="s-home-ai__copy">
              <Text className="s-home-ai__card-title">
                {t('home.lookupFestivalTitle')}
              </Text>
              <Text className="s-home-ai__card-desc">
                {t('home.lookupFestivalDesc')}
              </Text>
            </View>
          </View>
          <View className="s-home-ai__card-cta">
            <Text className="s-home-ai__cta-text s-home-ai__cta-text--lookup">
              {t('home.lookupFestivalCta')}
            </Text>
            <ChevronRight size={14} color="#4cc9f0" />
          </View>
          {exampleQuestions.length > 0 ? (
            <View
              className="s-home-ai__examples"
              onClick={(event) => event.stopPropagation()}
            >
              {exampleQuestions.map((question) => (
                <View
                  key={question.key}
                  className="s-home-ai__example-chip"
                  onClick={() => handleExampleQuestion(question.key)}
                  role="button"
                  aria-label={question.label}
                >
                  <Text className="s-home-ai__example-chip-text">{question.label}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View
          className="s-home-ai__card s-home-ai__card--team"
          onClick={handleFindTeam}
          role="button"
          aria-label={t('home.findTeamTitle')}
        >
          <View
            className="s-home-ai__card-glow s-home-ai__card-glow--team"
            aria-hidden
          />
          <View className="s-home-ai__card-top">
            <View
              className="s-home-ai__icon-wrap s-home-ai__icon-wrap--team"
              aria-hidden
            >
              <Users size={22} color="#ff0066" />
            </View>
            <View className="s-home-ai__copy">
              <Text className="s-home-ai__card-title">{t('home.findTeamTitle')}</Text>
              <Text className="s-home-ai__card-desc">{t('home.findTeamDesc')}</Text>
            </View>
          </View>
          <View className="s-home-ai__card-cta">
            <Text className="s-home-ai__cta-text s-home-ai__cta-text--team">
              {t('home.findTeamCta')}
            </Text>
            <ChevronRight size={14} color="#ff0066" />
          </View>
        </View>
      </View>

      <Text className="s-home-ai__disclaimer">{t('home.dualCtaDisclaimer')}</Text>
    </View>
  );
};
