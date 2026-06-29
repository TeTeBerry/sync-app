import { RefreshCw, Sparkles } from '../../components/icons';
import { Button, cn } from '../ui';
import { getBuddyPostAiDisclaimer } from '@/constants/aiDisclosure';
import type { BuddyPostComposeCandidate } from '@/types/partner';
import { Text, Textarea, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

function formatCandidateText(
  candidate: BuddyPostComposeCandidate,
  styleCodeLabel: string,
  styleSloganLabel: string,
): string {
  const label =
    candidate.style === 'code'
      ? styleCodeLabel
      : candidate.style === 'slogan'
        ? styleSloganLabel
        : null;
  if (!label) return candidate.text;
  if (
    candidate.text.startsWith(`${label}:`) ||
    candidate.text.startsWith(`${label}：`)
  ) {
    return candidate.text;
  }
  return `${label}: ${candidate.text}`;
}

type BuddyPostComposeStepProps = {
  note: string;
  noteMaxLength: number;
  candidates: BuddyPostComposeCandidate[];
  disclaimer: string | null;
  selectedId: string | null;
  loading: boolean;
  onNoteChange: (value: string) => void;
  onSelectCandidate: (id: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
};

export function BuddyPostComposeStep({
  note,
  noteMaxLength,
  candidates,
  disclaimer,
  selectedId,
  loading,
  onNoteChange,
  onSelectCandidate,
  onGenerate,
  onRegenerate,
}: BuddyPostComposeStepProps) {
  const t = useT();
  const styleCodeLabel = t('posts.composeStyleCode');
  const styleSloganLabel = t('posts.composeStyleSlogan');
  const canRegenerate = candidates.length > 0 && !loading;

  const handleSelect = (candidate: BuddyPostComposeCandidate) => {
    onSelectCandidate(candidate.id);
    onNoteChange(candidate.text);
  };

  return (
    <View className="s-ai-guide-plan-sheet__body s-ai-buddy-post-sheet__compose">
      <View className="s-ai-buddy-post-sheet__compose-head">
        <Text className="s-ai-buddy-post-sheet__compose-title">
          {t('posts.composeTitle')}
        </Text>
        <Text className="s-ai-buddy-post-sheet__compose-hint">
          {t('posts.composeHint')}
        </Text>
      </View>

      <View className="s-ai-buddy-post-sheet__compose-ai-field" aria-hidden>
        <Sparkles size={15} color="var(--primary)" aria-hidden />
        <Text className="s-ai-buddy-post-sheet__compose-ai-field-text">
          {disclaimer?.trim() || getBuddyPostAiDisclaimer()}
        </Text>
      </View>

      <View className="s-ai-buddy-post-sheet__compose-actions">
        <Button
          className={cn(
            's-ai-buddy-post-sheet__compose-btn',
            loading && 's-ai-buddy-post-sheet__compose-btn--disabled',
          )}
          disabled={loading}
          hoverClass={loading ? '' : 's-ai-buddy-post-sheet__compose-btn--pressed'}
          onClick={onGenerate}
        >
          <Sparkles size={15} color="#fff" aria-hidden />
          <Text className="s-ai-buddy-post-sheet__compose-btn-text">
            {loading ? t('posts.composeGenerating') : t('posts.composeGenerate')}
          </Text>
        </Button>
        <Button
          className={cn(
            's-ai-buddy-post-sheet__compose-btn s-ai-buddy-post-sheet__compose-btn--ghost',
            !canRegenerate && 's-ai-buddy-post-sheet__compose-btn--disabled',
          )}
          disabled={!canRegenerate}
          hoverClass={
            canRegenerate ? 's-ai-buddy-post-sheet__compose-btn--pressed' : ''
          }
          onClick={onRegenerate}
        >
          <RefreshCw size={14} color="#fff" aria-hidden />
          <Text className="s-ai-buddy-post-sheet__compose-btn-text">
            {t('posts.composeRegenerate')}
          </Text>
        </Button>
      </View>

      {candidates.length ? (
        <View className="s-ai-buddy-post-sheet__candidate-grid">
          {candidates.map((candidate) => {
            const selected = selectedId === candidate.id;
            return (
              <Button
                key={candidate.id}
                className={cn(
                  's-ai-buddy-post-sheet__candidate',
                  selected && 's-ai-buddy-post-sheet__candidate--selected',
                )}
                hoverClass="s-ai-buddy-post-sheet__candidate--pressed"
                onClick={() => handleSelect(candidate)}
              >
                {candidate.style ? (
                  <Text
                    className={cn(
                      's-ai-buddy-post-sheet__candidate-tag',
                      candidate.style === 'code' &&
                        's-ai-buddy-post-sheet__candidate-tag--code',
                      candidate.style === 'slogan' &&
                        's-ai-buddy-post-sheet__candidate-tag--slogan',
                    )}
                  >
                    {candidate.style === 'code' ? styleCodeLabel : styleSloganLabel}
                  </Text>
                ) : null}
                <Text className="s-ai-buddy-post-sheet__candidate-text">
                  {formatCandidateText(candidate, styleCodeLabel, styleSloganLabel)}
                </Text>
              </Button>
            );
          })}
        </View>
      ) : null}

      <View className="s-ai-guide-plan-sheet__field s-ai-buddy-post-sheet__field--note">
        <View className="s-ai-buddy-post-sheet__label-row">
          <Text className="s-ai-buddy-post-sheet__label">{t('posts.noteLabel')}</Text>
          <Text className="s-ai-buddy-post-sheet__optional-tag">
            {t('posts.noteOptional')}
          </Text>
        </View>
        <View className="s-ai-buddy-post-sheet__textarea-wrap">
          <Textarea
            className="s-ai-buddy-post-sheet__textarea"
            value={note}
            maxlength={noteMaxLength}
            placeholder={t('posts.composeNotePlaceholder')}
            placeholderClass="s-ai-guide-plan-sheet__input-placeholder"
            onInput={(e) => onNoteChange(e.detail.value ?? '')}
          />
          <Text className="s-ai-buddy-post-sheet__note-count" aria-hidden>
            {note.length}/{noteMaxLength}
          </Text>
        </View>
      </View>
    </View>
  );
}
