"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Database, 
  TestTube, 
  Fingerprint,
  Cpu,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { CountUp } from '@/components/CountUp';
import { TiltCard } from '@/components/TiltCard';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { CodeBeastCube3D } from '@/components/CodeBeastCube3D';
import { NeuralMesh3D } from '@/components/NeuralMesh3D';

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState('github.com/your-org/your-repo');

  const partners = [
    "VERCEL", "LINEAR", "SUPABASE", "RAYCAST", "FRAMER", "NOTHING", "ARC", "FIGMA",
    "VERCEL", "LINEAR", "SUPABASE", "RAYCAST", "FRAMER", "NOTHING", "ARC", "FIGMA"
  ];

  const agents = [
    {
      id: "architecture",
      name: "ARCHITECTURE",
      score: 88,
      desc: "Module boundaries, coupling, layering and dependency direction.",
      icon: Layers,
      progress: 88
    },
    {
      id: "security",
      name: "SECURITY",
      score: 74,
      desc: "AutoReview Detect → Locate → Repair over the CWE taxonomy.",
      icon: ShieldCheck,
      progress: 74
    },
    {
      id: "performance",
      name: "PERFORMANCE",
      score: 81,
      desc: "Hot paths, bundle weight, N+1 queries and render cost.",
      icon: Zap,
      progress: 81
    },
    {
      id: "testing",
      name: "TESTING",
      score: 79,
      desc: "Coverage depth, flake risk, mutation resistance and CI signal.",
      icon: TestTube,
      progress: 79
    },
    {
      id: "database",
      name: "DATABASE",
      score: 85,
      desc: "Schema normalization, indexing, migrations and connection pooling.",
      icon: Database,
      progress: 85
    },
    {
      id: "originality",
      name: "ORIGINALITY",
      score: 95,
      desc: "Tree-Sitter AST + CodeBERT embeddings with FAISS clone detection.",
      icon: Fingerprint,
      progress: 95
    }
  ];

  return (
    <div className="min-h-screen text-[#D4BC9A] relative overflow-hidden font-sans pb-24 selection:bg-amber-500/30">
      
      {/* Hero Container */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6">
        
        {/* Eyebrow Kicker */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#FF8C42] uppercase mb-4 sm:mb-6 justify-start"
        >
          <span className="text-[#FF8C42] animate-pulse">✨</span>
          <span>MULTI-AGENT REPOSITORY INTELLIGENCE</span>
        </motion.div>

        {/* Hero Grid: Balanced Left Content + Right 3D Rotating Cube */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center pt-2 min-h-[540px] lg:min-h-[600px]">
          
          {/* Left / Center-Aligned Content Column (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-7">
            
            {/* Massive Display Title with Refined Proportions */}
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[7.8rem] xl:text-[9rem] tracking-tight leading-[0.87] font-normal text-[#D4BC9A]">
              <motion.span 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.75, delay: 0.1, ease: [0.2, 0, 0.2, 1] }}
                className="block text-[#D4BC9A]"
              >
                READ
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.75, delay: 0.25, ease: [0.2, 0, 0.2, 1] }}
                className="block text-[#D4BC9A]"
              >
                YOUR
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.75, delay: 0.4, ease: [0.2, 0, 0.2, 1] }}
                className="block bg-gradient-to-r from-[#E07A48] via-[#FF8C42] to-[#D96B27] bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(224,122,72,0.5)]"
              >
                CODEBASE
              </motion.span>
            </h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-amber-100/75 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed font-normal"
            >
              Five specialist AI agents crawl your repository in parallel across architecture, security, performance, testing, and database, then merge into a single intelligence core that writes the executive report for you.
            </motion.p>

            {/* Search Input Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="pt-1 max-w-xl"
            >
              <div className="flex items-center justify-between bg-[#1F0F08] border border-[#E07A48]/40 rounded-full p-2 pl-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] focus-within:border-[#FF8C42] focus-within:shadow-[0_0_25px_rgba(224,122,72,0.4)] transition-all">
                <div className="flex items-center gap-3 flex-1">
                  <GitBranch className="w-5 h-5 text-amber-200/50 shrink-0" />
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = repoUrl.trim() || 'https://github.com/pallets/flask';
                        window.location.href = `/analysis?repo=${encodeURIComponent(target)}`;
                      }
                    }}
                    placeholder="github.com/your-org/your-repo"
                    className="bg-transparent border-none outline-none text-sm text-[#D4BC9A] w-full font-mono placeholder-amber-200/30"
                  />
                </div>
                <CodeBeastLiquidButton
                  href={`/analysis?repo=${encodeURIComponent(repoUrl.trim() || 'https://github.com/pallets/flask')}`}
                  variant="primary"
                  size="md"
                  label="ANALYZE"
                  icon={<Search className="w-3.5 h-3.5" />}
                />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              <CodeBeastLiquidButton
                href="/dashboard"
                variant="primary"
                size="lg"
                label="OPEN DASHBOARD"
                hasArrow
              />
              <CodeBeastLiquidButton
                href="/reports"
                variant="secondary"
                size="lg"
                label="SEE A SAMPLE REPORT"
                hasArrow
              />
            </motion.div>
          </div>

          {/* Right Column: 3D Rich CodeBeast Orange Cube (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.2, ease: [0.2, 0, 0.2, 1] }}
            className="lg:col-span-5 xl:col-span-5 flex items-center justify-center lg:justify-center py-4 lg:py-0 lg:-mt-20 xl:-mt-24 lg:pr-4 xl:pr-8 relative z-20"
          >
            <CodeBeastCube3D />
          </motion.div>

        </div>

        {/* Tech Partner Logo Ticker Strip (Matching Image 4) */}
        <div className="mt-20 pt-8 border-t border-[#E07A48]/20 overflow-hidden relative">
          <div className="flex items-center gap-16 animate-infinite-scroll whitespace-nowrap opacity-60 hover:opacity-100 transition-opacity">
            {partners.map((partner, idx) => (
              <span key={idx} className="font-display text-xl tracking-widest text-amber-200/50 hover:text-[#FF8C42] transition-colors cursor-pointer uppercase">
                {partner}
              </span>
            ))}
          </div>
        </div>

        {/* SECTION 2: THE SWARM - FIVE AGENTS. ONE VERDICT. (Matching Image 5) */}
        <section id="agents" className="mt-28 pt-12 space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left space-y-2"
          >
            <span className="text-xs font-bold text-[#FF8C42] uppercase tracking-widest font-mono">
              THE SWARM
            </span>
            <h2 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#D4BC9A] uppercase font-normal">
              FIVE AGENTS. <span className="text-gradient-copper">ONE VERDICT.</span>
            </h2>
          </motion.div>

          {/* 6 Agent Cards Grid (Matching Image 5 Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <TiltCard variant="primary" className="p-8 h-full shadow-2xl">
                  <div className="flex flex-col justify-between h-full space-y-6">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-[#2D160B] border border-[#E07A48]/30 flex items-center justify-center text-[#FF8C42] mb-6 shadow-inner">
                        <agent.icon className="w-6 h-6 text-[#FF8C42]" />
                      </div>

                      <h3 className="font-display text-3xl tracking-wider text-[#D4BC9A] uppercase mb-3">
                        {agent.name}
                      </h3>

                      <p className="text-amber-100/60 text-xs leading-relaxed font-normal">
                        {agent.desc}
                      </p>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <CountUp 
                          end={agent.score} 
                          duration={1500}
                          className="font-display text-5xl text-[#D4BC9A] tracking-tight shrink-0"
                        />
                        <div className="flex-1 h-1.5 rounded-full bg-[#26130A] overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#E07A48] to-[#FF8C42] rounded-full transition-all duration-1000"
                            style={{ width: `${agent.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-amber-200/40 uppercase tracking-wider shrink-0">SCORE</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 3: LIVE TOPOLOGY */}
        <section className="mt-20 sm:mt-24 pt-6 pb-20 space-y-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-2 max-w-3xl mx-auto"
          >
            <span className="text-xs font-bold text-[#FF8C42] uppercase tracking-widest font-mono">
              LIVE TOPOLOGY
            </span>
            <h2 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-tight text-[#D4BC9A] uppercase font-normal">
              A NEURAL MESH, <span className="text-gradient-copper">NOT A CHECKLIST</span>
            </h2>
          </motion.div>

          {/* Living Interactive 3D Neural Mesh */}
          <div className="relative max-w-6xl mx-auto flex items-center justify-center overflow-visible -mt-4 sm:-mt-6">
            <NeuralMesh3D />
          </div>
        </section>

      </main>
    </div>
  );
}
