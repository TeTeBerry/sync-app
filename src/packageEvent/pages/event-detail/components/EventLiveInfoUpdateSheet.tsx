import './EventLiveInfoUpdateSheet.scss';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, X, Zap } from '../../../../components/icons';
import { cn } from '../../../../components/ui';
import { useOverlayLock } from '../../../../hooks/useOverlayLock';
import {
  LIVE_INFO_CATEGORIES,
  LIVE_INFO_REMARKS_MAX,
  type LiveInfoCategoryId,
} from '../liveInfoConfig';
import type { PublishLiveInfoPayload } from '../useEventLiveInfo';
import { EventLiveInfoStarRow } from './EventLiveInfoStarRow';
import { Button } from '../../../../components/ui';
import { ScrollView, Text, Textarea, View } from '@tarojs/components';

type EventLiveInfoUpdateSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Resolves true when publish succeeded; sheet stays open on false. */
  onPublish: (payload: PublishLiveInfoPayload) => boolean | Promise<boolean>;
};

const DEFAULT_SCORE = 3;

export function EventLiveInfoUpdateSheet({
  open,
  onClose,
  onPublish,
}: EventLiveInfoUpdateSheetProps) {
  useOverlayLock(open);

  const [selected, setSelected] = useState<LiveInfoCategoryId[]>([
    'entry_crowd',
    'toilet_queue',
  ]);
  const [scores, setScores] = useState<Record<LiveInfoCategoryId, number>>({
    entry_crowd: DEFAULT_SCORE,
    toilet_queue: DEFAULT_SCORE,
    water_queue: DEFAULT_SCORE,
    smoke_drink: DEFAULT_SCORE,
  });
  const [remark, setRemark] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(['entry_crowd', 'toilet_queue']);
    setScores({
      entry_crowd: DEFAULT_SCORE,
      toilet_queue: DEFAULT_SCORE,
      water_queue: DEFAULT_SCORE,
      smoke_drink: DEFAULT_SCORE,
    });
    setRemark('');
    setPublishing(false);
  }, [open]);

  const toggleCategory = useCallback((id: LiveInfoCategoryId) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  }, []);

  const selectedCategories = useMemo(
    () => LIVE_INFO_CATEGORIES.filter((c) => selected.includes(c.id)),
    [selected],
  );

  const handlePublish = useCallback(async () => {
    if (!selected.length || publishing) return;
    setPublishing(true);
    try {
      const ok = await Promise.resolve(
        onPublish({
          ratings: selected.map((categoryId) => ({
            categoryId,
            score: scores[categoryId] ?? DEFAULT_SCORE,
          })),
          remark: remark.trim() || undefined,
        }),
      );
      if (ok) onClose();
    } finally {
      setPublishing(false);
    }
  }, [onClose, onPublish, publishing, remark, scores, selected]);

  if (!open) {
    return null;
  }

  return (
    <View
      className="s-overlay s-overlay--sheet s-live-info-update-sheet"
      catchMove
      role="presentation"
    >
      <View
        className="s-overlay__backdrop"
        onClick={publishing ? undefined : onClose}
      />
      <View className="s-overlay__panel" role="dialog" aria-modal="true">
        <View className="s-live-info-update-sheet__handle" aria-hidden />
        <View className="s-live-info-update-sheet__top">
          <Text className="s-live-info-update-sheet__title">更新现场实时资讯</Text>
          <Button
            className="s-live-info-update-sheet__close"
            hoverClass="s-live-info-update-sheet__close--pressed"
            aria-label="关闭"
            disabled={publishing}
            onClick={onClose}
          >
            <X size={18} color="#fff" aria-hidden />
          </Button>
        </View>

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-live-info-update-sheet__scroll s-scrollbar-none"
        >
          <View className="s-live-info-update-sheet__body">
            <Text className="s-live-info-update-sheet__section">
              ① 选择要更新的类别 (可多选)
            </Text>
            <View className="s-live-info-update-sheet__chips">
              {LIVE_INFO_CATEGORIES.map((category) => {
                const active = selected.includes(category.id);
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    className={[
                      's-live-info-update-sheet__chip',
                      active && 's-live-info-update-sheet__chip--on',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={
                      active
                        ? ({
                            borderColor: category.color,
                            color: category.color,
                          } as Record<string, string>)
                        : undefined
                    }
                    onClick={() => toggleCategory(category.id)}
                  >
                    <Icon
                      size={14}
                      color={active ? category.color : '#fff'}
                      aria-hidden
                    />
                    <Text className="s-live-info-update-sheet__chip-label">
                      {category.label}
                    </Text>
                    {active ? (
                      <Check size={14} color={category.color} aria-hidden />
                    ) : null}
                  </Button>
                );
              })}
            </View>

            {selectedCategories.length > 0 ? (
              <>
                <Text className="s-live-info-update-sheet__section">② 给每项打分</Text>
                {selectedCategories.map((category) => {
                  const score = scores[category.id] ?? DEFAULT_SCORE;
                  const Icon = category.icon;
                  return (
                    <View
                      key={category.id}
                      className="s-live-info-update-sheet__rate-card"
                    >
                      <View className="s-live-info-update-sheet__rate-head">
                        <View className="s-live-info-summary__label-wrap">
                          <Icon size={16} color={category.color} aria-hidden />
                          <Text className="s-live-info-update-sheet__rate-label">
                            {category.label}
                          </Text>
                        </View>
                        <Text
                          className="s-live-info-update-sheet__rate-tag"
                          style={{
                            color: category.color,
                            backgroundColor: `${category.color}22`,
                          }}
                        >
                          {category.scoreLabel(score)}
                        </Text>
                      </View>
                      <EventLiveInfoStarRow
                        category={category}
                        score={score}
                        interactive
                        onScoreChange={(next) =>
                          setScores((prev) => ({ ...prev, [category.id]: next }))
                        }
                      />
                    </View>
                  );
                })}
              </>
            ) : null}

            <Text className="s-live-info-update-sheet__section">③ 备注 (选填)</Text>
            <View className="s-live-info-update-sheet__remark-wrap">
              <Textarea
                className="s-live-info-update-sheet__remark"
                value={remark}
                maxlength={LIVE_INFO_REMARKS_MAX}
                placeholder="补充说明，例如：北门排队、厕所位置..."
                onInput={(e) => setRemark(e.detail.value)}
              />
              <Text className="s-live-info-update-sheet__remark-count">
                {remark.length}/{LIVE_INFO_REMARKS_MAX}
              </Text>
            </View>
          </View>
        </ScrollView>

        <Button
          className={cn(
            's-live-info-update-sheet__publish',
            publishing && 's-live-info-update-sheet__publish--disabled',
          )}
          hoverClass={publishing ? '' : 's-live-info-update-sheet__publish--pressed'}
          disabled={publishing}
          onClick={() => void handlePublish()}
        >
          <Zap size={18} color="#fff" aria-hidden />
          <Text className="s-live-info-update-sheet__publish-text">
            {publishing ? '发布中…' : '发布现场实时资讯'}
          </Text>
        </Button>
      </View>
    </View>
  );
}
