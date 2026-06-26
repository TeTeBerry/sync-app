import type { RecruitUnityTagId } from '@sync/partner-contracts';
import { Chip, ChipRow } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import { View } from '@tarojs/components';

type RecruitUnityTagChipsProps = {
  tagIds: RecruitUnityTagId[] | undefined;
  className?: string;
};

export function RecruitUnityTagChips({ tagIds, className }: RecruitUnityTagChipsProps) {
  const t = useT();
  const visible = tagIds?.filter(Boolean) ?? [];
  if (!visible.length) return null;

  return (
    <View className={className}>
      <ChipRow className="s-event-post__unity-chip-row">
        {visible.map((tagId) => (
          <Chip
            key={tagId}
            size="sm"
            label={t(`plur.unityTags.${tagId}`)}
            active
            disabled
            onClick={() => {}}
            className="s-event-post__unity-chip s-event-post__unity-chip--readonly"
          />
        ))}
      </ChipRow>
    </View>
  );
}
