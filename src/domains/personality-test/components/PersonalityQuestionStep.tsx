import type { FC } from 'react';
import { Button } from '@/components/ui';
import type { PersonalityQuestion } from '../types';
import { PersonalityAudioPlayer } from './PersonalityAudioPlayer';
import { Text, View } from '@tarojs/components';

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
