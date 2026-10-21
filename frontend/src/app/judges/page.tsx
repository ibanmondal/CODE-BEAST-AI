"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  X,
  Loader2,
  FileText
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion-primitives';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TrophyHonor {
  id: string;
  tier: 'Grand Prize' | '1st Runner Up' | '2nd Runner Up' | 'Category Award' | 'Faculty Commendation';
  awardTitle: string;
  prizeMoney?: string;
  badgeIcon: 'crown' | 'trophy' | 'medal' | 'star' | 'flame' | 'cpu';
  accentColor: string;
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
    team: "Nexus AI",
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
    team: "Cipher Guard",
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
    team: "Solana Streams",
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
    team: "AI Synthetics",
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
    team: "Aesthetic Labs",
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
    team: "CarbonZero",
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
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

  const certRef = useRef<HTMLDivElement>(null);

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

  const filteredTrophies = useMemo(() => {
    if (tierFilter === 'All Trophies') return trophies;
    if (tierFilter === 'Grand Champions') return trophies.filter(t => t.tier.includes('Runner Up') || t.tier === 'Grand Prize');
    return trophies.filter(t => t.tier === tierFilter);
  }, [trophies, tierFilter]);

  const grandPrize = trophies.find(t => t.tier === 'Grand Prize') || trophies[0];
  const firstRunner = trophies.find(t => t.tier === '1st Runner Up') || trophies[1];
  const secondRunner = trophies.find(t => t.tier === '2nd Runner Up') || trophies[2];

  // Professional PDF Download using jsPDF & html2canvas (No SecurityError on remote CSS)
  const handleDownloadPdf = async () => {
    const certElement = certRef.current;
    if (!certElement) return;
    setIsGeneratingPdf(true);
    try {
      let dataUrl: string | null = null;

      try {
        const canvas = await html2canvas(certElement, {
          scale: 2.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#FCFBF7',
          windowWidth: 1000
        });
        dataUrl = canvas.toDataURL('image/png', 1.0);
      } catch (canvasErr) {
        console.warn('html2canvas capture warning:', canvasErr);
      }

      if (!dataUrl) {
        // Fallback to html-to-image with skipFonts: true to prevent SecurityError on external stylesheets
        const { toPng } = await import('html-to-image');
        dataUrl = await toPng(certElement, {
          quality: 1.0,
          pixelRatio: 2.5,
          backgroundColor: '#FCFBF7',
          skipFonts: true
        });
      }

      // A4 Landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, 297, 210);
      const cleanTeam = selectedTrophy.team.replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Certificate_${cleanTeam}_${selectedTrophy.verificationId}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Failsafe: Open print window if canvas capture fails
      handlePrintCertificate();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Dedicated Print Window (A4 Landscape Isolated Print)
  const handlePrintCertificate = () => {
    const certElement = certRef.current;
    if (!certElement) return;

    const printWindow = window.open('', '_blank', 'width=1150,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${selectedTrophy.team}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: #FAF8F2;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: Georgia, 'Times New Roman', serif;
            }
            .cert-wrapper {
              width: 297mm;
              height: 210mm;
              padding: 10mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          </style>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Inter:wght@400;600;700&display=swap">
        </head>
        <body>
          <div class="cert-wrapper">
            ${certElement.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
      
      {/* 1. Dedicated Print Stylesheet to Ensure ONLY Certificate Prints Cleanly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-academic-certificate, #printable-academic-certificate * {
            visibility: visible !important;
          }
          #printable-academic-certificate {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 297mm !important;
            height: 210mm !important;
            max-width: 297mm !important;
            max-height: 210mm !important;
            margin: 0 !important;
            padding: 8mm !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 99999999 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
        }
      `}} />

      {/* 2. Header with Golden Ambient Accent & Mint Action */}
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
              Verifiable honors showcase celebrating top engineering repositories. Export authentic, high-definition university certificates signed by faculty judges.
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

      {/* 3. TOP 3 PODIUM PEDESTALS (Grand Champions) */}
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
                  className="px-3.5 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors"
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#08132B] text-xs font-bold rounded-none flex items-center gap-2 shadow-sm transition-all"
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
                  className="px-3.5 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors"
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

      {/* 4. CATEGORY HONORS & FACULTY COMMENDATIONS GRID */}
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
                  className="px-3.5 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors"
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

      {/* 5. ULTRA-PREMIUM PARCHMENT CERTIFICATE MODAL & PDF EXPORT */}
      <AnimatePresence>
        {isCertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border-2 border-amber-400/50 text-white p-4 sm:p-6 max-w-5xl w-full my-auto space-y-4 shadow-2xl rounded-none relative"
            >
              
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                      Official Verifiable Academic Certificate Preview
                    </h3>
                    <span className="text-xs text-[#8EA6C8]">Standard A4 Landscape · 300 DPI Export Ready</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="text-[#8EA6C8] hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AUTHENTIC HIGH-DEFINITION PARCHMENT CERTIFICATE FRAME */}
              <div className="w-full overflow-x-auto flex justify-center py-2 bg-black/40 p-2 border border-[#89CFF0]/20">
                <div
                  id="printable-academic-certificate"
                  ref={certRef}
                  className="w-[900px] h-[636px] shrink-0 bg-[#FCFBF7] text-[#0A1931] p-8 sm:p-10 relative flex flex-col justify-between shadow-2xl select-none"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif"
                  }}
                >
                  
                  {/* Classical Double Gold Foil Border with Corner Scrolls */}
                  <div className="absolute inset-2 border-[3px] border-[#C59B27] pointer-events-none" />
                  <div className="absolute inset-3.5 border border-[#D4AF37]/70 pointer-events-none" />
                  <div className="absolute inset-5 border border-[#B38728]/30 pointer-events-none" />

                  {/* 4 Baroque Corner Flourishes in Metallic Gold */}
                  <div className="absolute top-5 left-5 text-[#C59B27] text-lg font-serif select-none pointer-events-none">⚜</div>
                  <div className="absolute top-5 right-5 text-[#C59B27] text-lg font-serif select-none pointer-events-none">⚜</div>
                  <div className="absolute bottom-5 left-5 text-[#C59B27] text-lg font-serif select-none pointer-events-none">⚜</div>
                  <div className="absolute bottom-5 right-5 text-[#C59B27] text-lg font-serif select-none pointer-events-none">⚜</div>

                  {/* Subtle Security Guilloché Background */}
                  <div 
                    className="absolute inset-6 opacity-[0.035] pointer-events-none"
                    style={{
                      backgroundImage: "radial-gradient(#C59B27 1px, transparent 1px)",
                      backgroundSize: "14px 14px"
                    }}
                  />

                  {/* 1. Institutional Top Header */}
                  <div className="text-center space-y-1 relative z-10">
                    <span className="text-[10px] tracking-[0.25em] font-sans font-bold uppercase text-[#8A6516] block">
                      VISVESVARAYA TECHNOLOGICAL UNIVERSITY AFFILIATED · AICTE APPROVED
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F255C] tracking-wide uppercase font-serif">
                      HKBK COLLEGE OF ENGINEERING
                    </h2>
                    <p className="text-xs font-sans text-[#334155] font-semibold tracking-wider">
                      DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING
                    </p>
                    <span className="text-[10px] font-sans text-[#8A6516] tracking-widest uppercase block mt-0.5">
                      IN COLLABORATION WITH INSTITUTION’S INNOVATION COUNCIL (IIC) & CODE BEAST AI
                    </span>
                    <div className="h-0.5 w-36 bg-gradient-to-r from-transparent via-[#C59B27] to-transparent mx-auto mt-1" />
                  </div>

                  {/* 2. Certificate Title */}
                  <div className="text-center relative z-10 space-y-1">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                      NATIONAL CAPSTONE HACKATHON & REPOSITORY DEFENSE 2026
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#0F255C] uppercase tracking-wider font-serif">
                      Certificate of Excellence & Merit
                    </h3>
                  </div>

                  {/* 3. Recipient Citation & Team Name */}
                  <div className="text-center space-y-2 relative z-10 max-w-2xl mx-auto font-sans text-xs text-[#1E293B] leading-relaxed">
                    <p className="text-xs text-[#475569] italic">This is proudly conferred upon the engineering laureates of</p>
                    
                    <div className="border-b-2 border-[#C59B27]/60 pb-1 max-w-lg mx-auto">
                      <span className="text-2xl sm:text-3xl font-black text-[#0F255C] font-serif tracking-wider uppercase block">
                        {selectedTrophy.team}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569]">
                      Comprising: <strong className="text-[#0F255C] font-semibold">{selectedTrophy.members.join(', ') || "Project Team Members"}</strong>
                    </p>

                    <p className="text-xs text-[#475569]">
                      for meritorious distinction and technical excellence achieved in their project
                    </p>

                    {/* Repository Name & Track Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F2E9] border border-[#C59B27]/50 rounded-none shadow-2xs font-mono">
                      <span className="font-bold text-[#0F255C] text-xs">repo://{selectedTrophy.repo}</span>
                      <span className="text-[#C59B27]">•</span>
                      <span className="text-xs text-[#8A6516] font-semibold">{selectedTrophy.track}</span>
                    </div>

                    {/* Award Honor Gold Banner */}
                    <div className="pt-1">
                      <div className="inline-block px-6 py-1.5 bg-gradient-to-r from-[#F7EDD2] via-[#EED8A1] to-[#F7EDD2] border-2 border-[#C59B27] shadow-xs">
                        <span className="text-sm font-black font-serif uppercase tracking-widest text-[#0F255C]">
                          ★ {selectedTrophy.awardTitle} ★
                        </span>
                      </div>
                    </div>

                    {/* Citation Quote */}
                    <p className="text-[11px] text-[#475569] italic max-w-xl mx-auto pt-1 leading-snug">
                      &ldquo;{selectedTrophy.citation}&rdquo;
                    </p>
                  </div>

                  {/* 4. Official Signatures & 3D Gold Seal */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#C59B27]/40 items-end font-sans text-xs relative z-10">
                    
                    {/* Left Signature: Dr. Tabassum Ara */}
                    <div className="text-left space-y-1">
                      <div className="h-9 border-b border-dashed border-[#8A6516]/60 flex items-end">
                        <span className="font-serif italic text-base text-[#0F255C] font-bold">
                          Tabassum Ara
                        </span>
                      </div>
                      <strong className="block text-[#0F255C] text-xs font-serif font-bold">Dr. Tabassum Ara</strong>
                      <span className="text-[10px] text-[#475569] block leading-tight font-medium">Professor & Head of Department, AI & ML</span>
                      <span className="text-[9px] text-[#8A6516] block font-semibold">Dean, Institution’s Innovation Council (IIC)</span>
                    </div>

                    {/* Center Seal: Gold Embossed Emblem */}
                    <div className="flex flex-col items-center justify-center -translate-y-1">
                      <div className="w-18 h-18 rounded-full border-2 border-[#C59B27] bg-gradient-to-br from-[#FFF4D0] via-[#E6C66E] to-[#B38728] shadow-md flex flex-col items-center justify-center text-center p-1 relative">
                        <div className="w-15 h-15 rounded-full border border-dashed border-[#8A6516] flex flex-col items-center justify-center">
                          <Crown className="w-5 h-5 text-[#0F255C]" />
                          <span className="text-[6.5px] font-black text-[#0F255C] tracking-tighter uppercase mt-0.5 font-serif">
                            VERIFIED SEAL
                          </span>
                          <span className="text-[6px] font-bold text-[#0F255C]/80">HKBKCE · 2026</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-[#64748B] mt-1 font-semibold">Conferred: {selectedTrophy.issuedDate}</span>
                    </div>

                    {/* Right Signature: External Jury & Cryptographic ID */}
                    <div className="text-right space-y-1">
                      <div className="h-9 border-b border-dashed border-[#8A6516]/60 flex items-end justify-end">
                        <span className="font-serif italic text-base text-[#0F255C] font-bold">
                          David Chen / Jury Chair
                        </span>
                      </div>
                      <strong className="block text-[#0F255C] text-xs font-serif font-bold">Code Beast Consensus Jury</strong>
                      <span className="text-[10px] text-[#475569] block font-medium">National Hackathon Evaluation Board</span>
                      <span className="text-[9px] font-mono text-[#0F255C] block font-bold" title={selectedTrophy.verificationId}>
                        ID: {selectedTrophy.verificationId}
                      </span>
                    </div>

                  </div>

                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 font-sans text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyBadge}
                    className="px-3.5 py-2 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none flex items-center gap-1.5 transition-colors"
                  >
                    {copiedBadge ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBadge ? "Markdown Copied!" : "Copy README Badge"}</span>
                  </button>

                  <button
                    onClick={handleCopyLinkedIn}
                    className="px-3.5 py-2 bg-[#08132B] hover:bg-[#89CFF0]/20 text-white border border-[#89CFF0]/40 rounded-none flex items-center gap-1.5 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Post Copied!" : "Share on LinkedIn"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#08132B] font-bold rounded-none flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isGeneratingPdf ? "Rendering High-Res PDF..." : "Download Official PDF"}</span>
                  </button>

                  <button
                    onClick={handlePrintCertificate}
                    className="px-4 py-2 bg-[#08132B] hover:bg-[#0E2248] text-white border border-[#89CFF0]/50 font-bold rounded-none flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#89CFF0]" />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MINT / BESTOW NEW TROPHY MODAL */}
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
