import './MatchPreferencesSettings.scss';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';
import { Check } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import {
  updateCurrentUserAndInvalidate,
  useCurrentUserQuery,
} from '../../../../hooks/useSyncApi';
import { saveEncryptedProfileSnapshot } from '../../../../utils/profileSnapshotStorage';
import {
  formatMatchPreferencesSummary,
  MATCH_BUDGET_OPTIONS,
  MATCH_DEPARTURE_CITIES,
  MATCH_GENRE_OPTIONS,
  normalizeMatchBudgetLevel,
  type MatchBudgetLevel,
} from '../../../../constants/matchPreferences';
import { Input, Text, View } from '@tarojs/components';

const MAX_GENRES = 6;

export function MatchPreferencesSettings() {
  const { data: currentUser } = useCurrentUserQuery();
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<MatchBudgetLevel | ''>('');
  const [likeMate, setLikeMate] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const nextCity = currentUser?.city?.trim() ?? '';
    const preset = MATCH_DEPARTURE_CITIES.includes(
      nextCity as (typeof MATCH_DEPARTURE_CITIES)[number],
    );
    setCity(preset ? nextCity : '');
    setCustomCity(preset ? '' : nextCity);
    setGenres(currentUser?.favorGenres ?? []);
    setBudgetLevel(normalizeMatchBudgetLevel(currentUser?.budgetLevel) ?? '');
    setLikeMate(
      currentUser?.likeMate === true
        ? true
        : currentUser?.likeMate === false
          ? false
          : null,
    );
    setDirty(false);
  }, [currentUser]);

  const markDirty = useCallback(() => setDirty(true), []);

  const toggleGenre = useCallback(
    (genre: string) => {
      markDirty();
      setGenres((prev) => {
        if (prev.includes(genre)) {
          return prev.filter((g) => g !== genre);
        }
        if (prev.length >= MAX_GENRES) {
          void Taro.showToast({
            title: `最多选择 ${MAX_GENRES} 种曲风`,
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
        likeMate: likeMate === null ? undefined : likeMate,
      };
      await updateCurrentUserAndInvalidate(payload);
      await saveEncryptedProfileSnapshot({
        city: payload.city,
        favorGenres: payload.favorGenres,
        budgetLevel: payload.budgetLevel,
        likeMate: payload.likeMate,
        notificationsEnabled: currentUser?.notificationsEnabled,
      });
      setDirty(false);
      void Taro.showToast({ title: '已保存', icon: 'success' });
    } catch {
      void Taro.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
    } finally {
      setSaving(false);
    }
  }, [
    budgetLevel,
    currentUser?.notificationsEnabled,
    genres,
    likeMate,
    resolvedCity,
    saving,
  ]);

  const preview = formatMatchPreferencesSummary({
    city: resolvedCity || undefined,
    favorGenres: genres,
    budgetLevel: budgetLevel || undefined,
    likeMate: likeMate ?? undefined,
  });

  return (
    <View className="s-match-prefs">
      <View className="s-match-prefs__banner">
        <Text className="s-match-prefs__banner-title">用于 AI 匹配与推荐</Text>
        <Text className="s-match-prefs__banner-desc">
          发布组队帖、生成攻略时也会自动补充画像；此处可手动校正，让匹配更透明。
        </Text>
        <Text className="s-match-prefs__banner-preview">当前：{preview}</Text>
      </View>

      <View className="s-settings__card s-match-prefs__section">
        <Text className="s-match-prefs__label">常驻出发城市</Text>
        <View className="s-match-prefs__chips">
          {MATCH_DEPARTURE_CITIES.map((item) => (
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
          {MATCH_GENRE_OPTIONS.map((genre) => (
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
        {MATCH_BUDGET_OPTIONS.map((opt) => (
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

      <View className="s-settings__card s-match-prefs__section">
        <Text className="s-match-prefs__label">结伴意愿</Text>
        <View className="s-match-prefs__mate-row">
          {(
            [
              { value: true, label: '想找搭子' },
              { value: false, label: '不限' },
            ] as const
          ).map((opt) => (
            <Button
              key={String(opt.value)}
              className={`s-match-prefs__mate-btn${
                likeMate === opt.value ? ' s-match-prefs__mate-btn--active' : ''
              }`}
              hoverClass="s-match-prefs__mate-btn--pressed"
              onClick={() => {
                markDirty();
                setLikeMate(opt.value);
              }}
            >
              <Text className="s-match-prefs__mate-btn-text">{opt.label}</Text>
            </Button>
          ))}
        </View>
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
