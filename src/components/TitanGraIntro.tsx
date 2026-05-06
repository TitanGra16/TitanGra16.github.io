import { useCallback, useEffect, useRef, useState } from "react";

type TitanGraIntroProps = {
  onIntroComplete: () => void;
};

type TargetPoint = {
  x: number;
  y: number;
};

type Particle = TargetPoint & {
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  alpha: number;
  baseSize: number;
  color: string;
  phase: number;
  noise: number;
  delay: number;
  flicker: number;
  trail: boolean;
};

type LogoType = {
  text: string;
  fontSize: number;
  y: number;
};

type RenderLayers = {
  background: HTMLCanvasElement;
  sprites: Map<string, HTMLCanvasElement>;
};

const INTRO_DURATION = 4200;
const SHOCKWAVE_START = 3300;
const SHOCKWAVE_DURATION = 760;
const LOGO_TEXT = "TitanGra";
const FONT_STACK =
  "Inter, Sora, Space Grotesk, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const COLORS = ["#8A2BE2", "#B026FF", "#FF2ED1", "#F4E8FF"] as const;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const lerp = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

function getCanvasPixelRatio(width: number) {
  const deviceRatio = window.devicePixelRatio || 1;

  if (width >= 1280) {
    return Math.min(deviceRatio, 1.15);
  }

  if (width >= 768) {
    return Math.min(deviceRatio, 1.3);
  }

  return Math.min(deviceRatio, 1.45);
}

function getParticleBudget(width: number) {
  if (width < 520) {
    return 620;
  }

  if (width < 900) {
    return 860;
  }

  if (width < 1400) {
    return 1120;
  }

  return 1320;
}

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updatePreference);
    } else {
      media.addListener(updatePreference);
    }

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", updatePreference);
      } else {
        media.removeListener(updatePreference);
      }
    };
  }, []);

  return reducedMotion;
}

function getLogoType(width: number, height: number): LogoType {
  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");
  let fontSize = clamp(width, 320, 1280) * 0.15;

  fontSize = Math.min(fontSize, height * 0.2, 150);
  fontSize = Math.max(fontSize, 48);

  if (measureContext) {
    measureContext.font = `800 ${fontSize}px ${FONT_STACK}`;
    const measured = measureContext.measureText(LOGO_TEXT).width;
    const maxWidth = width * 0.82;

    if (measured > maxWidth) {
      fontSize *= maxWidth / measured;
    }
  }

  return {
    text: LOGO_TEXT,
    fontSize,
    y: height * 0.48
  };
}

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items;
}

function buildTextTargets(width: number, height: number): TargetPoint[] {
  const mask = document.createElement("canvas");
  const context = mask.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return [];
  }

  mask.width = Math.max(1, Math.floor(width));
  mask.height = Math.max(1, Math.floor(height));

  const logo = getLogoType(width, height);
  context.clearRect(0, 0, mask.width, mask.height);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `800 ${logo.fontSize}px ${FONT_STACK}`;
  context.fillStyle = "#ffffff";
  context.shadowColor = "#ffffff";
  context.shadowBlur = Math.max(8, logo.fontSize * 0.06);
  context.fillText(logo.text, width / 2, logo.y);

  const imageData = context.getImageData(0, 0, mask.width, mask.height).data;
  const step = width < 520 ? 6 : width < 900 ? 5 : 4;
  const targets: TargetPoint[] = [];

  for (let y = 0; y < mask.height; y += step) {
    for (let x = 0; x < mask.width; x += step) {
      const alpha = imageData[(y * mask.width + x) * 4 + 3];

      if (alpha > 110) {
        targets.push({ x, y });
      }
    }
  }

  return targets;
}

function randomStart(width: number, height: number): TargetPoint {
  if (Math.random() < 0.3) {
    return {
      x: Math.random() * width,
      y: Math.random() * height
    };
  }

  const side = Math.floor(Math.random() * 4);
  const pad = Math.max(width, height) * 0.08;

  if (side === 0) {
    return { x: Math.random() * width, y: -pad };
  }

  if (side === 1) {
    return { x: width + pad, y: Math.random() * height };
  }

  if (side === 2) {
    return { x: Math.random() * width, y: height + pad };
  }

  return { x: -pad, y: Math.random() * height };
}

function createParticles(targets: TargetPoint[], width: number, height: number) {
  const maxParticles = getParticleBudget(width);
  const selectedTargets =
    targets.length > maxParticles
      ? shuffle([...targets]).slice(0, maxParticles)
      : targets;

  return selectedTargets.map((target, index): Particle => {
    const start = randomStart(width, height);

    return {
      x: start.x,
      y: start.y,
      targetX: target.x,
      targetY: target.y,
      vx: (Math.random() - 0.5) * 1.35,
      vy: (Math.random() - 0.5) * 1.35,
      alpha: 0,
      baseSize: 0.48 + Math.random() * 1.05,
      color: COLORS[index % COLORS.length],
      phase: Math.random() * Math.PI * 2,
      noise: 0.25 + Math.random() * 1.05,
      delay: 180 + Math.random() * 1200,
      flicker: 0.45 + Math.random() * 1.1,
      trail: index % 5 === 0
    };
  });
}

