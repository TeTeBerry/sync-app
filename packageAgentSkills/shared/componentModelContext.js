/**
 * 原子组件通用：监听 Result / Overflow，供 wxa-skills-validate 与 DevTools 渲染校验。
 */

const SHARE_TITLE_MAX = 48;

function truncateShareField(value, max) {
  const trimmed = String(value || '').trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1))}…`;
}

function attachAiModeComponent(
  componentInstance,
  componentName,
  applyStructuredContent,
) {
  console.info(`[ai-mode] ${componentName} created`);

  const { NotificationType } = wx.modelContext;
  const modelCtx = wx.modelContext.getContext(componentInstance);

  modelCtx.on(NotificationType.Result, (data) => {
    const result = data?.result;
    const sc = result?.structuredContent;
    console.info(`[ai-mode] ${componentName} 收到 Result:`, sc, result?.isError);

    if (result?.isError) {
      const message = result.content?.[0]?.text || '操作失败';
      applyStructuredContent.call(componentInstance, {
        _error: true,
        message,
        ...(sc || {}),
      });
      return;
    }

    if (!sc) return;
    applyStructuredContent.call(componentInstance, sc);
  });

  const viewCtx = wx.modelContext.getViewContext(componentInstance);
  const dims = viewCtx.getDimensions();
  console.info(
    `[ai-mode] ${componentName} dimensions width=${dims.width} minHeight=${dims.minHeight} maxHeight=${dims.maxHeight}`,
  );

  viewCtx.on(NotificationType.Overflow, (overflowData) => {
    const overflowed = !!(overflowData && overflowData.overflowHeight > 0);
    console.info(
      `[ai-mode] ${componentName} overflow overflowed=${overflowed} data=${JSON.stringify(overflowData)}`,
    );
  });
  console.info(`[ai-mode] ${componentName} overflow monitor=on`);
}

function sendApiCall(componentInstance, componentName, text, apiName, args) {
  console.info(
    `[ai-mode] ${componentName} send api/call name=${apiName} args=${JSON.stringify(args)}`,
  );
  wx.modelContext.getContext(componentInstance).sendFollowUpMessage({
    content: [
      { type: 'text', text },
      { type: 'api/call', data: { name: apiName, arguments: args } },
    ],
  });
}

function sendTextFollowUp(componentInstance, componentName, text) {
  console.info(`[ai-mode] ${componentName} send text: ${text}`);
  wx.modelContext.getContext(componentInstance).sendFollowUpMessage({
    content: [{ type: 'text', text }],
  });
}

function openDetailPage(componentInstance, componentName, url) {
  const normalized = url.startsWith('/') ? url.slice(1) : url;
  console.info(`[ai-mode] ${componentName} openDetailPage url=${normalized}`);
  wx.modelContext.getViewContext(componentInstance).openDetailPage({ url: normalized });
}

function preloadRelatedDetailPage(componentInstance, componentName, url) {
  const normalized = url.startsWith('/') ? url.slice(1) : url;
  console.info(`[ai-mode] ${componentName} preloadDetailPage url=${normalized}`);
  try {
    wx.modelContext
      .getViewContext(componentInstance)
      .preloadDetailPage({ url: normalized });
  } catch (err) {
    console.info(`[ai-mode] ${componentName} preloadDetailPage skipped`, err);
  }
}

function expirePreviousSearchCards(componentInstance, skillRoot) {
  try {
    wx.modelContext.expireAllCards({
      componentPaths: [
        `${skillRoot}/components/search-results-card/index`,
        `${skillRoot}/components/event-compare-strip/index`,
      ],
      match: 'previous',
    });
  } catch (err) {
    console.info('[ai-mode] expirePreviousSearchCards skipped', err);
  }
}

function notifyModelSelection(componentInstance, text) {
  console.info(`[ai-mode] notifyModelSelection: ${text}`);
  wx.modelContext.getViewContext(componentInstance).updateModelContext({
    content: [{ type: 'text', text }],
  });
}

function buildEventSharePayload(event) {
  const legacyId = event?.legacyId;
  if (!legacyId) return null;
  const parts = [event.name, event.date, event.location].filter(Boolean);
  const title = truncateShareField(parts.join(' · ') || '电音节资讯', SHARE_TITLE_MAX);
  const path = `packageEvent/pages/event-detail/index?legacyId=${legacyId}`;
  const imageUrl = event.heroImageUrl || '';
  return { title, path, imageUrl: imageUrl || undefined };
}

function shareEventInTap(event) {
  const payload = buildEventSharePayload(event);
  if (!payload) return;
  console.info('[ai-mode] shareEventInTap', payload.title);
  wx.shareAppMessage(payload);
}

function openEventLocation(event) {
  const latitude = Number(event?.latitude);
  const longitude = Number(event?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
  console.info('[ai-mode] openEventLocation', latitude, longitude);
  wx.openLocation({
    latitude,
    longitude,
    name: event.name || '活动地点',
    address: event.location || '',
    scale: 15,
  });
}

function previewImageUrl(imageUrl) {
  const url = String(imageUrl || '').trim();
  if (!url) return;
  console.info('[ai-mode] previewImageUrl', url);
  wx.previewMedia({
    sources: [{ url, type: 'image' }],
  });
}

module.exports = {
  attachAiModeComponent,
  sendApiCall,
  sendTextFollowUp,
  openDetailPage,
  preloadRelatedDetailPage,
  expirePreviousSearchCards,
  notifyModelSelection,
  shareEventInTap,
  openEventLocation,
  previewImageUrl,
  buildEventSharePayload,
};
