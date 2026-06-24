import './EventsKnowledgeCard.scss';
import type { FC } from 'react';
import { Calendar, Sparkles } from '@/components/icons';
import { Text, View } from '@tarojs/components';
import { useLocale, useT } from '@/hooks/useI18n';
import type { KnowledgeCardPayload } from '@sync/scene-contracts';
import { goEventDetail } from '@/utils/route';

const EVENTS_AI_ACCENT = '#00E5C8';
const GENERIC_KNOWLEDGE_TITLES = new Set(['电音节资讯', 'Festival intel']);

type EventsKnowledgeCardProps = {
  card: KnowledgeCardPayload;
  parsedInsight?: string | null;
  isLoading?: boolean;
};

function resolveKnowledgeCardTitle(
  title: string,
  parsedInsight: string | null | undefined,
  locale: string,
  fallbackTitle: string,
): string {
  const isGeneric =
    GENERIC_KNOWLEDGE_TITLES.has(title) ||
    title === fallbackTitle ||
    /^festival intel$/i.test(title);

  if (!isGeneric || !parsedInsight?.trim()) {
    return title;
  }

  const monthMatch = parsedInsight.match(/(\d{1,2})月/);
  const yearMatch = parsedInsight.match(/(20\d{2})/);
  const year = yearMatch?.[1] ?? String(new Date().getFullYear());

  if (monthMatch) {
    const month = Number(monthMatch[1]);
    if (locale.toLowerCase().startsWith('en')) {
      const monthNames = [
        '',
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return `${monthNames[month] ?? `${month}月`} ${year} festival intel`;
    }
    return `${year}年${month}月电音节资讯`;
  }

  return title;
}

export const EventsKnowledgeCard: FC<EventsKnowledgeCardProps> = ({
  card,
  parsedInsight,
  isLoading = false,
}) => {
  const t = useT();
  const locale = useLocale();
  const displayTitle = resolveKnowledgeCardTitle(
    card.title ?? '',
    parsedInsight,
    locale,
    t('events.knowledge.fallbackTitle'),
  );

  return (
    <View className="s-events-knowledge-card" data-cmp="EventsKnowledgeCard">
      <View className="s-events-knowledge-card__header">
        <View className="s-events-knowledge-card__badge" aria-hidden>
          <Sparkles size={12} color="#0b151d" strokeWidth={2.25} />
          <Text className="s-events-knowledge-card__badge-text">
            {t('events.knowledge.kicker')}
          </Text>
        </View>

        {displayTitle ? (
          <Text className="s-events-knowledge-card__title">{displayTitle}</Text>
        ) : null}

        {parsedInsight ? (
          <View className="s-events-knowledge-card__parsed">
            <Text className="s-events-knowledge-card__parsed-label">
              {t('events.knowledge.parsedLabel', { summary: '' })}
            </Text>
            <Text className="s-events-knowledge-card__parsed-value">
              {parsedInsight}
            </Text>
          </View>
        ) : null}

        <View className="s-events-knowledge-card__divider" aria-hidden />
      </View>

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

      {card.compare ? (
        <View className="s-events-knowledge-card__compare">
          <View className="s-events-knowledge-card__compare-header">
            <Text className="s-events-knowledge-card__compare-corner" />
            <Text className="s-events-knowledge-card__compare-col">
              {card.compare.leftName}
            </Text>
            <Text className="s-events-knowledge-card__compare-col">
              {card.compare.rightName}
            </Text>
          </View>
          {card.compare.rows.map((row) => (
            <View key={row.label} className="s-events-knowledge-card__compare-row">
              <Text className="s-events-knowledge-card__compare-label">
                {row.label}
              </Text>
              <Text className="s-events-knowledge-card__compare-cell">{row.left}</Text>
              <Text className="s-events-knowledge-card__compare-cell">{row.right}</Text>
            </View>
          ))}
        </View>
      ) : null}

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
              <Calendar
                size={14}
                color={EVENTS_AI_ACCENT}
                strokeWidth={2}
                className="s-events-knowledge-card__link-icon"
              />
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
          {card.aiGenerated ? ` · ${t('events.knowledge.aiGenerated')}` : ''}
        </Text>
      </View>
    </View>
  );
};
