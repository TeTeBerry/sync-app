import './styles.css';
import { logPlurFilmEvent } from './analytics';
import { AmbientAudio } from './audio';
import {
  buildEventDetailUrl,
  buildHomeWithOnboardingUrl,
  buildLegalDocumentUrl,
  closeMiniProgramWebview,
  emitBridge,
  isWechatMiniProgram,
  type PlurFilmBridgePayload,
} from './bridge';
import { renderApp } from './dom';
import { resolvePlurScenes } from './media';
import { ParticleField } from './particles';
import { parsePlurFilmQuery, persistLowMotion } from './query';
import { createFilmTimeline } from './timeline';

async function mount(): Promise<void> {
  const query = parsePlurFilmQuery();
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) {
    throw new Error('#app not found');
  }

  const scenes = await resolvePlurScenes();
  const ui = renderApp(root, scenes);
  if (query.exportMode) {
    ui.root.classList.add('plur-film--export');
  }
  const audio = new AmbientAudio();
  const particles = new ParticleField(ui.particlesCanvas);
  let completed = false;
  let lowMotion = query.lowMotion;

  const applyLowMotion = (enabled: boolean): void => {
    lowMotion = enabled;
    persistLowMotion(enabled);
    ui.root.classList.toggle('plur-film--low-motion', enabled);
    ui.lowMotionBtn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    if (enabled) {
      particles.stop();
      return;
    }
    if (!completed) {
      particles.start(36);
    }
  };

  applyLowMotion(lowMotion);

  const finishBridge = (payload: PlurFilmBridgePayload): void => {
    emitBridge(payload);
    if (isWechatMiniProgram()) {
      closeMiniProgramWebview();
      return;
    }
    if (payload.action === 'find_team') {
      if (query.activityLegacyId) {
        window.location.href = buildEventDetailUrl(query.activityLegacyId);
        return;
      }
      window.location.href = buildHomeWithOnboardingUrl(2);
      return;
    }
    if (payload.action === 'continue_sync') {
      window.location.href = buildHomeWithOnboardingUrl(2);
      return;
    }
    if (payload.action === 'open_guidelines') {
      window.location.href = buildLegalDocumentUrl();
    }
  };

  const showCta = (): void => {
    if (completed) {
      return;
    }
    completed = true;
    ui.root.classList.add('plur-film--ended');
    ui.cta.hidden = false;
    particles.stop();
    logPlurFilmEvent('plur_film_complete', {
      from: query.from,
      activityLegacyId: query.activityLegacyId,
    });
  };

  const timeline = createFilmTimeline(ui, {
    lowMotion,
    particles,
    onComplete: showCta,
    onProgress: (ratio) => {
      ui.progressBar.style.width = `${Math.min(100, ratio * 100)}%`;
    },
  });

  const handleSkip = (): void => {
    logPlurFilmEvent('plur_film_skip', {
      from: query.from,
      activityLegacyId: query.activityLegacyId,
    });
    timeline.skipToEnd();
  };

  ui.skipBtn.addEventListener('click', handleSkip);

  ui.soundBtn.addEventListener('click', async () => {
    if (audio.isEnabled) {
      audio.disable();
      ui.root.classList.remove('plur-film--sound-on');
      ui.soundBtn.setAttribute('aria-pressed', 'false');
      ui.soundBtn.textContent = '开启声音';
      return;
    }
    await audio.enable();
    ui.root.classList.add('plur-film--sound-on');
    ui.soundBtn.setAttribute('aria-pressed', 'true');
    ui.soundBtn.textContent = '关闭声音';
    logPlurFilmEvent('plur_film_sound_on', { from: query.from });
  });

  ui.lowMotionBtn.addEventListener('click', () => {
    applyLowMotion(!lowMotion);
  });

  ui.findTeamBtn.addEventListener('click', () => {
    logPlurFilmEvent('plur_film_cta_find_team', {
      activityLegacyId: query.activityLegacyId,
      from: query.from,
    });
    finishBridge({
      action: 'find_team',
      activityLegacyId: query.activityLegacyId,
      from: query.from,
      plurFilmConverted: '1',
    });
  });

  ui.continueBtn.addEventListener('click', () => {
    logPlurFilmEvent('plur_film_cta_continue_sync', { from: query.from });
    finishBridge({
      action: 'continue_sync',
      from: query.from,
      onboardingHighlightStep: '2',
    });
  });

  ui.guidelinesBtn.addEventListener('click', () => {
    logPlurFilmEvent('plur_film_cta_guidelines', { from: query.from });
    finishBridge({ action: 'open_guidelines', from: query.from });
  });

  ui.replayBtn.addEventListener('click', () => {
    logPlurFilmEvent('plur_film_replay', { from: query.from });
    emitBridge({
      action: 'replay',
      from: query.from,
      activityLegacyId: query.activityLegacyId,
    });
    completed = false;
    timeline.restart();
    if (!lowMotion) {
      particles.start(36);
    }
  });

  ui.findTeamBtn.textContent = '去找队';
  if (!query.activityLegacyId) {
    ui.findTeamBtn.classList.add('plur-film__btn--primary');
  }

  logPlurFilmEvent('plur_film_play_start', {
    from: query.from,
    activityLegacyId: query.activityLegacyId,
    lowMotion,
  });

  timeline.play();

  window.addEventListener('beforeunload', () => {
    timeline.kill();
    particles.destroy();
    audio.disable();
  });
}

void mount().catch((error) => {
  console.error('[plur-film] failed to start:', error);
  const root = document.querySelector<HTMLElement>('#app');
  if (root) {
    root.textContent = 'PLUR 影片暂时无法加载，请稍后再试。';
  }
});
