import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

type TitanGraIntroProps = {
  onIntroComplete: () => void;
};

type ParticleKind = "star" | "signal" | "shard";

type Particle = {
  kind: ParticleKind;
  x: number;
  y: number;
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  angle: number;
  orbitX: number;
  orbitY: number;
  speed: number;
  size: number;
  length: number;
  alpha: number;
  color: string;
  phase: number;
};

const BRAND = "TitanGra";
const INTRO_DURATION = 3800;
const SHOCKWAVE_AT = 2920;
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

function randomFromEdge(width: number, height: number) {
  const pad = Math.max(width, height) * 0.12;
  const side = Math.floor(Math.random() * 4);

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

function createParticles(width: number, height: number): Particle[] {
  const starCount = width < 640 ? 90 : 140;
  const signalCount = width < 640 ? 92 : 150;
  const shardCount = width < 640 ? 16 : 28;
  const particles: Particle[] = [];

  for (let index = 0; index < starCount; index += 1) {
    particles.push({
      kind: "star",
      x: Math.random() * width,
      y: Math.random() * height,
      startX: 0,
      startY: 0,
      vx: (Math.random() - 0.5) * 0.08,
      vy: 0.08 + Math.random() * 0.18,
      angle: Math.random() * Math.PI * 2,
      orbitX: 0,
      orbitY: 0,
      speed: 0,
      size: 0.45 + Math.random() * 1.15,
      length: 0,
      alpha: 0.16 + Math.random() * 0.45,
      color: COLORS[index % COLORS.length],
      phase: Math.random() * Math.PI * 2
    });
  }

  for (let index = 0; index < signalCount; index += 1) {
    const start = randomFromEdge(width, height);
    const angle = (index / signalCount) * Math.PI * 2;

    particles.push({
      kind: "signal",
      x: start.x,
      y: start.y,
      startX: start.x,
      startY: start.y,
      vx: 0,
      vy: 0,
      angle,
      orbitX: 0,
      orbitY: 0,
      speed: 0.002 + Math.random() * 0.003,
      size: 0.85 + Math.random() * 1.55,
      length: 0,
      alpha: 0,
      color: COLORS[index % COLORS.length],
      phase: Math.random() * Math.PI * 2
    });
  }

  for (let index = 0; index < shardCount; index += 1) {
    const start = randomFromEdge(width, height);
    const angle = (index / shardCount) * Math.PI * 2 + Math.random() * 0.45;

    particles.push({
      kind: "shard",
      x: start.x,
      y: start.y,
      startX: start.x,
      startY: start.y,
      vx: 0,
      vy: 0,
      angle,
      orbitX: 0,
      orbitY: 0,
      speed: 0.0015 + Math.random() * 0.0022,
      size: 1,
      length: 22 + Math.random() * 48,
      alpha: 0,
      color: COLORS[(index + 1) % COLORS.length],
      phase: Math.random() * Math.PI * 2
    });
  }

  return particles;
}

function drawBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  settled: boolean
) {
  context.globalCompositeOperation = "source-over";
  context.globalAlpha = 1;
  context.fillStyle = settled ? "rgba(5, 3, 10, 0.24)" : "rgba(5, 3, 10, 0.34)";
  context.fillRect(0, 0, width, height);

  const centerGlow = context.createRadialGradient(
    width / 2,
    height * 0.47,
    0,
    width / 2,
    height * 0.47,
    Math.max(width, height) * 0.62
  );

  centerGlow.addColorStop(0, "rgba(176, 38, 255, 0.13)");
  centerGlow.addColorStop(0.36, "rgba(42, 10, 74, 0.12)");
  centerGlow.addColorStop(1, "rgba(5, 3, 10, 0)");
  context.fillStyle = centerGlow;
  context.fillRect(0, 0, width, height);

  const floorGlow = context.createLinearGradient(0, height * 0.46, 0, height);
  floorGlow.addColorStop(0, "rgba(255, 46, 209, 0)");
  floorGlow.addColorStop(0.55, "rgba(176, 38, 255, 0.06)");
  floorGlow.addColorStop(1, "rgba(42, 10, 74, 0.16)");
  context.fillStyle = floorGlow;
  context.fillRect(0, height * 0.44, width, height * 0.56);
}

