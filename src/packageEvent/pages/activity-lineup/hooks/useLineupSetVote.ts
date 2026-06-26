import { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchMySetVote,
  fetchSetVoteLeaderboard,
  submitSetVote,
} from '@/api/sync/setVote';
import { useT } from '@/hooks/useI18n';
import { ApiError } from '@/utils/apiClient';
import { requireAuth } from '@/utils/authGate';
import { isLoggedIn } from '@/utils/authStorage';
import { goEventDetail, goEventDetailWithBuddyPostPrefill } from '@/utils/route';
import type { SetVoteLeaderboardEntry, SetVotePick } from '@/types/activity';
import {
  buildSetVoteBuddyPostPrefill,
  buildSetVoteShareAppMessage,
  buildSetVoteShareTimeline,
  logSetVoteEvent,
  MAX_SET_VOTE_SELECTION,
  parseSetVoteShareQuery,
  resolveSetVoteShareTeaser,
  saveSetVotePoster,
  shareSetVotePoster,
  toggleSetVoteSelection,
  type SetVoteShareTeaser,
} from '@/domains/set-vote';
import { isWeappRuntime } from '@/utils/isWeappRuntime';
import type { ItineraryDj } from '@/types/itinerary';
import { showAppToast } from '@/utils/appToast';

function pickIdsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((id, index) => id === sortedB[index]);
}

