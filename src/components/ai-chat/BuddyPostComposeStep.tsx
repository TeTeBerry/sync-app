import { Sparkles } from '../../components/icons';
import { Button, cn } from '../ui';
import { BUDDY_POST_AI_DISCLAIMER } from '@/constants/aiDisclosure';
import type { BuddyPostComposeCandidate } from '@/types/partner';
import { ScrollView, Text, Textarea, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

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
  const showDisclaimer = Boolean(candidates.length || disclaimer);

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

      {showDisclaimer ? (
        <Text className="s-ai-buddy-post-sheet__ai-disclaimer">
          {disclaimer?.trim() || BUDDY_POST_AI_DISCLAIMER}
        </Text>
      ) : null}

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
          <Sparkles size={15} aria-hidden />
          <Text className="s-ai-buddy-post-sheet__compose-btn-text">
            {loading ? t('posts.composeGenerating') : t('posts.composeGenerate')}
          </Text>
        </Button>
        {candidates.length ? (
          <Button
            className={cn(
              's-ai-buddy-post-sheet__compose-btn s-ai-buddy-post-sheet__compose-btn--ghost',
              loading && 's-ai-buddy-post-sheet__compose-btn--disabled',
            )}
            disabled={loading}
            hoverClass={loading ? '' : 's-ai-buddy-post-sheet__compose-btn--pressed'}
            onClick={onRegenerate}
          >
            <Text className="s-ai-buddy-post-sheet__compose-btn-text">
              {t('posts.composeRegenerate')}
            </Text>
          </Button>
        ) : null}
      </View>

      {candidates.length ? (
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className="s-ai-buddy-post-sheet__candidate-scroll s-scrollbar-none"
        >
          <View className="s-ai-buddy-post-sheet__candidate-row">
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
                    <Text className="s-ai-buddy-post-sheet__candidate-tag">
                      {candidate.style === 'code'
                        ? t('posts.composeStyleCode')
                        : t('posts.composeStyleSlogan')}
                    </Text>
                  ) : null}
                  <Text className="s-ai-buddy-post-sheet__candidate-text">
                    {candidate.text}
                  </Text>
                </Button>
              );
            })}
          </View>
        </ScrollView>
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
