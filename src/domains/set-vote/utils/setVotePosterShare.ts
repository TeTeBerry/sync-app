import Taro from '@tarojs/taro';
import { hideThemedLoading, showThemedLoading } from '@/utils/themedLoading';
import { t } from '@/i18n';
import { shareImageFile } from '@/utils/shareImageFile';
import {
  ensureWritePhotosAlbumPermission,
  promptOpenAlbumSettings,
  saveImageToPhotosAlbum,
} from '@/domains/performance-itinerary/utils/itineraryWallpaperAlbum';
import type { SetVoteLeaderboardEntry, SetVotePick } from '@/types/activity';
import { renderSetVotePosterToTempFile } from './setVotePosterCanvas';
import { showAppToast } from '@/utils/appToast';

export async function shareSetVotePoster(input: {
  activityName: string;
  picks: SetVotePick[];
  topEntries: SetVoteLeaderboardEntry[];
}): Promise<void> {
  showThemedLoading({ title: t('setVote.generatingPoster'), mask: true });
  try {
    const path = await renderSetVotePosterToTempFile(input);
    await shareImageFile(path);
  } finally {
    hideThemedLoading();
  }
}

export async function saveSetVotePoster(input: {
  activityName: string;
  picks: SetVotePick[];
  topEntries: SetVoteLeaderboardEntry[];
}): Promise<void> {
  const allowed = await ensureWritePhotosAlbumPermission();
  if (!allowed) {
    await promptOpenAlbumSettings();
    throw new Error(t('setVote.albumPermissionDenied'));
  }

  showThemedLoading({ title: t('setVote.savingPoster'), mask: true });
  try {
    const path = await renderSetVotePosterToTempFile(input);
    await saveImageToPhotosAlbum(path);
    showAppToast('setVote.posterSaved', { icon: 'success' });
  } finally {
    hideThemedLoading();
  }
}
