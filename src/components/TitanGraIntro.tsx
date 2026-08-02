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
  if (points.length < 2) {
    return;
  }

  context.beginPath();
  context.moveTo(points[0].x, points[0].y);

  for (let index = 1; index < points.length - 1; index += 1) {
    const midpointX = (points[index].x + points[index + 1].x) * 0.5;
    const midpointY = (points[index].y + points[index + 1].y) * 0.5;
    context.quadraticCurveTo(points[index].x, points[index].y, midpointX, midpointY);
  }

  const lastPoint = points[points.length - 1];
  context.lineTo(lastPoint.x, lastPoint.y);
}

function createDust(): DustParticle[] {
  return Array.from({ length: 34 }, (_, index) => ({
    x: ((index * 47) % 101) / 100,
    y: ((index * 67 + 13) % 103) / 102,
    size: 0.65 + (index % 5) * 0.26,
    speed: 0.00008 + (index % 7) * 0.000015,
    phase: index * 0.71
  }));
}

function FluidCanvas({ hostRef }: { hostRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;

    if (!canvas || !host) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dust = createDust();
    let reducedMotion = motionPreference.matches;
    let width = 1;
    let height = 1;
    let pixelRatio = 1;
    let animationFrame = 0;
    let isVisible = true;
    let lastTime = 0;

    const pointer = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0
    };

    const resize = () => {
      const bounds = host.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, width < 720 ? 1.35 : 1.6);
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
      const pointCount = width < 680 ? 7 : 10;

      for (let index = 0; index < pointCount; index += 1) {
        const progress = index / (pointCount - 1);
        const envelope = Math.sin(progress * Math.PI);
        const wave =
          Math.sin(time * 0.00034 + progress * 5.4 + phase) * amplitude +
          Math.cos(time * 0.00019 - progress * 8.2 + phase * 0.7) * amplitude * 0.34;

        points.push({
          x: progress * width + pointer.currentX * width * 0.018 * envelope,
          y:
            height * (baseY + wave) +
            pointer.currentY * height * 0.055 * envelope +
            pointer.currentX * height * 0.012 * Math.cos(progress * Math.PI * 2)
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
      context.filter = `blur(${width < 680 ? 28 : 44}px)`;
      context.globalAlpha = 0.62;
      context.lineWidth = thickness;
      context.strokeStyle = gradient;
      traceCurve(context, points);
      context.stroke();

      context.filter = "none";
      context.globalAlpha = 0.34;
      context.lineWidth = 1.2;
      context.strokeStyle = "rgba(211, 190, 255, 0.7)";
      traceCurve(context, points);
      context.stroke();
      context.restore();
    };

    const drawOrbs = (time: number) => {
      const orbs = [
        { x: 0.76, y: 0.25, radius: 0.26, phase: 0.2, strength: 0.28 },
        { x: 0.88, y: 0.66, radius: 0.2, phase: 2.1, strength: 0.2 },
        { x: 0.38, y: 0.78, radius: 0.18, phase: 4.2, strength: 0.14 }
      ];

      context.save();
      context.globalCompositeOperation = "screen";

      orbs.forEach((orb, index) => {
        const x =
          width * (orb.x + Math.sin(time * 0.00021 + orb.phase) * 0.035) +
          pointer.currentX * width * (0.018 + index * 0.006);
        const y =
          height * (orb.y + Math.cos(time * 0.00018 + orb.phase) * 0.045) +
          pointer.currentY * height * (0.022 + index * 0.005);
        const radius = Math.max(width, height) * orb.radius;
        const glow = context.createRadialGradient(x, y, 0, x, y, radius);

        glow.addColorStop(0, `rgba(155, 102, 255, ${orb.strength})`);
        glow.addColorStop(0.34, `rgba(103, 49, 220, ${orb.strength * 0.58})`);
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
        const x = particle.x * width + drift * 18 + pointer.currentX * 4;
        const y = particle.y * height + Math.cos(time * particle.speed * 0.8 + particle.phase) * 12;
        const alpha = 0.08 + (drift + 1) * 0.055;

        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(220, 204, 255, ${alpha})`;
        context.fill();
      });

      context.restore();
    };

    const draw = (timestamp: number) => {
      lastTime = timestamp || lastTime;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      pointer.currentX += (pointer.targetX - pointer.currentX) * 0.045;
      pointer.currentY += (pointer.targetY - pointer.currentY) * 0.045;

      drawOrbs(lastTime);
      drawRibbon(
        lastTime,
        0.3,
        0.055,
        0.4,
        "rgba(84, 35, 184, 0)",
        "rgba(145, 88, 255, 0.72)",
        clamp(width * 0.105, 72, 150)
      );
      drawRibbon(
        lastTime,
        0.59,
        0.075,
        2.6,
        "rgba(66, 25, 150, 0)",
        "rgba(116, 62, 232, 0.6)",
        clamp(width * 0.13, 86, 188)
      );
      drawRibbon(
        lastTime,
        0.82,
        0.042,
        4.4,
        "rgba(61, 24, 128, 0)",
        "rgba(183, 143, 255, 0.32)",
        clamp(width * 0.075, 54, 112)
      );
      drawDust(lastTime);

      if (!reducedMotion && isVisible) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      pointer.targetX = clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * 2 - 1;
      pointer.targetY = clamp((event.clientY - bounds.top) / bounds.height, 0, 1) * 2 - 1;
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
      if (reducedMotion) {
        draw(lastTime || 1000);
      }
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
    host.addEventListener("pointermove", handlePointerMove, { passive: true });
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
        motionPreference.removeEventListener("change", handleMotionPreference);
      } else {
        motionPreference.removeListener(handleMotionPreference);
      }
    };
  }, [hostRef]);

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />;
}

export default function TitanGraIntro() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <section id="home" ref={heroRef} className="hero" aria-labelledby="hero-title">
      <FluidCanvas hostRef={heroRef} />
      <div className="hero__noise" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="status-dot" aria-hidden="true" />
            Computer Science student · Italy
          </p>
          <h1 id="hero-title">
            I turn curiosity into <span>code that works.</span>
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
          <div className="hero__proof" aria-label="Main areas of expertise">
            <span>C / C++</span>
            <span>Java</span>
            <span>Web + Systems</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
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