function createParticleSprites() {
  const sprites = new Map<string, HTMLCanvasElement>();
  const spriteSize = 48;

  COLORS.forEach((color) => {
    const sprite = document.createElement("canvas");
    const context = sprite.getContext("2d");

    sprite.width = spriteSize;
    sprite.height = spriteSize;

    if (context) {
      const center = spriteSize / 2;
      const glow = context.createRadialGradient(
        center,
        center,
        0,
        center,
        center,
        center
      );

      glow.addColorStop(0, color);
      glow.addColorStop(0.18, `${color}CC`);
      glow.addColorStop(0.48, `${color}4D`);
      glow.addColorStop(1, `${color}00`);
      context.fillStyle = glow;
      context.fillRect(0, 0, spriteSize, spriteSize);

      context.fillStyle = "#F4E8FF";
      context.globalAlpha = color === "#F4E8FF" ? 0.62 : 0.26;
      context.beginPath();
      context.arc(center, center, 1.9, 0, Math.PI * 2);
      context.fill();
    }

    sprites.set(color, sprite);
  });

  return sprites;
}

function createRenderLayers(width: number, height: number): RenderLayers {
  return {
    background: createBackgroundLayer(width, height),
    sprites: createParticleSprites()
  };
}

function createBackgroundLayer(width: number, height: number) {
  const layer = document.createElement("canvas");
  const context = layer.getContext("2d");

  layer.width = width;
  layer.height = height;

  if (!context) {
    return layer;
  }

  context.fillStyle = "#05030A";
  context.fillRect(0, 0, width, height);

  const depth = context.createLinearGradient(0, 0, width, height);
  depth.addColorStop(0, "rgba(11, 6, 20, 0.32)");
  depth.addColorStop(0.52, "rgba(42, 10, 74, 0.12)");
  depth.addColorStop(1, "rgba(5, 3, 10, 0.48)");
  context.fillStyle = depth;
  context.fillRect(0, 0, width, height);

  const centerGlow = context.createRadialGradient(
    width / 2,
    height * 0.48,
    0,
    width / 2,
    height * 0.48,
    Math.max(width, height) * 0.62
  );
  centerGlow.addColorStop(0, "rgba(138, 43, 226, 0.13)");
  centerGlow.addColorStop(0.36, "rgba(176, 38, 255, 0.055)");
  centerGlow.addColorStop(1, "rgba(5, 3, 10, 0)");
  context.fillStyle = centerGlow;
  context.fillRect(0, 0, width, height);

  return layer;
}

function drawBackground(
  context: CanvasRenderingContext2D,
  layer: HTMLCanvasElement,
  width: number,
  height: number,
  fade = true
) {
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  context.fillStyle = fade ? "rgba(5, 3, 10, 0.3)" : "#05030A";
  context.fillRect(0, 0, width, height);
  context.globalAlpha = fade ? 0.72 : 1;
  context.drawImage(layer, 0, 0, width, height);
  context.globalAlpha = 1;
}

function drawScannerLines(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  timestamp: number,
  settled: boolean
) {
  const introPresence =
    smoothstep(520, 1100, elapsed) * (1 - smoothstep(2050, 2900, elapsed));
  const idlePresence = settled ? 0.16 : 0;
  const alpha = Math.max(introPresence, idlePresence);

  if (alpha <= 0.01) {
    return;
  }

  context.save();
  context.globalAlpha = alpha;
  context.globalCompositeOperation = "lighter";

  const yOffset = (timestamp * 0.048) % 46;

  for (let y = -46 + yOffset; y < height; y += 46) {
    const line = context.createLinearGradient(0, y, width, y);
    line.addColorStop(0, "rgba(138, 43, 226, 0)");
    line.addColorStop(0.45, "rgba(138, 43, 226, 0.34)");
    line.addColorStop(0.55, "rgba(255, 46, 209, 0.22)");
    line.addColorStop(1, "rgba(138, 43, 226, 0)");
    context.fillStyle = line;
    context.fillRect(0, y, width, 1.2);
  }

  const scanY = (timestamp * 0.18) % height;
  context.fillStyle = "rgba(244, 232, 255, 0.08)";
  context.fillRect(0, scanY, width, 2);
  context.restore();
}

