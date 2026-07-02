import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { clamp } from "../lib/math";

export interface ConfettiHandle {
  burst: (origin?: { x: number; y: number }) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
}

const colors = ["#c79a53", "#e0a03c", "#79cf8c", "#efe9db", "#b9774e"];

export function Confetti({ ref }: { ref: Ref<ConfettiHandle> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrameRef = useRef(0);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      isAnimatingRef.current = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  function tick(): void {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d") ?? null;
    if (canvas === null || ctx === null) {
      isAnimatingRef.current = false;

      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.current.length - 1; i >= 0; i--) {
      const particle = particles.current[i];
      particle.vy += 0.18;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rot += particle.vr;
      particle.life -= 1;

      if (particle.life <= 0 || particle.y > canvas.height + 40) {
        particles.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rot);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = clamp(particle.life / 40, 0, 1);
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
      ctx.restore();
    }

    if (particles.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(tick);
    } else {
      isAnimatingRef.current = false;
    }
  }

  useImperativeHandle(ref, () => ({
    burst: (origin) => {
      const canvas = canvasRef.current;
      if (canvas === null) {
        return;
      }

      const cx = origin?.x ?? canvas.width / 2;
      const cy = origin?.y ?? canvas.height / 2;
      for (let i = 0; i < 140; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 9;
        particles.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          size: 6 + Math.random() * 7,
          color: colors[(Math.random() * colors.length) | 0],
          life: 60 + Math.random() * 40,
        });
      }

      if (!isAnimatingRef.current) {
        isAnimatingRef.current = true;
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      className={`
        pointer-events-none
        fixed
        inset-0
        z-60
        h-full
        w-full
      `}
    />
  );
}
