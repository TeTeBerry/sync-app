import './PostOwnerRecruitStatusButton.scss';
import { Button } from '../ui';
import { Text } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type PostOwnerRecruitStatusButtonProps = {
  recruitStatus: 'open' | 'full';
  onToggle: () => void;
  className?: string;
};

export function PostOwnerRecruitStatusButton({
  recruitStatus,
  onToggle,
  className,
}: PostOwnerRecruitStatusButtonProps) {
  const t = useT();
  const isFull = recruitStatus === 'full';

  return (
    <Button
      className={[
        's-post-owner-recruit',
        isFull && 's-post-owner-recruit--full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <Text className="s-post-owner-recruit__text">
        {isFull ? t('eventDetail.reopenRecruit') : t('eventDetail.markRecruitFull')}
      </Text>
    </Button>
  );
}
