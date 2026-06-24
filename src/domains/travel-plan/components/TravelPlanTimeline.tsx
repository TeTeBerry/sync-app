import {
  BedDouble,
  Car,
  ChevronDown,
  ChevronRight,
  Clock,
  Plane,
  Plus,
  Utensils,
  Zap,
} from '@/components/icons';
import { Button } from '@/components/ui';
import { Text, View } from '@tarojs/components';
import { resolveTravelPlanExpandedDetail } from '../utils/travelPlanNodeDisplay';
import { formatNodeSplitLabel } from '../utils/travelPlanSplit.util';
import {
  formatDiningBillCost,
  formatDiningBillMeta,
} from '../utils/travelPlanDiningBills';
import type { TravelPlanCategory, TravelPlanNode } from '../types';
import { isEditableTravelPlanNode } from '../utils/travelPlanNodeEdit.util';
import { TravelPlanNodePriceField } from './TravelPlanNodePriceField';
import { TravelPlanNodeSplitPopover } from './TravelPlanNodeSplitPopover';
import { useT } from '@/hooks/useI18n';
import { useState } from 'react';

const CATEGORY_COLORS: Record<TravelPlanCategory, string> = {
  flight: '#bf5af2',
  transport: '#ffd60a',
  hotel: '#0a84ff',
  dining: '#ff9f0a',
  event: '#ff375f',
};

function CategoryIcon({
  category,
  color,
}: {
  category: TravelPlanCategory;
  color: string;
}) {
  const size = 18;
  switch (category) {
    case 'flight':
      return <Plane size={size} color={color} />;
    case 'transport':
      return <Car size={size} color={color} />;
    case 'hotel':
      return <BedDouble size={size} color={color} />;
    case 'dining':
      return <Utensils size={size} color={color} />;
    case 'event':
      return <Zap size={size} color={color} />;
    default:
      return <Zap size={size} color={color} />;
  }
}

type TravelPlanTimelineProps = {
  nodes: TravelPlanNode[];
  pageSplitCount: number;
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  onAddNode: () => void;
  onEditNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onNodeSplitChange: (
    id: string,
    input: { splitEnabled: boolean; splitCount: number },
  ) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
};

