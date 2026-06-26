type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  alpha: number;
};

export class ParticleField {
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private raf = 0;
  private running = false;
  private accentHue = 200;

  constructor(private canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D unavailable');
    }
    this.ctx = ctx;
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  setAccentHue(hue: number): void {
    this.accentHue = hue;
  }

  start(count = 48): void {
    if (count <= 0 || this.running) {
      return;
    }
    this.running = true;
    this.particles = Array.from({ length: count }, () => this.spawn());
    this.tick();
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.resize);
  }

  private resize = (): void => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth, clientHeight } = this.canvas;
    this.canvas.width = Math.floor(clientWidth * dpr);
    this.canvas.height = Math.floor(clientHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private spawn(): Particle {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.15 - Math.random() * 0.45,
      size: 1 + Math.random() * 2.2,
      hue: this.accentHue + (Math.random() - 0.5) * 40,
      alpha: 0.25 + Math.random() * 0.55,
    };
  }

  private tick = (): void => {
    if (!this.running) {
      return;
    }
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    this.ctx.clearRect(0, 0, w, h);
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -8 || p.x < -8 || p.x > w + 8) {
        Object.assign(p, this.spawn(), { y: h + 8 });
      }
      this.ctx.beginPath();
      this.ctx.fillStyle = `hsla(${p.hue}, 90%, 68%, ${p.alpha})`;
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.raf = requestAnimationFrame(this.tick);
  };
}
