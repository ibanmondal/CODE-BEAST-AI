"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Award, 
  Trophy, 
  Crown, 
  Medal, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Printer, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  Plus, 
  GraduationCap, 
  Building2, 
  QrCode, 
  FileCheck, 
  Star, 
  Zap, 
  Cpu, 
  Flame, 
  Code2, 
  ChevronRight,
  X
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export interface TrophyHonor {
  id: string;
  tier: 'Grand Prize' | '1st Runner Up' | '2nd Runner Up' | 'Category Award' | 'Faculty Commendation';
  awardTitle: string;
  prizeMoney?: string;
  badgeIcon: 'crown' | 'trophy' | 'medal' | 'star' | 'flame' | 'cpu';
  accentColor: string; // 'gold' | 'silver' | 'bronze' | 'purple' | 'cyan' | 'emerald'
  repo: string;
  repoUrl: string;
  team: string;
  members: string[];
  track: string;
  score: number;
  citation: string;
  awardedBy: string;
  judgeRole: string;
  verificationId: string;
  issuedDate: string;
}

const INITIAL_TROPHIES: TrophyHonor[] = [
  {
    id: "trophy-01",
    tier: "Grand Prize",
    awardTitle: "Grand Prize Champion & Best Overall System",
    prizeMoney: "₹50,000 / $5,000 Grant",
    badgeIcon: "crown",
    accentColor: "gold",
    repo: "multi-agent-evaluator",
    repoUrl: "https://github.com/codebeast/multi-agent-evaluator",
    team: "Nexus AI (Team 01)",
    members: ["Iban Nadir Mondal", "Umme Misbah Sikandar", "Syed Imaduddin", "Hadi Hameed"],
    track: "Artificial Intelligence & Multi-Agent Systems",
    score: 96.4,
    citation: "Awarded for exceptional architectural execution of parallel LangGraph multi-agent execution, LibGit2 AST parsing, and deterministic quality scoring with zero live crashes.",
    awardedBy: "Dr. Tabassum Ara",
    judgeRole: "Professor & Head of Department, AI & ML | Dean, IIC",
    verificationId: "CERT-HKBK-2026-CB-9941X",
    issuedDate: "October 21, 2026"
  },
  {
    id: "trophy-02",
    tier: "1st Runner Up",
    awardTitle: "1st Runner Up & Security Excellence Trophy",
    prizeMoney: "₹25,000 / $2,500 Grant",
    badgeIcon: "trophy",
    accentColor: "silver",
    repo: "zero-trust-vault",
    repoUrl: "https://github.com/cyber-ops/zero-trust-vault",
    team: "Cipher Guard (Team 03)",
    members: ["Alex Mercer", "Devon Vance", "Priya Nair"],
    track: "Cybersecurity & Infrastructure",
    score: 91.8,
    citation: "Exemplary implementation of micro-segmentation proxy with real-time CWE injection blocking and sub-millisecond cryptographic secret rotation.",
    awardedBy: "David Chen",
    judgeRole: "Technical Judge & Cloud Security Architect",
    verificationId: "CERT-HKBK-2026-CB-8820B",
    issuedDate: "October 21, 2026"
  },
  {
    id: "trophy-03",
    tier: "2nd Runner Up",
    awardTitle: "2nd Runner Up & FinTech Innovation Medal",
    prizeMoney: "₹15,000 / $1,500 Grant",
    badgeIcon: "medal",
    accentColor: "bronze",
    repo: "solana-pay-stream",
    repoUrl: "https://github.com/defi-core/solana-pay-stream",
    team: "Solana Streams (Team 05)",
    members: ["Elena Rostova", "Kavya Patel", "Marcus Brody"],
    track: "Web3 & Streaming FinTech",
    score: 88.5,
    citation: "Flawless live demonstration of per-second micropayment streaming for distributed computational workloads on high-throughput ledger rails.",
    awardedBy: "Dr. Priya Sharma",
    judgeRole: "External University Evaluation Chair",
    verificationId: "CERT-HKBK-2026-CB-7714C",
    issuedDate: "October 21, 2026"
  },
  {
    id: "trophy-04",
    tier: "Category Award",
    awardTitle: "Best Multi-Agent & LLM Innovation Trophy",
    badgeIcon: "cpu",
    accentColor: "cyan",
    repo: "quantum-ml-flow",
    repoUrl: "https://github.com/quant-team/quantum-ml-flow",
    team: "AI Synthetics (Team 07)",
    members: ["Rohit Sharma", "Zainab Ali"],
    track: "Machine Learning & Research",
    score: 87.2,
    citation: "Pioneering adaptation of multi-provider LLM arbitration with resilient fallbacks across cloud APIs and local edge inference nodes.",
    awardedBy: "Dr. Tabassum Ara",
    judgeRole: "Professor & Head of Department, AI & ML",
    verificationId: "CERT-HKBK-2026-CB-6629D",
    issuedDate: "October 21, 2026"
  },
  {
    id: "trophy-05",
    tier: "Category Award",
    awardTitle: "Best UI/UX & Liquid-Glass Design Experience",
    badgeIcon: "star",
    accentColor: "purple",
    repo: "liquid-glass-framework",
    repoUrl: "https://github.com/design-core/liquid-glass-framework",
    team: "Aesthetic Labs (Team 09)",
    members: ["Maya Lin", "Chris Tanaka"],
    track: "Frontend & Human-Computer Interaction",
    score: 89.0,
    citation: "Stunning implementation of liquid-glass elevation tokens, accessible high-contrast typography, and responsive 3D particle canvas visualizers.",
    awardedBy: "Sarah Jenkins",
    judgeRole: "Academic Observer & Design Evaluator",
    verificationId: "CERT-HKBK-2026-CB-5541E",
    issuedDate: "October 21, 2026"
  },
  {
    id: "trophy-06",
    tier: "Faculty Commendation",
    awardTitle: "Dean's Choice Institution Innovation Council (IIC) Honor",
    badgeIcon: "flame",
    accentColor: "emerald",
    repo: "eco-route-optimizer",
    repoUrl: "https://github.com/green-logistics/eco-route-optimizer",
    team: "CarbonZero (Team 12)",
    members: ["Anand Verma", "Sofia Rossi", "Tariq Mansoor"],
    track: "Social Impact & Green Computing",
    score: 86.8,
    citation: "Recognized by the Institution's Innovation Council for high societal impact through graph-theoretic carbon footprint reduction algorithms.",
    awardedBy: "Dr. Tabassum Ara",
    judgeRole: "Dean, Institution’s Innovation Council (IIC)",
    verificationId: "CERT-HKBK-2026-CB-4418F",
    issuedDate: "October 21, 2026"
  }
];

