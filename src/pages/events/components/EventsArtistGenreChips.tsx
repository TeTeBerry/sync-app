import type { FC } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import type { CatalogArtistGenreChip } from '../../../utils/catalogLineupArtistGenres';

type EventsArtistGenreChipsProps = {
  chips: CatalogArtistGenreChip[];
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
};

function GenreChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <View
      className={[
        's-events-catalog-filters__chip',
        active ? 's-events-catalog-filters__chip--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      {active ? (
        <View className="s-events-catalog-filters__chip-accent" aria-hidden />
      ) : null}
      <Text
        className={[
          's-events-catalog-filters__chip-text',
          active ? 's-events-catalog-filters__chip-text--active' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {label}
      </Text>
    </View>
  );
}

export const EventsArtistGenreChips: FC<EventsArtistGenreChipsProps> = ({
  chips,
  selectedGenre,
  onGenreChange,
}) => {
  const t = useT();

  if (!chips.length) {
    return null;
  }

  const handleGenreClick = (genreId: string) => {
    onGenreChange(selectedGenre === genreId ? null : genreId);
  };

  return (
    <View
      className="s-events__artists-genre-chips"
      aria-label={t('events.artistsGenreAria')}
    >
      <ScrollView
        scrollX
        enhanced
        showScrollbar={false}
        className="s-events__artists-genre-chips-scroll s-scrollbar-none"
      >
        <View className="s-events-catalog-filters__row s-events__artists-genre-chips-row">
          {chips.map((chip) => (
            <GenreChip
              key={chip.id}
              active={selectedGenre === chip.id}
              label={chip.label}
              onClick={() => handleGenreClick(chip.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
