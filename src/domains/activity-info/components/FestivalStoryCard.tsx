import './FestivalStoryCard.scss';
import type { FC } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, Sparkles } from '@/components/icons';
import { Button, cn } from '@/components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import type { SceneFestivalStoryResult } from '@/domains/scene-agent/applySceneEffects';

export type FestivalStoryCardProps = {
  activityName: string;
  expanded: boolean;
  loading: boolean;
  story: SceneFestivalStoryResult | null;
  disclaimer: string | null;
  error: boolean;
  onToggle: () => void;
  onRegenerate: () => void;
};

export const FestivalStoryCard: FC<FestivalStoryCardProps> = ({
  activityName,
  expanded,
  loading,
  story,
  disclaimer,
  error,
  onToggle,
  onRegenerate,
}) => {
  const t = useT();

  return (
    <View className="s-festival-story-card">
      <Button
        className="s-festival-story-card__toggle"
        hoverClass="s-festival-story-card__toggle--pressed"
        onClick={onToggle}
      >
        <Sparkles size={16} color="var(--primary)" aria-hidden />
        <Text className="s-festival-story-card__title">
          {t('activityInfo.festivalStory.title', { name: activityName })}
        </Text>
        {expanded ? (
          <ChevronUp size={16} color="#8e8e93" aria-hidden />
        ) : (
          <ChevronDown size={16} color="#8e8e93" aria-hidden />
        )}
      </Button>

      {expanded ? (
        <View className="s-festival-story-card__body">
          {loading ? (
            <Text className="s-festival-story-card__status">
              {t('activityInfo.festivalStory.loading')}
            </Text>
          ) : error ? (
            <Text className="s-festival-story-card__status">
              {t('activityInfo.festivalStory.error')}
            </Text>
          ) : story ? (
            <>
              {story.sections.map((section, index) => (
                <View key={index} className="s-festival-story-card__section">
                  {section.heading ? (
                    <Text className="s-festival-story-card__heading">
                      {section.heading}
                    </Text>
                  ) : null}
                  <Text className="s-festival-story-card__text">{section.body}</Text>
                </View>
              ))}
              {disclaimer ? (
                <View className="s-festival-story-card__disclaimer">
                  <Sparkles size={13} color="var(--primary)" aria-hidden />
                  <Text className="s-festival-story-card__disclaimer-text">
                    {disclaimer}
                  </Text>
                </View>
              ) : null}
              <Button
                className={cn('s-festival-story-card__regen')}
                disabled={loading}
                onClick={onRegenerate}
              >
                <RefreshCw size={14} color="var(--primary)" aria-hidden />
                <Text className="s-festival-story-card__regen-text">
                  {t('activityInfo.festivalStory.regenerate')}
                </Text>
              </Button>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
