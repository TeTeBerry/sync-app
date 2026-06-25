import type { FC } from 'react';
import { ScrollView, View } from '@tarojs/components';
import { Chip, ChipRow } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import type { CatalogArtistGenreChip } from '../../../utils/catalogLineupArtistGenres';

type EventsArtistGenreChipsProps = {
  chips: CatalogArtistGenreChip[];
  selectedGenre: string | null;
  onGenreChange: (genre: string | null) => void;
};

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
        <ChipRow className="s-events__artists-genre-chips-row">
          {chips.map((chip) => (
            <Chip
              key={chip.id}
              active={selectedGenre === chip.id}
              label={chip.label}
              onClick={() => handleGenreClick(chip.id)}
            />
          ))}
        </ChipRow>
      </ScrollView>
    </View>
  );
};
