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
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion-primitives';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { apiUrl } from '@/lib/api';

export interface TrophyHonor {
  id: string;
  tier: 'Grand Prize' | '1st Runner Up' | '2nd Runner Up' | 'Category Award' | 'Faculty Commendation' | 'Participation Certificate';
  awardTitle: string;
  badgeIcon: 'crown' | 'trophy' | 'medal' | 'star' | 'flame' | 'cpu' | 'award';
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
    badgeIcon: "trophy",
    accentColor: "silver",
    repo: "zero-trust-vault",
    repoUrl: "https://github.com/cyber-ops/zero-trust-vault",
    team: "Cipher Guard",
    members: ["Alex Mercer", "Devon Vance", "Priya Nair"],
    track: "Cybersecurity & Infrastructure",
    score: 91.8,
    citation: "Exemplary implementation of micro-segmentation proxy with real-time CWE injection blocking and sub-millisecond cryptographic secret rotation.",
    awardedBy: "Dr. Mohammed Riyaz Ahmed",
    judgeRole: "Principal, HKBK College of Engineering",
    verificationId: "CERT-HKBK-2026-CB-8820B",
    issuedDate: "October 21, 2026"
  },
  {
    id: "trophy-03",
    tier: "2nd Runner Up",
    awardTitle: "2nd Runner Up & FinTech Innovation Medal",
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
  },
  {
    id: "trophy-07",
    tier: "Participation Certificate",
    awardTitle: "Verified Capstone Defense & Technical Participation",
    badgeIcon: "award",
    accentColor: "blue",
    repo: "distributed-consensus-raft",
    repoUrl: "https://github.com/cloud-team/distributed-consensus-raft",
    team: "Raft Core Systems",
    members: ["Kunal Sen", "Deepak Joshi"],
    track: "Distributed Systems & Cloud Computing",
    score: 84.6,
    citation: "Conferred in recognition of active participation, rigorous technical defense, and commendable engineering execution demonstrated during the Code Beast AI autonomous evaluation.",
    awardedBy: "Dr. Tabassum Ara",
    judgeRole: "Professor & Head of Department, AI & ML",
    verificationId: "CERT-HKBK-2026-CB-3312G",
    issuedDate: "October 21, 2026"
  }
];