export function useLineupSetVote(options: {
  activityLegacyId: number | undefined;
  lineupPublished: boolean;
  schedulePublished: boolean;
  activityName: string;
  activityDate?: string;
  lineupDjs: ItineraryDj[];
}) {
  const t = useT();
  const router = useRouter();
  const {
    activityLegacyId,
    lineupPublished,
    schedulePublished,
    activityName,
    activityDate,
    lineupDjs,
  } = options;

  const voteEnabled = lineupPublished && !schedulePublished && lineupDjs.length > 0;

  const shareQuery = useMemo(
    () => parseSetVoteShareQuery(router.params),
    [router.params],
  );

  const djNameById = useMemo(
    () => new Map(lineupDjs.map((dj) => [dj.id, dj.name])),
    [lineupDjs],
  );

  const [voteModeEnabled, setVoteModeEnabled] = useState(
    () => voteEnabled && (router.params.voteMode === '1' || Boolean(shareQuery)),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [picks, setPicks] = useState<SetVotePick[]>([]);
  const [entries, setEntries] = useState<SetVoteLeaderboardEntry[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [syncGenres, setSyncGenres] = useState(false);
  const [revoteAllowedToday, setRevoteAllowedToday] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voteDataLoaded, setVoteDataLoaded] = useState(false);
  const [showShareTeaser, setShowShareTeaser] = useState(
    () => voteEnabled && Boolean(shareQuery),
  );
  const [shareTeaser, setShareTeaser] = useState<SetVoteShareTeaser | null>(null);

  const shareRef = useRef({
    activityName: '',
    activityLegacyId: 0,
    picks: [] as SetVotePick[],
    entries: [] as SetVoteLeaderboardEntry[],
  });
  const openedRef = useRef(false);

  const submittedIds = useMemo(() => picks.map((pick) => pick.artistId), [picks]);
  const hasSubmitted = picks.length > 0;
  const selectionDirty = !pickIdsEqual(selectedIds, submittedIds);
  const showSubmitBar =
    voteEnabled &&
    voteModeEnabled &&
    selectedIds.length > 0 &&
    (!hasSubmitted || selectionDirty) &&
    !showShareTeaser;
  const showResults =
    voteEnabled &&
    voteModeEnabled &&
    hasSubmitted &&
    !selectionDirty &&
    !showShareTeaser;

  useEffect(() => {
    if (!voteEnabled) {
      setVoteModeEnabled(false);
      setShowShareTeaser(false);
      setShareTeaser(null);
    }
  }, [voteEnabled]);

  const loadLeaderboard = useCallback(async () => {
    if (!activityLegacyId) return null;
    const board = await fetchSetVoteLeaderboard(activityLegacyId);
    setEntries(board.entries);
    setTotalVoters(board.totalVoters);
    if (board.myPicks?.length) {
      setPicks(board.myPicks);
      setSelectedIds(board.myPicks.map((pick) => pick.artistId));
    }
    return board;
  }, [activityLegacyId]);

  useEffect(() => {
    if (!activityLegacyId || !voteEnabled || openedRef.current) return;
    openedRef.current = true;
    logSetVoteEvent('set_vote_open', {
      activityId: activityLegacyId,
      source: shareQuery ? 'share' : 'lineup',
    });
    if (shareQuery) {
      logSetVoteEvent('set_vote_share_landing', { activityId: activityLegacyId });
    }
  }, [activityLegacyId, voteEnabled, shareQuery]);

  useEffect(() => {
    if (!activityLegacyId || !voteEnabled) {
      setVoteDataLoaded(true);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const board = await loadLeaderboard();
        if (cancelled) return;

        if (shareQuery && showShareTeaser) {
          setShareTeaser(
            resolveSetVoteShareTeaser({
              activityName,
              shareQuery,
              djNameById,
              topEntries: board?.entries ?? [],
            }),
          );
          setVoteModeEnabled(true);
          setVoteDataLoaded(true);
          return;
        }

        if (isLoggedIn()) {
          try {
            const me = await fetchMySetVote(activityLegacyId);
            if (cancelled) return;
            setRevoteAllowedToday(me.revoteAllowedToday !== false);
            if (me.picks.length) {
              setPicks(me.picks);
              setSelectedIds(me.picks.map((pick) => pick.artistId));
            }
          } catch {
            // ignore me fetch for anonymous-ish sessions
          }
        }
      } catch {
        // leaderboard failure should not block lineup browsing
      } finally {
        if (!cancelled) {
          setVoteDataLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    activityLegacyId,
    activityName,
    djNameById,
    voteEnabled,
    loadLeaderboard,
    shareQuery,
    showShareTeaser,
  ]);

  useEffect(() => {
    shareRef.current = {
      activityName,
      activityLegacyId: activityLegacyId ?? 0,
      picks,
      entries,
    };
  }, [activityLegacyId, activityName, entries, picks]);

  useShareAppMessage(() => {
    const snapshot = shareRef.current;
    if (!snapshot.picks.length) {
      return {};
    }
    logSetVoteEvent('set_vote_share', {
      activityId: snapshot.activityLegacyId,
      channel: 'message',
    });
    return buildSetVoteShareAppMessage({
      activityName: snapshot.activityName,
      activityLegacyId: snapshot.activityLegacyId,
      voterPicks: snapshot.picks.map((pick) => pick.artistId),
    });
  });

  useShareTimeline(() => {
    const snapshot = shareRef.current;
    if (!snapshot.picks.length) {
      return {};
    }
    logSetVoteEvent('set_vote_share', {
      activityId: snapshot.activityLegacyId,
      channel: 'timeline',
    });
    return buildSetVoteShareTimeline({
      activityName: snapshot.activityName,
      activityLegacyId: snapshot.activityLegacyId,
      voterPicks: snapshot.picks.map((pick) => pick.artistId),
    });
  });

  const handleVoteModeChange = useCallback(
    (enabled: boolean) => {
      setVoteModeEnabled(enabled);
      if (enabled) {
        logSetVoteEvent('set_vote_mode_on', { activityId: activityLegacyId ?? 0 });
      }
    },
    [activityLegacyId],
  );

  const handleToggleDj = useCallback(
    (artistId: string) => {
      if (!voteModeEnabled) return;
      setSelectedIds((current) => {
        const { next, rejected } = toggleSetVoteSelection(
          current,
          artistId,
          MAX_SET_VOTE_SELECTION,
        );
        if (rejected) {
          showAppToast('setVote.maxSelection', {
            params: { max: MAX_SET_VOTE_SELECTION },
            icon: 'none',
          });
        }
        return next;
      });
    },
    [t, voteModeEnabled],
  );

  const performSubmit = useCallback(async () => {
    if (!activityLegacyId || selectedIds.length < 1) {
      showAppToast('setVote.pickAtLeastOne', { icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitSetVote(activityLegacyId, selectedIds, {
        syncGenres,
      });
      setPicks(result.picks);
      setTotalVoters(result.totalVoters);
      setRevoteAllowedToday(result.revoteAllowedToday !== false);
      await loadLeaderboard();
      setShowShareTeaser(false);
      showAppToast('setVote.submitSuccess', { icon: 'success' });
      logSetVoteEvent('set_vote_submit', {
        activityId: activityLegacyId,
        pickCount: result.picks.length,
      });
      if (syncGenres) {
        logSetVoteEvent('set_vote_sync_genres', { activityId: activityLegacyId });
      }
    } catch (error) {
      const message =
        error instanceof ApiError && error.status === 401
          ? t('setVote.loginRequired')
          : error instanceof ApiError && error.message
            ? error.message
            : t('setVote.submitFailed');
      showAppToast(message, { raw: true, icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  }, [activityLegacyId, loadLeaderboard, selectedIds, syncGenres, t]);

  const handleSubmit = useCallback(() => {
    requireAuth(() => {
      void performSubmit();
    }, 'social');
  }, [performSubmit]);

  const handleStartFromTeaser = useCallback(() => {
    setShowShareTeaser(false);
    setShareTeaser(null);
    setVoteModeEnabled(true);
  }, []);

  const handleEditPicks = useCallback(() => {
    if (revoteAllowedToday === false) {
      showAppToast('setVote.revoteLimit', { icon: 'none' });
      return;
    }
    setSelectedIds(submittedIds);
  }, [revoteAllowedToday, submittedIds, t]);

  const handleRecruitWall = useCallback(() => {
    if (!activityLegacyId) return;
    logSetVoteEvent('set_vote_cta_recruit_wall', { activityId: activityLegacyId });
    goEventDetail(activityLegacyId, { focusPosts: true });
  }, [activityLegacyId]);

  const handlePrefillBuddyPost = useCallback(() => {
    if (!activityLegacyId || !activityName) return;
    const prefill = buildSetVoteBuddyPostPrefill(picks, activityName, activityDate);
    goEventDetailWithBuddyPostPrefill(activityLegacyId, prefill);
  }, [activityDate, activityLegacyId, activityName, picks]);

  const handleSharePoster = useCallback(async () => {
    if (!activityName) return;
    try {
      logSetVoteEvent('set_vote_share', {
        activityId: activityLegacyId ?? 0,
        channel: 'poster',
      });
      await shareSetVotePoster({
        activityName,
        picks,
        topEntries: entries,
      });
    } catch {
      showAppToast('setVote.shareFailed', { icon: 'none' });
    }
  }, [activityLegacyId, activityName, entries, picks, t]);

  const handleSavePoster = useCallback(async () => {
    if (!activityName) return;
    try {
      await saveSetVotePoster({
        activityName,
        picks,
        topEntries: entries,
      });
    } catch {
      showAppToast('setVote.shareFailed', { icon: 'none' });
    }
  }, [activityName, entries, picks, t]);

  const voteCountByArtistId = useMemo(() => {
    if (!showResults) return undefined;
    return new Map(entries.map((entry) => [entry.artistId, entry.voteCount]));
  }, [entries, showResults]);

  return {
    enabled: voteEnabled,
    voteModeEnabled,
    voteDataLoaded,
    selectedIds,
    picks,
    entries,
    totalVoters,
    syncGenres,
    revoteAllowedToday,
    submitting,
    showShareTeaser,
    shareTeaser,
    showSubmitBar,
    showResults,
    maxSelection: MAX_SET_VOTE_SELECTION,
    isWeapp: isWeappRuntime,
    voteCountByArtistId,
    onVoteModeChange: handleVoteModeChange,
    onToggleDj: handleToggleDj,
    onSubmit: handleSubmit,
    onSyncGenresChange: setSyncGenres,
    onStartFromTeaser: handleStartFromTeaser,
    onRecruitWall: handleRecruitWall,
    onPrefillBuddyPost: handlePrefillBuddyPost,
    onSharePoster: handleSharePoster,
    onSavePoster: handleSavePoster,
    onEditPicks: handleEditPicks,
  };
}
