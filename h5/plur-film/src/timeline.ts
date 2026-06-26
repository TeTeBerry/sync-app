import gsap from 'gsap';
import {
  FREEZE_DURATION_S,
  PLUR_SCENE_DEFS,
  SCENE_DURATION_S,
  TOTAL_FILM_S,
  TOTAL_WITH_FREEZE_S,
} from './config';
import type { AppElements } from './dom';
import type { ParticleField } from './particles';

const SCENE_HUES: Record<string, number> = {
  peace: 195,
  love: 330,
  unity: 275,
  respect: 45,
};

export type FilmTimelineController = {
  play: () => void;
  pause: () => void;
  skipToEnd: () => void;
  restart: () => void;
  kill: () => void;
};

export function createFilmTimeline(
  ui: AppElements,
  options: {
    lowMotion: boolean;
    particles: ParticleField;
    onComplete: () => void;
    onProgress: (ratio: number) => void;
  },
): FilmTimelineController {
  const master = gsap.timeline({
    paused: true,
    defaults: { ease: 'power2.inOut' },
    onUpdate: () => {
      options.onProgress(master.progress());
    },
    onComplete: options.onComplete,
  });

  gsap.set(ui.scenes, { opacity: 0, scale: 1.04 });
  gsap.set(ui.scenes[0], { opacity: 1, scale: 1 });
  gsap.set(ui.captions, { opacity: 0, y: 18 });
  gsap.set(ui.fxGroups, { opacity: 0 });
  gsap.set('.plur-film__ripple', {
    opacity: 0,
    scale: 0.2,
    transformOrigin: '50% 50%',
  });
  gsap.set('.plur-film__peace-sign', {
    opacity: 0,
    scale: 0.6,
    transformOrigin: '50% 50%',
  });
  gsap.set('.plur-film__heart', { opacity: 0, y: 24, transformOrigin: '50% 50%' });
  gsap.set('.plur-film__unity-ring', {
    opacity: 0,
    scale: 0.85,
    transformOrigin: '50% 50%',
  });
  gsap.set('.plur-film__unity-hand', {
    opacity: 0,
    scale: 0.4,
    transformOrigin: '50% 50%',
  });
  gsap.set('.plur-film__beam', {
    opacity: 0,
    scaleY: 0.2,
    transformOrigin: '50% 100%',
  });
  gsap.set('.plur-film__beam-icon', { opacity: 0, y: 12 });
  gsap.set('[data-caption="freeze"]', { opacity: 0, y: 12 });

  PLUR_SCENE_DEFS.forEach((scene, index) => {
    const start = index * SCENE_DURATION_S;
    const sceneEl = ui.scenes[index];
    const caption = ui.captions[index];
    const fx = ui.fxGroups[index];
    const hue = SCENE_HUES[scene.id] ?? 200;

    if (index > 0) {
      master.to(
        ui.scenes[index - 1],
        { opacity: 0, duration: 0.8, ease: 'power1.inOut' },
        start,
      );
      master.to(
        sceneEl,
        {
          opacity: 1,
          scale: options.lowMotion ? 1 : 1.03,
          duration: SCENE_DURATION_S,
          ease: 'none',
        },
        start,
      );
    } else if (!options.lowMotion) {
      master.to(
        sceneEl,
        { scale: 1.03, duration: SCENE_DURATION_S, ease: 'none' },
        start,
      );
    }

    master.to(caption, { opacity: 1, y: 0, duration: 0.55 }, start + 0.15);
    master.to(
      caption,
      { opacity: 0, y: -10, duration: 0.45 },
      start + SCENE_DURATION_S - 0.55,
    );
    master.to(fx, { opacity: 1, duration: 0.35 }, start + 0.2);
    master.to(fx, { opacity: 0, duration: 0.35 }, start + SCENE_DURATION_S - 0.35);

    master.add(() => options.particles.setAccentHue(hue), start);

    if (scene.id === 'peace') {
      master.to(
        '.plur-film__peace-sign',
        { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' },
        start + 0.35,
      );
      [
        '.plur-film__ripple--1',
        '.plur-film__ripple--2',
        '.plur-film__ripple--3',
      ].forEach((selector, rippleIndex) => {
        master.to(
          selector,
          {
            opacity: 0.55 - rippleIndex * 0.12,
            scale: 2.8 + rippleIndex * 0.9,
            duration: 1.8,
            ease: 'sine.out',
          },
          start + 0.25 + rippleIndex * 0.35,
        );
        master.to(
          selector,
          { opacity: 0, duration: 0.4 },
          start + 1.9 + rippleIndex * 0.2,
        );
      });
    }

    if (scene.id === 'love') {
      master.to(
        '.plur-film__heart',
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: 'back.out(2)',
        },
        start + 0.3,
      );
      if (!options.lowMotion) {
        master.to(
          '.plur-film__heart',
          { y: -18, duration: 1.4, stagger: 0.06, ease: 'sine.out' },
          start + 0.8,
        );
      }
    }

    if (scene.id === 'unity') {
      master.to(
        '.plur-film__unity-ring',
        { opacity: 0.85, scale: 1, duration: 0.8, ease: 'power2.out' },
        start + 0.25,
      );
      master.to(
        '.plur-film__unity-hand',
        {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.05,
          ease: 'back.out(1.8)',
        },
        start + 0.45,
      );
    }

    if (scene.id === 'respect') {
      master.to(
        '.plur-film__beam',
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
        },
        start + 0.2,
      );
      master.to(
        '.plur-film__beam-icon',
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 },
        start + 0.55,
      );
    }
  });

  const freezeStart = TOTAL_FILM_S;
  master.to(
    '[data-caption="freeze"]',
    { opacity: 1, y: 0, duration: 0.5 },
    freezeStart + 0.1,
  );
  master.to(
    ui.scenes[3],
    { scale: options.lowMotion ? 1 : 1.02, duration: FREEZE_DURATION_S, ease: 'none' },
    freezeStart,
  );
  master.to(
    '[data-caption="freeze"]',
    { opacity: 0, duration: 0.35 },
    TOTAL_WITH_FREEZE_S - 0.35,
  );

  return {
    play: () => master.play(0),
    pause: () => master.pause(),
    skipToEnd: () => {
      master.progress(1);
      options.onProgress(1);
      options.onComplete();
    },
    restart: () => {
      master.pause(0);
      master.progress(0);
      gsap.set(ui.scenes, { opacity: 0, scale: 1.04 });
      gsap.set(ui.scenes[0], { opacity: 1, scale: 1 });
      gsap.set(ui.captions, { opacity: 0, y: 18 });
      gsap.set(ui.fxGroups, { opacity: 0 });
      gsap.set('[data-caption="freeze"]', { opacity: 0, y: 12 });
      gsap.set(ui.cta, { opacity: 0 });
      ui.cta.hidden = true;
      ui.root.classList.remove('plur-film--ended');
      master.play(0);
    },
    kill: () => master.kill(),
  };
}
