import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isLiveApi } from '@/constants/api';
import { useItineraryScheduleQuery } from '@/hooks/useItineraryApi';
import { useActivityDetailQuery } from '@/hooks/useSyncApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useSavedTravelPlanQuery, useTravelPlanMutations } from './useTravelPlanApi';
import { ApiError } from '@/utils/apiClient';
import {
  travelPlanNodeFromSavedPayload,
  travelPlanNodeToPayload,
} from '../utils/travelPlanApiMapper';
import { buildDefaultActivityTravelPlanNodes } from '../utils/travelPlanActivityNodes';
import {
  createTravelPlanNodeFromForm,
  sortTravelPlanAddFormValues,
  type TravelPlanAddFormValues,
} from '../utils/travelPlanAddForm';
import { computeTravelPlanDateRangeLabel } from '../utils/travelPlanDateTime';
import {
  applyActivityNodeOverrides,
  mergeTravelPlanNodes,
  normalizeHiddenActivityNodeIds,
  sortTravelPlanNodes,
} from '@/types/travelPlan';
import { computeTravelPlanStats } from '../utils/travelPlanStats';
import type { TravelPlanNode } from '../types';
import {
  alignTravelPlanNodesYear,
  resolveTravelPlanYearHint,
} from '../utils/travelPlanYearAlign';

type UseTravelPlanPageOptions = {
  activityLegacyId: number | null;
  eventMeta?: string;
};

function buildFallbackActivityNodes(input: {
  activityLegacyId: number;
  eventMeta: string;
  activityDate?: string;
  location?: string;
  sessions?: Array<{ dateKey: string; label: string }>;
  activityConfirmations?: Record<string, boolean>;
  activityPriceOverrides?: Record<string, number>;
}) {
  const nodes = buildDefaultActivityTravelPlanNodes({
    activityLegacyId: input.activityLegacyId,
    eventName: input.eventMeta,
    activityDate: input.activityDate,
    location: input.location,
    sessions: input.sessions,
    activityConfirmations: input.activityConfirmations,
  });

  return applyActivityNodeOverrides(
    nodes,
    input.activityConfirmations ?? {},
    input.activityPriceOverrides ?? {},
  );
}

