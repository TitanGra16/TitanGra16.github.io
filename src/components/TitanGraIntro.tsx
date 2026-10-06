import { useEffect, useRef } from "react";

type Point = {
  x: number;
  y: number;
};

type DustParticle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function traceCurve(context: CanvasRenderingContext2D, points: Point[]) {
  if (points.length < 2) return;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  for (let index = 1; index < points.length - 1; index += 1) {
    const midpointX = (points[index].x + points[index + 1].x) * 0.5;
    const midpointY = (points[index].y + points[index + 1].y) * 0.5;
    context.quadraticCurveTo(
      points[index].x,
      points[index].y,
      midpointX,
      midpointY
    );
  }
  const lastPoint = points[points.length - 1];
  context.lineTo(lastPoint.x, lastPoint.y);
}

function createDust(): DustParticle[] {
  return Array.from({ length: 48 }, (_, index) => ({
    x: ((index * 47) % 101) / 100,
    y: ((index * 67 + 13) % 103) / 102,
    size: 0.5 + (index % 7) * 0.2,
    speed: 0.00007 + (index % 9) * 0.000011,
    phase: index * 0.71,
  }));
}

function FluidCanvas({
  hostRef,
}: {
  hostRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!canvas || !host) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const dust = createDust();
    let reducedMotion = motionPreference.matches;
    let width = 1,
      height = 1,
      pixelRatio = 1;
    let animationFrame = 0;
    let isVisible = true;
    let lastTime = 0;
    let lastFrameTime = 0;
    const FRAME_BUDGET = 1000 / 50;

    const pointer = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        width < 720 ? 1.35 : 1.6
      );
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawRibbon = (
      time: number,
      baseY: number,
      amplitude: number,
      phase: number,
      colorA: string,
      colorB: string,
      thickness: number
    ) => {
      const points: Point[] = [];
      const pointCount = width < 680 ? 7 : 11;

      for (let index = 0; index < pointCount; index += 1) {
        const progress = index / (pointCount - 1);
        const envelope = Math.sin(progress * Math.PI);
        const wave =
          Math.sin(time * 0.00034 + progress * 5.4 + phase) * amplitude +
          Math.cos(time * 0.00019 - progress * 8.2 + phase * 0.7) *
            amplitude *
            0.34;

        points.push({
          x:
            progress * width +
            pointer.currentX * width * 0.018 * envelope,
          y:
            height * (baseY + wave) +
            pointer.currentY * height * 0.055 * envelope +
            pointer.currentX *
              height *
              0.012 *
              Math.cos(progress * Math.PI * 2),
        });
      }

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colorA);
      gradient.addColorStop(0.52, colorB);
      gradient.addColorStop(1, colorA);

      context.save();
      context.globalCompositeOperation = "screen";
      context.lineCap = "round";
      context.lineJoin = "round";
      context.filter = `blur(${width < 680 ? 28 : 46}px)`;
      context.globalAlpha = 0.72;
      context.lineWidth = thickness;
      context.strokeStyle = gradient;
      traceCurve(context, points);
      context.stroke();

      context.filter = "none";
      context.globalAlpha = 0.4;
      context.lineWidth = 1.5;
      context.strokeStyle = "rgba(211, 190, 255, 0.78)";
      traceCurve(context, points);
      context.stroke();
      context.restore();
    };

    const drawOrbs = (time: number) => {
      const orbs = [
        { x: 0.76, y: 0.22, radius: 0.28, phase: 0.2, strength: 0.34 },
        { x: 0.9, y: 0.66, radius: 0.22, phase: 2.1, strength: 0.24 },
        { x: 0.36, y: 0.8, radius: 0.2, phase: 4.2, strength: 0.17 },
        { x: 0.6, y: 0.08, radius: 0.17, phase: 6.0, strength: 0.13 },
      ];

      context.save();
      context.globalCompositeOperation = "screen";

      orbs.forEach((orb, index) => {
        const x =
          width *
            (orb.x + Math.sin(time * 0.00021 + orb.phase) * 0.04) +
          pointer.currentX * width * (0.018 + index * 0.006);
        const y =
          height *
            (orb.y + Math.cos(time * 0.00018 + orb.phase) * 0.05) +
          pointer.currentY * height * (0.022 + index * 0.005);
        const radius = Math.max(width, height) * orb.radius;
        const glow = context.createRadialGradient(x, y, 0, x, y, radius);

        glow.addColorStop(0, `rgba(155, 102, 255, ${orb.strength})`);
        glow.addColorStop(
          0.34,
          `rgba(103, 49, 220, ${orb.strength * 0.55})`
        );
        glow.addColorStop(1, "rgba(61, 24, 128, 0)");
        context.fillStyle = glow;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      });

      context.restore();
    };

    const drawDust = (time: number) => {
      context.save();
      context.globalCompositeOperation = "screen";

      dust.forEach((particle) => {
        const drift = Math.sin(time * particle.speed + particle.phase);
        const x =
          particle.x * width + drift * 20 + pointer.currentX * 5;
        const y =
          particle.y * height +
          Math.cos(time * particle.speed * 0.8 + particle.phase) * 14;
        const alpha = 0.07 + (drift + 1) * 0.056;

        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(220, 204, 255, ${alpha})`;
        context.fill();
      });

      context.restore();
    };

    const draw = (timestamp: number) => {
      if (timestamp - lastFrameTime < FRAME_BUDGET && lastFrameTime > 0) {
        animationFrame = window.requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp;
      lastTime = timestamp || lastTime;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const lerpFactor = clamp(
        0.045 *
          (timestamp - (lastFrameTime - FRAME_BUDGET)) /
          16.67,
        0.01,
        0.12
      );
      pointer.currentX +=
        (pointer.targetX - pointer.currentX) * lerpFactor;
      pointer.currentY +=
        (pointer.targetY - pointer.currentY) * lerpFactor;

      drawOrbs(lastTime);
      // 4 ribbons — layered aurora effect
      drawRibbon(
        lastTime, 0.2, 0.07, 0.4,
        "rgba(84, 35, 184, 0)",
        "rgba(160, 95, 255, 0.88)",
        clamp(width * 0.115, 80, 170)
      );
      drawRibbon(
        lastTime, 0.5, 0.09, 2.6,
        "rgba(66, 25, 150, 0)",
        "rgba(122, 68, 242, 0.74)",
        clamp(width * 0.145, 95, 215)
      );
      drawRibbon(
        lastTime, 0.78, 0.05, 4.4,
        "rgba(61, 24, 128, 0)",
        "rgba(192, 154, 255, 0.42)",
        clamp(width * 0.082, 60, 130)
      );
      drawRibbon(
        lastTime, 0.36, 0.034, 1.8,
        "rgba(120, 60, 220, 0)",
        "rgba(230, 185, 255, 0.26)",
        clamp(width * 0.056, 38, 84)
      );
      drawDust(lastTime);

      if (!reducedMotion && isVisible) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointer.targetX =
        clamp(
          (event.clientX - bounds.left) / bounds.width,
          0,
          1
        ) *
          2 -
        1;
      pointer.targetY =
        clamp(
          (event.clientY - bounds.top) / bounds.height,
          0,
          1
        ) *
          2 -
        1;
    };

    const resetPointer = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    };

    const handleMotionPreference = () => {
      reducedMotion = motionPreference.matches;
      window.cancelAnimationFrame(animationFrame);
      draw(lastTime || 1000);
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(lastTime || 1000);
    });

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (!wasVisible && isVisible && !reducedMotion) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = window.requestAnimationFrame(draw);
        }
      },
      { threshold: 0.02 }
    );

    resize();
    resizeObserver.observe(host);
    visibilityObserver.observe(host);
    host.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    host.addEventListener("pointerleave", resetPointer);

    if (typeof motionPreference.addEventListener === "function") {
      motionPreference.addEventListener("change", handleMotionPreference);
    } else {
      motionPreference.addListener(handleMotionPreference);
    }

    draw(1000);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerleave", resetPointer);

      if (typeof motionPreference.removeEventListener === "function") {
        motionPreference.removeEventListener(
          "change",
          handleMotionPreference
        );
      } else {
        motionPreference.removeListener(handleMotionPreference);
      }
    };
  }, [hostRef]);

  return (
    <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
  );
}

/* ─── Data ─────────────────────────────────────────────────── */

const techBadges = [
  { label: "React",       dot: true,  delay: 0,   duration: 5.4, x: "-13%", y: "18%" },
  { label: "Java",        dot: false, delay: 0.9, duration: 6.6, x: "36%",  y: "-8%" },
  { label: "TypeScript",  dot: false, delay: 1.5, duration: 5.9, x: "84%",  y: "10%" },
  { label: "C / C++",    dot: false, delay: 0.4, duration: 5.0, x: "-15%", y: "70%" },
  { label: "Linux",       dot: false, delay: 1.9, duration: 6.2, x: "80%",  y: "84%" },
];

// Split the headline into animated word-by-word spans
const h1Parts = [
  { text: "I",          delay: 320, gradient: false },
  { text: "turn",       delay: 375, gradient: false },
  { text: "curiosity",  delay: 430, gradient: false },
  { text: "into",       delay: 485, gradient: false },
  // non-breaking spaces keep "code that works." as one animated chunk
  { text: "code\u00a0that\u00a0works.", delay: 545, gradient: true },
];

/* ─── Component ─────────────────────────────────────────────── */

export default function TitanGraIntro() {
  const heroRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  /* 3D parallax tilt on the visual element */
  useEffect(() => {
    const hero = heroRef.current;
    const visual = visualRef.current;
    if (!hero || !visual) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId = 0;
    let targetRX = 0,
      targetRY = 0;
    let currentRX = 0,
      currentRY = 0;

    const handleMove = (e: PointerEvent) => {
      const rect = visual.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetRY = clamp(((e.clientX - cx) / (rect.width / 2)) * 11, -11, 11);
      targetRX = clamp(-((e.clientY - cy) / (rect.height / 2)) * 8, -8, 8);
    };

    const handleLeave = () => {
      targetRX = 0;
      targetRY = 0;
    };

    const tick = () => {
      currentRX += (targetRX - currentRX) * 0.07;
      currentRY += (targetRY - currentRY) * 0.07;
      visual.style.transform = `perspective(900px) rotateX(${currentRX.toFixed(2)}deg) rotateY(${currentRY.toFixed(2)}deg)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    hero.addEventListener("pointermove", handleMove, { passive: true });
    hero.addEventListener("pointerleave", handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      hero.removeEventListener("pointermove", handleMove);
      hero.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="hero"
      aria-labelledby="hero-title"
    >
      <FluidCanvas hostRef={heroRef} />
      <div className="hero__noise" aria-hidden="true" />

      <div className="hero__inner">
        {/* ── Left copy ── */}
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="status-dot" aria-hidden="true" />
            Computer Science student · Italy
          </p>

          <h1 id="hero-title">
            {/* Screen-reader version (hidden visually) */}
            <span className="sr-only">
              I turn curiosity into code that works.
            </span>

            {/* Animated word-split version (hidden from a11y) */}
            <span aria-hidden="true">
              {h1Parts.map(({ text, delay, gradient }) => (
                <span key={text} className="hero__word">
                  <span
                    className={`hero__word-inner${gradient ? " hero__word-inner--gradient" : ""}`}
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    {text}
                  </span>
                </span>
              ))}
            </span>
          </h1>

          <p className="hero__lede">
            I explore software from the inside out—systems, application logic,
            web interfaces, Linux, and networks—then turn what I learn into
            practical projects.
          </p>

          <div className="hero__actions">
            <a className="button button--primary" href="#projects">
              View selected work <span aria-hidden="true">↘</span>
            </a>
            <a
              className="button button--ghost"
              href="https://github.com/TitanGra16"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div
            className="hero__proof"
            aria-label="Main areas of expertise"
          >
            <span>C / C++</span>
            <span>Java</span>
            <span>Web + Systems</span>
          </div>
        </div>

        {/* ── Right visual ── */}
        <div ref={visualRef} className="hero-visual" aria-hidden="true">

          {/* Floating tech-badge chips */}
          {techBadges.map((badge) => (
            <div
              key={badge.label}
              className="hero-badge-wrap"
              style={{
                left: badge.x,
                top: badge.y,
                animationDelay: `${Math.round(820 + badge.delay * 1000)}ms`,
              }}
            >
              <div
                className="hero-badge"
                style={
                  {
                    "--float-duration": `${badge.duration}s`,
                    animationDelay: `${Math.round(badge.delay * 1000)}ms`,
                  } as React.CSSProperties
                }
              >
                {badge.dot && (
                  <span className="hero-badge__dot" aria-hidden="true" />
                )}
                {badge.label}
              </div>
            </div>
          ))}

          <div className="hero-visual__label hero-visual__label--top">
            <span>01</span> Study deeply
          </div>
          <div className="hero-visual__orbit hero-visual__orbit--outer" />
          <div className="hero-visual__orbit hero-visual__orbit--inner" />
          <div className="hero-visual__disc">
            <div className="hero-visual__glare" />
            <img src="/logo.png" alt="" />
          </div>
          <div className="hero-visual__label hero-visual__label--bottom">
            <span>02</span> Build deliberately
          </div>
        </div>
      </div>

      <div className="hero__footer" aria-hidden="true">
        <span>Scroll to explore</span>
        <span className="hero__scroll-line" />
        <span>TitanGra / Portfolio 2026</span>
      </div>
    </section>
  );
}
