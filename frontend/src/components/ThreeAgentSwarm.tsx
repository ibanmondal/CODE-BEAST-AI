"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ShieldCheck, Layers, Zap, TestTube, Database, Fingerprint, Award, CheckCircle2, Cpu } from "lucide-react";

interface AgentSwarmProps {
  onSelectAgent?: (agentId: string) => void;
  activeAgentId?: string | null;
  className?: string;
}

const AGENTS = [
  { id: "security", name: "AutoReview Security", role: "OWASP & CWE Slicing", color: 0x89cff0, icon: ShieldCheck },
  { id: "architecture", name: "Architecture & SOLID", role: "Modularity & Coupling", color: 0xbae6fd, icon: Layers },
  { id: "performance", name: "Resource Performance", role: "Algorithmic Complexity", color: 0x89cff0, icon: Zap },
  { id: "testing", name: "Testing & CI Flakes", role: "Assertion Density", color: 0x70c0e8, icon: TestTube },
  { id: "database", name: "Database & Schema", role: "N+1 & Transaction Locks", color: 0x89cff0, icon: Database },
  { id: "similarity", name: "AST Neural Clones", role: "CodeBERT Vectors", color: 0xbae6fd, icon: Fingerprint },
  { id: "dx", name: "Developer Experience", role: "Type Strictness & Docs", color: 0x70c0e8, icon: Cpu },
  { id: "finops", name: "Cloud & FinOps", role: "Compute Efficiency", color: 0x89cff0, icon: Award }
];