function drawLaunchBeams(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  timestamp: number,
  settled: boolean
) {
  const reveal =
    smoothstep(260, 1200, elapsed) * (1 - smoothstep(2600, 3500, elapsed)) +
    (settled ? 0.18 : 0);

  if (reveal <= 0.01) {
    return;
  }

  const centerX = width / 2;
  const centerY = height * 0.47;
  const time = timestamp * 0.001;
  const beamLength = Math.max(width, height) * 0.62;

  context.save();
  context.globalCompositeOperation = "lighter";
  context.lineCap = "round";

  for (let i = 0; i < 7; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const spread = (i - 3) * 0.09;
    const angle = side * (0.28 + spread) + Math.sin(time * 0.7 + i) * 0.03;
    const x1 = centerX + Math.cos(angle + Math.PI) * beamLength;
    const y1 = centerY + Math.sin(angle + Math.PI) * beamLength * 0.46;
    const x2 = centerX + Math.cos(angle) * beamLength;
    const y2 = centerY + Math.sin(angle) * beamLength * 0.46;
    const beam = context.createLinearGradient(x1, y1, x2, y2);

    beam.addColorStop(0, "rgba(138, 43, 226, 0)");
    beam.addColorStop(0.46, "rgba(176, 38, 255, 0.02)");
    beam.addColorStop(0.5, i % 3 === 0 ? "rgba(255, 46, 209, 0.28)" : "rgba(176, 38, 255, 0.23)");
    beam.addColorStop(0.54, "rgba(244, 232, 255, 0.03)");
    beam.addColorStop(1, "rgba(138, 43, 226, 0)");

    context.globalAlpha = reveal * (0.75 - i * 0.055);
    context.strokeStyle = beam;
    context.lineWidth = i % 3 === 0 ? 2.2 : 1.1;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
  }

  context.globalAlpha = reveal * 0.55;
  context.strokeStyle = "#F4E8FF";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(centerX, centerY - Math.min(height * 0.2, 130));
  context.lineTo(centerX, centerY + Math.min(height * 0.2, 130));
  context.stroke();
  context.restore();
}

function drawScanner(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  timestamp: number
) {
  const reveal = smoothstep(360, 1050, elapsed) * (1 - smoothstep(2200, 3100, elapsed));

  if (reveal <= 0.01) {
    return;
  }

  const y = height * 0.47 + Math.sin(timestamp * 0.002) * height * 0.12;
  const line = context.createLinearGradient(0, y, width, y);

  line.addColorStop(0, "rgba(138, 43, 226, 0)");
  line.addColorStop(0.42, "rgba(176, 38, 255, 0.35)");
  line.addColorStop(0.5, "rgba(244, 232, 255, 0.48)");
  line.addColorStop(0.58, "rgba(255, 46, 209, 0.3)");
  line.addColorStop(1, "rgba(138, 43, 226, 0)");

  context.save();
  context.globalCompositeOperation = "lighter";
  context.globalAlpha = reveal;
  context.fillStyle = line;
  context.fillRect(0, y - 1, width, 2);
  context.fillStyle = "rgba(176, 38, 255, 0.055)";
  context.fillRect(0, y - 32, width, 64);
  context.restore();
}

