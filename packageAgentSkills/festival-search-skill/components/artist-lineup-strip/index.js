const {
  attachAiModeComponent,
  sendTextFollowUp,
  preloadRelatedDetailPage,
  previewImageUrl,
  openDetailPage,
} = require('../../../shared/componentModelContext');

function artistInitial(name) {
  const trimmed = String(name || '').trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

Component({
  data: {
    activityName: '',
    activityDate: '',
    activityLocation: '',
    artists: [],
    artistCount: 0,
    moreCount: 0,
  },

  lifetimes: {
    created() {
      attachAiModeComponent(this, 'artist-lineup-strip', function applyLineupStrip(sc) {
        const rawArtists = sc.artists || [];
        const displayLimit = 12;
        const artists = rawArtists.slice(0, displayLimit).map((artist) => ({
          name: artist.name,
          imageUrl: artist.imageUrl || '',
          artistId: artist.artistId || '',
          initial: artistInitial(artist.name),
        }));
        const artistCount = rawArtists.length;
        const activityLegacyId = sc.activityLegacyId;
        this._activityLegacyId = activityLegacyId || 0;

        this.setData({
          activityName: sc.activityName || '',
          activityDate: sc.activityDate || '',
          activityLocation: sc.activityLocation || '',
          artists,
          artistCount,
          moreCount: Math.max(0, artistCount - displayLimit),
        });
        console.info('[ai-mode] artist-lineup-strip setData', { artistCount });

        if (activityLegacyId) {
          const viewCtx = wx.modelContext.getViewContext(this);
          viewCtx.setRelatedPage({
            path: '/packageEvent/pages/activity-lineup/index',
            query: `id=${activityLegacyId}&activityLegacyId=${activityLegacyId}`,
          });
          preloadRelatedDetailPage(
            this,
            'artist-lineup-strip',
            `packageEvent/pages/activity-lineup/index?id=${activityLegacyId}&activityLegacyId=${activityLegacyId}`,
          );
        }
      });
    },
  },

  methods: {
    onTapArtist(e) {
      const name = e.currentTarget.dataset.name || '该艺人';
      const imageUrl = e.currentTarget.dataset.imageUrl || '';
      const artistId = e.currentTarget.dataset.artistId || '';
      const legacyId = this._activityLegacyId;

      if (imageUrl) {
        previewImageUrl(imageUrl);
      }

      if (artistId && legacyId) {
        openDetailPage(
          this,
          'artist-lineup-strip',
          `packageEvent/pages/activity-lineup/index?id=${legacyId}&activityLegacyId=${legacyId}&openArtistId=${encodeURIComponent(artistId)}`,
        );
        return;
      }

      sendTextFollowUp(this, 'artist-lineup-strip', `介绍一下阵容艺人 ${name}`);
    },
  },
});