// Generates an authentic, self-contained A4 Landscape Print Document
function generateCertificatePrintHtml(trophy: TrophyHonor): string {
  const isPart = trophy.tier === 'Participation Certificate';
  const mainHeading = isPart ? 'Certificate of Technical Defense & Participation' : 'Certificate of Excellence & Merit';
  const preamble = isPart
    ? 'for active participation, commendable engineering defense, and technical execution demonstrated in their project'
    : 'for meritorious distinction, algorithmic rigor, and architectural excellence achieved in their project';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate - ${trophy.team} - ${trophy.verificationId}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #FAF7EE;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: Georgia, 'Times New Roman', serif;
      -webkit-font-smoothing: antialiased;
    }
    .cert-page {
      width: 297mm;
      height: 210mm;
      max-width: 297mm;
      max-height: 210mm;
      padding: 12mm 14mm;
      background: #FFFDF8;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    }
    @media print {
      body {
        background: transparent !important;
      }
      .cert-page {
        box-shadow: none !important;
        width: 297mm !important;
        height: 210mm !important;
        margin: 0 !important;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
    }
    /* Classical Triple Gold Foil Borders */
    .outer-border {
      position: absolute;
      top: 6mm;
      left: 6mm;
      right: 6mm;
      bottom: 6mm;
      border: 3.5px solid #C59B27;
      pointer-events: none;
    }
    .inner-border-1 {
      position: absolute;
      top: 8.5mm;
      left: 8.5mm;
      right: 8.5mm;
      bottom: 8.5mm;
      border: 1px solid #E6C66E;
      pointer-events: none;
    }
    .inner-border-2 {
      position: absolute;
      top: 10.5mm;
      left: 10.5mm;
      right: 10.5mm;
      bottom: 10.5mm;
      border: 0.5px solid rgba(179, 135, 40, 0.4);
      pointer-events: none;
    }
    .corner-flourish {
      position: absolute;
      font-size: 20px;
      color: #C59B27;
      line-height: 1;
      font-family: Georgia, serif;
    }
    .top-left { top: 9mm; left: 10mm; }
    .top-right { top: 9mm; right: 10mm; }
    .bottom-left { bottom: 9mm; left: 10mm; }
    .bottom-right { bottom: 9mm; right: 10mm; }

    /* Security pattern */
    .bg-guilloche {
      position: absolute;
      inset: 12mm;
      opacity: 0.035;
      background-image: radial-gradient(#C59B27 1px, transparent 1px);
      background-size: 14px 14px;
      pointer-events: none;
    }

    /* Header Block */
    .header-block {
      text-align: center;
      position: relative;
      z-index: 2;
    }
    .vtu-affiliation {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 8pt;
      font-weight: 700;
      color: #8A6516;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .college-name {
      font-size: 21pt;
      font-weight: 900;
      color: #0F255C;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 1px 0;
    }
    .dept-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #334155;
      letter-spacing: 0.08em;
      margin: 1px 0;
    }
    .council-title {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #8A6516;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .divider-line {
      height: 1.5px;
      width: 140px;
      background: linear-gradient(90deg, transparent, #C59B27, transparent);
      margin: 5px auto 3px auto;
    }

    /* Title Block */
    .title-block {
      text-align: center;
      position: relative;
      z-index: 2;
      margin: 2px 0;
    }
    .competition-sub {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 8pt;
      font-weight: 800;
      color: #C59B27;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      display: block;
      margin-bottom: 1px;
    }
    .cert-heading {
      font-size: 19pt;
      font-weight: 900;
      color: #0F255C;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: 0;
    }

    /* Body Block */
    .body-block {
      text-align: center;
      position: relative;
      z-index: 2;
      max-width: 230mm;
      margin: 0 auto;
    }
    .conferred-text {
      font-size: 8.5pt;
      color: #475569;
      font-style: italic;
      margin: 2px 0;
    }
    .team-name {
      font-size: 21pt;
      font-weight: 900;
      color: #0F255C;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border-bottom: 2px solid rgba(197, 155, 39, 0.7);
      display: inline-block;
      padding: 0 16px 2px 16px;
      margin: 2px 0 3px 0;
    }
    .members-line {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 8.5pt;
      color: #475569;
      margin: 2px 0;
    }
    .members-line strong {
      color: #0F255C;
      font-weight: 700;
    }
    .citation-preamble {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 8pt;
      color: #475569;
      margin: 2px 0;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2.5px 12px;
      background: #F5F2E9;
      border: 1px solid rgba(197, 155, 39, 0.5);
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 8pt;
      color: #0F255C;
      font-weight: 700;
      margin: 3px 0;
    }
    .award-banner {
      display: inline-block;
      padding: 3.5px 18px;
      background: linear-gradient(90deg, #F9F1D8, #EED8A1, #F9F1D8);
      border: 1.5px solid #C59B27;
      color: #0F255C;
      font-size: 9.5pt;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 2px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .citation-quote {
      font-size: 8pt;
      color: #475569;
      font-style: italic;
      line-height: 1.35;
      max-width: 190mm;
      margin: 2px auto 0 auto;
    }

    /* Footer Grid */
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 130px 1fr;
      align-items: end;
      border-top: 1px solid rgba(197, 155, 39, 0.4);
      padding-top: 6px;
      position: relative;
      z-index: 2;
    }
    .sig-col {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .sig-col.left { text-align: left; }
    .sig-col.right { text-align: right; }
    .sig-line {
      height: 24px;
      border-bottom: 1px dashed rgba(138, 101, 22, 0.6);
      display: flex;
      align-items: flex-end;
      margin-bottom: 3px;
    }
    .sig-col.right .sig-line {
      justify-content: flex-end;
    }
    .script-sig {
      font-family: Georgia, cursive, serif;
      font-style: italic;
      font-size: 13pt;
      font-weight: 700;
      color: #0F255C;
      letter-spacing: 0.04em;
    }
    .sig-name {
      display: block;
      font-family: Georgia, serif;
      font-size: 9pt;
      font-weight: 800;
      color: #0F255C;
      margin-bottom: 1px;
    }
    .sig-role {
      display: block;
      font-size: 7pt;
      color: #475569;
      line-height: 1.25;
    }
    .sig-council {
      display: block;
      font-size: 6.5pt;
      color: #8A6516;
      font-weight: 700;
      line-height: 1.25;
    }
    .cert-id {
      display: block;
      font-family: monospace;
      font-size: 7pt;
      font-weight: 700;
      color: #0F255C;
      margin-top: 2px;
    }

    /* 3D Gold Medallion */
    .seal-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .gold-medal {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px solid #C59B27;
      background: radial-gradient(circle at 35% 35%, #FFF6D6, #E6C66E 50%, #B38728 85%, #8A6516);
      box-shadow: 0 4px 10px rgba(0,0,0,0.18), inset 0 0 8px rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .medal-inner {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 1px dashed #8A6516;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .medal-crown {
      font-size: 13px;
      line-height: 1;
      color: #0F255C;
    }
    .medal-text {
      font-family: Georgia, serif;
      font-size: 5pt;
      font-weight: 900;
      color: #0F255C;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 1px;
    }
    .medal-sub {
      font-size: 4.5pt;
      font-weight: 700;
      color: #0F255C;
    }
    .conferred-date {
      font-family: monospace;
      font-size: 6.5pt;
      color: #64748B;
      font-weight: 600;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div class="cert-page" id="printable-cert">
    <div class="outer-border"></div>
    <div class="inner-border-1"></div>
    <div class="inner-border-2"></div>
    <div class="corner-flourish top-left">⚜</div>
    <div class="corner-flourish top-right">⚜</div>
    <div class="corner-flourish bottom-left">⚜</div>
    <div class="corner-flourish bottom-right">⚜</div>
    <div class="bg-guilloche"></div>

    <div class="header-block">
      <div class="vtu-affiliation">Visvesvaraya Technological University Affiliated · AICTE Approved</div>
      <div class="college-name">HKBK College of Engineering</div>
      <div class="dept-title">Department of Artificial Intelligence & Machine Learning</div>
      <div class="council-title">In Collaboration with Institution’s Innovation Council (IIC) & Code Beast AI</div>
      <div class="divider-line"></div>
    </div>

    <div class="title-block">
      <span class="competition-sub">National Capstone Hackathon & Repository Defense 2026</span>
      <h1 class="cert-heading">${mainHeading}</h1>
    </div>

    <div class="body-block">
      <p class="conferred-text">This is proudly conferred upon the engineering laureates of</p>
      <div class="team-name">${trophy.team}</div>
      <div class="members-line">Comprising: <strong>${trophy.members.join(', ') || 'Project Engineering Laureates'}</strong></div>
      <div class="citation-preamble">${preamble}</div>
      
      <div class="badge-pill">
        <span>repo://${trophy.repo}</span>
        <span style="color:#C59B27">•</span>
        <span style="color:#8A6516">${trophy.track}</span>
        <span style="color:#C59B27">•</span>
        <span>${trophy.score} / 100 PTS</span>
      </div>
      <br/>
      <div class="award-banner">★ ${trophy.awardTitle} ★</div>
      
      <div class="citation-quote">“${trophy.citation}”</div>
    </div>

    <div class="footer-grid">
      <div class="sig-col left">
        <div class="sig-line">
          <span class="script-sig">Tabassum Ara</span>
        </div>
        <strong class="sig-name">Dr. Tabassum Ara</strong>
        <span class="sig-role">Professor & Head of Department, AI & ML</span>
        <span class="sig-council">Dean, Institution’s Innovation Council (IIC)</span>
      </div>

      <div class="seal-wrap">
        <div class="gold-medal">
          <div class="medal-inner">
            <span class="medal-crown">👑</span>
            <span class="medal-text">Verified Seal</span>
            <span class="medal-sub">HKBKCE · 2026</span>
          </div>
        </div>
        <span class="conferred-date">Conferred: ${trophy.issuedDate}</span>
      </div>

      <div class="sig-col right">
        <div class="sig-line">
          <span class="script-sig">Dr. Mohammed Riyaz Ahmed</span>
        </div>
        <strong class="sig-name">Dr. Mohammed Riyaz Ahmed</strong>
        <span class="sig-role">Principal, HKBK College of Engineering (HKBKCE)</span>
        <span class="sig-council">Chief Academic Authority &amp; Institutional Patron</span>
        <span class="cert-id">ID: ${trophy.verificationId}</span>
      </div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
}

// Convert a backend row into a verifiable TrophyHonor
function rowToTrophy(row: any, rank: number, cohortName: string): TrophyHonor {
  const repoName = row.repo || row.repo_name || "repository";
  const teamName = row.team || row.team_name || (repoName.split('/')[0] || "Engineering Team");
  const score = row.overall ?? row.overall_score ?? 85.0;
  const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();

  let tier: TrophyHonor['tier'] = 'Participation Certificate';
  let awardTitle = 'Verified Capstone Defense & Technical Participation';
  let badgeIcon: TrophyHonor['badgeIcon'] = 'award';
  let accentColor = 'blue';

  if (rank === 1) {
    tier = 'Grand Prize';
    awardTitle = 'Grand Prize Champion & Best Overall System';
    badgeIcon = 'crown';
    accentColor = 'gold';
  } else if (rank === 2) {
    tier = '1st Runner Up';
    awardTitle = '1st Runner Up & Security Excellence Trophy';
    badgeIcon = 'trophy';
    accentColor = 'silver';
  } else if (rank === 3) {
    tier = '2nd Runner Up';
    awardTitle = '2nd Runner Up & Architectural Innovation Medal';
    badgeIcon = 'medal';
    accentColor = 'bronze';
  }

  const track = row.track || (row.sec >= 85 ? "Cybersecurity & Micro-Segmentation" : row.arch >= 85 ? "Cloud Architecture & Scalability" : "Artificial Intelligence & Software Engineering");
  const citation = rank === 1
    ? "Awarded for exceptional architectural execution, high test coverage, deterministic quality scoring, and zero security vulnerabilities."
    : rank === 2
    ? "Exemplary implementation of robust software architecture, secure code patterns, and clean component isolation."
    : rank === 3
    ? "Flawless demonstration of computational performance, distributed data flows, and sound engineering standards."
    : "Conferred in recognition of active participation, rigorous technical defense, and commendable engineering execution demonstrated during autonomous evaluation.";

  return {
    id: `trophy-dynamic-${repoName}-${rank}`,
    tier,
    awardTitle,
    badgeIcon,
    accentColor,
    repo: repoName,
    repoUrl: `https://github.com/${repoName}`,
    team: teamName,
    members: ["Lead Submitter", "Project Contributor", "Engineering Member"],
    track,
    score: Number(score),
    citation,
    awardedBy: "Dr. Tabassum Ara",
    judgeRole: "Professor & Head of Department, AI & ML | Dean, IIC",
    verificationId: `CERT-HKBK-2026-CB-${randHex}`,
    issuedDate: "October 21, 2026"
  };
}

export default function TrophyHallPage() {
  const [cohortMode, setCohortMode] = useState<'recent' | 'batch' | 'global' | 'minted'>('recent');
  const [trophies, setTrophies] = useState<TrophyHonor[]>(INITIAL_TROPHIES);
  const [selectedTrophy, setSelectedTrophy] = useState<TrophyHonor>(INITIAL_TROPHIES[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('All Certificates');

  // Backend Data
  const [recentLeaderboard, setRecentLeaderboard] = useState<any[]>([]);
  const [recentCohortName, setRecentCohortName] = useState<string>('Recent Evaluation Session');
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [batchData, setBatchData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Fetch all cohorts data on mount
  useEffect(() => {
    Promise.all([
      fetch(apiUrl('/api/v1/stats/recent-leaderboard')).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(apiUrl('/api/v1/stats/leaderboard')).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(apiUrl('/api/v1/stats/batch-leaderboard')).then(r => r.ok ? r.json() : null).catch(() => null)
    ]).then(([recent, global, batch]) => {
      if (recent?.leaderboard) {
        setRecentLeaderboard(recent.leaderboard);
        if (recent.cohort_name) setRecentCohortName(recent.cohort_name);
      }
      if (global?.leaderboard) {
        setGlobalLeaderboard(global.leaderboard);
      }
      if (batch?.leaderboard) {
        setBatchData(batch);
      }
      setLoading(false);
    });
  }, []);

  // Check URL query param ?repo=... to auto-open certificate from Leaderboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const targetRepo = urlParams.get('repo');
      if (targetRepo) {
        const decoded = decodeURIComponent(targetRepo).toLowerCase();
        // Check in initial or create on the fly
        const found = trophies.find(t => t.repo.toLowerCase() === decoded)
          || (recentLeaderboard.length > 0 && rowToTrophy(recentLeaderboard.find(r => (r.repo || '').toLowerCase() === decoded) || { repo: targetRepo }, 4, 'Direct Lookup'))
          || rowToTrophy({ repo: targetRepo }, 4, 'Direct Lookup');

        if (found) {
          setSelectedTrophy(found);
          setIsCertModalOpen(true);
        }
      }
    }
  }, [trophies, recentLeaderboard]);

  // Compute active list of trophies based on selected cohort mode
  const currentCohortTrophies = useMemo<TrophyHonor[]>(() => {
    if (cohortMode === 'minted') {
      return trophies;
    }
    if (cohortMode === 'recent' && recentLeaderboard.length > 0) {
      return recentLeaderboard.map((r, i) => rowToTrophy(r, i + 1, recentCohortName));
    }
    if (cohortMode === 'batch' && batchData?.leaderboard?.rankings) {
      return batchData.leaderboard.rankings.map((r: any, i: number) => rowToTrophy(r, i + 1, batchData.leaderboard.batch_name || 'AI Batch Cohort'));
    }
    if (cohortMode === 'global' && globalLeaderboard.length > 0) {
      return globalLeaderboard.map((r, i) => rowToTrophy(r, i + 1, 'Global Standings'));
    }
    return trophies;
  }, [cohortMode, trophies, recentLeaderboard, recentCohortName, batchData, globalLeaderboard]);

  // Filtered by tier and search query
  const filteredTrophies = useMemo(() => {
    return currentCohortTrophies.filter(t => {
      const matchesSearch = t.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.awardTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      if (tierFilter === 'All Certificates') return true;
      if (tierFilter === 'Grand Champions') return t.tier.includes('Runner Up') || t.tier === 'Grand Prize';
      if (tierFilter === 'Participation') return t.tier === 'Participation Certificate';
      return t.tier === tierFilter;
    });
  }, [currentCohortTrophies, searchQuery, tierFilter]);

  const grandPrize = currentCohortTrophies.find(t => t.tier === 'Grand Prize') || currentCohortTrophies[0];
  const firstRunner = currentCohortTrophies.find(t => t.tier === '1st Runner Up') || currentCohortTrophies[1];
  const secondRunner = currentCohortTrophies.find(t => t.tier === '2nd Runner Up') || currentCohortTrophies[2];

  // Professional PDF Download using jsPDF & html2canvas
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
          backgroundColor: '#FFFDF8',
          windowWidth: 1000
        });
        dataUrl = canvas.toDataURL('image/png', 1.0);
      } catch (canvasErr) {
        console.warn('html2canvas capture warning:', canvasErr);
      }

      if (!dataUrl) {
        // Fallback to html-to-image with skipFonts: true
        const { toPng } = await import('html-to-image');
        dataUrl = await toPng(certElement, {
          quality: 1.0,
          pixelRatio: 2.5,
          backgroundColor: '#FFFDF8',
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
      console.error('Failed to generate PDF, falling back to print dialog:', err);
      handlePrintCertificate();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Dedicated Print Engine (A4 Landscape Isolated Print with Complete Embedded CSS)
  const handlePrintCertificate = () => {
    const printWindow = window.open('', '_blank', 'width=1150,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = generateCertificatePrintHtml(selectedTrophy);
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
    setTrophies(updated);
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
    const text = `🏆 Proud to announce that our project "${selectedTrophy.repo}" has been awarded the "${selectedTrophy.awardTitle}" at the Code Beast AI Capstone Hackathon, evaluated under Dr. Tabassum Ara (HOD, AIML) and approved by Dr. Mohammed Riyaz Ahmed (Principal, HKBKCE) at HKBK College of Engineering!\n\nVerified Certificate ID: ${selectedTrophy.verificationId}\n\n#CodeBeastAI #HackathonWinner #AIML #HKBKCE #VTU`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 text-white max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* 1. TOP HEADER & COHORT SELECTOR */}
      <ScrollReveal direction="down" distance={15}>
        <div className="space-y-4 pb-6 border-b border-[#89CFF0]/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-widest shadow-xs">
                  <Award className="w-3.5 h-3.5" />
                  Official Academic Credentials
                </span>
                <span className="text-xs text-[#8EA6C8] font-mono">Affiliated: VTU · AICTE Approved</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Digital Trophy Hall &amp; Verified Certificates
              </h1>
              <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-2xl">
                Verifiable academic honors celebrating top engineering laureates. Every participating repository receives an official, university-grade certificate signed by Dr. Tabassum Ara and consensus faculty judges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsMintModalOpen(true)}
                className="px-4 py-2 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-bold rounded-none flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Bestow Custom Honor</span>
              </button>

              <Link
                href="/leaderboard"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#040914] text-xs font-bold rounded-none flex items-center gap-2 shadow-sm transition-all hover:scale-105"
              >
                <Trophy className="w-4 h-4" />
                <span>Global Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* Cohort Tabs (Matching Leaderboard structure) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setCohortMode('recent')}
                className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  cohortMode === 'recent'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#040914] font-bold shadow-md'
                    : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recent Standings ({recentLeaderboard.length})</span>
                <span className={`w-2 h-2 rounded-full ${cohortMode === 'recent' ? 'bg-[#040914] animate-pulse' : 'bg-emerald-400'}`} />
              </button>

              <button
                onClick={() => setCohortMode('batch')}
                className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  cohortMode === 'batch'
                    ? 'bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] font-bold shadow-md'
                    : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Batch Cohort ({batchData?.leaderboard?.rankings?.length || 0})</span>
              </button>

              <button
                onClick={() => setCohortMode('global')}
                className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  cohortMode === 'global'
                    ? 'bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] font-bold shadow-md'
                    : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Global All-Time ({globalLeaderboard.length})</span>
              </button>

              <button
                onClick={() => setCohortMode('minted')}
                className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  cohortMode === 'minted'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-[#040914] font-bold shadow-md'
                    : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/25'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Special Category Honors</span>
              </button>
            </div>

            {/* Search filter within cohort */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8EA6C8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search repository or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#08132B] border border-[#89CFF0]/30 pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#8EA6C8] focus:outline-none focus:border-[#89CFF0]"
              />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. THREE PODIUM CARDS (Top 3 Laureates - NO GRANTS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Grand Champions Podium (Top 3 Laureates)</span>
          </span>
          <span className="text-xs font-mono text-[#8EA6C8]">
            {cohortMode === 'recent' ? recentCohortName : cohortMode === 'batch' ? (batchData?.leaderboard?.batch_name || 'AI Cohort') : cohortMode === 'global' ? 'Global Benchmark' : 'Mentored Honors'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
          
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
                  className="px-3.5 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
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
            <div className="liquid-glass-card rounded-none p-6 sm:p-7 border-2 border-amber-400/70 bg-gradient-to-b from-[#1E1B0E]/90 via-[#0D1E45] to-[#040914] shadow-[0_0_35px_rgba(251,191,36,0.2)] space-y-4 order-1 md:order-2 md:-translate-y-2 relative overflow-hidden group hover:border-amber-300 transition-all">
              <div className="absolute top-0 right-0 w-28 h-28 bg-amber-400/10 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400 animate-bounce" />
                  🥇 Grand Prize Champion
                </span>
                <span className="text-2xl font-black font-mono text-amber-300">{grandPrize.score} pts</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight mt-1">{grandPrize.awardTitle}</h3>
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
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#08132B] text-xs font-bold rounded-none flex items-center gap-2 shadow-sm transition-all cursor-pointer"
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
                  className="px-3.5 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* 3. COHORT PARTICIPATION CERTIFICATES & HONORS DIRECTORY */}
      <div className="space-y-4 pt-4">
        
        {/* Tier Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#89CFF0]/20">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#89CFF0]" />
              <span>Verifiable Honors &amp; Participation Credentials</span>
            </h2>
            <p className="text-xs text-[#8EA6C8] mt-0.5">
              Every evaluated repository receives an official, university-grade certificate for participation and merit.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono flex-wrap">
            {['All Certificates', 'Grand Champions', 'Participation', 'Category Award'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 border transition-colors cursor-pointer ${
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

        {/* Repositories / Certificates Grid */}
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
                      {trophy.tier === 'Participation Certificate' ? (
                        <Award className="w-4 h-4 text-emerald-400" />
                      ) : trophy.badgeIcon === 'crown' ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : trophy.badgeIcon === 'trophy' ? (
                        <Trophy className="w-4 h-4 text-[#89CFF0]" />
                      ) : (
                        <Medal className="w-4 h-4 text-amber-500" />
                      )}
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
                  <span className="text-[#8EA6C8] block font-mono">Recognized Laureates:</span>
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
                  className="px-3.5 py-1.5 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 text-xs font-semibold rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* 4. ULTRA-PREMIUM PARCHMENT CERTIFICATE MODAL & PDF EXPORT */}
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
                    <span className="text-xs text-[#8EA6C8]">Standard A4 Landscape · Full High-Definition 300 DPI Export</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="text-[#8EA6C8] hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* AUTHENTIC HIGH-DEFINITION PARCHMENT CERTIFICATE FRAME */}
              <div className="w-full overflow-x-auto flex justify-center py-2 bg-black/40 p-2 border border-[#89CFF0]/20">
                <div
                  id="printable-academic-certificate"
                  ref={certRef}
                  className="w-[900px] h-[636px] shrink-0 bg-[#FFFDF8] text-[#0A1931] p-8 sm:p-10 relative flex flex-col justify-between shadow-2xl select-none"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif"
                  }}
                >
                  
                  {/* Classical Double Gold Foil Border with Corner Scrolls */}
                  <div className="absolute inset-2 border-[3.5px] border-[#C59B27] pointer-events-none" />
                  <div className="absolute inset-3.5 border border-[#E6C66E] pointer-events-none" />
                  <div className="absolute inset-5 border border-[rgba(179,135,40,0.4)] pointer-events-none" />

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
                      DEPARTMENT OF ARTIFICIAL INTELLIGENCE &amp; MACHINE LEARNING
                    </p>
                    <span className="text-[10px] font-sans text-[#8A6516] tracking-widest uppercase block mt-0.5">
                      IN COLLABORATION WITH INSTITUTION’S INNOVATION COUNCIL (IIC) &amp; CODE BEAST AI
                    </span>
                    <div className="h-0.5 w-36 bg-gradient-to-r from-transparent via-[#C59B27] to-transparent mx-auto mt-1" />
                  </div>

                  {/* 2. Certificate Title */}
                  <div className="text-center relative z-10 space-y-1">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                      NATIONAL CAPSTONE HACKATHON &amp; REPOSITORY DEFENSE 2026
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#0F255C] uppercase tracking-wider font-serif">
                      {selectedTrophy.tier === 'Participation Certificate' ? 'Certificate of Technical Defense & Participation' : 'Certificate of Excellence & Merit'}
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
                      Comprising: <strong className="text-[#0F255C] font-semibold">{selectedTrophy.members.join(', ') || "Project Engineering Laureates"}</strong>
                    </p>

                    <p className="text-xs text-[#475569]">
                      {selectedTrophy.tier === 'Participation Certificate'
                        ? 'for active participation and successful capstone repository defense of their project'
                        : 'for meritorious distinction and technical excellence achieved in their project'}
                    </p>

                    {/* Repository Name & Track Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#F5F2E9] border border-[#C59B27]/50 rounded-none shadow-2xs font-mono">
                      <span className="font-bold text-[#0F255C] text-xs">repo://{selectedTrophy.repo}</span>
                      <span className="text-[#C59B27]">•</span>
                      <span className="text-xs text-[#8A6516] font-semibold">{selectedTrophy.track}</span>
                      <span className="text-[#C59B27]">•</span>
                      <span className="text-xs text-[#0F255C] font-bold">{selectedTrophy.score} / 100 PTS</span>
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
                      <span className="text-[10px] text-[#475569] block leading-tight font-medium">Professor &amp; Head of Department, AI &amp; ML</span>
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

                    {/* Right Signature: Dr. Mohammed Riyaz Ahmed, Principal HKBKCE */}
                    <div className="text-right space-y-1">
                      <div className="h-9 border-b border-dashed border-[#8A6516]/60 flex items-end justify-end">
                        <span className="font-serif italic text-base text-[#0F255C] font-bold">
                          Dr. Mohammed Riyaz Ahmed
                        </span>
                      </div>
                      <strong className="block text-[#0F255C] text-xs font-serif font-bold">Dr. Mohammed Riyaz Ahmed</strong>
                      <span className="text-[10px] text-[#475569] block font-medium leading-tight">Principal, HKBK College of Engineering</span>
                      <span className="text-[9px] text-[#8A6516] block font-semibold">Chief Academic Authority &amp; Institutional Patron</span>
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
                    className="px-3.5 py-2 bg-[#08132B] hover:bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/40 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedBadge ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBadge ? "Markdown Copied!" : "Copy README Badge"}</span>
                  </button>

                  <button
                    onClick={handleCopyLinkedIn}
                    className="px-3.5 py-2 bg-[#08132B] hover:bg-[#89CFF0]/20 text-white border border-[#89CFF0]/40 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
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

      {/* 5. BESTOW NEW TROPHY / COMMENDATION MODAL (NO GRANTS) */}
      <AnimatePresence>
        {isMintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border border-[#89CFF0]/30 text-white p-6 max-w-lg w-full my-auto space-y-4 shadow-xl rounded-none"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#89CFF0]" />
                  <h3 className="text-base font-bold text-white uppercase font-mono">
                    Bestow Institutional Award
                  </h3>
                </div>
                <button
                  onClick={() => setIsMintModalOpen(false)}
                  className="text-[#8EA6C8] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleMintTrophy} className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-[#8EA6C8] mb-1 font-mono uppercase text-[10px]">Recipient Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexus AI"
                    value={newTeam}
                    onChange={(e) => setNewTeam(e.target.value)}
                    className="w-full bg-[#040914] border border-[#89CFF0]/30 p-2 text-white focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="block text-[#8EA6C8] mb-1 font-mono uppercase text-[10px]">Repository Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. multi-agent-evaluator"
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    className="w-full bg-[#040914] border border-[#89CFF0]/30 p-2 text-white focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="block text-[#8EA6C8] mb-1 font-mono uppercase text-[10px]">Team Members (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Iban Nadir, Umme Misbah, Syed Imaduddin, Hadi Hameed"
                    value={newMembers}
                    onChange={(e) => setNewMembers(e.target.value)}
                    className="w-full bg-[#040914] border border-[#89CFF0]/30 p-2 text-white focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#8EA6C8] mb-1 font-mono uppercase text-[10px]">Award Tier</label>
                    <select
                      value={newTier}
                      onChange={(e) => setNewTier(e.target.value as TrophyHonor['tier'])}
                      className="w-full bg-[#040914] border border-[#89CFF0]/30 p-2 text-white focus:outline-none focus:border-[#89CFF0]"
                    >
                      <option value="Grand Prize">Grand Prize Champion</option>
                      <option value="1st Runner Up">1st Runner Up</option>
                      <option value="2nd Runner Up">2nd Runner Up</option>
                      <option value="Category Award">Category Award</option>
                      <option value="Faculty Commendation">Faculty Commendation</option>
                      <option value="Participation Certificate">Participation Certificate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#8EA6C8] mb-1 font-mono uppercase text-[10px]">Evaluation Score (0-100)</label>
                    <input
                      type="number"
                      min={60}
                      max={100}
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      className="w-full bg-[#040914] border border-[#89CFF0]/30 p-2 text-white focus:outline-none focus:border-[#89CFF0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#8EA6C8] mb-1 font-mono uppercase text-[10px]">Official Award Title</label>
                  <input
                    type="text"
                    required
                    value={newAward}
                    onChange={(e) => setNewAward(e.target.value)}
                    className="w-full bg-[#040914] border border-[#89CFF0]/30 p-2 text-white focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div>
                  <label className="block text-[#8EA6C8] mb-1 font-mono uppercase text-[10px]">Faculty Citation &amp; Evaluation Statement</label>
                  <textarea
                    rows={3}
                    placeholder="Describe why this project is receiving this commendation..."
                    value={newCitation}
                    onChange={(e) => setNewCitation(e.target.value)}
                    className="w-full bg-[#040914] border border-[#89CFF0]/30 p-2 text-white focus:outline-none focus:border-[#89CFF0]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#89CFF0]/20">
                  <button
                    type="button"
                    onClick={() => setIsMintModalOpen(false)}
                    className="px-4 py-2 bg-[#040914] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#89CFF0] hover:bg-[#70C0E8] text-[#040914] font-bold"
                  >
                    Mint &amp; Sign Honor
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