function drawEnergyRing(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  timestamp: number,
  settled: boolean
) {
  const centerX = width / 2;
  const centerY = height * 0.47;
  const radiusX = Math.min(width * 0.31, 430);
  const radiusY = Math.min(height * 0.15, 150);
  const reveal = settled ? 1 : smoothstep(1250, 2900, elapsed);
  const time = timestamp * 0.001;

  if (reveal <= 0.01) {
    return;
  }

  context.save();
  context.globalCompositeOperation = "lighter";
  context.lineWidth = 1.2;

  for (let i = 0; i < 3; i += 1) {
    const start = time * (0.28 + i * 0.1) + i * 1.7;
    const end = start + Math.PI * (0.36 + i * 0.08);

    context.globalAlpha = reveal * (0.18 - i * 0.035);
    context.strokeStyle = i === 1 ? "#FF2ED1" : "#B026FF";
    context.beginPath();
    context.ellipse(centerX, centerY, radiusX + i * 18, radiusY + i * 9, 0, start, end);
    context.stroke();
  }

  context.globalAlpha = reveal * 0.18;
  context.strokeStyle = "#8A2BE2";
  context.setLineDash([8, 18]);
  context.beginPath();
  context.ellipse(centerX, centerY, radiusX * 0.82, radiusY * 0.82, 0, 0, Math.PI * 2);
  context.stroke();
  context.setLineDash([]);

  context.globalAlpha = reveal * 0.12;
  context.strokeStyle = "#F4E8FF";
  context.lineWidth = 0.8;
  context.beginPath();
  context.ellipse(centerX, centerY, radiusX * 0.58, radiusY * 0.58, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawShockwave(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number
) {
  const progress = clamp((elapsed - SHOCKWAVE_AT) / 700);

  if (progress <= 0 || progress >= 1) {
    return;
  }

  const centerX = width / 2;
  const centerY = height * 0.47;
  const alpha = 1 - progress;
  const eased = easeOutCubic(progress);

  context.save();
  context.globalCompositeOperation = "lighter";
  context.strokeStyle = `rgba(255, 46, 209, ${0.46 * alpha})`;
  context.lineWidth = 1.8 + alpha * 4;
  context.shadowColor = "#FF2ED1";
  context.shadowBlur = 26;
  context.beginPath();
  context.arc(centerX, centerY, eased * Math.min(width, height) * 0.5, 0, Math.PI * 2);
  context.stroke();

  context.shadowBlur = 0;
  context.globalAlpha = alpha * 0.18;
  context.fillStyle = "#F4E8FF";
  context.fillRect(0, centerY - 1, width, 2);
  context.restore();
}

function updateAndDrawParticles(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  elapsed: number,
  timestamp: number,
  delta: number,
  settled: boolean
) {
  const step = Math.min(delta / 16.67, 2);
  const centerX = width / 2;
  const centerY = height * 0.47;
  const radiusX = Math.min(width * 0.31, 430);
  const radiusY = Math.min(height * 0.15, 150);
  const gather = settled ? 1 : smoothstep(760, 2820, elapsed);
  const seconds = timestamp * 0.001;

  context.save();
  context.globalCompositeOperation = "lighter";

  for (const particle of particles) {
    if (particle.kind === "star") {
      particle.x += particle.vx * step;
      particle.y += particle.vy * step;

      if (particle.y > height + 12) {
        particle.y = -12;
        particle.x = Math.random() * width;
      }

      context.globalAlpha =
        particle.alpha * (0.65 + Math.sin(seconds + particle.phase) * 0.22);
      context.fillStyle = particle.color;
      context.fillRect(particle.x, particle.y, particle.size, particle.size);
      continue;
    }

    if (particle.kind === "shard") {
      if (settled) {
        particle.angle += particle.speed * step;
      }

      const launch = smoothstep(360, 2380, elapsed);
      const easedLaunch = easeOutCubic(launch);
      const targetX =
        centerX +
        Math.cos(particle.angle + seconds * 0.12) *
          (radiusX * (1.03 + Math.sin(particle.phase) * 0.16));
      const targetY =
        centerY +
        Math.sin(particle.angle + seconds * 0.12) *
          (radiusY * (1.04 + Math.cos(particle.phase) * 0.16));

      particle.x = lerp(particle.startX, targetX, easedLaunch);
      particle.y = lerp(particle.startY, targetY, easedLaunch);
      particle.alpha = lerp(particle.alpha, settled ? 0.36 : 0.64, 0.045 * step);

      const dx = Math.cos(particle.angle + seconds * 0.12);
      const dy = Math.sin(particle.angle + seconds * 0.12) * 0.5;
      const shardGradient = context.createLinearGradient(
        particle.x - dx * particle.length,
        particle.y - dy * particle.length,
        particle.x + dx * particle.length,
        particle.y + dy * particle.length
      );

      shardGradient.addColorStop(0, `${particle.color}00`);
      shardGradient.addColorStop(0.5, particle.color);
      shardGradient.addColorStop(1, `${particle.color}00`);
      context.globalAlpha = particle.alpha * (0.5 + launch * 0.5);
      context.strokeStyle = shardGradient;
      context.lineWidth = width < 640 ? 1.4 : 1.9;
      context.beginPath();
      context.moveTo(particle.x - dx * particle.length, particle.y - dy * particle.length);
      context.lineTo(particle.x + dx * particle.length, particle.y + dy * particle.length);
      context.stroke();
      continue;
    }

    if (settled) {
      particle.angle += particle.speed * step;
    }

    const drift =
      Math.sin(seconds * 1.35 + particle.phase) * (settled ? 4 : 60 * (1 - gather));
    const targetX = centerX + Math.cos(particle.angle) * (radiusX + drift);
    const targetY = centerY + Math.sin(particle.angle) * (radiusY + drift * 0.18);
    const previousX = particle.x;
    const previousY = particle.y;

    particle.x = lerp(particle.x, targetX, 0.025 + gather * 0.075);
    particle.y = lerp(particle.y, targetY, 0.025 + gather * 0.075);
    particle.alpha = lerp(particle.alpha, 0.44 + gather * 0.26, 0.035 * step);

    if (gather > 0.2) {
      context.globalAlpha = particle.alpha * 0.12;
      context.strokeStyle = particle.color;
      context.lineWidth = 0.65;
      context.beginPath();
      context.moveTo(previousX, previousY);
      context.lineTo(particle.x, particle.y);
      context.stroke();
    }

    context.globalAlpha = particle.alpha;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function renderScene(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  width: number,
  height: number,
  elapsed: number,
  timestamp: number,
  delta: number,
  settled: boolean
) {
  drawBackground(context, width, height, settled);
  drawLaunchBeams(context, width, height, elapsed, timestamp, settled);
  drawScanner(context, width, height, elapsed, timestamp);
  updateAndDrawParticles(context, particles, width, height, elapsed, timestamp, delta, settled);
  drawEnergyRing(context, width, height, elapsed, timestamp, settled);
  drawShockwave(context, width, height, elapsed);
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

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let particles: Particle[] = [];
    let previousTimestamp = performance.now();
    const startTimestamp = performance.now();

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = getCanvasPixelRatio(bounds.width);

      width = Math.max(320, Math.floor(bounds.width));
      height = Math.max(520, Math.floor(bounds.height));
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.imageSmoothingEnabled = true;
      particles = createParticles(width, height);
    };

    const observer =
      "ResizeObserver" in window ? new ResizeObserver(resize) : null;

    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    resize();

    if (reducedMotion) {
      renderScene(context, particles, width, height, INTRO_DURATION, 0, 16.67, true);
      finishIntro();

      return () => {
        observer?.disconnect();
        window.removeEventListener("resize", resize);
      };
    }

    const animate = (timestamp: number) => {
      const rawElapsed = timestamp - startTimestamp;
      const elapsed = completedRef.current
        ? INTRO_DURATION
        : Math.min(rawElapsed, INTRO_DURATION);
      const delta = timestamp - previousTimestamp;
      const settled = completedRef.current || rawElapsed >= INTRO_DURATION;

      previousTimestamp = timestamp;

      if (rawElapsed >= INTRO_DURATION) {
        finishIntro();
      }

      renderScene(context, particles, width, height, elapsed, timestamp, delta, settled);
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

      <div className="intro__gate" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="intro__depth-map" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="intro__monolith" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="intro__hud intro__hud--left" aria-hidden="true">
        <span>INIT 01</span>
        <strong>Computer Science</strong>
      </div>

      <div className="intro__hud intro__hud--right" aria-hidden="true">
        <span>STACK</span>
        <strong>C/C++ . Java . Web</strong>
      </div>

      <div className="intro__brand" data-text={BRAND} aria-hidden="true">
        {Array.from(BRAND).map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            style={{ "--letter-index": index } as CSSProperties}
          >
            {letter}
          </span>
        ))}
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
