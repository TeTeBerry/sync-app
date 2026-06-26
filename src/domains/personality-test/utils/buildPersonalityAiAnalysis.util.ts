import type { AppLocale } from '@/i18n/types';
import { translate } from '@/i18n/translate';
import type { PersonalityTestCatalog } from '../personalityTestCatalog';
import { getPersonalityMeta } from '../personalityTestCatalog';
import type {
  PersonalityEventRecommendation,
  PersonalityTestResult,
  PersonalityTypeMeta,
} from '../types';

export function resolvePersonalityTypeLabel(
  meta: PersonalityTypeMeta,
  locale: AppLocale,
): string {
  return locale === 'en-US' ? meta.labelEn : meta.label;
}

function tr(locale: AppLocale, key: string, params?: Record<string, string | number>) {
  return translate(key, locale, params);
}

export function buildPersonalityAiAnalysis(
  result: PersonalityTestResult,
  catalog: PersonalityTestCatalog,
  locale: AppLocale,
): string {
  const primary = getPersonalityMeta(catalog, result.score.primaryType);
  const secondary = result.score.secondaryType
    ? getPersonalityMeta(catalog, result.score.secondaryType)
    : null;
  const soulName = result.recommendations.soulMatch.djName;
  const lineupEvent = result.recommendedEvents.find(
    (event) => event.matchedDjs.length > 0,
  );

  const lines: string[] = [
    tr(locale, `personality.analysis.type.${result.score.primaryType}`),
  ];

  if (result.score.blendRatio && secondary) {
    lines.push(
      tr(locale, 'personality.analysis.blendNote', {
        primaryPercent: result.score.blendRatio.primary,
        primaryLabel: resolvePersonalityTypeLabel(primary, locale),
        secondaryPercent: result.score.blendRatio.secondary,
        secondaryLabel: resolvePersonalityTypeLabel(secondary, locale),
      }),
    );
  }

  lines.push(
    tr(locale, 'personality.analysis.genreNote', {
      genres: primary.genreTags.join(' · '),
    }),
  );

  lines.push(
    tr(locale, 'personality.analysis.soulMatch', {
      djName: soulName,
      score: result.recommendations.soulMatch.soulSimilarity,
    }),
  );

  lines.push(resolveEventNote(locale, lineupEvent, soulName));

  return lines.filter(Boolean).join('\n');
}

function resolveEventNote(
  locale: AppLocale,
  lineupEvent: PersonalityEventRecommendation | undefined,
  soulName: string,
): string {
  if (!lineupEvent) {
    return tr(locale, 'personality.analysis.eventBrowseMore');
  }

  if (lineupEvent.matchedDjs.includes(soulName)) {
    return tr(locale, 'personality.analysis.eventWithSoulDj', {
      eventName: lineupEvent.name,
      djName: soulName,
    });
  }

  const separator = tr(locale, 'personality.analysis.djListSeparator');
  return tr(locale, 'personality.analysis.eventWithDjs', {
    eventName: lineupEvent.name,
    djs: lineupEvent.matchedDjs.slice(0, 2).join(separator),
  });
}
