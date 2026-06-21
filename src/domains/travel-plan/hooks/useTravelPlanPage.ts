import Taro from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useT } from '@/hooks/useI18n';

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

export function useTravelPlanPage({
  activityLegacyId,
  eventMeta,
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

  const [apiActivityNodes, setApiActivityNodes] = useState<TravelPlanNode[]>([]);
  const [userNodes, setUserNodes] = useState<TravelPlanNode[]>([]);
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
  }, [activityLegacyId, apiEnabled]);

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
  }, [activityQuery.data?.date, nodes]);

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
      nextActivityPriceOverrides: Record<string, number>,
      nextHiddenActivityNodeIds: string[],
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
        createTravelPlanNodesFromFormValues(sortedValues),
        activityYearHint,
      );
      const nextUserNodes = sortTravelPlanNodes([...userNodes, ...nodes]);
      const previousUserNodes = userNodes;
      setUserNodes(nextUserNodes);
      setExpandedId(nodes[nodes.length - 1]?.id ?? null);

      const ok = await persistPlan(
        nextUserNodes,
        activityPriceOverrides,
        hiddenActivityNodeIds,
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
        setExpandedId(null);
      }
    },
    [
      activityPriceOverrides,
      activityYearHint,
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

        const ok = await persistPlan(userNodes, nextOverrides, hiddenActivityNodeIds);
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

        const ok = await persistPlan(userNodes, activityPriceOverrides, nextHidden);
        if (!ok) {
          setHiddenActivityNodeIds(previousHidden);
        } else {
          void Taro.showToast({ title: t('travelPlan.removed'), icon: 'none' });
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
      );
      if (!ok) {
        setUserNodes(previousUserNodes);
      } else {
        void Taro.showToast({ title: t('travelPlan.deleted'), icon: 'none' });
      }
    },
    [
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
    isLoading:
      apiEnabled &&
      (savedQuery.isLoading || savedQuery.data === undefined) &&
      !savedQuery.isError,
    isSaving,
    toggleExpanded,
    addSheetOpen,
    handleAddNode,
    closeAddSheet,
    handleSaveNode,
    handleDeleteNode,
    handleUpdateNodePrice,
    confirmDialog,
  };
}
