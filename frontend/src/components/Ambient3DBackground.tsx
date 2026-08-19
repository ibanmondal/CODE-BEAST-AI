"use client";
import React, { useEffect, useRef } from "react";

export function Ambient3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    mouseRef.current.x = width * 0.65;
    mouseRef.current.y = height * 0.35;
    mouseRef.current.targetX = width * 0.65;
    mouseRef.current.targetY = height * 0.35;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Floating ambient gold/copper dust particle pool (Reduced by 45% for clean negative space)
    const particleCount = Math.min(32, Math.floor(width / 55));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.6,
      speedX: (Math.random() - 0.5) * 0.22,
      speedY: (Math.random() - 0.5) * 0.22 - 0.05,
      alpha: Math.random() * 0.25 + 0.1,
      maxAlpha: Math.random() * 0.38 + 0.15,
      alphaSpeed: Math.random() * 0.004 + 0.001,
      growing: Math.random() > 0.5,
      color: Math.random() > 0.3 ? "230, 110, 40" : "255, 150, 70",
    }));

    let breathTimer = 0;

    const render = () => {
      breathTimer += 0.018;
      const breathScale = 1 + Math.sin(breathTimer) * 0.1;

      // Smooth cursor parallax interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;

      ctx.clearRect(0, 0, width, height);

      // Deep espresso base background fill
      ctx.fillStyle = "#0D0704";
      ctx.fillRect(0, 0, width, height);

      // 1. Massive Upper-Right Warm Copper Light Cloud (Rich & Vivid Match to Lovable Screenshot)
      const lightX = width * 0.60 + (mouseRef.current.x - width / 2) * 0.08;
      const lightY = height * 0.30 + (mouseRef.current.y - height / 2) * 0.08;
      const lightRadius = Math.max(width * 0.65, 750) * breathScale;

      const upperGlow = ctx.createRadialGradient(
        lightX,
        lightY,
        30,
        lightX,
        lightY,
        lightRadius
      );
      upperGlow.addColorStop(0, "rgba(224, 110, 45, 0.62)");
      upperGlow.addColorStop(0.3, "rgba(195, 85, 30, 0.40)");
      upperGlow.addColorStop(0.65, "rgba(120, 45, 15, 0.18)");
      upperGlow.addColorStop(1, "rgba(13, 7, 4, 0)");

      ctx.fillStyle = upperGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Secondary Warm Orange Atmosphere Glow (Left Center)
      const leftGlow = ctx.createRadialGradient(
        width * 0.2,
        height * 0.45,
        20,
        width * 0.2,
        height * 0.45,
        550
      );
      leftGlow.addColorStop(0, "rgba(215, 95, 35, 0.25)");
      leftGlow.addColorStop(0.6, "rgba(140, 50, 18, 0.08)");
      leftGlow.addColorStop(1, "rgba(13, 7, 4, 0)");

      ctx.fillStyle = leftGlow;
      ctx.fillRect(0, 0, width, height);

      // 3. Lower-Right Atmospheric Warm Glow
      const lowerGlow = ctx.createRadialGradient(
        width * 0.75,
        height * 0.8,
        20,
        width * 0.75,
        height * 0.8,
        500
      );
      lowerGlow.addColorStop(0, "rgba(200, 85, 30, 0.22)");
      lowerGlow.addColorStop(1, "rgba(13, 7, 4, 0)");

      ctx.fillStyle = lowerGlow;
      ctx.fillRect(0, 0, width, height);

      // 4. Render Floating Fine Copper/Gold Dust Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.growing) {
          p.alpha += p.alphaSpeed;
          if (p.alpha >= p.maxAlpha) p.growing = false;
        } else {
          p.alpha -= p.alphaSpeed;
          if (p.alpha <= 0.08) p.growing = true;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
}