function updateParticle(
  particle: Particle,
  elapsed: number,
  timestamp: number,
  delta: number,
  settled: boolean
) {
  const step = Math.min(delta / 16.67, 2);
  const seconds = timestamp * 0.001;

  if (settled) {
    const tremor = 0.18 + particle.noise * 0.24;
    const idleX =
      particle.targetX +
      Math.sin(seconds * (1.15 + particle.noise) + particle.phase) * tremor;
    const idleY =
      particle.targetY +
      Math.cos(seconds * (1.05 + particle.noise) + particle.phase) * tremor;

    particle.x = lerp(particle.x, idleX, 0.07 * step);
    particle.y = lerp(particle.y, idleY, 0.07 * step);
    particle.vx *= 0.88;
    particle.vy *= 0.88;
    particle.alpha = lerp(particle.alpha, 0.54, 0.035 * step);
    return;
  }

  const birth = smoothstep(particle.delay, particle.delay + 820, elapsed);
  const attraction = smoothstep(1120, 3220, elapsed);
  const dx = particle.targetX - particle.x;
  const dy = particle.targetY - particle.y;
  const fieldX =
    Math.sin(seconds * 3.2 + particle.phase + particle.y * 0.012) *
    particle.noise;
  const fieldY =
    Math.cos(seconds * 2.8 + particle.phase + particle.x * 0.014) *
    particle.noise;
  const pull = 0.003 + attraction * 0.021;
  const turbulence = (1 - attraction) * 0.09;

  particle.vx += (dx * pull + fieldX * turbulence) * step;
  particle.vy += (dy * pull + fieldY * turbulence) * step;
  particle.vx *= Math.pow(0.86, step);
  particle.vy *= Math.pow(0.86, step);
  particle.x += particle.vx * step;
  particle.y += particle.vy * step;

  if (attraction > 0.82) {
    const lock = (attraction - 0.82) / 0.18;
    const microJitter = (1 - lock) * particle.noise * 1.15;

    particle.x = lerp(
      particle.x,
      particle.targetX + Math.sin(seconds * 14 + particle.phase) * microJitter,
      0.08 * step
    );
    particle.y = lerp(
      particle.y,
      particle.targetY + Math.cos(seconds * 13 + particle.phase) * microJitter,
      0.08 * step
    );
  }

  const firstBlink = 0.16 + smoothstep(360, 960, elapsed) * 0.34;
  particle.alpha = birth * (firstBlink + attraction * 0.38);
}

function drawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  sprites: Map<string, HTMLCanvasElement>,
  elapsed: number,
  timestamp: number,
  settled: boolean
) {
  const attraction = settled ? 1 : smoothstep(1120, 3220, elapsed);
  const flickerStrength = settled ? 0.035 : 0.14;

  context.save();
  context.globalCompositeOperation = "lighter";

  for (const particle of particles) {
    const sprite = sprites.get(particle.color);
    const flicker =
      1 +
      Math.sin(timestamp * 0.006 * particle.flicker + particle.phase) *
        flickerStrength;
    const size = particle.baseSize + attraction * 0.55;
    const alpha = clamp(particle.alpha * flicker, 0, 1);

    if (alpha <= 0.01 || !sprite) {
      continue;
    }

    const spriteSize = size * (settled ? 6.4 : 6);
    context.globalAlpha = alpha * 0.58;
    context.drawImage(
      sprite,
      particle.x - spriteSize / 2,
      particle.y - spriteSize / 2,
      spriteSize,
      spriteSize
    );

    if (particle.trail && !settled && attraction > 0.28) {
      context.globalAlpha = alpha * 0.15;
      context.strokeStyle = particle.color;
      context.lineWidth = 0.55;
      context.beginPath();
      context.moveTo(particle.x, particle.y);
      context.lineTo(
        particle.x - particle.vx * 5.5,
        particle.y - particle.vy * 5.5
      );
      context.stroke();
    }
  }

  context.restore();
}

function drawShockwave(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number
) {
  const progress = clamp((elapsed - SHOCKWAVE_START) / SHOCKWAVE_DURATION);

  if (progress <= 0 || progress >= 1) {
    return 0;
  }

  const eased = easeOutCubic(progress);
  const radius = eased * Math.min(width, height) * 0.46;
  const alpha = 1 - progress;

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = `rgba(255, 46, 209, ${0.72 * alpha})`;
  context.lineWidth = 2.4 + alpha * 5;
  context.shadowColor = "#FF2ED1";
  context.shadowBlur = 42;
  context.beginPath();
  context.arc(width / 2, height * 0.48, radius, 0, Math.PI * 2);
  context.stroke();

  context.fillStyle = `rgba(176, 38, 255, ${0.08 * alpha})`;
  context.fillRect(0, height * 0.48 - 1, width, 2);
  context.restore();

  return alpha;
}

