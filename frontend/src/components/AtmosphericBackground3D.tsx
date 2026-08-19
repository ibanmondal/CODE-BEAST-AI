"use client";

import React, { useEffect, useRef } from "react";
import { ShaderBackground } from "@/components/ui/waves-background-2";

export function AtmosphericBackground3D() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  useEffect(() => {
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

    window.addEventListener("resize", handleResize, { passive: true });

    // Dynamic Volumetric Light Field & Dust Particles
    const dustCount = 80;
    const dustParticles = Array.from({ length: dustCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.3 - 0.1,
      color: Math.random() > 0.5 ? "#FF8C42" : "#E07A48"
    }));

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Volumetric Organic Radial Halo 1 (Top Center)
      const halo1X = width * 0.5 + Math.sin(time * 0.8) * 40;
      const halo1Y = height * 0.35 + Math.cos(time * 0.5) * 30;
      const halo1 = ctx.createRadialGradient(
        halo1X,
        halo1Y,
        20,
        halo1X,
        halo1Y,
        width * 0.55
      );
      halo1.addColorStop(0, "rgba(224, 122, 72, 0.14)");
      halo1.addColorStop(0.4, "rgba(180, 80, 30, 0.06)");
      halo1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = halo1;
      ctx.fillRect(0, 0, width, height);

      // Volumetric Organic Radial Halo 2 (Bottom Right)
      const halo2X = width * 0.8 + Math.cos(time * 0.6) * 50;
      const halo2Y = height * 0.75 + Math.sin(time * 0.7) * 40;
      const halo2 = ctx.createRadialGradient(
        halo2X,
        halo2Y,
        30,
        halo2X,
        halo2Y,
        width * 0.45
      );
      halo2.addColorStop(0, "rgba(255, 140, 66, 0.10)");
      halo2.addColorStop(0.5, "rgba(217, 107, 39, 0.04)");
      halo2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = halo2;
      ctx.fillRect(0, 0, width, height);

      // Subtle Floating Dust Particles (High Performance Alpha Blending)
      dustParticles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(time * 2 + p.x) * 0.4);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#0D0704] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(224,122,72,0.22),rgba(13,7,4,1))]">
      {/* 1. Deep Interactive WebGL Silk Shader Background */}
      <ShaderBackground className="absolute inset-0 w-full h-full opacity-90" />

      {/* 2. Layered Volumetric Light Field & 3D Ambient Dust Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}

