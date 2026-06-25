import './MatchPreferencesSettings.scss';
import { useCallback, useEffect, useState } from 'react';
import { Check } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import {
  updateCurrentUserAndInvalidate,
  useCurrentUserQuery,
} from '../../../../hooks/useSyncApi';
import { saveEncryptedProfileSnapshot } from '../../../../utils/profileSnapshotStorage';
import {
  readProfilePreferenceSortEnabled,
  writeProfilePreferenceSortEnabled,
} from '../../../../utils/profileStorage';
import {
  BUDDY_BUDGET_OPTIONS,
  BUDDY_DEPARTURE_CITIES,
  BUDDY_GENRE_OPTIONS,
  formatBuddyPreferencesSummary,
  normalizeBuddyBudgetLevel,
  type BuddyBudgetLevel,
} from '../../../../constants/buddyPreferences';
import { useT } from '../../../../hooks/useI18n';
import { Input, Text, View } from '@tarojs/components';
import { showAppToast } from '@/utils/appToast';

const MAX_GENRES = 6;

export function BuddyPreferencesSettings() {
  const t = useT();
  const { data: currentUser } = useCurrentUserQuery();
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<BuddyBudgetLevel | ''>('');
  const [preferenceSortEnabled, setPreferenceSortEnabled] = useState(() =>
    readProfilePreferenceSortEnabled(),
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const nextCity = currentUser?.city?.trim() ?? '';
    const preset = BUDDY_DEPARTURE_CITIES.includes(
      nextCity as (typeof BUDDY_DEPARTURE_CITIES)[number],
    );
    setCity(preset ? nextCity : '');
    setCustomCity(preset ? '' : nextCity);
    setGenres(currentUser?.favorGenres ?? []);
    setBudgetLevel(normalizeBuddyBudgetLevel(currentUser?.budgetLevel) ?? '');
    setDirty(false);
  }, [currentUser]);

  const markDirty = useCallback(() => setDirty(true), []);

  const togglePreferenceSort = useCallback(() => {
    setPreferenceSortEnabled((prev) => {
      const next = !prev;
      writeProfilePreferenceSortEnabled(next);
      return next;
    });
  }, []);

  const toggleGenre = useCallback(
    (genre: string) => {
      markDirty();
      setGenres((prev) => {
        if (prev.includes(genre)) {
          return prev.filter((g) => g !== genre);
        }
        if (prev.length >= MAX_GENRES) {
          showAppToast('settings.maxGenres', {
            params: { count: MAX_GENRES },
            icon: 'none',
          });
          return prev;
        }
        return [...prev, genre];
      });
    },
    [markDirty],
  );

  const resolvedCity = (customCity.trim() || city.trim()).trim();

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        city: resolvedCity || undefined,
        favorGenres: genres.length ? genres : undefined,
        budgetLevel: budgetLevel || undefined,
      };
      await updateCurrentUserAndInvalidate(payload);
      await saveEncryptedProfileSnapshot({
        city: payload.city,
        favorGenres: payload.favorGenres,
        budgetLevel: payload.budgetLevel,
        notificationsEnabled: currentUser?.notificationsEnabled,
      });
      setDirty(false);
      showAppToast('common.save', { icon: 'success' });
    } catch {
      showAppToast('common.requestFailed', { icon: 'none' });
    } finally {
      setSaving(false);
    }
  }, [budgetLevel, currentUser?.notificationsEnabled, genres, resolvedCity, saving]);

  const preview = formatBuddyPreferencesSummary({
    city: resolvedCity || undefined,
    favorGenres: genres,
    budgetLevel: budgetLevel || undefined,
  });

  return (
    <View className="s-match-prefs">
      <View className="s-match-prefs__banner">
        <Text className="s-match-prefs__banner-title">
          {t('settings.buddyPrefsBannerTitle')}
        </Text>
        <Text className="s-match-prefs__banner-desc">
          {t('settings.buddyPrefsBannerDesc')}
        </Text>
        <Text className="s-match-prefs__banner-preview">当前：{preview}</Text>
      </View>

      <View className="s-settings__card s-match-prefs__section">
        <View className="s-settings__row">
          <View>
            <View className="s-settings__row-label">
              {t('settings.buddyPrefsRecruitSortToggle')}
            </View>
            <View className="s-settings__row-desc">
              {t('settings.buddyPrefsRecruitSortDesc')}
            </View>
          </View>
          <Button
            role="switch"
            aria-checked={preferenceSortEnabled}
            className={`s-settings__toggle${
              preferenceSortEnabled ? ' s-settings__toggle--on' : ''
            }`}
            onClick={togglePreferenceSort}
          >
            <Text className="s-settings__toggle-knob" />
          </Button>
        </View>
      </View>

      <View className="s-settings__card s-match-prefs__section">
        <Text className="s-match-prefs__label">常驻出发城市</Text>
        <View className="s-match-prefs__chips">
          {BUDDY_DEPARTURE_CITIES.map((item) => (
            <Button
              key={item}
              className={`s-match-prefs__chip${
                city === item && !customCity.trim()
                  ? ' s-match-prefs__chip--active'
                  : ''
              }`}
              hoverClass="s-match-prefs__chip--pressed"
              onClick={() => {
                markDirty();
                setCity(item);
                setCustomCity('');
              }}
            >
              <Text className="s-match-prefs__chip-text">{item}</Text>
            </Button>
          ))}
        </View>
        <Input
          className="s-match-prefs__input"
          placeholder="其它城市（选填）"
          value={customCity}
          onInput={(e) => {
            markDirty();
            setCustomCity(e.detail.value);
            if (e.detail.value.trim()) setCity('');
          }}
        />
      </View>

      <View className="s-settings__card s-match-prefs__section">
        <Text className="s-match-prefs__label">偏好曲风（可多选）</Text>
        <View className="s-match-prefs__chips">
          {BUDDY_GENRE_OPTIONS.map((genre) => (
            <Button
              key={genre}
              className={`s-match-prefs__chip${
                genres.includes(genre) ? ' s-match-prefs__chip--active' : ''
              }`}
              hoverClass="s-match-prefs__chip--pressed"
              onClick={() => toggleGenre(genre)}
            >
              <Text className="s-match-prefs__chip-text">{genre}</Text>
            </Button>
          ))}
        </View>
      </View>

      <View className="s-settings__card s-match-prefs__section">
        <Text className="s-match-prefs__label">住宿预算档位</Text>
        {BUDDY_BUDGET_OPTIONS.map((opt) => (
          <Button
            key={opt.id}
            className={`s-settings__option${
              budgetLevel === opt.id ? ' s-settings__option--selected' : ''
            }`}
            onClick={() => {
              markDirty();
              setBudgetLevel(opt.id);
            }}
          >
            <View>
              <View className="s-settings__option-label">{opt.label}</View>
              <View className="s-settings__option-desc">{opt.hint}</View>
            </View>
            {budgetLevel === opt.id ? (
              <Check size={20} className="s-settings__check" />
            ) : null}
          </Button>
        ))}
      </View>

      <Button
        className="s-settings__feedback-btn s-match-prefs__save"
        disabled={saving || !dirty}
        onClick={() => void handleSave()}
      >
        <Text className="s-btn-label">{saving ? '保存中…' : '保存偏好'}</Text>
      </Button>
    </View>
  );
}
