import './EventsSearchBar.scss';
import type { FC } from 'react';
import { Search, X } from '../../../components/icons';
import { Input, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventsSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  embedded?: boolean;
  compact?: boolean;
  placeholder?: string;
  ariaLabel?: string;
};

export const EventsSearchBar: FC<EventsSearchBarProps> = ({
  value,
  onChange,
  embedded = false,
  compact = false,
  placeholder,
  ariaLabel,
}) => {
  const t = useT();

  return (
    <View
      className={[
        's-events-search',
        embedded ? 's-events-search--embedded' : '',
        compact ? 's-events-search--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel ?? t('events.searchAria')}
    >
      <View className="s-events-search__icon-wrap" aria-hidden>
        <Search size={compact ? 14 : 15} color="rgba(255, 255, 255, 0.55)" />
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
      {value.trim() ? (
        <View
          className="s-events-search__clear"
          role="button"
          aria-label={t('events.searchClear')}
          onClick={() => onChange('')}
        >
          <X size={13} color="rgba(255, 255, 255, 0.55)" aria-hidden />
        </View>
      ) : null}
    </View>
  );
};