function drawGlitchBurst(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number
) {
  if (intensity <= 0.01) {
    return;
  }

  const logo = getLogoType(width, height);
  const areaWidth = Math.min(width * 0.72, logo.fontSize * 5.8);
  const lines = Math.floor(5 + intensity * 14);

  context.save();
  context.globalCompositeOperation = "lighter";
  context.shadowColor = "#FF2ED1";
  context.shadowBlur = 22;

  for (let i = 0; i < lines; i += 1) {
    const y =
      logo.y +
      (Math.random() - 0.5) * logo.fontSize * 1.25 +
      Math.sin(i) * 6;
    const x = width / 2 - areaWidth / 2 + Math.random() * areaWidth;
    const lineWidth = 16 + Math.random() * areaWidth * 0.26;
    const lineHeight = 1 + Math.random() * 2.4;

    context.globalAlpha = intensity * (0.22 + Math.random() * 0.46);
    context.fillStyle = Math.random() > 0.46 ? "#FF2ED1" : "#B026FF";
    context.fillRect(x, y, lineWidth, lineHeight);
  }

  context.restore();
}

function drawStaticScene(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  layers: RenderLayers,
  width: number,
  height: number
) {
  drawBackground(context, layers.background, width, height, false);
  drawScannerLines(context, width, height, 2200, 0, true);
  drawParticles(context, particles, layers.sprites, INTRO_DURATION, 0, true);
}

export default function TitanGraIntro({
  onIntroComplete
}: TitanGraIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const reducedMotion = useReducedMotion();

  const finishIntro = useCallback(() => {
    if (completedRef.current) {
      return;
    }

    completedRef.current = true;
    setIsReady(true);
    onIntroComplete();
  }, [onIntroComplete]);

  const skipIntro = useCallback(() => {
    finishIntro();
  }, [finishIntro]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      finishIntro();
      return undefined;
    }

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let layers: RenderLayers | null = null;
    let previousTimestamp = performance.now();
    const startTimestamp = performance.now();
    let nextBurstTimestamp = startTimestamp + 5200;
    let burstEndTimestamp = 0;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();

      width = Math.max(320, Math.floor(bounds.width));
      height = Math.max(520, Math.floor(bounds.height));
      const pixelRatio = getCanvasPixelRatio(width);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.imageSmoothingEnabled = true;

      const targets = buildTextTargets(width, height);
      particles = createParticles(targets, width, height);
      layers = createRenderLayers(width, height);

      if (completedRef.current || reducedMotion) {
        particles.forEach((particle) => {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
          particle.alpha = 0.92;
        });
      }

      if (reducedMotion && layers) {
        drawStaticScene(context, particles, layers, width, height);
      }
    };

    const observer =
      "ResizeObserver" in window ? new ResizeObserver(resize) : null;

    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    resize();

    if (reducedMotion) {
      finishIntro();

      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", resize);
      };
    }

    const animate = (timestamp: number) => {
      const elapsed = completedRef.current
        ? INTRO_DURATION + timestamp - startTimestamp
        : timestamp - startTimestamp;
      const delta = timestamp - previousTimestamp;
      previousTimestamp = timestamp;

      const settled = completedRef.current || elapsed >= INTRO_DURATION;

      if (elapsed >= INTRO_DURATION) {
        finishIntro();
      }

      if (settled && timestamp > nextBurstTimestamp) {
        burstEndTimestamp = timestamp + 140 + Math.random() * 120;
        nextBurstTimestamp = timestamp + 1700 + Math.random() * 3600;
      }

      const burstIntensity =
        timestamp < burstEndTimestamp
          ? 1 - (burstEndTimestamp - timestamp) / 260
          : 0;

      if (!layers) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      drawBackground(context, layers.background, width, height, true);
      drawScannerLines(context, width, height, elapsed, timestamp, settled);

      particles.forEach((particle) => {
        updateParticle(particle, elapsed, timestamp, delta, settled);
      });

      drawParticles(
        context,
        particles,
        layers.sprites,
        elapsed,
        timestamp,
        settled
      );
      const shockAlpha = drawShockwave(context, width, height, elapsed);
      drawGlitchBurst(
        context,
        width,
        height,
        Math.max(shockAlpha, clamp(burstIntensity))
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [finishIntro, reducedMotion]);

  return (
    <section id="top" className={`intro ${isReady ? "intro--ready" : ""}`}>
      <h1 className="sr-only">TitanGra Portfolio</h1>

      <canvas ref={canvasRef} className="intro__canvas" aria-hidden="true" />

      <div className="intro__brand" aria-hidden="true">
        TitanGra
      </div>

      {!isReady && (
        <button className="intro__skip" type="button" onClick={skipIntro}>
          Skip intro
        </button>
      )}

      <div className="intro__copy" aria-hidden={!isReady}>
        <p>Building digital worlds, one line at a time.</p>
        <a className="intro__arrow" href="#about" aria-label="Scroll to about">
          <span />
        </a>
      </div>
    </section>
  );
}
