import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import {
  Bookmark,
  Calendar,
  ChevronRight,
  MapPin,
  RefreshCw,
  Share2,
} from '@/components/icons';
import { Button } from '@/components/ui';
import {
  getCachedPersonalityTestCatalog,
  getDjSoulProfile,
  getPersonalityMeta,
  loadPersonalityTestCatalog,
  savePersonalityPoster,
  sharePersonalityPoster,
  buildPersonalityBuddyPostPrefill,
} from '@/domains/personality-test';
import type { PersonalityEventRecommendation, PersonalityTestResult } from '../types';
import { getActivityStatusFromActivity } from '@/utils/activityStatus';
import {
  goEventDetail,
  goEventDetailWithBuddyPostPrefill,
  goExclusiveItinerary,
} from '@/utils/route';
import { buildPersonalityItinerarySelection } from '../utils/buildPersonalityItinerarySelection';
import { resolvePersonalityMediaUrl } from '../utils/resolvePersonalityMedia';
import { useT } from '@/hooks/useI18n';
import { formatActivityLocationLabel } from '@/utils/formatActivityDisplay';
import { Text, View, Image } from '@tarojs/components';

type PersonalityResultViewProps = {
  result: PersonalityTestResult;
  onRestart: () => void;
  isWeapp?: boolean;
};

function eventIncludesDj(
  event: PersonalityEventRecommendation,
  djName: string,
): boolean {
  const target = djName.trim().toLowerCase();
  return event.matchedDjs.some((name) => name.trim().toLowerCase() === target);
}

function isUpcomingEvent(event: PersonalityEventRecommendation): boolean {
  return getActivityStatusFromActivity(event.dateLabel, event.name) !== 'ended';
}

