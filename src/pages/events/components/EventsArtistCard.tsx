import type { FC } from 'react';
import { Image, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import type { CatalogLineupArtist } from '../../../types/backend';
import { getCatalogArtistPrimaryGenreLabel } from '../../../utils/catalogLineupArtistGenres';

type EventsArtistCardProps = {
  artist: CatalogLineupArtist;
  rankTier?: number;
  thumbSrc?: string;
  backdropSrc?: string;
  onOpenArtist: (artistId: string) => void;
};

export const EventsArtistCard: FC<EventsArtistCardProps> = ({
  artist,
  rankTier = 0,
  thumbSrc,
  backdropSrc,
  onOpenArtist,
}) => {
  const t = useT();
  const primaryGenre = getCatalogArtistPrimaryGenreLabel(artist) || null;
  const chineseAliases = artist.chineseAliases ?? [];

  return (
    <View
      className={[
        's-events__artist-card',
        rankTier > 0 ? `s-events__artist-card--rank-${rankTier}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      hoverClass="s-events__artist-card--pressed"
      onClick={() => onOpenArtist(artist.id)}
    >
      {backdropSrc ? (
        <View className="s-events__artist-card-backdrop" aria-hidden>
          <Image
            src={backdropSrc}
            className="s-events__artist-card-backdrop-img"
            mode="aspectFill"
          />
          <View
            className={[
              's-events__artist-card-backdrop-scrim',
              rankTier > 0
                ? `s-events__artist-card-backdrop-scrim--rank-${rankTier}`
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </View>
      ) : null}
      <View className="s-events__artist-avatar-stage">
        <View className="s-events__artist-avatar-glow" aria-hidden />
        <View className="s-events__artist-avatar-wrap">
          <ImageWithFallback
            src={thumbSrc}
            alt={artist.name}
            wrapperClassName="s-events__artist-avatar"
            imageClassName="s-events__artist-avatar-img"
            fallbackWrapperClassName="s-events__artist-avatar s-events__artist-avatar--fallback"
            fallback={artist.name.slice(0, 2)}
          />
        </View>
      </View>
      <View className="s-events__artist-info">
        <Text className="s-events__artist-name s-line-clamp-2">{artist.name}</Text>
        {chineseAliases.length ? (
          <Text className="s-events__artist-aliases s-line-clamp-1">
            {chineseAliases.join('、')}
          </Text>
        ) : null}
        {primaryGenre ? (
          <View className="s-events__artist-genres">
            <View className="s-events__artist-genre-chip">
              <Text className="s-events__artist-genre-chip-text s-line-clamp-1">
                {primaryGenre}
              </Text>
            </View>
          </View>
        ) : null}
        <View className="s-events__artist-stats">
          <Text className="s-events__artist-count">
            {t('events.artistActivityCount', {
              count: artist.activityCount,
            })}
          </Text>
        </View>
      </View>
      {artist.nextActivity ? (
        <View className="s-events__artist-next-strip">
          <Text className="s-events__artist-next-kicker">
            {t('events.artistNextKicker')}
          </Text>
          <Text className="s-events__artist-next-value s-line-clamp-1">
            {artist.nextActivity.name}
          </Text>
          <Text className="s-events__artist-next-date">{artist.nextActivity.date}</Text>
        </View>
      ) : null}
    </View>
  );
};
