import {
  BedDouble,
  Car,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  Hourglass,
  Plane,
  Plus,
  Utensils,
  Zap,
} from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';
import { resolveTravelPlanExpandedDetail } from '../travelPlanNodeDisplay';
import type { TravelPlanCategory, TravelPlanNode } from '../travelPlanTypes';
import { TravelPlanNodePriceField } from './TravelPlanNodePriceField';

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
  expandedId: string | null;
  onToggleExpanded: (id: string) => void;
  onAddNode: () => void;
  onDeleteNode: (id: string) => void;
  onToggleConfirmed: (id: string) => void;
  onUpdatePrice: (id: string, price: number | undefined) => void;
};

function TravelPlanNodeCard({
  node,
  expanded,
  onToggle,
  onDelete,
  onToggleConfirmed,
  onUpdatePrice,
}: {
  node: TravelPlanNode;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleConfirmed: () => void;
  onUpdatePrice: (price: number | undefined) => void;
}) {
  const accent = CATEGORY_COLORS[node.category];
  const expandedDetail = expanded ? resolveTravelPlanExpandedDetail(node) : undefined;

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
          <Button
            className={[
              's-travel-plan__node-check',
              node.confirmed
                ? 's-travel-plan__node-check--confirmed'
                : 's-travel-plan__node-check--pending',
            ].join(' ')}
            hoverClass="s-travel-plan__node-check--pressed"
            aria-label={node.confirmed ? '标记为待确认' : '标记为已确认'}
            onTap={(event) => {
              event.stopPropagation();
              onToggleConfirmed();
            }}
          >
            <CircleCheck
              size={16}
              color={node.confirmed ? '#34c759' : '#636366'}
              aria-hidden
            />
          </Button>
          <View className="s-travel-plan__node-chevron" aria-hidden>
            {expanded ? (
              <ChevronDown size={16} color="#8e8e93" />
            ) : (
              <ChevronRight size={16} color="#8e8e93" />
            )}
          </View>
        </View>

        <Text className="s-travel-plan__node-sub">{node.subtitle}</Text>

        {expandedDetail ? (
          <Text className="s-travel-plan__node-detail">{expandedDetail}</Text>
        ) : null}

        {expanded ? (
          <View className="s-travel-plan__node-foot">
            {node.confirmed ? (
              <View className="s-travel-plan__node-status s-travel-plan__node-status--confirmed">
                <CircleCheck size={12} color="#34c759" aria-hidden />
                <Text className="s-travel-plan__node-status-text">已确认</Text>
              </View>
            ) : (
              <View className="s-travel-plan__node-status s-travel-plan__node-status--pending">
                <Hourglass size={12} color="#ff9f0a" aria-hidden />
                <Text className="s-travel-plan__node-status-text">待确认</Text>
              </View>
            )}
            <Button
              className="s-travel-plan__node-delete"
              hoverClass="s-travel-plan__node-delete--pressed"
              onTap={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              <Text className="s-travel-plan__node-delete-label">删除</Text>
            </Button>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function TravelPlanTimeline({
  nodes,
  expandedId,
  onToggleExpanded,
  onAddNode,
  onDeleteNode,
  onToggleConfirmed,
  onUpdatePrice,
}: TravelPlanTimelineProps) {
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
                expanded={expanded}
                onToggle={() => onToggleExpanded(node.id)}
                onDelete={() => onDeleteNode(node.id)}
                onToggleConfirmed={() => onToggleConfirmed(node.id)}
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
