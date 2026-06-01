const { launchMiniProgram } = require('./helpers/launch.cjs');
const { waitMs, waitForSelector } = require('./helpers/wait.cjs');
const { describeE2e } = require('./helpers/describe-e2e.cjs');
const { getDefaultActivityLegacyId } = require('./helpers/env.cjs');
const {
  requirePage,
  expectRoutePath,
  expectRouteContains,
} = require('./helpers/assert-page.cjs');

const TAB_ROUTES = [
  { path: '/pages/index/index', label: '首页' },
  { path: '/pages/events/index', label: '活动' },
  { path: '/pages/profile/index', label: '我的' },
];

describeE2e('RELEASE-SMOKE (miniprogram)', () => {
  /** @type {import('miniprogram-automator/out/MiniProgram').default | undefined} */
  let miniProgram;

  beforeAll(async () => {
    miniProgram = await launchMiniProgram();
  }, 180_000);

  afterAll(async () => {
    if (miniProgram) {
      await miniProgram.close();
    }
  });

  it('switches among 首页 / 活动 / 我的', async () => {
    for (const tab of TAB_ROUTES) {
      const page = requirePage(
        await miniProgram.switchTab(tab.path),
        `switchTab(${tab.path})`,
      );
      await waitMs(page, 800);

      expectRoutePath(page, tab.path);

      const bottomNav = await page.$('[data-cmp=BottomNav]');
      expect(bottomNav).not.toBeNull();

      const label = await page.$('.s-bottom-nav__label--active');
      expect(label).not.toBeNull();
      expect(await label.text()).toContain(tab.label);
    }
  });

  it('opens activity detail by navigateTo', async () => {
    const activityLegacyId = getDefaultActivityLegacyId();
    const url =
      `/packageEvent/pages/event-detail/index?activityLegacyId=${activityLegacyId}`;

    const page = requirePage(
      await miniProgram.navigateTo(url),
      `navigateTo(${url})`,
    );
    await waitMs(page, 1500);

    expectRouteContains(page, 'event-detail');

    const detailRoot = await waitForSelector(page, '.s-event-detail', {
      timeoutMs: 20_000,
    });
    expect(detailRoot).not.toBeNull();
  });

  it('opens detail from 活动 tab when an event card is listed', async () => {
    const eventsPage = requirePage(
      await miniProgram.switchTab('/pages/events/index'),
      'switchTab(/pages/events/index)',
    );
    await waitMs(eventsPage, 1200);

    const card = await eventsPage.$('[data-cmp=EventCard]');
    if (!card) {
      // eslint-disable-next-line no-console
      console.warn(
        '[e2e] No EventCard — start backend and set TARO_APP_API_BASE_URL in .env.local',
      );
      return;
    }

    await card.tap();
    await waitMs(eventsPage, 1500);

    const current = requirePage(
      await miniProgram.currentPage(),
      'currentPage() after EventCard tap',
    );
    expectRouteContains(current, 'event-detail');

    const detailRoot = await waitForSelector(current, '.s-event-detail', {
      timeoutMs: 20_000,
    });
    expect(detailRoot).not.toBeNull();
  });
});
