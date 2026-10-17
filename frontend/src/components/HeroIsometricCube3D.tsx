"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroIsometricCube3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 280;

    // Scene & Orthographic/Perspective Camera for isometric look
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(160, 140, 200);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Glowing baby blue colors from reference
    const cyanColor = 0x89cff0;
    const electricBlue = 0x58a6ff;
    const deepNavy = 0x071533;

    // 1. Central Main Cube with GitHub Logo
    const cubeSize = 58;
    const mainBoxGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    // Canvas Texture for GitHub Octocat logo on the front face
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Deep blue gradient background
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, "#081b44");
      grad.addColorStop(0.5, "#0d2e6e");
      grad.addColorStop(1, "#1e50aa");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Inner electric border glow
      ctx.strokeStyle = "#89cff0";
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 498, 498);

      // Draw GitHub Octocat Silhouette in crisp white
      ctx.fillStyle = "#FFFFFF";
      ctx.shadowColor = "#89cff0";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      // Scaled Octocat path
      ctx.save();
      ctx.translate(56, 56);
      ctx.scale(2.0, 2.0);
      const path = new Path2D("M100 20C55.8 20 20 55.8 20 100c0 35.4 23 65.4 54.8 76 4 0.7 5.5-1.7 5.5-3.8 0-1.9-0.1-8.2-0.1-15-22.3 4.8-27-9.5-27-9.5-3.6-9.2-8.9-11.7-8.9-11.7-7.3-5 0.6-4.9 0.6-4.9 8 0.6 12.3 8.3 12.3 8.3 7.2 12.3 18.8 8.7 23.4 6.7 0.7-5.2 2.8-8.7 5.1-10.7-17.8-2-36.5-8.9-36.5-39.6 0-8.8 3.1-15.9 8.3-21.5-0.8-2-3.6-10.2 0.8-21.2 0 0 6.7-2.2 22 8.2 6.4-1.8 13.3-2.7 20.1-2.7 6.8 0 13.7 0.9 20.1 2.7 15.3-10.4 22-8.2 22-8.2 4.4 11 1.6 19.2 0.8 21.2 5.2 5.6 8.3 12.7 8.3 21.5 0 30.8-18.8 37.5-36.7 39.5 2.9 2.5 5.5 7.5 5.5 15.1 0 10.9-0.1 19.7-0.1 22.4 0 2.2 1.4 4.7 5.6 3.8C177 165.4 200 135.4 200 100c0-44.2-35.8-80-80-80z");
      ctx.fill(path);
      ctx.restore();
    }

    const githubTexture = new THREE.CanvasTexture(canvas);

    // Box Materials: Front face has GitHub logo, other faces dark navy glass with cyan edges
    const faceMatDark = new THREE.MeshStandardMaterial({
      color: 0x071b40,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0f2e6b,
      emissiveIntensity: 0.6
    });

    const faceMatLogo = new THREE.MeshStandardMaterial({
      map: githubTexture,
      metalness: 0.7,
      roughness: 0.2,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.7
    });

    // Face order: right, left, top, bottom, front, back
    const cubeMaterials = [
      faceMatDark,
      faceMatDark,
      faceMatDark,
      faceMatDark,
      faceMatLogo,
      faceMatDark
    ];

    const mainCube = new THREE.Mesh(mainBoxGeo, cubeMaterials);
    rootGroup.add(mainCube);

    // Cyan glowing wireframe edges on the main cube
    const edgesGeo = new THREE.EdgesGeometry(mainBoxGeo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x89cff0,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    const cubeEdges = new THREE.LineSegments(edgesGeo, edgesMat);
    mainCube.add(cubeEdges);

    // 2. Surrounding Isometric Secondary Cubes
    const secondaryCubeGeo = new THREE.BoxGeometry(38, 38, 38);
    const secondaryEdgesGeo = new THREE.EdgesGeometry(secondaryCubeGeo);

    const wireMat = new THREE.LineBasicMaterial({
      color: electricBlue,
      transparent: true,
      opacity: 0.65
    });

    const secPositions = [
      { x: -50, y: 35, z: -35 },
      { x: 45, y: 48, z: -40 },
      { x: -40, y: -45, z: 25 },
      { x: 55, y: -30, z: -30 },
      { x: 0, y: 65, z: -10 }
    ];

    secPositions.forEach((pos) => {
      const secCube = new THREE.Mesh(
        secondaryCubeGeo,
        new THREE.MeshStandardMaterial({
          color: 0x051026,
          metalness: 0.9,
          roughness: 0.25,
          transparent: true,
          opacity: 0.75,
          emissive: 0x0a2558,
          emissiveIntensity: 0.35
        })
      );
      secCube.position.set(pos.x, pos.y, pos.z);
      const secEdges = new THREE.LineSegments(secondaryEdgesGeo, wireMat);
      secCube.add(secEdges);
      rootGroup.add(secCube);
    });

    // 3. Perspective Grid Lines on Floor
    const gridGeo = new THREE.BufferGeometry();
    const gridLines: number[] = [];
    const gridSize = 140;
    const step = 20;

    for (let i = -gridSize; i <= gridSize; i += step) {
      gridLines.push(-gridSize, -60, i, gridSize, -60, i);
      gridLines.push(i, -60, -gridSize, i, -60, gridSize);
    }

    gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridLines, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.25
    });
    const floorGrid = new THREE.LineSegments(gridGeo, gridMat);
    rootGroup.add(floorGrid);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(cyanColor, 4, 300);
    pointLight1.position.set(100, 100, 120);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(electricBlue, 3, 300);
    pointLight2.position.set(-100, -50, -80);
    scene.add(pointLight2);

    // 5. Subtle Interactive Rotation Loop
    let animId: number;
    let time = 0;

    const animate = () => {
      time += 0.012;
      rootGroup.rotation.y = Math.sin(time * 0.5) * 0.12;
      rootGroup.position.y = Math.sin(time) * 4;
      mainCube.rotation.y = Math.sin(time * 0.4) * 0.08;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      mainBoxGeo.dispose();
      secondaryCubeGeo.dispose();
      edgesGeo.dispose();
      secondaryEdgesGeo.dispose();
      gridGeo.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[260px] flex items-center justify-center select-none">
      {/* Background Electric Glow */}
      <div className="absolute w-48 h-48 rounded-full bg-[#58A6FF]/20 blur-3xl pointer-events-none" />
      <div ref={mountRef} className="w-full h-full relative z-10" />
    </div>
  );
}
