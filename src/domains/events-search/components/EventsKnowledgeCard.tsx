import './EventsKnowledgeCard.scss';
import type { FC } from 'react';
import { Sparkles } from '@/components/icons';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import type { KnowledgeCardPayload } from '@sync/scene-contracts';
import { goEventDetail } from '@/utils/route';

type EventsKnowledgeCardProps = {
  card: KnowledgeCardPayload;
  parsedInsight?: string | null;
  isLoading?: boolean;
  disclaimer?: string | null;
};

export const EventsKnowledgeCard: FC<EventsKnowledgeCardProps> = ({
  card,
  parsedInsight,
  isLoading = false,
  disclaimer,
}) => {
  const t = useT();

  return (
    <View className="s-events-knowledge-card" data-cmp="EventsKnowledgeCard">
      <View className="s-events-knowledge-card__head">
        <View className="s-events-knowledge-card__badge" aria-hidden>
          <Sparkles size={12} color="#64d2ff" strokeWidth={2.25} />
          <Text className="s-events-knowledge-card__badge-text">
            {t('events.knowledge.kicker')}
          </Text>
        </View>
        {card.title ? (
          <Text className="s-events-knowledge-card__title">{card.title}</Text>
        ) : null}
      </View>

      {parsedInsight ? (
        <Text className="s-events-knowledge-card__parsed">
          {t('events.knowledge.parsedLabel', { summary: parsedInsight })}
        </Text>
      ) : null}

      {isLoading ? (
        <Text className="s-events-knowledge-card__loading">
          {t('events.knowledge.loading')}
        </Text>
      ) : (
        <View className="s-events-knowledge-card__sections">
          {card.sections.map((section, index) => (
            <View
              key={`${section.heading ?? 'section'}-${index}`}
              className="s-events-knowledge-card__section"
            >
              {section.heading ? (
                <Text className="s-events-knowledge-card__section-heading">
                  {section.heading}
                </Text>
              ) : null}
              <Text className="s-events-knowledge-card__section-body">
                {section.body}
              </Text>
            </View>
          ))}
        </View>
      )}

      {card.links?.length ? (
        <View className="s-events-knowledge-card__links">
          {card.links.map((link) => (
            <View
              key={`${link.label}-${link.activityLegacyId ?? 'link'}`}
              className="s-events-knowledge-card__link"
              onClick={() => {
                if (link.activityLegacyId != null) {
                  goEventDetail(link.activityLegacyId);
                }
              }}
            >
              <Text className="s-events-knowledge-card__link-text">{link.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View className="s-events-knowledge-card__footer">
        <Text className="s-events-knowledge-card__sources">
          {t('events.knowledge.sources', {
            sources: card.sources.join(' · '),
          })}
        </Text>
        <Text className="s-events-knowledge-card__disclaimer">
          {disclaimer ?? t('events.knowledge.disclaimer')}
        </Text>
        {card.aiGenerated ? (
          <Text className="s-events-knowledge-card__ai-tag">
            {t('events.knowledge.aiGenerated')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
