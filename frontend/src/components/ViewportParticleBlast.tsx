"use client";

import React, { useEffect, useRef } from "react";

interface ViewportParticleBlastProps {
  active: boolean;
  onComplete?: () => void;
}

export function ViewportParticleBlast({ active, onComplete }: ViewportParticleBlastProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Center origin of blast (Right Hero Area)
    const centerX = width * 0.72;
    const centerY = height * 0.46;

    // 2,000 High-Definition Full-Viewport Sparkles (Strictly Clamped Radius)
    const particleCount = 2000;
    const particles = Array.from({ length: particleCount }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 26 + 6; // Exact spreading velocity preserved
      const zSpeed = (Math.random() - 0.5) * 6; // Controlled Z velocity
      const radius = Math.random() * 2.5 + 0.8;

      return {
        x: centerX,
        y: centerY,
        z: (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: zSpeed,
        radius,
        alpha: 0.95,
        color: Math.random() > 0.4 ? "#FF8C42" : Math.random() > 0.3 ? "#D4BC9A" : "#E07A48"
      };
    });

    let frame = 0;
    const maxFrames = 160; // ~2.6 seconds total sequence

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const isReassembling = frame > 80;

      particles.forEach((p) => {
        if (!isReassembling) {
          // Outward 3D Blast to Full Viewport Edges
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.vx *= 0.965;
          p.vy *= 0.965;
        } else {
          // Inward Gravity Re-assembly with clean alpha fade out
          p.x += (centerX - p.x) * 0.1;
          p.y += (centerY - p.y) * 0.1;
          p.alpha = Math.max(0, p.alpha - 0.025);
        }

        // Strictly Clamped 3D Perspective (Max 2.0x scale, Max 6px radius)
        const safeZ = Math.max(-200, Math.min(200, p.z));
        const perspective = Math.min(2.0, Math.max(0.4, 450 / (450 + safeZ)));
        const r = Math.min(6.0, Math.max(0.5, p.radius * perspective));

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.75;
        ctx.shadowColor = "#FF8C42";
        ctx.shadowBlur = 3; // Subtle soft sparkle blur
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      if (frame < maxFrames) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        if (onComplete) onComplete();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
    />
  );
}
