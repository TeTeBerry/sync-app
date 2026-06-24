import './EventsSearchBar.scss';
import type { FC } from 'react';
import { Search, Sparkles, X } from '../../../components/icons';
import { Input, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventsSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  aiActive?: boolean;
  isSearching?: boolean;
  placeholder?: string;
  ariaLabel?: string;
};

export const EventsSearchBar: FC<EventsSearchBarProps> = ({
  value,
  onChange,
  aiActive = false,
  isSearching = false,
  placeholder,
  ariaLabel,
}) => {
  const t = useT();
  const trimmed = value.trim();
  const showAi = aiActive && trimmed.length > 0;

  return (
    <View
      className={[
        's-events-search',
        's-events-search--embedded',
        's-events-search--compact',
        showAi ? 's-events-search--ai' : '',
        isSearching ? 's-events-search--loading' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel ?? t('events.searchAria')}
    >
      <View className="s-events-search__leading" aria-hidden>
        {showAi ? (
          <Sparkles size={16} color="#4cc9f0" strokeWidth={2} />
        ) : (
          <Search size={16} color="rgba(255, 255, 255, 0.42)" strokeWidth={2} />
        )}
      </View>
      <Input
        className="s-events-search__input"
        type="text"
        value={value}
        placeholder={placeholder ?? t('events.searchPlaceholder')}
        placeholderClass="s-events-search__placeholder"
        confirmType="search"
        onInput={(event) => onChange(event.detail.value)}
      />
      {trimmed ? (
        <View
          className="s-events-search__clear"
          role="button"
          aria-label={t('events.searchClear')}
          onClick={() => onChange('')}
        >
          <X size={14} color="rgba(255, 255, 255, 0.5)" aria-hidden />
        </View>
      ) : null}
    </View>
  );
};
