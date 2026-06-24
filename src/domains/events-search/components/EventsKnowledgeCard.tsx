import './EventsKnowledgeCard.scss';
import type { FC } from 'react';
import { ChevronRight, Sparkles } from '@/components/icons';
import { Text, View } from '@tarojs/components';
import { useLocale, useT } from '@/hooks/useI18n';
import type { KnowledgeCardPayload } from '@sync/scene-contracts';
import { goEventDetail } from '@/utils/route';

const GENERIC_KNOWLEDGE_TITLES = new Set(['电音节资讯', 'Festival intel']);

type EventsKnowledgeCardProps = {
  card: KnowledgeCardPayload;
  parsedInsight?: string | null;
  isLoading?: boolean;
};

type ParsedBulletSection = {
  heading?: string;
  intro?: string;
  bullets?: string[];
  body?: string;
};

function resolveKnowledgeHeadline(
  title: string,
  parsedInsight: string | null | undefined,
  locale: string,
  fallbackTitle: string,
  sections: KnowledgeCardPayload['sections'],
): string | null {
  const intro = sections[0]?.body?.trim();
  const countMatch = intro?.match(/(\d+)\s*场/);
  if (countMatch && parsedInsight?.trim()) {
    const count = countMatch[1];
    if (locale.toLowerCase().startsWith('en')) {
      return `${count} related festival${count === '1' ? '' : 's'}`;
    }
    return `找到 ${count} 场相关电音节`;
  }

  const isGeneric =
    GENERIC_KNOWLEDGE_TITLES.has(title) ||
    title === fallbackTitle ||
    /^festival intel$/i.test(title);

  if (isGeneric && parsedInsight?.trim()) {
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
        return `${monthNames[month] ?? month} ${year}`;
      }
      return `${year}年${month}月`;
    }
    return parsedInsight.trim();
  }

  return title.trim() || null;
}

function normalizeSections(
  sections: KnowledgeCardPayload['sections'],
): ParsedBulletSection[] {
  return sections.map((section) => {
    const body = section.body?.trim() ?? '';
    const lines = body
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const bullets = lines
      .filter((line) => line.startsWith('•'))
      .map((line) => line.replace(/^•\s*/, '').trim());
    const intro =
      lines.find((line) => !line.startsWith('•') && !line.startsWith('-')) ?? undefined;

    if (bullets.length > 0) {
      return {
        heading: section.heading?.trim() || undefined,
        intro,
        bullets,
        body: bullets.length === lines.length ? undefined : body,
      };
    }

    return {
      heading: section.heading?.trim() || undefined,
      body,
    };
  });
}

function shouldHideIntro(intro: string | undefined): boolean {
  if (!intro) return true;
  return /找到\s*\d+\s*场/.test(intro);
}

export const EventsKnowledgeCard: FC<EventsKnowledgeCardProps> = ({
  card,
  parsedInsight,
  isLoading = false,
}) => {
  const t = useT();
  const locale = useLocale();
  const headline = resolveKnowledgeHeadline(
    card.title ?? '',
    parsedInsight,
    locale,
    t('events.knowledge.fallbackTitle'),
    card.sections,
  );
  const sections = normalizeSections(card.sections);

  return (
    <View className="s-events-knowledge-card" data-cmp="EventsKnowledgeCard">
      <View className="s-events-knowledge-card__header">
        <View className="s-events-knowledge-card__meta">
          <View className="s-events-knowledge-card__badge" aria-hidden>
            <Sparkles size={12} color="#4cc9f0" strokeWidth={2} />
            <Text className="s-events-knowledge-card__badge-text">
              {t('events.knowledge.kicker')}
            </Text>
          </View>
          {parsedInsight?.trim() ? (
            <Text className="s-events-knowledge-card__query-chip">
              {parsedInsight.trim()}
            </Text>
          ) : null}
        </View>

        {headline ? (
          <Text className="s-events-knowledge-card__headline">{headline}</Text>
        ) : null}
      </View>

      {isLoading ? (
        <View className="s-events-knowledge-card__loading-wrap">
          <View className="s-events-knowledge-card__loading-bar" />
          <Text className="s-events-knowledge-card__loading">
            {t('events.knowledge.loading')}
          </Text>
        </View>
      ) : (
        <View className="s-events-knowledge-card__sections">
          {sections.map((section, index) => (
            <View
              key={`${section.heading ?? 'section'}-${index}`}
              className="s-events-knowledge-card__section"
            >
              {section.heading ? (
                <Text className="s-events-knowledge-card__section-heading">
                  {section.heading}
                </Text>
              ) : null}

              {section.intro && !shouldHideIntro(section.intro) ? (
                <Text className="s-events-knowledge-card__section-intro">
                  {section.intro}
                </Text>
              ) : null}

              {section.bullets?.length ? (
                <View className="s-events-knowledge-card__bullets">
                  {section.bullets.map((line) => (
                    <View key={line} className="s-events-knowledge-card__bullet-row">
                      <View className="s-events-knowledge-card__bullet-dot" />
                      <Text className="s-events-knowledge-card__bullet-text">
                        {line}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : section.body ? (
                <Text className="s-events-knowledge-card__section-body">
                  {section.body}
                </Text>
              ) : null}
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
              <Text className="s-events-knowledge-card__link-text">{link.label}</Text>
              <ChevronRight
                size={14}
                color="#4cc9f0"
                strokeWidth={2}
                className="s-events-knowledge-card__link-chevron"
              />
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