export default function TrophyHallPage() {
  const [trophies, setTrophies] = useState<TrophyHonor[]>(INITIAL_TROPHIES);
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyHonor>(INITIAL_TROPHIES[0]);
  const [tierFilter, setTierFilter] = useState<string>('All Trophies');
  
  // Modals & Feedback
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false);

  // New Trophy Minting Form
  const [newTeam, setNewTeam] = useState<string>('');
  const [newRepo, setNewRepo] = useState<string>('');
  const [newMembers, setNewMembers] = useState<string>('');
  const [newAward, setNewAward] = useState<string>('Best Multi-Agent & LLM Innovation Trophy');
  const [newTier, setNewTier] = useState<TrophyHonor['tier']>('Category Award');
  const [newScore, setNewScore] = useState<number>(90);
  const [newCitation, setNewCitation] = useState<string>('');
  const [newJudge, setNewJudge] = useState<string>('Dr. Tabassum Ara');

  // Load persisted trophies if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('codebeast_trophy_hall');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTrophies(parsed);
          setSelectedTrophy(parsed[0]);
        }
      }
    } catch (e) {}
  }, []);

  const saveTrophies = (updated: TrophyHonor[]) => {
    setTrophies(updated);
    try {
      localStorage.setItem('codebeast_trophy_hall', JSON.stringify(updated));
    } catch (e) {}
  };

  // Filtered trophies list
  const filteredTrophies = useMemo(() => {
    if (tierFilter === 'All Trophies') return trophies;
    if (tierFilter === 'Grand Champions') return trophies.filter(t => t.tier.includes('Runner Up') || t.tier === 'Grand Prize');
    return trophies.filter(t => t.tier === tierFilter);
  }, [trophies, tierFilter]);

  // Top 3 Podium
  const grandPrize = trophies.find(t => t.tier === 'Grand Prize') || trophies[0];
  const firstRunner = trophies.find(t => t.tier === '1st Runner Up') || trophies[1];
  const secondRunner = trophies.find(t => t.tier === '2nd Runner Up') || trophies[2];

  // Handle Minting New Trophy
  const handleMintTrophy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.trim() || !newRepo.trim()) return;

    const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newHonor: TrophyHonor = {
      id: `trophy-${Date.now()}`,
      tier: newTier,
      awardTitle: newAward,
      prizeMoney: newTier === 'Grand Prize' ? '₹50,000 Grant' : newTier === '1st Runner Up' ? '₹25,000 Grant' : undefined,
      badgeIcon: newTier === 'Grand Prize' ? 'crown' : newTier.includes('Runner Up') ? 'trophy' : 'medal',
      accentColor: newTier === 'Grand Prize' ? 'gold' : newTier === '1st Runner Up' ? 'silver' : newTier === '2nd Runner Up' ? 'bronze' : 'cyan',
      repo: newRepo.trim(),
      repoUrl: `https://github.com/developer/${newRepo.trim()}`,
      team: newTeam.trim(),
      members: newMembers.split(',').map(m => m.trim()).filter(Boolean),
      track: "Computer Science & Artificial Intelligence",
      score: Number(newScore),
      citation: newCitation.trim() || "Awarded for exceptional technical demonstration during capstone defense.",
      awardedBy: newJudge,
      judgeRole: newJudge.includes("Tabassum") ? "Professor & Head of Department, AI & ML | Dean, IIC" : "Hackathon Evaluator Chair",
      verificationId: `CERT-HKBK-2026-CB-${randHex}`,
      issuedDate: "October 21, 2026"
    };

    const updated = [newHonor, ...trophies];
    saveTrophies(updated);
    setSelectedTrophy(newHonor);
    setIsMintModalOpen(false);

    // Reset Form
    setNewTeam('');
    setNewRepo('');
    setNewMembers('');
    setNewCitation('');
  };

  const handleCopyBadge = () => {
    const badgeMarkdown = `[![Code Beast AI Verified Honor](https://img.shields.io/badge/CodeBeast%20Honors-${encodeURIComponent(selectedTrophy.awardTitle)}-gold?style=for-the-badge&logo=github)](https://codebeast.ai/verify/${selectedTrophy.verificationId})`;
    navigator.clipboard.writeText(badgeMarkdown);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2500);
  };

  const handleCopyLinkedIn = () => {
    const text = `🏆 Proud to announce that our project "${selectedTrophy.repo}" has been awarded the "${selectedTrophy.awardTitle}" at the Code Beast AI Capstone Hackathon, evaluated under Dr. Tabassum Ara at HKBK College of Engineering!\n\nVerified Certificate ID: ${selectedTrophy.verificationId}\n\n#CodeBeastAI #HackathonWinner #AIML #HKBKCE`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 text-white max-w-7xl mx-auto">
      
      {/* 1. Header with Golden Ambient Accent & Mint Action */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-amber-400/40 text-amber-300 text-[11px] font-bold tracking-wider uppercase rounded-none shadow-xs mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              National Hackathon & Capstone Honors
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Digital Trophy Hall & Verified Certificates</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-500/40 uppercase">
                Hall of Fame
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-3xl leading-relaxed">
              Verifiable honors showcase celebrating top engineering repositories. Inspect award citations, review digital seals, and export printable certificates signed by faculty judges.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsMintModalOpen(true)}
              className="px-4 py-2 text-xs font-extrabold bg-[#89CFF0] text-[#08132B] hover:bg-[#BAE6FD] transition-colors rounded-none flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Bestow New Award</span>
            </button>

            <Link
              href="/leaderboard"
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none transition-all flex items-center gap-2 shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Global Leaderboard</span>
              <ChevronRight className="w-3 h-3 opacity-70" />
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. TOP 3 PODIUM PEDESTALS (Grand Champions) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Grand Champions Podium (Top 3 Laureates)
            </span>
          </div>
          <span className="text-xs text-[#8EA6C8] font-mono">Evaluated by Consensus Jury</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* SILVER PEDESTAL (1st Runner Up) */}
          {firstRunner && (
            <div className="liquid-glass-card rounded-none p-5 sm:p-6 border-2 border-slate-400/50 bg-gradient-to-b from-[#0A1A3A] to-[#040914] shadow-lg space-y-4 order-2 md:order-1 relative overflow-hidden group hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-slate-300" />
                  🥈 1st Runner Up Trophy
                </span>
                <span className="text-xl font-black font-mono text-white">{firstRunner.score} pts</span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase block">
                  {firstRunner.prizeMoney || "Honorary Grant"}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">{firstRunner.awardTitle}</h3>
                <p className="text-xs text-[#BAE6FD] mt-1 font-mono font-semibold">{firstRunner.team}</p>
                <span className="text-[11px] text-[#8EA6C8] block truncate">{firstRunner.repo}</span>
              </div>

              <div className="pt-3 border-t border-[#89CFF0]/15 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedTrophy(firstRunner);
                    setIsCertModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Inspect Certificate</span>
                </button>
                <span className="text-[10px] font-mono text-[#8EA6C8]">{firstRunner.verificationId}</span>
              </div>
            </div>
          )}

          {/* GOLD PEDESTAL (Grand Prize Champion - Elevated) */}
          {grandPrize && (
            <div className="liquid-glass-card rounded-none p-6 sm:p-7 border-2 border-amber-400/70 bg-gradient-to-b from-[#1E1B0E]/90 via-[#0D1E45] to-[#040914] shadow-[0_0_35px_rgba(251,191,36,0.2)] space-y-5 order-1 md:order-2 md:-translate-y-2 relative overflow-hidden group hover:border-amber-300 transition-all">
              
              {/* Subtle Golden Crown Aura */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/10 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                  🥇 Grand Prize Champion
                </span>
                <span className="text-2xl font-black font-mono text-amber-300">{grandPrize.score} pts</span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 uppercase">
                  {grandPrize.prizeMoney}
                </span>
                <h3 className="text-xl font-extrabold text-white tracking-tight mt-2">{grandPrize.awardTitle}</h3>
                <p className="text-sm text-[#BAE6FD] mt-1 font-mono font-bold">{grandPrize.team}</p>
                <span className="text-xs text-[#8EA6C8] block truncate">{grandPrize.repo}</span>
              </div>

              <p className="text-xs text-[#DCE4FE] leading-relaxed italic border-l-2 border-l-amber-400/60 pl-3">
                &ldquo;{grandPrize.citation}&rdquo;
              </p>

              <div className="pt-3 border-t border-amber-400/30 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedTrophy(grandPrize);
                    setIsCertModalOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#08132B] text-xs font-bold rounded-none flex items-center gap-2 shadow-sm transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>View Official Certificate</span>
                </button>
                <span className="text-[10px] font-mono text-amber-300/80 font-bold">{grandPrize.verificationId}</span>
              </div>
            </div>
          )}

          {/* BRONZE PEDESTAL (2nd Runner Up) */}
          {secondRunner && (
            <div className="liquid-glass-card rounded-none p-5 sm:p-6 border-2 border-amber-700/50 bg-gradient-to-b from-[#1A0F0A] to-[#040914] shadow-lg space-y-4 order-3 relative overflow-hidden group hover:border-amber-600 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-500 uppercase flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-600" />
                  🥉 2nd Runner Up Trophy
                </span>
                <span className="text-xl font-black font-mono text-white">{secondRunner.score} pts</span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                  {secondRunner.prizeMoney || "Honorary Grant"}
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">{secondRunner.awardTitle}</h3>
                <p className="text-xs text-[#BAE6FD] mt-1 font-mono font-semibold">{secondRunner.team}</p>
                <span className="text-[11px] text-[#8EA6C8] block truncate">{secondRunner.repo}</span>
              </div>

              <div className="pt-3 border-t border-[#89CFF0]/15 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedTrophy(secondRunner);
                    setIsCertModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Inspect Certificate</span>
                </button>
                <span className="text-[10px] font-mono text-[#8EA6C8]">{secondRunner.verificationId}</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. CATEGORY HONORS & FACULTY COMMENDATIONS GRID */}
      <div className="space-y-4 pt-4">
        
        {/* Tier Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#89CFF0]/20">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#89CFF0]" />
              <span>Special Category Awards & Institutional Honors</span>
            </h2>
            <p className="text-xs text-[#8EA6C8] mt-0.5">
              Distinguished awards minted for multi-agent innovation, architectural audacity, and UI/UX craftsmanship.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            {['All Trophies', 'Grand Champions', 'Category Award', 'Faculty Commendation'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 border transition-colors ${
                  tierFilter === t
                    ? 'bg-[#89CFF0]/20 text-[#89CFF0] border-[#89CFF0]'
                    : 'bg-[#08132B] text-[#8EA6C8] border-[#89CFF0]/20 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Trophies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrophies.map((trophy) => (
            <div
              key={trophy.id}
              className="liquid-glass-card rounded-none p-5 sm:p-6 border border-[#89CFF0]/25 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#89CFF0]/60 transition-all group"
            >
              <div className="space-y-3">
                
                {/* Header Icon & Tier */}
                <div className="flex items-center justify-between pb-2 border-b border-[#89CFF0]/15">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#08132B] border border-[#89CFF0]/40 text-[#89CFF0]">
                      {trophy.badgeIcon === 'crown' && <Crown className="w-4 h-4 text-amber-400" />}
                      {trophy.badgeIcon === 'trophy' && <Trophy className="w-4 h-4 text-[#89CFF0]" />}
                      {trophy.badgeIcon === 'medal' && <Medal className="w-4 h-4 text-amber-500" />}
                      {trophy.badgeIcon === 'cpu' && <Cpu className="w-4 h-4 text-cyan-400" />}
                      {trophy.badgeIcon === 'star' && <Star className="w-4 h-4 text-purple-400" />}
                      {trophy.badgeIcon === 'flame' && <Flame className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider">
                      {trophy.tier}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#08132B] text-white border border-[#89CFF0]/30">
                    {trophy.score} / 100
                  </span>
                </div>

                {/* Award Title & Team Info */}
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-[#89CFF0] transition-colors">
                    {trophy.awardTitle}
                  </h4>
                  <p className="text-xs text-[#BAE6FD] font-mono mt-1 font-semibold">
                    {trophy.team}
                  </p>
                  <span className="text-[11px] text-[#8EA6C8] block mt-0.5">
                    {trophy.track}
                  </span>
                </div>

                {/* Citation */}
                <p className="text-xs text-[#DCE4FE] leading-relaxed line-clamp-3 bg-[#08132B]/60 p-2.5 border border-[#89CFF0]/15 italic">
                  &ldquo;{trophy.citation}&rdquo;
                </p>

                {/* Team Members List */}
                <div className="space-y-1 text-[11px]">
                  <span className="text-[#8EA6C8] block font-mono">Awarded Laureates:</span>
                  <div className="flex flex-wrap gap-1">
                    {trophy.members.map((m, mIdx) => (
                      <span key={mIdx} className="px-1.5 py-0.5 bg-[#08132B] border border-[#89CFF0]/20 text-[10px] font-mono text-white">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card Footer: Action & Verification */}
              <div className="pt-3 border-t border-[#89CFF0]/15 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setSelectedTrophy(trophy);
                    setIsCertModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Inspect Certificate</span>
                </button>

                <span className="text-[10px] font-mono text-[#8EA6C8]">
                  {trophy.verificationId}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* 4. OFFICIAL VERIFIED CERTIFICATE MODAL (PRINT READY) */}
      <AnimatePresence>
        {isCertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border-2 border-amber-400/50 text-white p-6 sm:p-10 max-w-3xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl rounded-none font-serif relative"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setIsCertModalOpen(false)}
                className="absolute top-4 right-4 text-[#8EA6C8] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              {/* CERTIFICATE FRAME (Print-Ready) */}
              <div className="border-4 border-double border-amber-400/60 p-6 sm:p-8 bg-[#040914] text-center space-y-6 relative overflow-hidden shadow-inner">
                
                {/* Institutional Header */}
                <div className="space-y-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300 block">
                    INSTITUTION’S INNOVATION COUNCIL (IIC) & DEPARTMENT OF AI & ML
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-wide uppercase font-serif">
                    HKBK COLLEGE OF ENGINEERING
                  </h2>
                  <p className="text-xs font-sans text-[#BAE6FD]">
                    Bengaluru, Karnataka, India · Affiliated to VTU, Approved by AICTE
                  </p>
                </div>

                <div className="h-0.5 w-32 bg-amber-400/60 mx-auto" />

                {/* Certificate Name */}
                <div className="space-y-1">
                  <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#89CFF0]">
                    Official Capstone & Hackathon Distinction
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-serif">
                    Certificate of Excellence & Merit
                  </h3>
                </div>

                {/* Recipient Text */}
                <div className="space-y-3 font-sans text-xs sm:text-sm text-[#DCE4FE] max-w-xl mx-auto leading-relaxed">
                  <p>This is to certify that the engineering team</p>
                  <p className="text-lg sm:text-xl font-bold text-white font-serif tracking-wider border-b border-amber-400/40 pb-1 max-w-md mx-auto">
                    {selectedTrophy.team}
                  </p>
                  <p className="text-xs text-[#BAE6FD]">
                    Comprising: <strong>{selectedTrophy.members.join(', ') || "Project Team Leads"}</strong>
                  </p>
                  <p>has been officially conferred the title of</p>
                  <p className="text-base sm:text-lg font-extrabold text-amber-300 uppercase tracking-wide bg-amber-950/40 py-1.5 px-4 border border-amber-500/30">
                    {selectedTrophy.awardTitle}
                  </p>
                  <p>
                    for outstanding performance and technical rigor in their project <strong>{selectedTrophy.repo}</strong> with an evaluated benchmark score of <strong>{selectedTrophy.score} / 100</strong>.
                  </p>
                </div>

                {/* Official Citation */}
                <div className="p-3 bg-[#08132B]/80 border border-amber-400/30 text-xs font-sans text-[#BAE6FD] italic max-w-lg mx-auto">
                  &ldquo;{selectedTrophy.citation}&rdquo;
                </div>

                {/* Security Verification & Signatures */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-amber-400/30 items-end font-sans text-xs">
                  
                  {/* Left: Faculty Guide Signature */}
                  <div className="text-left space-y-1">
                    <div className="h-8 border-b border-dashed border-[#8EA6C8]/60" />
                    <strong className="block text-white text-xs">{selectedTrophy.awardedBy}</strong>
                    <span className="text-[10px] text-[#8EA6C8] block leading-tight">{selectedTrophy.judgeRole}</span>
                  </div>

                  {/* Center: Gold Seal Emblem */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-amber-400/80 bg-gradient-to-br from-amber-500/20 to-amber-900/40 flex flex-col items-center justify-center text-center shadow-lg">
                      <Crown className="w-6 h-6 text-amber-400" />
                      <span className="text-[7px] font-bold text-amber-200 uppercase tracking-tighter mt-0.5">VERIFIED SEAL</span>
                    </div>
                    <span className="text-[9px] font-mono text-[#8EA6C8] mt-1">{selectedTrophy.issuedDate}</span>
                  </div>

                  {/* Right: Verification QR & Hash */}
                  <div className="text-right space-y-1">
                    <div className="h-8 border-b border-dashed border-[#8EA6C8]/60" />
                    <strong className="block text-white text-xs">Code Beast Consensus Jury</strong>
                    <span className="text-[10px] text-[#89CFF0] font-mono block truncate" title={selectedTrophy.verificationId}>
                      ID: {selectedTrophy.verificationId}
                    </span>
                  </div>

                </div>

              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 font-sans text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyBadge}
                    className="px-3 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none flex items-center gap-1.5 transition-colors"
                  >
                    {copiedBadge ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBadge ? "Markdown Copied!" : "Copy README Badge"}</span>
                  </button>

                  <button
                    onClick={handleCopyLinkedIn}
                    className="px-3 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-white border border-[#89CFF0]/40 rounded-none flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Post Copied!" : "Share on LinkedIn"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCertModalOpen(false)}
                    className="px-4 py-2 bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20 rounded-none"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#08132B] font-bold rounded-none flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Certificate</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MINT / BESTOW NEW TROPHY MODAL */}
      <AnimatePresence>
        {isMintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border-2 border-[#89CFF0]/50 text-white p-6 sm:p-7 max-w-md w-full space-y-4 shadow-xl rounded-none font-sans"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#89CFF0]/20">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Bestow Hackathon Trophy & Mint Credential
                  </h3>
                </div>
                <button onClick={() => setIsMintModalOpen(false)} className="text-[#8EA6C8] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleMintTrophy} className="space-y-3 text-xs">
                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Winning Team Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexus AI"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Repository Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. multi-agent-evaluator"
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Team Laureates (comma-separated):</label>
                  <input
                    type="text"
                    placeholder="e.g. Iban Nadir Mondal, Umme Misbah, Syed Imaduddin, Hadi"
                    value={newMembers}
                    onChange={(e) => setNewMembers(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[#8EA6C8] font-mono block mb-1">Award Tier:</label>
                    <select
                      value={newTier}
                      onChange={(e: any) => setNewTier(e.target.value)}
                      className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                    >
                      <option value="Grand Prize">Grand Prize Champion</option>
                      <option value="1st Runner Up">1st Runner Up</option>
                      <option value="2nd Runner Up">2nd Runner Up</option>
                      <option value="Category Award">Category Award</option>
                      <option value="Faculty Commendation">Faculty Commendation</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#8EA6C8] font-mono block mb-1">Final Score (0-100):</label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Official Award Title:</label>
                  <input
                    type="text"
                    required
                    value={newAward}
                    onChange={(e) => setNewAward(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Bestowed By (Judge / Faculty):</label>
                  <select
                    value={newJudge}
                    onChange={(e) => setNewJudge(e.target.value)}
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  >
                    <option value="Dr. Tabassum Ara">Dr. Tabassum Ara (Professor & HOD, AI & ML | Dean, IIC)</option>
                    <option value="Dr. Priya Sharma">Dr. Priya Sharma (Head Judge)</option>
                    <option value="David Chen">David Chen (Technical Judge)</option>
                    <option value="Consensus Committee Jury">Consensus Committee Jury</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8EA6C8] font-mono block mb-1">Official Jury Citation:</label>
                  <textarea
                    rows={2}
                    value={newCitation}
                    onChange={(e) => setNewCitation(e.target.value)}
                    placeholder="Enter formal citation honoring the team's architectural achievements..."
                    className="w-full bg-[#0C1E45] border border-[#89CFF0]/30 p-2 text-white rounded-none focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#89CFF0]/20">
                  <button
                    type="button"
                    onClick={() => setIsMintModalOpen(false)}
                    className="px-3 py-1.5 bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20 rounded-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#08132B] font-bold rounded-none"
                  >
                    Mint & Award Trophy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
