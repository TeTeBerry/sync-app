import './PostOwnerDeleteButton.scss';
import { Trash2 } from '../icons';
import { Button } from '../ui';
import { View } from '@tarojs/components';

const DELETE_COLOR = '#ff6467';

export type PostOwnerDeleteButtonProps = {
  onDelete: () => void;
  className?: string;
};

export function PostOwnerDeleteButton({
  onDelete,
  className,
}: PostOwnerDeleteButtonProps) {
  return (
    <Button
      className={['s-post-owner-delete', className].filter(Boolean).join(' ')}
      aria-label="删除"
      onClick={(event) => {
        event.stopPropagation();
        onDelete();
      }}
    >
      <View className="s-post-owner-delete__icon">
        <Trash2 size={16} color={DELETE_COLOR} />
      </View>
    </Button>
  );
}