export function ThreeAgentSwarm({ onSelectAgent, activeAgentId, className = "" }: AgentSwarmProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!mountRef.current || !isClient) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting System - Crisp Blue & White Enterprise Saas Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x89cff0, 1.8);
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    // 3. Central ConsJudge Core Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Sharp Square Core Box (90-degree enterprise geometry)
    const coreGeometry = new THREE.BoxGeometry(3.2, 3.2, 3.2);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x08132b,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreMesh);

    // Core Wireframe Cage
    const cageGeo = new THREE.BoxGeometry(3.6, 3.6, 3.6);
    const cageEdges = new THREE.EdgesGeometry(cageGeo);
    const cageMat = new THREE.LineBasicMaterial({ color: 0x89cff0, transparent: true, opacity: 0.8 });
    const cageMesh = new THREE.LineSegments(cageEdges, cageMat);
    coreGroup.add(cageMesh);

    // Outer Orbital Concentric Rings
    const ring1Geo = new THREE.RingGeometry(8.8, 9.0, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x89cff0, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    const ring2Geo = new THREE.RingGeometry(11.8, 12.0, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xbae6fd, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2;
    scene.add(ring2);

    // 4. 8 Agent Orbital Nodes (Sharp 90-degree Cubes & Data Lines)
    const agentNodes: { mesh: THREE.Mesh; line: THREE.Line; id: string; angle: number; radius: number; speed: number }[] = [];
    const agentRadius = 9.0;

    AGENTS.forEach((agent, index) => {
      const angle = (index / AGENTS.length) * Math.PI * 2;
      const x = Math.cos(angle) * agentRadius;
      const z = Math.sin(angle) * agentRadius;

      // Agent Mesh (Sharp Cube)
      const agentGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const agentMat = new THREE.MeshStandardMaterial({
        color: agent.color,
        roughness: 0.3,
        metalness: 0.5
      });
      const agentMesh = new THREE.Mesh(agentGeo, agentMat);
      agentMesh.position.set(x, 0, z);
      scene.add(agentMesh);

      // Outer Edge Wireframe
      const agentEdges = new THREE.EdgesGeometry(agentGeo);
      const agentEdgeMat = new THREE.LineBasicMaterial({ color: 0xffffff });
      const agentEdgeLines = new THREE.LineSegments(agentEdges, agentEdgeMat);
      agentMesh.add(agentEdgeLines);

      // Connecting Telemetry Line to Central Core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, 0, z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x89cff0,
        transparent: true,
        opacity: 0.4
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      agentNodes.push({
        mesh: agentMesh,
        line: line,
        id: agent.id,
        angle: angle,
        radius: agentRadius,
        speed: 0.004 + (index % 2) * 0.001
      });
    });

    // 5. Pulsing Telemetry Data Packets (Flying small cubes)
    const packets: { mesh: THREE.Mesh; targetIdx: number; progress: number }[] = [];
    const packetGeo = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xbae6fd });

    for (let p = 0; p < 8; p++) {
      const pMesh = new THREE.Mesh(packetGeo, packetMat);
      scene.add(pMesh);
      packets.push({ mesh: pMesh, targetIdx: p, progress: Math.random() });
    }

    // 6. Mouse Interaction & Parallax Tilt
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotationY = mouseX * 0.45;
      targetRotationX = -mouseY * 0.35;
    };

    const container = mountRef.current;
    container.addEventListener("mousemove", handlePointerMove);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth camera dampening
      currentRotationX += (targetRotationX - currentRotationX) * 0.05;
      currentRotationY += (targetRotationY - currentRotationY) * 0.05;

      camera.position.x = Math.sin(currentRotationY) * 22;
      camera.position.y = 8 + currentRotationX * 6;
      camera.position.z = Math.cos(currentRotationY) * 22;
      camera.lookAt(0, 0, 0);

      // Rotate ConsJudge Core
      coreMesh.rotation.x = time * 0.4;
      coreMesh.rotation.y = time * 0.6;
      cageMesh.rotation.x = -time * 0.2;
      cageMesh.rotation.y = -time * 0.3;

      // Pulse Core Scale subtly
      const scale = 1.0 + Math.sin(time * 2.5) * 0.03;
      coreGroup.scale.set(scale, scale, scale);

      // Animate Agent Nodes in orbit
      agentNodes.forEach((node, i) => {
        node.angle += node.speed;
        const x = Math.cos(node.angle) * node.radius;
        const z = Math.sin(node.angle) * node.radius;
        const y = Math.sin(time * 2 + i) * 0.4;

        node.mesh.position.set(x, y, z);
        node.mesh.rotation.y = time * 0.8 + i;
        node.mesh.rotation.x = time * 0.4;

        // Update connecting line geometry
        const positions = (node.line.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        positions[3] = x;
        positions[4] = y;
        positions[5] = z;
        node.line.geometry.attributes.position.needsUpdate = true;
      });

      // Animate Data Packets along connecting vectors
      packets.forEach((p) => {
        p.progress += delta * 0.6;
        if (p.progress > 1) p.progress = 0;

        const targetNode = agentNodes[p.targetIdx];
        if (targetNode) {
          const start = new THREE.Vector3(0, 0, 0);
          const end = targetNode.mesh.position;
          p.mesh.position.lerpVectors(start, end, p.progress);
          p.mesh.rotation.x = time * 3;
          p.mesh.rotation.y = time * 3;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handlePointerMove);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isClient]);

  return (
    <div className={`relative w-full h-[420px] bg-white border border-[#D8E5F8] rounded-none overflow-hidden select-none ${className}`}>
      
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/30 text-xs font-mono text-white shadow-sm rounded-full">
          <span className="w-2 h-2 rounded-full bg-[#89CFF0] animate-pulse" />
          <span className="font-bold">PARALLEL SWARM TOPOLOGY</span>
          <span className="text-[#8EA6C8]">v2.5</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 pointer-events-none text-right">
        <span className="text-[11px] font-mono text-[#8EA6C8] block">ARBITRATION PROTOCOL</span>
        <span className="text-xs font-bold text-white font-mono">ConsJudge Dual-Pass</span>
      </div>

      {/* Bottom Interactive Quick-Agent Selector */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2 overflow-x-auto py-1 px-1 bg-[#08132B]/95 backdrop-blur-md border border-[#89CFF0]/25 rounded-xl">
        <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase tracking-wider px-2 shrink-0">
          Evaluator Nodes:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent && onSelectAgent(agent.id)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all shrink-0 ${
                activeAgentId === agent.id
                  ? "bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] font-bold border-[#89CFF0] shadow-xs"
                  : "bg-[#040914] text-[#8EA6C8] border-[#89CFF0]/20 hover:border-[#89CFF0] hover:text-white"
              }`}
            >
              {agent.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