function TravelPlanNodeCard({
  node,
  pageSplitCount,
  expanded,
  splitPopoverOpen,
  onToggleSplitPopover,
  onCloseSplitPopover,
  onToggle,
  onEdit,
  onSplit,
  onDelete,
  onUpdatePrice,
}: {
  node: TravelPlanNode;
  pageSplitCount: number;
  expanded: boolean;
  splitPopoverOpen: boolean;
  onToggleSplitPopover: () => void;
  onCloseSplitPopover: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onSplit: (input: { splitEnabled: boolean; splitCount: number }) => void;
  onDelete: () => void;
  onUpdatePrice: (price: number | undefined) => void;
}) {
  const t = useT();
  const canEdit = isEditableTravelPlanNode(node);
  const canSplit = canEdit && node.price != null && node.price > 0;
  const accent = CATEGORY_COLORS[node.category];
  const expandedDetail = expanded ? resolveTravelPlanExpandedDetail(node) : undefined;
  const billLines =
    node.diningBills && node.diningBills.length > 0
      ? node.diningBills
      : node.transportBills && node.transportBills.length > 0
        ? node.transportBills
        : null;
  const splitLabel = formatNodeSplitLabel(
    node.price,
    node.splitEnabled,
    node.splitCount ?? pageSplitCount,
  );

  return (
    <View
      className={[
        's-travel-plan__node-card',
        expanded ? 's-travel-plan__node-card--expanded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-travel-plan__node-body" onClick={onToggle}>
        <View className="s-travel-plan__node-head">
          <View className="s-travel-plan__node-meta">
            <Text
              className="s-travel-plan__node-time"
              style={{ backgroundColor: `${accent}22`, color: accent }}
            >
              {node.timeLabel}
            </Text>
            {node.duration ? (
              <View className="s-travel-plan__node-duration">
                <Clock size={12} color="#8e8e93" aria-hidden />
                <Text className="s-travel-plan__node-duration-text">
                  {node.duration}
                </Text>
              </View>
            ) : null}
          </View>
          <TravelPlanNodePriceField
            value={node.price}
            accent={accent}
            onChange={onUpdatePrice}
          />
        </View>

        <View className="s-travel-plan__node-title-row">
          <Text className="s-travel-plan__node-title">{node.title}</Text>
          <View className="s-travel-plan__node-chevron" aria-hidden>
            {expanded ? (
              <ChevronDown size={16} color="#8e8e93" />
            ) : (
              <ChevronRight size={16} color="#8e8e93" />
            )}
          </View>
        </View>

        <Text className="s-travel-plan__node-sub">{node.subtitle}</Text>

        {splitLabel ? (
          <Text className="s-travel-plan__node-split">{splitLabel}</Text>
        ) : null}

        {expanded && billLines ? (
          <View className="s-travel-plan__dining-bills">
            {billLines.map((bill) => {
              const costLabel = formatDiningBillCost(bill.cost);
              return (
                <View key={bill.id} className="s-travel-plan__dining-bill">
                  <View className="s-travel-plan__dining-bill-main">
                    <Text className="s-travel-plan__dining-bill-title">
                      {bill.title}
                    </Text>
                    <Text className="s-travel-plan__dining-bill-meta">
                      {formatDiningBillMeta(bill)}
                    </Text>
                  </View>
                  {costLabel ? (
                    <Text className="s-travel-plan__dining-bill-cost">{costLabel}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : expandedDetail ? (
          <Text className="s-travel-plan__node-detail">{expandedDetail}</Text>
        ) : null}

        {expanded ? (
          <View className="s-travel-plan__node-foot">
            {canSplit ? (
              <View className="s-travel-plan__node-split-wrap">
                <Button
                  className={[
                    's-travel-plan__node-split',
                    node.splitEnabled ? 's-travel-plan__node-split--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  hoverClass="s-travel-plan__node-split--pressed"
                  onTap={(event) => {
                    event.stopPropagation();
                    onToggleSplitPopover();
                  }}
                >
                  <Text className="s-travel-plan__node-split-label">
                    {t('travelPlan.splitNode')}
                  </Text>
                </Button>
                <TravelPlanNodeSplitPopover
                  open={splitPopoverOpen}
                  splitEnabled={Boolean(node.splitEnabled)}
                  splitCount={node.splitCount ?? pageSplitCount}
                  price={node.price}
                  onClose={onCloseSplitPopover}
                  onConfirm={onSplit}
                />
              </View>
            ) : null}
            {canEdit ? (
              <Button
                className="s-travel-plan__node-edit"
                hoverClass="s-travel-plan__node-edit--pressed"
                onTap={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
              >
                <Text className="s-travel-plan__node-edit-label">
                  {t('travelPlan.editNode')}
                </Text>
              </Button>
            ) : null}
            <Button
              className="s-travel-plan__node-delete"
              hoverClass="s-travel-plan__node-delete--pressed"
              onTap={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              <Text className="s-travel-plan__node-delete-label">
                {t('travelPlan.deleteConfirmText')}
              </Text>
            </Button>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function TravelPlanTimeline({
  nodes,
  pageSplitCount,
  expandedId,
  onToggleExpanded,
  onAddNode,
  onEditNode,
  onDeleteNode,
  onNodeSplitChange,
  onUpdatePrice,
}: TravelPlanTimelineProps) {
  const [splitPopoverNodeId, setSplitPopoverNodeId] = useState<string | null>(null);

  return (
    <View className="s-travel-plan__timeline">
      <View className="s-travel-plan__timeline-rail" aria-hidden />
      {nodes.map((node) => {
        const accent = CATEGORY_COLORS[node.category];
        const expanded = expandedId === node.id;
        return (
          <View key={node.id} className="s-travel-plan__timeline-item">
            <View
              className="s-travel-plan__timeline-icon"
              style={{ backgroundColor: `${accent}22` }}
              aria-hidden
            >
              <CategoryIcon category={node.category} color={accent} />
            </View>
            <View className="s-travel-plan__timeline-card-wrap">
              <TravelPlanNodeCard
                node={node}
                pageSplitCount={pageSplitCount}
                expanded={expanded}
                splitPopoverOpen={splitPopoverNodeId === node.id}
                onToggleSplitPopover={() =>
                  setSplitPopoverNodeId((prev) => (prev === node.id ? null : node.id))
                }
                onCloseSplitPopover={() => setSplitPopoverNodeId(null)}
                onToggle={() => {
                  setSplitPopoverNodeId(null);
                  onToggleExpanded(node.id);
                }}
                onEdit={() => {
                  setSplitPopoverNodeId(null);
                  onEditNode(node.id);
                }}
                onSplit={(input) => onNodeSplitChange(node.id, input)}
                onDelete={() => {
                  setSplitPopoverNodeId(null);
                  onDeleteNode(node.id);
                }}
                onUpdatePrice={(price) => onUpdatePrice(node.id, price)}
              />
            </View>
          </View>
        );
      })}

      <View className="s-travel-plan__timeline-item s-travel-plan__timeline-item--add">
        <Button
          className="s-travel-plan__add-icon"
          hoverClass="s-travel-plan__add-icon--pressed"
          aria-label="添加新节点"
          onClick={onAddNode}
        >
          <Plus size={18} color="#8e8e93" />
        </Button>
        <Button
          className="s-travel-plan__add-card"
          hoverClass="s-travel-plan__add-card--pressed"
          onClick={onAddNode}
        >
          <Text className="s-travel-plan__add-label">+ 添加新节点</Text>
        </Button>
      </View>
    </View>
  );
}
