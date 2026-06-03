import './TeamApplySheet.scss';
import { useCallback, useEffect, useState } from 'react';
import { MapPin, Users, X } from '../icons';
import { Button } from '../ui';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import type { TeamApplyBuddyPreview } from '../../utils/teamApplyBuddyPreview';
import {
  LIGHT_APPLY_GENDER_OPTIONS,
  LIGHT_APPLY_TRIP_DAY_OPTIONS,
  defaultLightApplyDraft,
  type LightApplyDraft,
  type LightApplyGenderPref,
} from '../../utils/lightApplyDraft';
import Taro from '@tarojs/taro';
import { Input, Text, Textarea, View } from '@tarojs/components';

const MESSAGE_MAX_LENGTH = 120;

export type TeamApplySheetMode = 'full' | 'light';

export type TeamApplySheetProps = {
  open: boolean;
  mode?: TeamApplySheetMode;
  buddyPreview?: TeamApplyBuddyPreview | null;
  defaultDepartureCity?: string;
  submitting?: boolean;
  publishPending?: boolean;
  onClose: () => void;
  onConfirm: (payload: { message: string; lightApply?: LightApplyDraft }) => void;
};

export function TeamApplySheet({
  open,
  mode = 'full',
  buddyPreview = null,
  defaultDepartureCity,
  submitting = false,
  publishPending = false,
  onClose,
  onConfirm,
}: TeamApplySheetProps) {
  const busy = submitting || publishPending;
  useOverlayLock(open);
  const [message, setMessage] = useState('');
  const [lightDraft, setLightDraft] = useState<LightApplyDraft>(() =>
    defaultLightApplyDraft({ departureCity: defaultDepartureCity }),
  );

  useEffect(() => {
    if (open) {
      setMessage('');
      setLightDraft(defaultLightApplyDraft({ departureCity: defaultDepartureCity }));
    }
  }, [defaultDepartureCity, open]);

  const handleConfirm = useCallback(() => {
    if (busy) return;

    if (mode === 'light') {
      const city = lightDraft.departureCity.trim();
      if (!city) {
        void Taro.showToast({ title: '请填写出发地', icon: 'none' });
        return;
      }
      onConfirm({
        message: message.trim(),
        lightApply: {
          departureCity: city,
          tripDays: lightDraft.tripDays,
          genderPref: lightDraft.genderPref,
        },
      });
      return;
    }

    onConfirm({ message: message.trim() });
  }, [busy, lightDraft, message, mode, onConfirm]);

  if (!open) return null;

  const isLight = mode === 'light';

  return (
    <View
      className="s-overlay s-overlay--sheet s-team-apply-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-team-apply-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-apply-sheet-title"
      >
        <View className="s-team-apply-sheet__handle" aria-hidden />
        <View className="s-team-apply-sheet__header">
          <View className="s-team-apply-sheet__title-row">
            <View className="s-team-apply-sheet__title-icon" aria-hidden>
              <Users size={16} color="#ff0066" aria-hidden />
            </View>
            <Text id="team-apply-sheet-title" className="s-team-apply-sheet__title">
              申请组队
            </Text>
          </View>
          <Text className="s-team-apply-sheet__subtitle">
            {isLight
              ? '填写简要信息即可申请，之后可再完善组队帖'
              : '你的组队信息将发送给发帖人'}
          </Text>
          <Button
            className="s-team-apply-sheet__close"
            hoverClass="s-team-apply-sheet__close--pressed"
            aria-label="关闭"
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <View className="s-team-apply-sheet__body">
          {isLight ? (
            <View className="s-team-apply-sheet__light">
              <Text className="s-team-apply-sheet__label">出发地（必填）</Text>
              <View className="s-team-apply-sheet__light-input-wrap">
                <MapPin size={14} color="#8e8e93" aria-hidden />
                <Input
                  className="s-team-apply-sheet__light-input"
                  value={lightDraft.departureCity}
                  placeholder="如：广州、上海"
                  placeholderClass="s-team-apply-sheet__light-placeholder"
                  disabled={busy}
                  onInput={(e) =>
                    setLightDraft((prev) => ({
                      ...prev,
                      departureCity: e.detail.value ?? '',
                    }))
                  }
                />
              </View>

              <Text className="s-team-apply-sheet__label">出行天数（选填）</Text>
              <View className="s-team-apply-sheet__chips">
                {LIGHT_APPLY_TRIP_DAY_OPTIONS.map((opt) => {
                  const selected = lightDraft.tripDays === opt.value;
                  return (
                    <Button
                      key={opt.label}
                      className={`s-team-apply-sheet__chip${selected ? ' s-team-apply-sheet__chip--on' : ''}`}
                      hoverClass="s-team-apply-sheet__chip--pressed"
                      disabled={busy}
                      onClick={() =>
                        setLightDraft((prev) => ({
                          ...prev,
                          tripDays: opt.value,
                        }))
                      }
                    >
                      <Text className="s-btn-label">{opt.label}</Text>
                    </Button>
                  );
                })}
              </View>

              <Text className="s-team-apply-sheet__label">性别偏好（选填）</Text>
              <View className="s-team-apply-sheet__chips">
                {LIGHT_APPLY_GENDER_OPTIONS.map((pref) => {
                  const selected = (lightDraft.genderPref ?? '不限') === pref;
                  return (
                    <Button
                      key={pref}
                      className={`s-team-apply-sheet__chip${selected ? ' s-team-apply-sheet__chip--on' : ''}`}
                      hoverClass="s-team-apply-sheet__chip--pressed"
                      disabled={busy}
                      onClick={() =>
                        setLightDraft((prev) => ({
                          ...prev,
                          genderPref: pref as LightApplyGenderPref,
                        }))
                      }
                    >
                      <Text className="s-btn-label">{pref}</Text>
                    </Button>
                  );
                })}
              </View>
            </View>
          ) : buddyPreview?.body ? (
            <View className="s-team-apply-sheet__buddy-card" aria-label="我的组队信息">
              <Text className="s-team-apply-sheet__buddy-card-label">我的组队信息</Text>
              <Text className="s-team-apply-sheet__buddy-card-body">
                {buddyPreview.body}
              </Text>
              {buddyPreview.location ? (
                <View className="s-team-apply-sheet__buddy-card-meta">
                  <MapPin size={12} color="#8e8e93" aria-hidden />
                  <Text className="s-team-apply-sheet__buddy-card-meta-text">
                    {buddyPreview.location}
                  </Text>
                </View>
              ) : null}
              {buddyPreview.tags.length ? (
                <View className="s-team-apply-sheet__buddy-card-tags">
                  {buddyPreview.tags.map((tag) => (
                    <Text key={tag} className="s-team-apply-sheet__buddy-card-tag">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          <Text className="s-team-apply-sheet__label">补充说明（选填）：</Text>
          <View className="s-team-apply-sheet__textarea-wrap">
            <Textarea
              className="s-team-apply-sheet__textarea"
              value={message}
              maxlength={MESSAGE_MAX_LENGTH}
              placeholder={
                isLight ? '我也从现场出发，可以一起走' : '我也从广州出发，可以一起走'
              }
              placeholderStyle="color: rgba(255,255,255,0.28)"
              disabled={busy}
              onInput={(e) => setMessage(e.detail.value ?? '')}
            />
            <Text className="s-team-apply-sheet__count" aria-hidden>
              {message.length}/{MESSAGE_MAX_LENGTH}
            </Text>
          </View>
        </View>

        <View className="s-team-apply-sheet__footer">
          <Button
            className="s-team-apply-sheet__btn s-team-apply-sheet__btn--ghost"
            hoverClass="s-team-apply-sheet__btn--pressed"
            disabled={busy}
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            className={[
              's-team-apply-sheet__btn',
              's-team-apply-sheet__btn--primary',
              busy ? 's-team-apply-sheet__btn--loading' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            hoverClass="s-team-apply-sheet__btn--pressed"
            disabled={busy}
            onClick={handleConfirm}
          >
            {publishPending ? '保存中…' : submitting ? '提交中…' : '确认申请'}
          </Button>
        </View>
      </View>
    </View>
  );
}
