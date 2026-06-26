import type { PlurScene } from './config';
import { PEACE_GESTURE_SVG } from './peaceGesture';

export function renderApp(root: HTMLElement, scenes: PlurScene[]): AppElements {
  root.innerHTML = `
    <div class="plur-film" data-cmp="PlurFilm">
      <div class="plur-film__stage" aria-hidden="true">
        ${scenes
          .map(
            (scene, index) => `
          <div class="plur-film__scene" data-scene="${scene.id}" data-index="${index}">
            <img
              class="plur-film__bg"
              src="${scene.image}"
              alt=""
              decoding="async"
              loading="eager"
            />
            <div class="plur-film__scene-scrim"></div>
          </div>
        `,
          )
          .join('')}
        <canvas class="plur-film__particles" aria-hidden="true"></canvas>
        <svg class="plur-film__overlay" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g class="plur-film__fx plur-film__fx--peace">
            <circle class="plur-film__ripple plur-film__ripple--1" cx="195" cy="620" r="24" />
            <circle class="plur-film__ripple plur-film__ripple--2" cx="195" cy="620" r="24" />
            <circle class="plur-film__ripple plur-film__ripple--3" cx="195" cy="620" r="24" />
            ${PEACE_GESTURE_SVG}
          </g>
          <g class="plur-film__fx plur-film__fx--love">
            ${Array.from({ length: 8 })
              .map((_, i) => {
                const x = 80 + (i % 4) * 70;
                const y = 360 + Math.floor(i / 4) * 90;
                return `<text class="plur-film__heart" x="${x}" y="${y}" text-anchor="middle">♥</text>`;
              })
              .join('')}
          </g>
          <g class="plur-film__fx plur-film__fx--unity">
            <circle class="plur-film__unity-ring" cx="195" cy="360" r="120" fill="none" stroke-width="3" />
            ${Array.from({ length: 10 })
              .map((_, i) => {
                const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                const x = 195 + Math.cos(angle) * 120;
                const y = 360 + Math.sin(angle) * 120;
                return `<circle class="plur-film__unity-hand" cx="${x}" cy="${y}" r="10" />`;
              })
              .join('')}
          </g>
          <g class="plur-film__fx plur-film__fx--respect">
            <g class="plur-film__respect-beams">
              ${[
                { x: 70, color: '#4cc9f0', icon: 'note' },
                { x: 130, color: '#4895ef', icon: 'radio' },
                { x: 195, color: '#f72585', icon: 'bolt' },
                { x: 260, color: '#b5179e', icon: 'heart' },
                { x: 320, color: '#f9c74f', icon: 'phones' },
              ]
                .map((beam) => {
                  const iconMarkup =
                    beam.icon === 'note'
                      ? '<path d="M-6 4v-18l12-4v18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />'
                      : beam.icon === 'radio'
                        ? '<rect x="-9" y="-6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2" /><circle cx="-4" cy="0" r="2.5" fill="currentColor" />'
                        : beam.icon === 'bolt'
                          ? '<path d="M2 -10  -4 0h5l-3 10 8-12h-5z" fill="currentColor" />'
                          : beam.icon === 'heart'
                            ? '<path d="M0 -4c-4-5-10-1-10 4 0 6 10 12 10 12s10-6 10-12c0-5-6-9-10-4z" fill="currentColor" />'
                            : '<path d="M-8 -2h5v-8h6v8h5v6h-5v8h-6v-8h-5z" fill="none" stroke="currentColor" stroke-width="2" />';
                  return `
                <g class="plur-film__beam" transform="translate(${beam.x}, 700)">
                  <rect class="plur-film__beam-bar" x="-10" y="-220" width="20" height="220" rx="10" fill="${beam.color}" />
                  <g class="plur-film__beam-icon" transform="translate(0, -232)">${iconMarkup}</g>
                </g>
              `;
                })
                .join('')}
            </g>
          </g>
        </svg>
      </div>

      <div class="plur-film__copy">
        ${scenes
          .map(
            (scene) => `
          <article class="plur-film__caption" data-caption="${scene.id}">
            <p class="plur-film__caption-title">${scene.title}</p>
            <p class="plur-film__caption-sub">${scene.subtitle}</p>
            ${scene.extra ? `<p class="plur-film__caption-extra">${scene.extra}</p>` : ''}
          </article>
        `,
          )
          .join('')}
        <article class="plur-film__caption plur-film__caption--freeze" data-caption="freeze">
          <p class="plur-film__caption-title plur-film__caption-title--plur">PEACE · LOVE · UNITY · RESPECT</p>
        </article>
      </div>

      <header class="plur-film__chrome">
        <button type="button" class="plur-film__btn plur-film__btn--ghost" data-action="skip">跳过</button>
        <div class="plur-film__chrome-right">
          <button type="button" class="plur-film__btn plur-film__btn--ghost" data-action="low-motion" aria-pressed="false">低动效</button>
          <button type="button" class="plur-film__btn plur-film__btn--ghost" data-action="sound" aria-pressed="false">开启声音</button>
        </div>
      </header>

      <div class="plur-film__visualizer" aria-hidden="true">
        ${Array.from({ length: 12 })
          .map((_, i) => `<span class="plur-film__viz-bar" style="--i:${i}"></span>`)
          .join('')}
      </div>

      <section class="plur-film__cta" hidden>
        <p class="plur-film__cta-lead">PLUR 是 SYNC 的社区态度</p>
        <button type="button" class="plur-film__btn plur-film__btn--primary" data-action="find-team">去找队</button>
        <button type="button" class="plur-film__btn plur-film__btn--secondary" data-action="continue-sync">继续了解 SYNC</button>
        <button type="button" class="plur-film__btn plur-film__btn--link" data-action="guidelines">阅读社区规范</button>
        <button type="button" class="plur-film__btn plur-film__btn--link" data-action="replay">再看一遍</button>
      </section>

      <div class="plur-film__progress" aria-hidden="true"><span class="plur-film__progress-bar"></span></div>
    </div>
  `;

  const film = root.querySelector<HTMLElement>('.plur-film');
  if (!film) {
    throw new Error('Failed to mount PLUR film');
  }

  return {
    root: film,
    scenes: [...film.querySelectorAll<HTMLElement>('.plur-film__scene')],
    captions: [...film.querySelectorAll<HTMLElement>('.plur-film__caption')],
    fxGroups: [...film.querySelectorAll<SVGElement>('.plur-film__fx')],
    progressBar: film.querySelector<HTMLElement>('.plur-film__progress-bar')!,
    cta: film.querySelector<HTMLElement>('.plur-film__cta')!,
    particlesCanvas: film.querySelector<HTMLCanvasElement>('.plur-film__particles')!,
    visualizer: film.querySelector<HTMLElement>('.plur-film__visualizer')!,
    skipBtn: film.querySelector<HTMLButtonElement>('[data-action="skip"]')!,
    soundBtn: film.querySelector<HTMLButtonElement>('[data-action="sound"]')!,
    lowMotionBtn: film.querySelector<HTMLButtonElement>('[data-action="low-motion"]')!,
    findTeamBtn: film.querySelector<HTMLButtonElement>('[data-action="find-team"]')!,
    continueBtn: film.querySelector<HTMLButtonElement>(
      '[data-action="continue-sync"]',
    )!,
    guidelinesBtn: film.querySelector<HTMLButtonElement>('[data-action="guidelines"]')!,
    replayBtn: film.querySelector<HTMLButtonElement>('[data-action="replay"]')!,
  };
}

export type AppElements = {
  root: HTMLElement;
  scenes: HTMLElement[];
  captions: HTMLElement[];
  fxGroups: SVGElement[];
  progressBar: HTMLElement;
  cta: HTMLElement;
  particlesCanvas: HTMLCanvasElement;
  visualizer: HTMLElement;
  skipBtn: HTMLButtonElement;
  soundBtn: HTMLButtonElement;
  lowMotionBtn: HTMLButtonElement;
  findTeamBtn: HTMLButtonElement;
  continueBtn: HTMLButtonElement;
  guidelinesBtn: HTMLButtonElement;
  replayBtn: HTMLButtonElement;
};
