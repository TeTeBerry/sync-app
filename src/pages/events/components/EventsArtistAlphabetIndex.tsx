import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { CATALOG_ARTIST_ALPHABET } from '../../../utils/catalogLineupArtistSort';

type EventsArtistAlphabetIndexProps = {
  availableLetters: Set<string>;
  activeLetter?: string | null;
  onLetterTap: (letter: string) => void;
};

export const EventsArtistAlphabetIndex: FC<EventsArtistAlphabetIndexProps> = ({
  availableLetters,
  activeLetter,
  onLetterTap,
}) => {
  const t = useT();
  const letters = availableLetters.has('#')
    ? [...CATALOG_ARTIST_ALPHABET, '#']
    : [...CATALOG_ARTIST_ALPHABET];

  return (
    <View
      className="s-events__artists-alphabet-index"
      aria-label={t('events.artistsAlphabetIndexAria')}
    >
      {letters.map((letter) => {
        const enabled = availableLetters.has(letter);
        return (
          <View
            key={letter}
            className={[
              's-events__artists-alphabet-letter',
              enabled ? 's-events__artists-alphabet-letter--enabled' : '',
              activeLetter === letter
                ? 's-events__artists-alphabet-letter--active'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={enabled ? () => onLetterTap(letter) : undefined}
          >
            <Text className="s-events__artists-alphabet-letter-text">{letter}</Text>
          </View>
        );
      })}
    </View>
  );
};
