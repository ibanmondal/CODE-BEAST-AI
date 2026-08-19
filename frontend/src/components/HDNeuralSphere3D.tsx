"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface HDNeuralSphere3DProps {
  className?: string;
  interactive?: boolean;
  onIntroComplete?: () => void;
}

export function HDNeuralSphere3D({ className = "", interactive = true, onIntroComplete }: HDNeuralSphere3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.domElement.style.background = "transparent";
    renderer.domElement.style.backgroundColor = "transparent";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.transition = "opacity 0.3s ease";
    container.appendChild(renderer.domElement);

    // 2. Geodesic Sphere Geometry Construction
    const sphereRadius = 130;
    const nodeCount = 320;
    const nodes: THREE.Vector3[] = [];
    const phi = (1 + Math.sqrt(5)) / 2; // Fibonacci sphere distribution

    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / phi;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      nodes.push(new THREE.Vector3(x * sphereRadius, y * sphereRadius, z * sphereRadius));
    }

    // 3. Node Points Mesh
    const nodesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const colors = new Float32Array(nodeCount * 3);

    const orangeColor = new THREE.Color("#FF8C42");
    const copperColor = new THREE.Color("#E07A48");

    nodes.forEach((node, i) => {
      positions[i * 3] = node.x;
      positions[i * 3 + 1] = node.y;
      positions[i * 3 + 2] = node.z;

      const c = Math.random() > 0.4 ? orangeColor : copperColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });

    nodesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const nodesMaterial = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });

    const nodesMesh = new THREE.Points(nodesGeometry, nodesMaterial);
    scene.add(nodesMesh);

    // 4. Connecting Lines Geodesic Network
    const linePositions: number[] = [];
    const lineColors: number[] = [];
    const connectionThreshold = 42;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < connectionThreshold) {
          linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);

          lineColors.push(orangeColor.r, orangeColor.g, orangeColor.b);
          lineColors.push(copperColor.r, copperColor.g, copperColor.b);
        }
      }
    }

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    linesGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));

    const linesMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });

    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // 5. Orbiting Particle Rings
    const orbitCount = 180;
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPositions = new Float32Array(orbitCount * 3);

    for (let i = 0; i < orbitCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = sphereRadius + (Math.random() * 40 - 20);
      const height = (Math.random() - 0.5) * 80;

      orbitPositions[i * 3] = Math.cos(angle) * r;
      orbitPositions[i * 3 + 1] = height;
      orbitPositions[i * 3 + 2] = Math.sin(angle) * r;
    }

    orbitGeometry.setAttribute("position", new THREE.BufferAttribute(orbitPositions, 3));
    const orbitMaterial = new THREE.PointsMaterial({
      size: 2.2,
      color: 0xff8c42,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const orbitMesh = new THREE.Points(orbitGeometry, orbitMaterial);
    scene.add(orbitMesh);

    // 6. Interactive Mouse Motion Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 0.8;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 0.8;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // 7. Animation Loop with Viewport Optimization
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
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Sphere rotation
      nodesMesh.rotation.y = elapsedTime * 0.15 + targetX;
      nodesMesh.rotation.x = elapsedTime * 0.08 + targetY;

      linesMesh.rotation.y = nodesMesh.rotation.y;
      linesMesh.rotation.x = nodesMesh.rotation.x;

      orbitMesh.rotation.y = -elapsedTime * 0.2;
      orbitMesh.rotation.z = Math.sin(elapsedTime * 0.5) * 0.1;

      // Pulse breathing scale
      const scale = 1 + Math.sin(elapsedTime * 1.8) * 0.025;
      nodesMesh.scale.set(scale, scale, scale);
      linesMesh.scale.set(scale, scale, scale);

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
      renderer.setClearColor(0x000000, 0);
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
    setIsLoaded(true);

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
      nodesGeometry.dispose();
      nodesMaterial.dispose();
      linesGeometry.dispose();
      linesMaterial.dispose();
      orbitGeometry.dispose();
      orbitMaterial.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[350px] sm:min-h-[450px]" />
    </div>
  );
}
