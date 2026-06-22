import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import type { ItineraryDj } from '@/types/itinerary';

type LineupArtistGridProps = {
  artists: ItineraryDj[];
};

export const LineupArtistGrid: FC<LineupArtistGridProps> = ({ artists }) => {
  return (
    <View className="s-activity-lineup__artist-grid">
      {artists.map((artist, index) => (
        <View
          key={artist.id}
          className={[
            's-activity-lineup__artist-card',
            index % 2 === 0
              ? 's-activity-lineup__artist-card--pink'
              : 's-activity-lineup__artist-card--purple',
          ].join(' ')}
        >
          <Text className="s-activity-lineup__artist-name">{artist.name}</Text>
          <Text className="s-activity-lineup__artist-genre">{artist.genreLabel}</Text>
        </View>
      ))}
    </View>
  );
};
