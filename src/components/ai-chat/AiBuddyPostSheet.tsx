import './AiGuidePlanSheet.scss';
import './AiBuddyPostSheet.scss';
import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Send, Users, X } from '../../components/icons';
import { Button, cn } from '../ui';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import type {
  AiBuddyPostFormValues,
  AiBuddyPostSubmitPayload,
  BuddyPostTagId,
} from '../../types/buddyPost';
import { BUDDY_POST_TAG_OPTIONS } from '../../types/buddyPost';
import { defaultBuddyPostForm } from '../../utils/buddyPostForm';
import { Input, Picker, ScrollView, Text, Textarea, View } from '@tarojs/components';

const NOTE_MAX_LENGTH = 120;
const BUDDY_PICKER_ICON_COLOR = '#64d2ff';

export type AiBuddyPostSheetProps = {
  open: boolean;
  activityDate?: string;
  activityTitle?: string;
  initialValues?: AiBuddyPostFormValues | null;
  /** Apply-team flow: let user choose whether the post appears on the activity feed. */
  showSyncToFeedOption?: boolean;
  onClose: () => void;
  onSubmit: (values: AiBuddyPostSubmitPayload) => void | Promise<void>;
};

function FeedSyncToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Button
      className={cn(
        's-ai-guide-plan-sheet__toggle',
        checked && 's-ai-guide-plan-sheet__toggle--on',
      )}
      role="switch"
      aria-checked={checked}
      aria-label="同步到帖子列表"
      hoverClass="s-ai-guide-plan-sheet__toggle--pressed"
      onClick={() => onChange(!checked)}
    >
      <View className="s-ai-guide-plan-sheet__toggle-knob" aria-hidden />
    </Button>
  );
}

function displayDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${Number(m[2])}月${Number(m[3])}日`;
}

export function AiBuddyPostSheet({
  open,
  activityDate,
  activityTitle: _activityTitle,
  initialValues,
  showSyncToFeedOption = false,
  onClose,
  onSubmit,
}: AiBuddyPostSheetProps) {
  useOverlayLock(open);

  const defaults = useMemo(() => defaultBuddyPostForm(activityDate), [activityDate]);

  /** 微信 scroll-view 须明确高度，flex 子项不能为 height:0 */
  const scrollHeightPx = useMemo(() => {
    const win = Taro.getWindowInfo();
    const panelMax = Math.min(win.windowHeight * 0.82, 640);
    const chrome = 8 + 52 + 76 + 20;
    return Math.max(300, Math.floor(panelMax - chrome));
  }, []);

  const [scrollTop, setScrollTop] = useState(0);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [location, setLocation] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [tags, setTags] = useState<BuddyPostTagId[]>(['team']);
  const [note, setNote] = useState('');
  const [syncToPostList, setSyncToPostList] = useState(true);

  useEffect(() => {
    if (!open) return;
    setScrollTop(0);
    setSyncToPostList(true);
    const seed = initialValues ?? defaults;
    if (seed) {
      setDateStart(seed.dateStart);
      setDateEnd(seed.dateEnd);
      setLocation(seed.location);
      setHeadcount(seed.headcount);
      setTags(seed.tags.length ? seed.tags : ['team']);
      setNote(seed.note ?? '');
      return;
    }
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setDateStart(iso);
    setDateEnd(iso);
    setLocation('');
    setHeadcount('');
    setTags(['team']);
    setNote('');
  }, [defaults, initialValues, open]);

  const toggleTag = useCallback((id: BuddyPostTagId) => {
    setTags((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((t) => t !== id);
        return next.length ? next : prev;
      }
      return [...prev, id];
    });
  }, []);

  const canSubmit =
    Boolean(dateStart && dateEnd && location.trim() && headcount.trim()) &&
    dateEnd >= dateStart;

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    void Promise.resolve(
      onSubmit({
        dateStart,
        dateEnd,
        location: location.trim(),
        headcount: headcount.trim(),
        tags: tags.length ? tags : ['team'],
        note: note.trim() || undefined,
        ...(showSyncToFeedOption ? { syncToPostList } : {}),
      }),
    );
  }, [
    canSubmit,
    dateEnd,
    dateStart,
    headcount,
    location,
    note,
    onSubmit,
    showSyncToFeedOption,
    syncToPostList,
    tags,
  ]);

  if (!open) return null;

  return (
    <View
      className="s-overlay s-overlay--sheet s-ai-guide-plan-sheet s-ai-buddy-post-sheet"
      catchMove
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onClose} />
      <View
        className="s-overlay__panel s-ai-guide-plan-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-buddy-post-sheet-title"
      >
        <View className="s-ai-guide-plan-sheet__handle" aria-hidden />
        <View className="s-ai-guide-plan-sheet__top">
          <View className="s-ai-guide-plan-sheet__title-row">
            <View className="s-ai-guide-plan-sheet__title-icon" aria-hidden>
              <Users size={16} color="#ff0066" aria-hidden />
            </View>
            <Text
              id="ai-buddy-post-sheet-title"
              className="s-ai-guide-plan-sheet__title"
            >
              组队信息
            </Text>
          </View>
          <Button
            className="s-ai-guide-plan-sheet__close"
            hoverClass="s-ai-guide-plan-sheet__close--pressed"
            aria-label="关闭"
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          scrollTop={scrollTop}
          className="s-ai-guide-plan-sheet__scroll s-scrollbar-none"
          style={{ height: `${scrollHeightPx}px` }}
        >
          <View className="s-ai-guide-plan-sheet__body">
            <View className="s-ai-guide-plan-sheet__field">
              <View className="s-ai-buddy-post-sheet__field-head">
                <Text className="s-ai-buddy-post-sheet__label">活动时间</Text>
                <Text className="s-ai-buddy-post-sheet__field-hint-inline">
                  可选择区间，例如 6月13日-14日
                </Text>
              </View>
              <View className="s-ai-buddy-post-sheet__date-row">
                <View className="s-ai-buddy-post-sheet__date-col">
                  <Picker
                    mode="date"
                    value={dateStart}
                    onChange={(e) => {
                      const next = e.detail.value;
                      setDateStart(next);
                      if (dateEnd < next) setDateEnd(next);
                    }}
                  >
                    <View className="s-ai-buddy-post-sheet__picker">
                      <CalendarDays
                        size={16}
                        color={BUDDY_PICKER_ICON_COLOR}
                        className="s-ai-buddy-post-sheet__picker-icon"
                        aria-hidden
                      />
                      <Text className="s-ai-buddy-post-sheet__picker-value">
                        {displayDate(dateStart)}
                      </Text>
                    </View>
                  </Picker>
                  <Text className="s-ai-buddy-post-sheet__picker-caption">开始</Text>
                </View>
                <Text className="s-ai-buddy-post-sheet__date-dash" aria-hidden>
                  —
                </Text>
                <View className="s-ai-buddy-post-sheet__date-col">
                  <Picker
                    mode="date"
                    value={dateEnd}
                    start={dateStart}
                    onChange={(e) => setDateEnd(e.detail.value)}
                  >
                    <View className="s-ai-buddy-post-sheet__picker">
                      <CalendarDays
                        size={16}
                        color={BUDDY_PICKER_ICON_COLOR}
                        className="s-ai-buddy-post-sheet__picker-icon"
                        aria-hidden
                      />
                      <Text className="s-ai-buddy-post-sheet__picker-value">
                        {displayDate(dateEnd)}
                      </Text>
                    </View>
                  </Picker>
                  <Text className="s-ai-buddy-post-sheet__picker-caption">结束</Text>
                </View>
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-buddy-post-sheet__label">地点</Text>
              <View className="s-ai-guide-plan-sheet__input-wrap">
                <MapPin
                  size={18}
                  className="s-ai-guide-plan-sheet__input-icon"
                  aria-hidden
                />
                <Input
                  className="s-ai-guide-plan-sheet__input"
                  type="text"
                  value={location}
                  placeholder="出发地、区域或集合点"
                  placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
                  onInput={(e) => setLocation(e.detail.value ?? '')}
                />
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-buddy-post-sheet__label">人数</Text>
              <View className="s-ai-guide-plan-sheet__input-wrap">
                <Users
                  size={18}
                  className="s-ai-guide-plan-sheet__input-icon"
                  aria-hidden
                />
                <Input
                  className="s-ai-guide-plan-sheet__input"
                  type="text"
                  value={headcount}
                  placeholder="如 2人、2-3人"
                  placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
                  onInput={(e) => setHeadcount(e.detail.value ?? '')}
                />
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__field">
              <Text className="s-ai-buddy-post-sheet__label">组队类型（可选）</Text>
              <View className="s-ai-buddy-post-sheet__tag-row">
                {BUDDY_POST_TAG_OPTIONS.map((opt) => {
                  const active = tags.includes(opt.id);
                  return (
                    <Button
                      key={opt.id}
                      className={cn(
                        's-ai-buddy-post-sheet__tag',
                        active && `s-ai-buddy-post-sheet__tag--${opt.id}`,
                      )}
                      hoverClass="s-ai-buddy-post-sheet__tag--pressed"
                      onClick={() => toggleTag(opt.id)}
                    >
                      <Text
                        className={cn(
                          's-ai-buddy-post-sheet__tag-text',
                          active && `s-ai-buddy-post-sheet__tag-text--${opt.id}`,
                        )}
                      >
                        {opt.label}
                      </Text>
                    </Button>
                  );
                })}
              </View>
            </View>

            <View className="s-ai-guide-plan-sheet__field s-ai-buddy-post-sheet__field--note">
              <Text className="s-ai-buddy-post-sheet__label">备注（可选）</Text>
              <View className="s-ai-buddy-post-sheet__textarea-wrap">
                <Textarea
                  className="s-ai-buddy-post-sheet__textarea"
                  value={note}
                  maxlength={NOTE_MAX_LENGTH}
                  placeholder="性别偏好、预算、其他说明…"
                  placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
                  onInput={(e) => setNote(e.detail.value ?? '')}
                />
                <Text className="s-ai-buddy-post-sheet__note-count" aria-hidden>
                  {note.length}/{NOTE_MAX_LENGTH}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="s-ai-guide-plan-sheet__footer">
          {showSyncToFeedOption ? (
            <View className="s-ai-buddy-post-sheet__sync-row">
              <View className="s-ai-buddy-post-sheet__sync-copy">
                <Text className="s-ai-buddy-post-sheet__sync-label">
                  同步到帖子列表
                </Text>
                <Text className="s-ai-buddy-post-sheet__sync-hint">
                  关闭后仍会保存并参与匹配推荐，但不会出现在活动帖子列表
                </Text>
              </View>
              <FeedSyncToggle checked={syncToPostList} onChange={setSyncToPostList} />
            </View>
          ) : null}
          <Button
            className={cn(
              's-ai-guide-plan-sheet__submit',
              !canSubmit && 's-ai-guide-plan-sheet__submit--disabled',
            )}
            disabled={!canSubmit}
            hoverClass={canSubmit ? 's-ai-guide-plan-sheet__submit--pressed' : ''}
            onTap={handleSubmit}
          >
            <Send size={18} color="#fff" aria-hidden />
            <Text className="s-ai-guide-plan-sheet__submit-text">
              {showSyncToFeedOption ? '保存' : '发布组队帖'}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
