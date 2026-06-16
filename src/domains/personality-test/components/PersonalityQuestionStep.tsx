import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import type { PersonalityQuestion, PersonalityQuestionOption } from '../types';
import { PersonalityAudioPlayer } from './PersonalityAudioPlayer';
import { resolvePersonalityMediaUrls } from '../utils/resolvePersonalityMedia';
import { Image, Text, Video, View } from '@tarojs/components';

type PersonalityQuestionStepProps = {
  question: PersonalityQuestion;
  currentIndex: number;
  totalQuestions: number;
  progressPercent: number;
  selectedOptionId?: string;
  onSelect: (optionId: string) => void;
  onBack?: () => void;
  onNext: () => void;
  submitting?: boolean;
};

type ResolvedVjOption = PersonalityQuestionOption & {
  videoUrl: string;
  posterUrl: string;
};

function VjOptionCard({
  option,
  active,
  disabled,
  onSelect,
}: {
  option: ResolvedVjOption;
  active: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const hasVideo = Boolean(option.videoUrl);

  return (
    <Button
      className={[
        's-personality-quiz__vj-card',
        active && 's-personality-quiz__vj-card--active',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      onClick={onSelect}
    >
      <View className="s-personality-quiz__vj-preview" aria-hidden>
        {hasVideo ? (
          <Video
            className="s-personality-quiz__vj-video"
            src={option.videoUrl}
            poster={option.posterUrl || undefined}
            objectFit="cover"
            muted
            loop
            autoplay={active}
            controls={false}
            showCenterPlayBtn={false}
            showPlayBtn={false}
            showFullscreenBtn={false}
            enableProgressGesture={false}
          />
        ) : option.posterUrl ? (
          <Image
            className="s-personality-quiz__vj-poster"
            src={option.posterUrl}
            mode="aspectFill"
          />
        ) : (
          <View className="s-personality-quiz__vj-placeholder">
            <Text className="s-personality-quiz__vj-placeholder-text">VJ</Text>
          </View>
        )}
      </View>
      <Text className="s-personality-quiz__vj-label">{option.label}</Text>
    </Button>
  );
}

export const PersonalityQuestionStep: FC<PersonalityQuestionStepProps> = ({
  question,
  currentIndex,
  totalQuestions,
  progressPercent,
  selectedOptionId,
  onSelect,
  onBack,
  onNext,
  submitting = false,
}) => {
  const isLast = currentIndex >= totalQuestions - 1;
  const isVjGrid = question.media?.type === 'vj_grid';
  const [vjOptions, setVjOptions] = useState<ResolvedVjOption[]>([]);

  useEffect(() => {
    if (!isVjGrid) {
      setVjOptions([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      const videoKeys = question.options.map((option) => option.mediaAssetKey);
      const posterKeys = question.options.map((option) => option.mediaPosterAssetKey);
      const [videoUrls, posterUrls] = await Promise.all([
        resolvePersonalityMediaUrls(videoKeys),
        resolvePersonalityMediaUrls(posterKeys),
      ]);

      if (cancelled) return;

      setVjOptions(
        question.options.map((option, index) => ({
          ...option,
          videoUrl: videoUrls[index] ?? '',
          posterUrl: posterUrls[index] ?? '',
        })),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [isVjGrid, question.options]);

  return (
    <View className="s-personality-quiz__panel">
      <View className="s-personality-quiz__progress" aria-hidden>
        <View
          className="s-personality-quiz__progress-bar"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <View className="s-personality-quiz__step">
        <Text className="s-personality-quiz__step-title">{question.prompt}</Text>
        <Text className="s-personality-quiz__step-badge">
          第 {currentIndex + 1}/{totalQuestions} 题
        </Text>
      </View>

      {question.media?.type === 'audio' ? (
        <PersonalityAudioPlayer
          assetKey={question.media.assetKey}
          caption={question.media.caption}
          disabled={submitting}
        />
      ) : null}

      {isVjGrid ? (
        <View className="s-personality-quiz__vj-grid">
          {(vjOptions.length ? vjOptions : question.options).map((option) => (
            <VjOptionCard
              key={option.id}
              option={
                'videoUrl' in option
                  ? (option as ResolvedVjOption)
                  : { ...option, videoUrl: '', posterUrl: '' }
              }
              active={selectedOptionId === option.id}
              disabled={submitting}
              onSelect={() => onSelect(option.id)}
            />
          ))}
        </View>
      ) : (
        <View className="s-personality-quiz__options">
          {question.options.map((option) => {
            const active = selectedOptionId === option.id;
            return (
              <Button
                key={option.id}
                className={[
                  's-personality-quiz__option',
                  active && 's-personality-quiz__option--active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                disabled={submitting}
                onClick={() => onSelect(option.id)}
              >
                <Text className="s-personality-quiz__option-label">{option.label}</Text>
              </Button>
            );
          })}
        </View>
      )}

      <View className="s-personality-quiz__actions">
        {currentIndex > 0 ? (
          <Button
            className="s-personality-quiz__action s-personality-quiz__action--ghost"
            disabled={submitting}
            onClick={onBack}
          >
            上一题
          </Button>
        ) : (
          <View className="s-personality-quiz__action-spacer" />
        )}
        <Button
          className="s-personality-quiz__action s-personality-quiz__action--primary"
          disabled={!selectedOptionId || submitting}
          onClick={onNext}
        >
          {submitting ? '生成结果…' : isLast ? '查看结果' : '下一题'}
        </Button>
      </View>
    </View>
  );
};
