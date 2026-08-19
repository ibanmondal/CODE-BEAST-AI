"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EvilEye } from "@/components/ui/EvilEye";
import { useBeastIntroAudio } from "@/hooks/useBeastIntroAudio";

interface BeastIntroOverlayProps {
  onStartDissolve?: () => void;
  onComplete?: () => void;
  forceRun?: boolean;
}

export function BeastIntroOverlay({
  onStartDissolve,
  onComplete,
  forceRun = false,
}: BeastIntroOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [eyeProps, setEyeProps] = useState({
    intensity: 0.0,
    glowIntensity: 0.0,
    scale: 0.75,
    flameSpeed: 0.6,
    opacity: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio engine — synchronized with the visual timeline
  const { startIntroAudio, cleanup: cleanupAudio } = useBeastIntroAudio();

  // -------------------------------------------------------------
  // Master Continuous 5-Stage Orchestration Timeline (~8.2s Total)
  // -------------------------------------------------------------
  useEffect(() => {
    setIsVisible(true);
    setStage(1);
    setEyeProps({
      intensity: 0.0,
      glowIntensity: 0.0,
      scale: 0.75,
      flameSpeed: 0.6,
      opacity: 0,
    });

    // Stage 1 -> Stage 2: Pure Black hold (1.2s), then Full Fiery Eye Awakens
    const t1 = setTimeout(() => {
      setStage(2);
      setEyeProps({
        intensity: 1.1,
        glowIntensity: 0.25,
        scale: 0.82,
        flameSpeed: 0.9,
        opacity: 1,
      });
    }, 1200);

    // Stage 2 -> Stage 3: Full Flame Tendrils & Corona Reach Full Peak (3.2s)
    const t2 = setTimeout(() => {
      setStage(3);
      setEyeProps({
        intensity: 1.5,
        glowIntensity: 0.38,
        scale: 0.85,
        flameSpeed: 1.0,
        opacity: 1,
      });
    }, 3200);

    // Stage 3 -> Stage 4: Fiery Corona & Embers Buildup (4.8s)
    const t3 = setTimeout(() => {
      setStage(4);
      setEyeProps({
        intensity: 1.6,
        glowIntensity: 0.42,
        scale: 0.88,
        flameSpeed: 1.1,
        opacity: 1,
      });
    }, 4800);

    // Stage 4 -> Stage 5: CODEBEAST Website Typography Title Reveal (6.0s)
    const t4 = setTimeout(() => {
      setStage(5);
    }, 6000);

    // Stage 5 -> Seamless Crossfade: Trigger Dashboard Fade-In (6.6s)
    const t5 = setTimeout(() => {
      if (onStartDissolve) onStartDissolve();
      setIsVisible(false);
    }, 6600);

    // Stage 5 -> Complete & Unmount Overlay (8.2s)
    const t6 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 8200);

    // Launch the cinematic audio — browser autoplay gracefully handled inside the hook
    startIntroAudio();

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      cleanupAudio();
    };
  }, [forceRun]);

  // -------------------------------------------------------------
  // Stage 4-5 Sparse Floating Dark Copper Embers
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isVisible || stage < 3) return;
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

    const emberCount = 30;
    const embers = Array.from({ length: emberCount }).map(() => ({
      x: width * 0.5 + (Math.random() - 0.5) * (width * 0.6),
      y: height * 0.55 + Math.random() * (height * 0.3),
      r: Math.random() * 2.0 + 0.6,
      alpha: Math.random() * 0.5 + 0.15,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -Math.random() * 1.3 - 0.5,
      life: Math.random() * 120,
      color: Math.random() > 0.5 ? "#FF8C42" : "#E07A48",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      embers.forEach((e) => {
        e.x += e.vx + Math.sin(e.life * 0.04) * 0.3;
        e.y += e.vy;
        e.life += 1;

        if (e.y < -10 || e.life > 160) {
          e.x = width * 0.5 + (Math.random() - 0.5) * (width * 0.6);
          e.y = height * 0.65 + Math.random() * 60;
          e.life = 0;
        }

        const fadeAlpha = Math.sin((e.life / 160) * Math.PI) * e.alpha;

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.globalAlpha = Math.max(0, fadeAlpha);
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
  }, [isVisible, stage]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{
          opacity: 0,
          scale: 1.025,
          filter: "blur(2px)",
          transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
        }}
        className="fixed inset-0 z-[10000] bg-[#000000] select-none overflow-hidden flex flex-col items-center justify-center pointer-events-auto"
      >
        {/* Stage 1: Pure Black Screen & Very Subtle Dark Atmosphere */}
        <div className="absolute inset-0 bg-[#000000] pointer-events-none">
          <div
            className="absolute inset-0 transition-opacity duration-1500"
            style={{
              opacity: stage >= 2 ? 0.3 : 0,
              background:
                "radial-gradient(circle at 50% 45%, rgba(255, 140, 66, 0.15) 0%, rgba(13, 7, 4, 0.05) 55%, transparent 85%)",
            }}
          />
        </div>

        {/* Floating Embers Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* Stage 2-5: Centered Full Flame Tendril <EvilEye /> WebGL Container */}
        <motion.div
          className="relative w-full max-w-[1100px] h-[65vh] max-h-[680px] flex items-center justify-center z-20 pointer-events-none px-4"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{
            opacity: eyeProps.opacity,
            scale: eyeProps.scale,
          }}
          transition={{ duration: 2.0, ease: [0.2, 0, 0.2, 1] }}
        >
          <EvilEye
            eyeColor="#FF8C42"
            intensity={eyeProps.intensity}
            pupilSize={0.6}
            irisWidth={0.25}
            glowIntensity={eyeProps.glowIntensity}
            scale={0.85}
            noiseScale={1.0}
            pupilFollow={1.0}
            flameSpeed={eyeProps.flameSpeed}
            backgroundColor="#000000"
          />
        </motion.div>

        {/* Stage 4-5: CODEBEAST Website Typography Title Reveal */}
        {stage >= 4 && (
          <div className="absolute bottom-[12%] z-30 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.94 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Website font-display typography */}
              <h1
                className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-normal tracking-tight uppercase relative z-10 text-[#D4BC9A]"
                style={{
                  letterSpacing: "0.06em",
                  textShadow:
                    "0 4px 30px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 140, 66, 0.5)",
                }}
              >
                CODEBEAST
              </h1>

              {/* Subtitle Badge matching website style */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: stage === 5 ? 1 : 0.7 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="mt-2 flex items-center justify-center gap-3"
              >
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#FF8C42]/60 to-transparent" />
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] uppercase text-[#D4BC9A]/90 bg-[#140804]/90 px-4 py-1 rounded-full border border-[#E07A48]/35 shadow-md">
                  MULTI-AGENT REPOSITORY INTELLIGENCE
                </span>
                <span className="h-px w-12 bg-gradient-to-r from-transparent via-[#FF8C42]/60 to-transparent" />
              </motion.div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default BeastIntroOverlay;
