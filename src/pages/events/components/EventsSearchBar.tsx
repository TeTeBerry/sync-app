import './EventsSearchBar.scss';
import type { FC } from 'react';
import { Search, X } from '../../../components/icons';
import { Input, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventsSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export const EventsSearchBar: FC<EventsSearchBarProps> = ({ value, onChange }) => {
  const t = useT();

  return (
    <View className="s-events-search" aria-label={t('events.searchAria')}>
      <Search size={16} color="var(--muted-foreground)" aria-hidden />
      <Input
        className="s-events-search__input"
        type="text"
        value={value}
        placeholder={t('events.searchPlaceholder')}
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
          <X size={14} color="var(--muted-foreground)" aria-hidden />
        </View>
      ) : null}
    </View>
  );
};
