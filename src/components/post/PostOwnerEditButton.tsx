import './PostOwnerEditButton.scss';
import { Pencil } from '../icons';
import { Button } from '../ui';
import { View } from '@tarojs/components';

/** Matches `--secondary` theme blue. */
const EDIT_COLOR = '#4cc9f0';

export type PostOwnerEditButtonProps = {
  onEdit: () => void;
  className?: string;
  ariaLabel?: string;
};

export function PostOwnerEditButton({
  onEdit,
  className,
  ariaLabel = '编辑',
}: PostOwnerEditButtonProps) {
  return (
    <Button
      className={['s-post-owner-edit', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        onEdit();
      }}
    >
      <View className="s-post-owner-edit__icon">
        <Pencil size={16} color={EDIT_COLOR} aria-hidden />
      </View>
    </Button>
  );
}
