import { Plus } from '@/components/icons';
import { Button } from '@/components/ui';
import { Text } from '@tarojs/components';

type TravelPlanHeaderActionProps = {
  onAdd: () => void;
};

export function TravelPlanHeaderAction({ onAdd }: TravelPlanHeaderActionProps) {
  return (
    <Button
      className="s-travel-plan__header-add"
      hoverClass="s-travel-plan__header-add--pressed"
      aria-label="添加行程"
      onClick={onAdd}
    >
      <Plus size={14} color="#ffffff" aria-hidden />
      <Text className="s-travel-plan__header-add-label">添加行程</Text>
    </Button>
  );
}
