import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventsArtistGenrePreferenceToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const EventsArtistGenrePreferenceToggle: FC<
  EventsArtistGenrePreferenceToggleProps
> = ({ checked, onChange }) => {
  const t = useT();

  return (
    <View
      className="s-events__artists-preference-toggle"
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      aria-label={t('events.artistsGenrePreferenceSortAria')}
    >
      <View
        className={[
          's-events__artists-preference-toggle-check',
          checked ? 's-events__artists-preference-toggle-check--on' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <Text className="s-events__artists-preference-toggle-label">
        {t('events.artistsGenrePreferenceInsight')}
      </Text>
    </View>
  );
};
