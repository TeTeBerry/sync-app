import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isLiveApi } from '@/constants/api';
import { findLatestTravelGuideForActivity } from '@/domains/travel-guide/utils/travelGuideDetailStorage';
import { useItineraryScheduleQuery } from '@/hooks/useItineraryApi';
import { useActivityDetailQuery } from '@/hooks/useSyncApi';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useSavedTravelPlanQuery, useTravelPlanMutations } from './useTravelPlanApi';
import { ApiError } from '@/utils/apiClient';
import {
  travelPlanNodeFromSavedPayload,
  travelPlanNodeToPayload,
} from '../utils/travelPlanApiMapper';
import { fitTravelPlanSavePayload } from '../utils/travelPlanSavePayload';
import { buildDefaultActivityTravelPlanNodes } from '../utils/travelPlanActivityNodes';
import {
  createTravelPlanNodesFromFormValues,
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
import {
  buildTravelPlanSplitSummaryText,
  clampSplitCount,
  filterSplitEnabledNodes,
  resolveDefaultSplitCount,
} from '../utils/travelPlanSplit.util';
import type { TravelPlanSplitConfirmValues } from '../components/TravelPlanSplitSheet';
import { useT } from '@/hooks/useI18n';
import {
  isEditableTravelPlanNode,
  rebuildTravelPlanNodesForEdit,
  replaceTravelPlanNodeInList,
  travelPlanNodeToAddFormValues,
} from '../utils/travelPlanNodeEdit.util';
import { showAppToast } from '@/utils/appToast';

type UseTravelPlanPageOptions = {
  activityLegacyId: number | null;
  eventMeta?: string;
  queryHeadcount?: number | null;
};

function buildFallbackActivityNodes(input: {
  activityLegacyId: number;
  eventMeta: string;
  activityDate?: string;
  location?: string;
  sessions?: Array<{ dateKey: string; label: string }>;
  activityPriceOverrides?: Record<string, number>;
}) {
  const nodes = buildDefaultActivityTravelPlanNodes({
    activityLegacyId: input.activityLegacyId,
    eventName: input.eventMeta,
    activityDate: input.activityDate,
    location: input.location,
    sessions: input.sessions,
  });

  return applyActivityNodeOverrides(nodes, {}, input.activityPriceOverrides ?? {});
}

function sumPendingNodeAmount(nodes: TravelPlanNode[]): number {
  return nodes.reduce((sum, node) => sum + (node.price ?? 0), 0);
}

function applySplitFieldsToNodes(
  nodes: TravelPlanNode[],
  split: TravelPlanSplitConfirmValues,
): TravelPlanNode[] {
  return nodes.map((node) => {
    const next: TravelPlanNode = { ...node };
    if (split.splitEnabled) {
      next.splitEnabled = true;
      next.splitCount = clampSplitCount(split.splitCount);
    } else {
      delete next.splitEnabled;
      delete next.splitCount;
    }
    return next;
  });
}

export function useTravelPlanPage({
  activityLegacyId,
  eventMeta,
  queryHeadcount,
}: UseTravelPlanPageOptions) {
  const t = useT();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });
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

  const guideHeadcount = useMemo(() => {
    if (activityLegacyId == null || !Number.isFinite(activityLegacyId)) {
      return null;
    }
    return findLatestTravelGuideForActivity(activityLegacyId)?.form.headcount ?? null;
  }, [activityLegacyId]);

  const [apiActivityNodes, setApiActivityNodes] = useState<TravelPlanNode[]>([]);
  const [userNodes, setUserNodes] = useState<TravelPlanNode[]>([]);
  const [activityPriceOverrides, setActivityPriceOverrides] = useState<
    Record<string, number>
  >({});
  const [hiddenActivityNodeIds, setHiddenActivityNodeIds] = useState<string[]>([]);
  const [splitCount, setSplitCount] = useState(() =>
    resolveDefaultSplitCount({
      queryHeadcount,
      guideHeadcount,
    }),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [splitSheetOpen, setSplitSheetOpen] = useState(false);
  const [pendingAddNodes, setPendingAddNodes] = useState<TravelPlanNode[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [addSheetMode, setAddSheetMode] = useState<'add' | 'edit'>('add');
  const [editSheetInitialValues, setEditSheetInitialValues] = useState<
    TravelPlanAddFormValues[] | null
  >(null);
  const [pendingEditNodeId, setPendingEditNodeId] = useState<string | null>(null);
  const [pendingSplitDefaults, setPendingSplitDefaults] = useState<{
    splitEnabled: boolean;
    splitCount: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copyingSplitSummary, setCopyingSplitSummary] = useState(false);
  const splitCountInitializedRef = useRef(false);

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
      activityPriceOverrides,
    });
  }, [
    activityPriceOverrides,
    activityQuery.data?.date,
    activityQuery.data?.location,
    effectiveActivityLegacyId,
    resolvedEventMeta,
    scheduleQuery.data?.sessions,
  ]);

  const activityNodes = useMemo(() => {
    if (apiActivityNodes.length > 0) {
      return applyActivityNodeOverrides(apiActivityNodes, {}, activityPriceOverrides);
    }
    return fallbackActivityNodes;
  }, [activityPriceOverrides, apiActivityNodes, fallbackActivityNodes]);

  useEffect(() => {
    setApiActivityNodes([]);
    setUserNodes([]);
    setActivityPriceOverrides({});
    setHiddenActivityNodeIds([]);
    setExpandedId(null);
    setSplitCount(
      resolveDefaultSplitCount({
        queryHeadcount,
        guideHeadcount,
      }),
    );
    splitCountInitializedRef.current = false;
  }, [activityLegacyId, apiEnabled, guideHeadcount, queryHeadcount]);

  useEffect(() => {
    if (!apiEnabled) {
      return;
    }
    if (savedQuery.isLoading) {
      return;
    }
    if (savedQuery.data === undefined) {
      return;
    }

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
    setActivityPriceOverrides(saved?.activityPriceOverrides ?? {});
    setHiddenActivityNodeIds(saved?.hiddenActivityNodeIds ?? []);

    if (!splitCountInitializedRef.current) {
      setSplitCount(
        resolveDefaultSplitCount({
          queryHeadcount,
          savedSplitCount: saved?.splitCount,
          guideHeadcount,
        }),
      );
      splitCountInitializedRef.current = true;
    }
  }, [
    activityQuery.data?.date,
    apiEnabled,
    guideHeadcount,
    queryHeadcount,
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
  }, [activityQuery.data?.date, nodes]);

  const pageMeta = useMemo(() => {
    const title = resolvedEventMeta;
    if (!dateRangeLabel) {
      return title;
    }
    return `${title} · ${dateRangeLabel}`;
  }, [dateRangeLabel, resolvedEventMeta]);

  const stats = useMemo(
    () => computeTravelPlanStats(nodes, splitCount),
    [nodes, splitCount],
  );

  const pendingSplitAmount = useMemo(
    () => sumPendingNodeAmount(pendingAddNodes),
    [pendingAddNodes],
  );

  const persistPlan = useCallback(
    async (
      nextUserNodes: TravelPlanNode[],
      nextActivityPriceOverrides: Record<string, number>,
      nextHiddenActivityNodeIds: string[],
      nextSplitCount: number,
    ) => {
      if (!apiEnabled || activityLegacyId == null) {
        return true;
      }

      setIsSaving(true);
      try {
        await save(
          fitTravelPlanSavePayload({
            eventMeta: resolvedEventMeta.slice(0, 200),
            nodes: nextUserNodes.map(travelPlanNodeToPayload),
            activityConfirmations: {},
            activityPriceOverrides: nextActivityPriceOverrides,
            hiddenActivityNodeIds: normalizeHiddenActivityNodeIds(
              nextHiddenActivityNodeIds,
            ),
            splitCount: clampSplitCount(nextSplitCount),
          }),
        );
        return true;
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : t('travelPlan.saveFailed');
        showAppToast(message, { raw: true, icon: 'none' });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [activityLegacyId, apiEnabled, resolvedEventMeta, save, t],
  );

  const toggleExpanded = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleAddNode = useCallback(() => {
    setEditingNodeId(null);
    setEditSheetInitialValues(null);
    setAddSheetMode('add');
    setAddSheetOpen(true);
  }, []);

  const closeAddSheet = useCallback(() => {
    setAddSheetOpen(false);
    setEditingNodeId(null);
    setEditSheetInitialValues(null);
    setAddSheetMode('add');
  }, []);

  const closeSplitSheet = useCallback(() => {
    setSplitSheetOpen(false);
    setPendingAddNodes([]);
    setPendingEditNodeId(null);
    setPendingSplitDefaults(null);
  }, []);

  const handleEditNode = useCallback(
    (id: string) => {
      const target = userNodes.find((node) => node.id === id);
      if (!target || !isEditableTravelPlanNode(target)) {
        return;
      }
      setEditingNodeId(id);
      setAddSheetMode('edit');
      setEditSheetInitialValues(travelPlanNodeToAddFormValues(target));
      setAddSheetOpen(true);
    },
    [userNodes],
  );

  const handleSaveNode = useCallback(
    (values: TravelPlanAddFormValues[]) => {
      const sortedValues = sortTravelPlanAddFormValues(values);

      if (editingNodeId) {
        const existingNode = userNodes.find((node) => node.id === editingNodeId);
        const rebuiltNodes = alignTravelPlanNodesYear(
          rebuildTravelPlanNodesForEdit(editingNodeId, sortedValues),
          activityYearHint,
        );
        setPendingEditNodeId(editingNodeId);
        setPendingAddNodes(rebuiltNodes);
        setPendingSplitDefaults({
          splitEnabled: existingNode?.splitEnabled ?? true,
          splitCount: clampSplitCount(existingNode?.splitCount ?? splitCount),
        });
        setAddSheetOpen(false);
        setEditingNodeId(null);
        setEditSheetInitialValues(null);
        setSplitSheetOpen(true);
        return;
      }

      const createdNodes = alignTravelPlanNodesYear(
        createTravelPlanNodesFromFormValues(sortedValues),
        activityYearHint,
      );
      setPendingEditNodeId(null);
      setPendingSplitDefaults(null);
      setPendingAddNodes(createdNodes);
      setAddSheetOpen(false);
      setSplitSheetOpen(true);
    },
    [activityYearHint, editingNodeId, splitCount, userNodes],
  );

  const handleSplitConfirm = useCallback(
    async (split: TravelPlanSplitConfirmValues) => {
      if (pendingAddNodes.length === 0) {
        setSplitSheetOpen(false);
        return;
      }

      const nextSplitCount = clampSplitCount(split.splitCount);
      setSplitCount(nextSplitCount);

      const nodesWithSplit = applySplitFieldsToNodes(pendingAddNodes, {
        ...split,
        splitCount: nextSplitCount,
      });

      const nextUserNodes = pendingEditNodeId
        ? sortTravelPlanNodes(
            replaceTravelPlanNodeInList(userNodes, pendingEditNodeId, nodesWithSplit),
          )
        : sortTravelPlanNodes([...userNodes, ...nodesWithSplit]);

      const previousUserNodes = userNodes;
      const previousSplitCount = splitCount;
      const focusId =
        nodesWithSplit[nodesWithSplit.length - 1]?.id ?? pendingEditNodeId ?? null;

      setUserNodes(nextUserNodes);
      setExpandedId(focusId);
      setSplitSheetOpen(false);
      setPendingAddNodes([]);
      setPendingEditNodeId(null);
      setPendingSplitDefaults(null);

      const ok = await persistPlan(
        nextUserNodes,
        activityPriceOverrides,
        hiddenActivityNodeIds,
        nextSplitCount,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
        setSplitCount(previousSplitCount);
        setExpandedId(null);
      }
    },
    [
      activityPriceOverrides,
      hiddenActivityNodeIds,
      pendingAddNodes,
      pendingEditNodeId,
      persistPlan,
      splitCount,
      userNodes,
    ],
  );

  const handleSplitCountChange = useCallback(
    async (nextCount: number) => {
      const normalized = clampSplitCount(nextCount);
      const previous = splitCount;
      setSplitCount(normalized);

      const ok = await persistPlan(
        userNodes,
        activityPriceOverrides,
        hiddenActivityNodeIds,
        normalized,
      );
      if (!ok) {
        setSplitCount(previous);
      }
    },
    [activityPriceOverrides, hiddenActivityNodeIds, persistPlan, splitCount, userNodes],
  );

  const handleCopySplitSummary = useCallback(async () => {
    if (copyingSplitSummary) {
      return;
    }
    const splitNodes = filterSplitEnabledNodes(nodes);
    if (splitNodes.length === 0) {
      showAppToast('travelPlan.copySplitEmpty', { icon: 'none' });
      return;
    }
    setCopyingSplitSummary(true);
    try {
      const text = buildTravelPlanSplitSummaryText({
        eventName: resolvedEventMeta,
        nodes,
        splitCount,
        disclaimer: t('travelPlan.splitSummaryDisclaimer'),
      });
      await Taro.setClipboardData({ data: text });
      showAppToast('travelPlan.copySplitSuccess', { icon: 'success' });
    } catch {
      showAppToast('travelPlan.copySplitFailed', { icon: 'none' });
    } finally {
      setCopyingSplitSummary(false);
    }
  }, [copyingSplitSummary, nodes, resolvedEventMeta, splitCount, t]);

  const handleNodeSplitChange = useCallback(
    async (id: string, input: { splitEnabled: boolean; splitCount: number }) => {
      const target = userNodes.find((node) => node.id === id);
      if (!target || !isEditableTravelPlanNode(target)) {
        return;
      }

      const nextUserNodes = userNodes.map((node) => {
        if (node.id !== id) {
          return node;
        }
        const updated: TravelPlanNode = { ...node };
        if (input.splitEnabled) {
          updated.splitEnabled = true;
          updated.splitCount = clampSplitCount(input.splitCount);
        } else {
          delete updated.splitEnabled;
          delete updated.splitCount;
        }
        return updated;
      });
      const previousUserNodes = userNodes;
      setUserNodes(nextUserNodes);

      const ok = await persistPlan(
        nextUserNodes,
        activityPriceOverrides,
        hiddenActivityNodeIds,
        splitCount,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
      }
    },
    [activityPriceOverrides, hiddenActivityNodeIds, persistPlan, splitCount, userNodes],
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
          nextOverrides,
          hiddenActivityNodeIds,
          splitCount,
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
        activityPriceOverrides,
        hiddenActivityNodeIds,
        splitCount,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
      }
    },
    [
      activityNodes,
      activityPriceOverrides,
      hiddenActivityNodeIds,
      persistPlan,
      splitCount,
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
        title: t(`travelPlan.${isActivityNode ? 'removeActivity' : 'deleteNode'}`),
        message: isActivityNode
          ? t('travelPlan.removeActivityConfirm')
          : t('travelPlan.deleteNodeConfirm'),
        confirmText: t('travelPlan.deleteConfirmText'),
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
          activityPriceOverrides,
          nextHidden,
          splitCount,
        );
        if (!ok) {
          setHiddenActivityNodeIds(previousHidden);
        } else {
          showAppToast('travelPlan.removed', { icon: 'none' });
        }
        return;
      }

      const nextUserNodes = userNodes.filter((node) => node.id !== id);
      const previousUserNodes = userNodes;
      setUserNodes(nextUserNodes);

      const ok = await persistPlan(
        nextUserNodes,
        activityPriceOverrides,
        hiddenActivityNodeIds,
        splitCount,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
      } else {
        showAppToast('travelPlan.deleted', { icon: 'none' });
      }
    },
    [
      activityPriceOverrides,
      confirm,
      hiddenActivityNodeIds,
      nodes,
      persistPlan,
      splitCount,
      userNodes,
      t,
    ],
  );

  return {
    pageMeta,
    nodes,
    stats,
    splitCount,
    expandedId,
    isLoading:
      apiEnabled &&
      (savedQuery.isLoading || savedQuery.data === undefined) &&
      !savedQuery.isError,
    isSaving,
    copyingSplitSummary,
    toggleExpanded,
    addSheetOpen,
    addSheetMode,
    editSheetInitialValues,
    splitSheetOpen,
    pendingSplitAmount,
    pendingSplitEnabled: pendingSplitDefaults?.splitEnabled ?? true,
    pendingSplitCount: pendingSplitDefaults?.splitCount ?? splitCount,
    handleAddNode,
    closeAddSheet,
    closeSplitSheet,
    handleEditNode,
    handleSaveNode,
    handleSplitConfirm,
    handleSplitCountChange,
    handleCopySplitSummary,
    handleNodeSplitChange,
    handleDeleteNode,
    handleUpdateNodePrice,
    confirmDialog,
  };
}