export function useTravelPlanPage({
  activityLegacyId,
  eventMeta,
}: UseTravelPlanPageOptions) {
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });
  const apiEnabled =
    isLiveApi() &&
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0;

  const activityQuery = useActivityDetailQuery(
    apiEnabled ? (activityLegacyId ?? undefined) : undefined,
  );
  const scheduleQuery = useItineraryScheduleQuery(apiEnabled ? activityLegacyId : null);
  const savedQuery = useSavedTravelPlanQuery(apiEnabled ? activityLegacyId : null);
  const { save } = useTravelPlanMutations(activityLegacyId ?? 0);
  const hydratedFromApiRef = useRef(false);

  const resolvedEventMeta =
    eventMeta?.trim() ||
    activityQuery.data?.name?.trim() ||
    scheduleQuery.data?.eventMeta?.trim() ||
    '';

  const activityYearHint = useMemo(
    () =>
      resolveTravelPlanYearHint({
        activityDate: activityQuery.data?.date,
        eventName: resolvedEventMeta,
      }),
    [activityQuery.data?.date, resolvedEventMeta],
  );

  const [apiActivityNodes, setApiActivityNodes] = useState<TravelPlanNode[]>([]);
  const [userNodes, setUserNodes] = useState<TravelPlanNode[]>([]);
  const [activityConfirmations, setActivityConfirmations] = useState<
    Record<string, boolean>
  >({});
  const [activityPriceOverrides, setActivityPriceOverrides] = useState<
    Record<string, number>
  >({});
  const [hiddenActivityNodeIds, setHiddenActivityNodeIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const effectiveActivityLegacyId =
    activityLegacyId != null &&
    Number.isFinite(activityLegacyId) &&
    activityLegacyId > 0
      ? activityLegacyId
      : null;

  const fallbackActivityNodes = useMemo(() => {
    if (effectiveActivityLegacyId == null) {
      return [];
    }
    return buildFallbackActivityNodes({
      activityLegacyId: effectiveActivityLegacyId,
      eventMeta: resolvedEventMeta,
      activityDate: activityQuery.data?.date,
      location: activityQuery.data?.location,
      sessions: scheduleQuery.data?.sessions?.length
        ? scheduleQuery.data.sessions
        : undefined,
      activityConfirmations,
      activityPriceOverrides,
    });
  }, [
    activityConfirmations,
    activityPriceOverrides,
    activityQuery.data?.date,
    activityQuery.data?.location,
    effectiveActivityLegacyId,
    resolvedEventMeta,
    scheduleQuery.data?.sessions?.length,
  ]);

  const activityNodes = useMemo(() => {
    if (apiActivityNodes.length > 0) {
      return applyActivityNodeOverrides(
        apiActivityNodes,
        activityConfirmations,
        activityPriceOverrides,
      );
    }
    return fallbackActivityNodes;
  }, [
    activityConfirmations,
    activityPriceOverrides,
    apiActivityNodes,
    fallbackActivityNodes,
  ]);

  useEffect(() => {
    hydratedFromApiRef.current = false;
    setApiActivityNodes([]);
    setUserNodes([]);
    setActivityConfirmations({});
    setActivityPriceOverrides({});
    setHiddenActivityNodeIds([]);
    setExpandedId(null);
  }, [activityLegacyId, apiEnabled]);

  useEffect(() => {
    if (!apiEnabled || hydratedFromApiRef.current) {
      return;
    }
    if (savedQuery.isLoading) {
      return;
    }

    hydratedFromApiRef.current = true;

    const saved = savedQuery.data;
    const nextApiActivityNodes = (saved?.activityNodes ?? []).map((node) =>
      travelPlanNodeFromSavedPayload(node, 'activity'),
    );
    const nextUserNodes = alignTravelPlanNodesYear(
      (saved?.userNodes ?? []).map((node) =>
        travelPlanNodeFromSavedPayload(node, 'user'),
      ),
      resolveTravelPlanYearHint({
        activityDate: activityQuery.data?.date,
        eventName: resolvedEventMeta,
      }),
    );

    setApiActivityNodes(nextApiActivityNodes);
    setUserNodes(sortTravelPlanNodes(nextUserNodes));
    setActivityConfirmations(saved?.activityConfirmations ?? {});
    setActivityPriceOverrides(saved?.activityPriceOverrides ?? {});
    setHiddenActivityNodeIds(saved?.hiddenActivityNodeIds ?? []);
  }, [
    activityQuery.data?.date,
    apiEnabled,
    resolvedEventMeta,
    savedQuery.data,
    savedQuery.isLoading,
  ]);

  const visibleActivityNodes = useMemo(() => {
    const hidden = new Set(hiddenActivityNodeIds);
    return activityNodes.filter((node) => !hidden.has(node.id));
  }, [activityNodes, hiddenActivityNodeIds]);

  const nodes = useMemo(
    () => mergeTravelPlanNodes(visibleActivityNodes, userNodes),
    [userNodes, visibleActivityNodes],
  );

  const dateRangeLabel = useMemo(() => {
    const fromNodes = computeTravelPlanDateRangeLabel(nodes);
    if (fromNodes) {
      return fromNodes;
    }
    return activityQuery.data?.date?.trim() || '';
  }, [activityQuery.data?.date, apiEnabled, nodes]);

  const pageMeta = useMemo(() => {
    const title = resolvedEventMeta;
    if (!dateRangeLabel) {
      return title;
    }
    return `${title} · ${dateRangeLabel}`;
  }, [dateRangeLabel, resolvedEventMeta]);

  const stats = useMemo(() => computeTravelPlanStats(nodes), [nodes]);

  const persistPlan = useCallback(
    async (
      nextUserNodes: TravelPlanNode[],
      nextActivityConfirmations: Record<string, boolean>,
      nextActivityPriceOverrides: Record<string, number>,
      nextHiddenActivityNodeIds: string[],
    ) => {
      if (!apiEnabled || activityLegacyId == null) {
        return true;
      }

      setIsSaving(true);
      try {
        await save({
          eventMeta: resolvedEventMeta.slice(0, 200),
          nodes: nextUserNodes.map(travelPlanNodeToPayload),
          activityConfirmations: nextActivityConfirmations,
          activityPriceOverrides: nextActivityPriceOverrides,
          hiddenActivityNodeIds: normalizeHiddenActivityNodeIds(
            nextHiddenActivityNodeIds,
          ),
        });
        return true;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : '保存失败，请重试';
        void Taro.showToast({ title: message, icon: 'none' });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [activityLegacyId, apiEnabled, resolvedEventMeta, save],
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleAddNode = useCallback(() => {
    setAddSheetOpen(true);
  }, []);

  const closeAddSheet = useCallback(() => {
    setAddSheetOpen(false);
  }, []);

  const handleSaveNode = useCallback(
    async (values: TravelPlanAddFormValues[]) => {
      const sortedValues = sortTravelPlanAddFormValues(values);
      const nodes = alignTravelPlanNodesYear(
        sortedValues.map(createTravelPlanNodeFromForm),
        activityYearHint,
      );
      const nextUserNodes = sortTravelPlanNodes([...userNodes, ...nodes]);
      const previousUserNodes = userNodes;
      setUserNodes(nextUserNodes);
      setExpandedId(nodes[nodes.length - 1]?.id ?? null);

      const ok = await persistPlan(
        nextUserNodes,
        activityConfirmations,
        activityPriceOverrides,
        hiddenActivityNodeIds,
      );
      if (ok) {
        void Taro.showToast({
          title: nodes.length > 1 ? `已保存 ${nodes.length} 段行程` : '已保存行程',
          icon: 'success',
        });
      } else {
        setUserNodes(previousUserNodes);
        setExpandedId(null);
      }
    },
    [
      activityConfirmations,
      activityPriceOverrides,
      activityYearHint,
      hiddenActivityNodeIds,
      persistPlan,
      userNodes,
    ],
  );

  const toggleNodeConfirmed = useCallback(
    async (id: string) => {
      const isActivityNode =
        activityNodes.some((node) => node.id === id) ||
        id.startsWith('activity-event-');

      if (isActivityNode) {
        const current = activityNodes.find((node) => node.id === id);
        const nextConfirmations = {
          ...activityConfirmations,
          [id]: !(activityConfirmations[id] ?? current?.confirmed ?? true),
        };
        const previousConfirmations = activityConfirmations;
        setActivityConfirmations(nextConfirmations);

        const ok = await persistPlan(
          userNodes,
          nextConfirmations,
          activityPriceOverrides,
          hiddenActivityNodeIds,
        );
        if (!ok) {
          setActivityConfirmations(previousConfirmations);
        }
        return;
      }

      const nextUserNodes = userNodes.map((node) =>
        node.id === id ? { ...node, confirmed: !node.confirmed } : node,
      );
      const previousUserNodes = userNodes;
      setUserNodes(nextUserNodes);

      const ok = await persistPlan(
        nextUserNodes,
        activityConfirmations,
        activityPriceOverrides,
        hiddenActivityNodeIds,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
      }
    },
    [
      activityConfirmations,
      activityNodes,
      activityPriceOverrides,
      hiddenActivityNodeIds,
      persistPlan,
      userNodes,
    ],
  );

  const handleUpdateNodePrice = useCallback(
    async (id: string, price: number | undefined) => {
      const isActivityNode =
        activityNodes.some((node) => node.id === id) ||
        id.startsWith('activity-event-');

      if (isActivityNode) {
        const nextOverrides = { ...activityPriceOverrides };
        if (price == null) {
          delete nextOverrides[id];
        } else {
          nextOverrides[id] = price;
        }
        const previousOverrides = activityPriceOverrides;
        setActivityPriceOverrides(nextOverrides);

        const ok = await persistPlan(
          userNodes,
          activityConfirmations,
          nextOverrides,
          hiddenActivityNodeIds,
        );
        if (!ok) {
          setActivityPriceOverrides(previousOverrides);
        }
        return;
      }

      const nextUserNodes = userNodes.map((node) => {
        if (node.id !== id) {
          return node;
        }
        const updated: TravelPlanNode = { ...node };
        if (price == null) {
          delete updated.price;
        } else {
          updated.price = price;
        }
        return updated;
      });
      const previousUserNodes = userNodes;
      setUserNodes(nextUserNodes);

      const ok = await persistPlan(
        nextUserNodes,
        activityConfirmations,
        activityPriceOverrides,
        hiddenActivityNodeIds,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
      }
    },
    [
      activityConfirmations,
      activityNodes,
      activityPriceOverrides,
      hiddenActivityNodeIds,
      persistPlan,
      userNodes,
    ],
  );

  const handleDeleteNode = useCallback(
    async (id: string) => {
      const target = nodes.find((node) => node.id === id);
      if (!target) {
        return;
      }

      const isActivityNode = target.source === 'activity';
      const accepted = await confirm({
        title: isActivityNode ? '移除活动行程' : '删除行程节点',
        message: isActivityNode
          ? '确定从行程计划中移除这场活动吗？'
          : '确定要删除这条行程吗？',
        confirmText: '删除',
      });
      if (!accepted) {
        return;
      }

      setExpandedId((prev) => (prev === id ? null : prev));

      if (isActivityNode) {
        const nextHidden = normalizeHiddenActivityNodeIds([
          ...hiddenActivityNodeIds,
          id,
        ]);
        const previousHidden = hiddenActivityNodeIds;
        setHiddenActivityNodeIds(nextHidden);

        const ok = await persistPlan(
          userNodes,
          activityConfirmations,
          activityPriceOverrides,
          nextHidden,
        );
        if (!ok) {
          setHiddenActivityNodeIds(previousHidden);
        } else {
          void Taro.showToast({ title: '已移除', icon: 'none' });
        }
        return;
      }

      const nextUserNodes = userNodes.filter((node) => node.id !== id);
      const previousUserNodes = userNodes;
      setUserNodes(nextUserNodes);

      const ok = await persistPlan(
        nextUserNodes,
        activityConfirmations,
        activityPriceOverrides,
        hiddenActivityNodeIds,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
      } else {
        void Taro.showToast({ title: '已删除', icon: 'none' });
      }
    },
    [
      activityConfirmations,
      activityPriceOverrides,
      confirm,
      hiddenActivityNodeIds,
      nodes,
      persistPlan,
      userNodes,
    ],
  );

  return {
    pageMeta,
    nodes,
    stats,
    expandedId,
    isLoading: apiEnabled && savedQuery.isLoading && !hydratedFromApiRef.current,
    isSaving,
    toggleExpanded,
    addSheetOpen,
    handleAddNode,
    closeAddSheet,
    handleSaveNode,
    handleDeleteNode,
    toggleNodeConfirmed,
    handleUpdateNodePrice,
    confirmDialog,
  };
}
