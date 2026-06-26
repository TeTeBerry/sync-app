import type { RecruitUnityTagId } from '@sync/partner-contracts';
import { RECRUIT_UNITY_TAG_IDS } from '@sync/partner-contracts';
import { Chip, ChipRow } from '../ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type BuddyPostUnityTagsFieldProps = {
  selected: RecruitUnityTagId[];
  onToggle: (tagId: RecruitUnityTagId) => void;
  maxSelected?: number;
};

export function BuddyPostUnityTagsField({
  selected,
  onToggle,
  maxSelected = 3,
}: BuddyPostUnityTagsFieldProps) {
  const t = useT();
  const atLimit = selected.length >= maxSelected;

  return (
    <View className="s-ai-guide-plan-sheet__field s-ai-buddy-post-sheet__unity-tags">
      <Text className="s-ai-buddy-post-sheet__label">
        {t('plur.unityTags.sectionTitle')}
      </Text>
      <ChipRow className="s-ai-buddy-post-sheet__unity-chip-row">
        {RECRUIT_UNITY_TAG_IDS.map((tagId) => {
          const active = selected.includes(tagId);
          return (
            <Chip
              key={tagId}
              size="sm"
              label={t(`plur.unityTags.${tagId}`)}
              active={active}
              disabled={!active && atLimit}
              onClick={() => onToggle(tagId)}
            />
          );
        })}
      </ChipRow>
    </View>
  );
}