export const PersonalityResultView: FC<PersonalityResultViewProps> = ({
  result,
  onRestart,
  isWeapp = false,
}) => {
  const t = useT();
  const [catalog, setCatalog] = useState(() => getCachedPersonalityTestCatalog());
  const soul = result.recommendations.soulMatch;
  const [similarityDisplay, setSimilarityDisplay] = useState(0);
  const [raverAvatarUrl, setRaverAvatarUrl] = useState('');

  const tierLabel = useCallback(
    (tier: string): string => {
      if (tier === 'must_see') return t('personality.mustSee');
      if (tier === 'recommended') return t('personality.recommended');
      return t('personality.challenge');
    },
    [t],
  );

  const formatSpiritConnectionLine = useCallback(
    (entry: { role: 'soul' | 'aligned'; djName: string } | string): string => {
      if (typeof entry === 'string') {
        if (entry.includes('·')) return entry;
        return t('personality.soulArtistLine', { name: entry });
      }
      return entry.role === 'soul'
        ? t('personality.soulResonanceLine', { name: entry.djName })
        : t('personality.alignedArtistLine', { name: entry.djName });
    },
    [t],
  );

  useEffect(() => {
    if (!result.raverAvatarKey?.trim()) {
      setRaverAvatarUrl('');
      return;
    }
    let cancelled = false;
    void resolvePersonalityMediaUrl(result.raverAvatarKey).then((url) => {
      if (!cancelled) {
        setRaverAvatarUrl(url);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [result.raverAvatarKey]);

  useEffect(() => {
    void loadPersonalityTestCatalog()
      .then(setCatalog)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const target = soul.soulSimilarity;
    if (target <= 0) {
      setSimilarityDisplay(0);
      return;
    }
    let frame = 0;
    const steps = 20;
    const timer = setInterval(() => {
      frame += 1;
      setSimilarityDisplay(Math.round((target * frame) / steps));
      if (frame >= steps) {
        clearInterval(timer);
        setSimilarityDisplay(target);
      }
    }, 35);
    return () => clearInterval(timer);
  }, [soul.soulSimilarity]);

  const lineupEvents = result.recommendedEvents.filter(
    (event) => event.matchedDjs.length > 0 && isUpcomingEvent(event),
  );
  const confirmedSoulEvent = lineupEvents.find((event) =>
    eventIncludesDj(event, soul.djName),
  );
  const itineraryTargetEvent = confirmedSoulEvent ?? lineupEvents[0];

  const liveInfoLabel = useMemo(() => {
    if (!confirmedSoulEvent) {
      return '';
    }
    return [
      confirmedSoulEvent.name,
      confirmedSoulEvent.dateLabel,
      confirmedSoulEvent.location,
    ]
      .filter(Boolean)
      .join(' · ');
  }, [confirmedSoulEvent]);

  if (!catalog) {
    return (
      <View className="s-personality-result">
        <Text className="s-personality-result__celebrate">
          {t('personality.loadingResults')}
        </Text>
      </View>
    );
  }

  const primary = getPersonalityMeta(catalog, result.score.primaryType);
  const secondary = result.score.secondaryType
    ? getPersonalityMeta(catalog, result.score.secondaryType)
    : null;
  const soulProfile = getDjSoulProfile(catalog, soul.djId);

  const blendLabel =
    result.score.blendRatio && secondary
      ? `${result.score.blendRatio.primary}% ${primary.label} + ${result.score.blendRatio.secondary}% ${secondary.label}`
      : null;

  const djSections = [
    { title: t('personality.mustSee'), items: result.recommendations.mustSee },
    {
      title: t('personality.recommended'),
      items: result.recommendations.recommended,
    },
    { title: t('personality.challenge'), items: result.recommendations.challenge },
  ].filter((section) => section.items.length > 0);

  const handlePrefillBuddyPost = () => {
    if (!itineraryTargetEvent) {
      void Taro.showToast({
        title: t('personality.noRecommendation'),
        icon: 'none',
      });
      return;
    }
    const prefill = buildPersonalityBuddyPostPrefill(
      result,
      itineraryTargetEvent,
      catalog,
    );
    goEventDetailWithBuddyPostPrefill(itineraryTargetEvent.activityLegacyId, prefill);
  };

  const handleGenerateItinerary = () => {
    if (!itineraryTargetEvent) {
      void Taro.showToast({
        title: t('personality.noLineup'),
        icon: 'none',
      });
      return;
    }
    const selection = buildPersonalityItinerarySelection(result, itineraryTargetEvent);
    goExclusiveItinerary(
      itineraryTargetEvent.activityLegacyId,
      selection.selectedDjIds,
      {
        focusDjName: selection.focusDjName,
        selectedDjNames: selection.selectedDjNames,
      },
    );
  };

  const handleSavePoster = async () => {
    try {
      await savePersonalityPoster(result);
    } catch {
      void Taro.showToast({ title: t('personality.saveFailed'), icon: 'none' });
    }
  };

  const handleSharePoster = async () => {
    try {
      await sharePersonalityPoster(result);
    } catch {
      void Taro.showToast({ title: t('personality.shareFailed'), icon: 'none' });
    }
  };

  return (
    <View className="s-personality-result">
      <Text className="s-personality-result__celebrate">
        {t('personality.celebrate')}
      </Text>

      <View
        className="s-personality-result__hero"
        style={{ borderColor: `${primary.primaryColor}44` }}
      >
        <View className="s-personality-result__hero-glow" aria-hidden />
        <Text className="s-personality-result__hero-emoji" aria-hidden>
          {primary.emoji}
        </Text>
        {result.raverNickname || raverAvatarUrl ? (
          <View className="s-personality-result__hero-identity">
            {raverAvatarUrl ? (
              <Image
                className="s-personality-result__hero-avatar"
                src={raverAvatarUrl}
                mode="aspectFill"
              />
            ) : null}
            {result.raverNickname ? (
              <Text className="s-personality-result__hero-nickname">
                {result.raverNickname}
              </Text>
            ) : null}
          </View>
        ) : null}
        <Text className="s-personality-result__hero-dj">
          {primary.emoji} {soul.djName} {primary.emoji}
        </Text>
        <Text className="s-personality-result__hero-genre">{soul.genreLabel}</Text>

        <View className="s-personality-result__similarity">
          <View className="s-personality-result__similarity-ring" aria-hidden>
            <View
              className="s-personality-result__similarity-arc"
              style={{
                background: `conic-gradient(${primary.primaryColor} ${similarityDisplay * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
              }}
            />
            <View className="s-personality-result__similarity-ring-hole" />
          </View>
          <View className="s-personality-result__similarity-copy">
            <Text className="s-personality-result__similarity-label">
              {t('personality.similarityLabel')}
            </Text>
            <Text
              className="s-personality-result__similarity-value"
              style={{ color: primary.primaryColor }}
            >
              {similarityDisplay}%
            </Text>
          </View>
        </View>

        <Text className="s-personality-result__hero-tagline">
          「{result.narrative.tagline}」
        </Text>
      </View>

      <View
        className="s-personality-result__chip"
        style={{ borderColor: `${primary.primaryColor}44` }}
      >
        <Text className="s-personality-result__chip-text">
          {primary.emoji} {primary.label} · {primary.labelEn}
        </Text>
        {blendLabel ? (
          <Text className="s-personality-result__chip-sub">{blendLabel}</Text>
        ) : null}
      </View>

      <View className="s-personality-result__card">
        <Text className="s-personality-result__section-title">
          {t('personality.aiAnalysis')}
        </Text>
        <Text className="s-personality-result__analysis">
          {result.narrative.aiAnalysis}
        </Text>
      </View>

      {result.narrative.spiritConnections.length > 0 ? (
        <View className="s-personality-result__card">
          <Text className="s-personality-result__section-title">
            {t('personality.spiritConnection')}
          </Text>
          <View
            className="s-personality-result__spirit-card"
            style={{ borderLeftColor: primary.primaryColor }}
          >
            {result.narrative.spiritConnections.map((entry) => {
              const line = formatSpiritConnectionLine(entry);
              return (
                <Text key={line} className="s-personality-result__spirit-line">
                  {line}
                </Text>
              );
            })}
          </View>
        </View>
      ) : null}

      {confirmedSoulEvent ? (
        <View className="s-personality-result__card">
          <Text className="s-personality-result__section-title">
            {t('personality.lineupAnnounced')}
          </Text>
          <View
            className="s-personality-result__live-card"
            onClick={() => goEventDetail(confirmedSoulEvent.activityLegacyId)}
            role="button"
            aria-label={liveInfoLabel}
          >
            <MapPin size={16} color="#ff4d94" />
            <Text className="s-personality-result__live-text">{liveInfoLabel}</Text>
          </View>
        </View>
      ) : null}

      {djSections.length > 0 ? (
        <View className="s-personality-result__card">
          <Text className="s-personality-result__section-title">
            {t('personality.lineupRecommendation')}
          </Text>
          <Text className="s-personality-result__section-meta">
            {t('personality.basedOn', { track: soulProfile.signatureTrack })}
          </Text>

          {djSections.map((section) => (
            <View key={section.title} className="s-personality-result__dj-section">
              <Text className="s-personality-result__dj-heading">{section.title}</Text>
              {section.items.map((item) => (
                <View
                  key={`${section.title}-${item.djId}`}
                  className="s-personality-result__dj-row"
                >
                  <View className="s-personality-result__dj-main">
                    <Text className="s-personality-result__dj-name">{item.djName}</Text>
                    <Text className="s-personality-result__dj-genre">
                      {item.genreLabel}
                    </Text>
                    {item.highlight ? (
                      <Text className="s-personality-result__dj-highlight">
                        {item.highlight}
                      </Text>
                    ) : null}
                  </View>
                  <View className="s-personality-result__dj-score-col">
                    <Text className="s-personality-result__dj-score">
                      {item.matchScore}%
                    </Text>
                    <Text className="s-personality-result__dj-tier">
                      {tierLabel(item.tier)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {lineupEvents.length > 0 ? (
        <View className="s-personality-result__card">
          <Text className="s-personality-result__section-title">
            {t('personality.eventRecommendation')}
          </Text>
          <Text className="s-personality-result__section-meta">
            {t('personality.basedOn', { track: '' })}
          </Text>
          <View className="s-personality-result__event-list">
            {lineupEvents.map((event) => {
              const includesSoul = eventIncludesDj(event, soul.djName);
              return (
                <View
                  key={event.activityLegacyId}
                  className="s-personality-result__event-card"
                  hoverClass="s-personality-result__event-card--pressed"
                  hoverStayTime={80}
                  onClick={() => goEventDetail(event.activityLegacyId)}
                  role="button"
                  aria-label={`${event.name}，${event.matchedDjs.join('、')}`}
                >
                  <View
                    className="s-personality-result__event-card-glow"
                    style={{ background: `${primary.primaryColor}22` }}
                    aria-hidden
                  />
                  <View className="s-personality-result__event-card-inner">
                    <View className="s-personality-result__event-card-head">
                      <Text className="s-personality-result__event-name">
                        {event.name}
                      </Text>
                      <View
                        className={[
                          's-personality-result__event-badge',
                          includesSoul ? 's-personality-result__event-badge--soul' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={
                          includesSoul
                            ? {
                                borderColor: `${primary.primaryColor}66`,
                                background: `${primary.primaryColor}18`,
                              }
                            : undefined
                        }
                      >
                        <Text
                          className="s-personality-result__event-badge-text"
                          style={
                            includesSoul ? { color: primary.primaryColor } : undefined
                          }
                        >
                          {includesSoul
                            ? t('personality.containsSoulDj')
                            : t('personality.lineupAnnouncedShort')}
                        </Text>
                      </View>
                    </View>

                    <View className="s-personality-result__event-details">
                      {event.dateLabel ? (
                        <View className="s-personality-result__event-detail">
                          <Calendar size={13} color="#8e8e93" aria-hidden />
                          <Text className="s-personality-result__event-detail-text">
                            {event.dateLabel}
                          </Text>
                        </View>
                      ) : null}
                      {event.location ? (
                        <View className="s-personality-result__event-detail">
                          <MapPin size={13} color="#8e8e93" aria-hidden />
                          <Text className="s-personality-result__event-detail-text">
                            {formatActivityLocationLabel(event.location)}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {event.matchedDjs.length > 0 ? (
                      <View className="s-personality-result__event-dj-block">
                        <Text className="s-personality-result__event-dj-label">
                          {t('personality.lineupMatch')}
                        </Text>
                        <View className="s-personality-result__event-dj-chips">
                          {event.matchedDjs.slice(0, 5).map((djName) => {
                            const isSoul =
                              djName.trim().toLowerCase() ===
                              soul.djName.trim().toLowerCase();
                            return (
                              <View
                                key={djName}
                                className={[
                                  's-personality-result__event-dj-chip',
                                  isSoul
                                    ? 's-personality-result__event-dj-chip--soul'
                                    : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                style={
                                  isSoul
                                    ? {
                                        borderColor: `${primary.primaryColor}55`,
                                        background: `${primary.primaryColor}14`,
                                      }
                                    : undefined
                                }
                              >
                                <Text
                                  className="s-personality-result__event-dj-chip-text"
                                  style={
                                    isSoul ? { color: primary.primaryColor } : undefined
                                  }
                                >
                                  {djName}
                                </Text>
                              </View>
                            );
                          })}
                          {event.matchedDjs.length > 5 ? (
                            <Text className="s-personality-result__event-dj-more">
                              +{event.matchedDjs.length - 5}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ) : null}

                    <View className="s-personality-result__event-card-foot">
                      <Text className="s-personality-result__event-card-cta">
                        {t('personality.viewEventDetail')}
                      </Text>
                      <ChevronRight size={14} color="#8e8e93" aria-hidden />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View className="s-personality-result__primary-actions">
        <Button
          className="s-personality-result__cta s-personality-result__cta--primary"
          onClick={handlePrefillBuddyPost}
        >
          {t('personality.prefillBuddyPost')}
        </Button>
        <Button className="s-personality-result__cta" onClick={handleGenerateItinerary}>
          {t('personality.generateItinerary')}
        </Button>
      </View>

      <View className="s-personality-result__secondary-actions">
        <Button
          className="s-personality-result__secondary"
          onClick={() => void handleSavePoster()}
        >
          <Bookmark size={15} color="#fff" />
          <Text className="s-personality-result__secondary-label">
            {t('personality.saveSoul')}
          </Text>
        </Button>
        <Button className="s-personality-result__secondary" onClick={onRestart}>
          <RefreshCw size={15} color="#fff" />
          <Text className="s-personality-result__secondary-label">
            {t('personality.retakeTest')}
          </Text>
        </Button>
        <Button
          className="s-personality-result__secondary"
          onClick={() => void handleSharePoster()}
        >
          <Share2 size={15} color="#fff" />
          <Text className="s-personality-result__secondary-label">
            {t('personality.sharePoster')}
          </Text>
        </Button>
        {isWeapp ? (
          <Button className="s-personality-result__secondary" openType="share">
            <Share2 size={15} color="#fff" />
            <Text className="s-personality-result__secondary-label">
              {t('personality.shareWithFriends')}
            </Text>
          </Button>
        ) : null}
      </View>
    </View>
  );
};
