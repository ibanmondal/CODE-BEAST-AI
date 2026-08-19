"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ViewportParticleBlast } from "@/components/ViewportParticleBlast";
import { Flame, Sparkles } from "lucide-react";

export function InteractiveBeastSphere3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [hintText, setHintText] = useState("CLICK 3D CORE TO DETONATE ENGINE");

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mesh References
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const solidSphereMeshRef = useRef<THREE.Mesh | null>(null);
  const nodesMeshRef = useRef<THREE.Points | null>(null);
  const linesMeshRef = useRef<THREE.LineSegments | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);

  // Mouse Tracking
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 550;

    // 1. Scene & Camera Setup with Wide Field of View
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 420;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.domElement.style.background = "transparent";
    renderer.domElement.style.backgroundColor = "transparent";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "auto";
    renderer.domElement.style.transition = "opacity 0.3s ease";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Root 3D Centered Group (Shifted UP)
    const mainGroup = new THREE.Group();
    mainGroup.position.y = 25; // Shift sphere UP
    mainGroupRef.current = mainGroup;
    scene.add(mainGroup);

    // -------------------------------------------------------------
    // A. RICH 3D GEODESIC NEURAL SPHERE & INNER METALLIC CORE
    // -------------------------------------------------------------
    const sphereRadius = 90;

    // Inner Dark Metallic Obsidian Core
    const innerGeo = new THREE.SphereGeometry(sphereRadius * 0.75, 48, 48);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x140703,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x551c05,
      emissiveIntensity: 0.6
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 380 Geodesic Points / Nodes Distribution
    const nodeCount = 380;
    const nodes: THREE.Vector3[] = [];
    const phi = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / phi;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      nodes.push(new THREE.Vector3(x * sphereRadius, y * sphereRadius, z * sphereRadius));
    }

    // Nodes Mesh Points
    const nodesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    const orangeColor = new THREE.Color("#FF8C42");
    const copperColor = new THREE.Color("#E07A48");
    const brightColor = new THREE.Color("#D4BC9A");

    nodes.forEach((n, i) => {
      positions[i * 3] = n.x;
      positions[i * 3 + 1] = n.y;
      positions[i * 3 + 2] = n.z;

      const c = i % 3 === 0 ? orangeColor : i % 3 === 1 ? copperColor : brightColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });

    nodesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const nodesMat = new THREE.PointsMaterial({
      size: 4.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    const nodesMesh = new THREE.Points(nodesGeo, nodesMat);
    mainGroup.add(nodesMesh);
    nodesMeshRef.current = nodesMesh;

    // Geodesic Connection Lines
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const threshold = 34;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < threshold) {
          linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);

          lineColors.push(orangeColor.r, orangeColor.g, orangeColor.b);
          lineColors.push(copperColor.r, copperColor.g, copperColor.b);
        }
      }
    }

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeo.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));

    const linesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(linesGeo, linesMat);
    mainGroup.add(linesMesh);
    linesMeshRef.current = linesMesh;

    // -------------------------------------------------------------
    // B. 2 ELEGANT SHINY 3D METALLIC ORBITAL RINGS (Zero White Rings)
    // -------------------------------------------------------------
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xe07a48,
      roughness: 0.12,
      metalness: 0.95,
      emissive: 0xff8c42,
      emissiveIntensity: 0.45
    });

    // Ring 1 (Inclined 35°, Radius 120)
    const ring1Geo = new THREE.TorusGeometry(120, 2.4, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geo, ringMat);
    ring1.rotation.x = Math.PI / 4;
    ring1.rotation.y = Math.PI / 6;
    mainGroup.add(ring1);
    ring1Ref.current = ring1;

    // Ring 2 (Inclined -30°, Radius 142)
    const ring2Geo = new THREE.TorusGeometry(142, 2.0, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geo, ringMat);
    ring2.rotation.x = -Math.PI / 5;
    ring2.rotation.z = Math.PI / 35;
    mainGroup.add(ring2);
    ring2Ref.current = ring2;

    // -------------------------------------------------------------
    // C. LIGHTING & MOUSE MOTION
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const orangeLight = new THREE.PointLight(0xff8c42, 4, 450);
    orangeLight.position.set(120, 150, 200);
    scene.add(orangeLight);

    const rimLight = new THREE.PointLight(0xe07a48, 3, 400);
    rimLight.position.set(-150, -100, -100);
    scene.add(rimLight);

    // Mouse Tracking Handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / width - 0.5) * 0.6;
      mouseRef.current.y = ((e.clientY - rect.top) / height - 0.5) * 0.6;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 60 FPS Render Loop with Viewport Optimization
    let clock = new THREE.Clock();
    let animId: number | null = null;
    let isVisibleInViewport = true;
    let isDisposed = false;

    const animate = () => {
      if (isDisposed) return;
      if (!isVisibleInViewport) {
        animId = null;
        return;
      }
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Lerp mouse target
      mouseRef.current.targetX += (mouseRef.current.x - mouseRef.current.targetX) * 0.05;
      mouseRef.current.targetY += (mouseRef.current.y - mouseRef.current.targetY) * 0.05;

      if (mainGroupRef.current) {
        mainGroupRef.current.rotation.y = elapsed * 0.18 + mouseRef.current.targetX;
        mainGroupRef.current.rotation.x = Math.sin(elapsed * 0.6) * 0.06 + mouseRef.current.targetY;
      }

      // Rotate 3D Orbital Rings at Different Speeds
      if (ring1Ref.current) ring1Ref.current.rotation.z = elapsed * 0.35;
      if (ring2Ref.current) ring2Ref.current.rotation.x = elapsed * -0.28;

      // Gentle Breathing Pulse
      const pulse = 1 + Math.sin(elapsed * 1.8) * 0.025;
      if (nodesMeshRef.current && linesMeshRef.current) {
        nodesMeshRef.current.scale.set(pulse, pulse, pulse);
        linesMeshRef.current.scale.set(pulse, pulse, pulse);
      }

      renderer.render(scene, camera);
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      canvasElem.style.opacity = "0";
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
      setTimeout(() => {
        try {
          const gl = renderer.getContext();
          const loseCtx = gl?.getExtension("WEBGL_lose_context");
          if (loseCtx) loseCtx.restoreContext();
        } catch {
          // ignore error
        }
      }, 200);
    };

    const handleContextRestored = () => {
      canvasElem.style.opacity = "1";
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.setClearColor(0x000000, 0);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      if (!animId) animate();
    };

    const canvasElem = renderer.domElement;
    canvasElem.addEventListener("webglcontextlost", handleContextLost, false);
    canvasElem.addEventListener("webglcontextrestored", handleContextRestored, false);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisibleInViewport = entry.isIntersecting;
      if (isVisibleInViewport && !animId) {
        animate();
      }
    }, { threshold: 0.01 });

    intersectionObserver.observe(container);
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      intersectionObserver.disconnect();
      canvasElem.removeEventListener("webglcontextlost", handleContextLost);
      canvasElem.removeEventListener("webglcontextrestored", handleContextRestored);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      innerGeo.dispose();
      innerMat.dispose();
      nodesGeo.dispose();
      nodesMat.dispose();
      linesGeo.dispose();
      linesMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ringMat.dispose();
      renderer.dispose();
    };
  }, []);

  // -------------------------------------------------------------
  // Full Viewport Particle Explosion Click Sequence
  // -------------------------------------------------------------
  const handleClick = () => {
    if (isCharging || isExploding) return;

    // Stage 1: Energy Compression & Ring Acceleration (300ms)
    setIsCharging(true);
    setHintText("ENERGY CHARGING...");

    setTimeout(() => {
      // Stage 2: Detonate Full Viewport Particle Blast Across Entire Screen
      setIsCharging(false);
      setIsExploding(true);
      setHintText("FULL VIEWPORT DETONATION!");

      if (mainGroupRef.current) mainGroupRef.current.visible = false;

    }, 350);
  };

  const handleBlastComplete = () => {
    setIsExploding(false);
    if (mainGroupRef.current) {
      mainGroupRef.current.visible = true;
      // Smooth scale-in transition from 0.8 to 1.0 to eliminate sudden flash
      mainGroupRef.current.scale.set(0.8, 0.8, 0.8);
      let step = 0.8;
      const fadeIn = setInterval(() => {
        step += 0.04;
        if (mainGroupRef.current) {
          mainGroupRef.current.scale.set(step, step, step);
        }
        if (step >= 1.0) {
          if (mainGroupRef.current) mainGroupRef.current.scale.set(1, 1, 1);
          clearInterval(fadeIn);
        }
      }, 16);
    }
    setHintText("CLICK 3D CORE TO DETONATE ENGINE");
  };

  return (
    <>
      {/* 100% Full-Viewport ViewportParticleBlast Component */}
      <ViewportParticleBlast active={isExploding} onComplete={handleBlastComplete} />

      <div className="relative flex flex-col items-center justify-center w-full max-w-[550px] mx-auto select-none">
        
        {/* 3D WebGL Canvas Container with Zero Clipping */}
        <div 
          ref={containerRef} 
          onClick={handleClick}
          className="w-full h-[480px] sm:h-[520px] cursor-pointer relative group flex items-center justify-center overflow-visible"
        >
          {/* Soft Organic Radial Light Halo */}
          <div className="absolute w-[360px] h-[360px] rounded-full bg-radial from-[#E07A48]/25 via-[#1A0B05]/30 to-transparent blur-3xl group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
        </div>

        {/* Action Button Badge */}
        <div 
          onClick={handleClick}
          className="beast-3d-button mt-2 flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1F0F08]/90 border border-[#E07A48]/50 hover:border-[#FF8C42] text-[#D4BC9A] text-xs font-mono font-bold tracking-wider uppercase cursor-pointer shadow-[0_10px_25px_rgba(0,0,0,0.8)] transition-all hover:scale-[1.03] group z-20 overflow-hidden before:absolute before:inset-0 before:-translate-x-full hover:before:animate-btn-light-sweep before:bg-gradient-to-r before:from-transparent before:via-[#FF8C42]/30 before:to-transparent"
        >
          <Flame className="w-4 h-4 text-[#FF8C42] animate-pulse group-hover:scale-110 transition-transform" />
          <span className="bg-gradient-to-r from-[#FF8C42] to-[#E07A48] bg-clip-text text-transparent">
            {hintText}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-amber-200/50 group-hover:rotate-180 transition-transform duration-500" />
        </div>

      </div>
    </>
  );
}
