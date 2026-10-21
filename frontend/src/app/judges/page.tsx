"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  UserPlus, 
  Trash2, 
  Search, 
  X, 
  Users,
  Sparkles,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Building,
  KeyRound,
  Layers,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';

export interface JudgeMember {
  id: number | string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  domains: string[];
  status: 'Active' | 'Invited' | 'Offline';
  avatar: string;
  assignedAuditsCount: number;
}

const INITIAL_JUDGES: JudgeMember[] = [
  { 
    id: 1, 
    name: 'Dr. Priya Sharma', 
    email: 'priya@codebeast.ai', 
    role: 'Head Judge', 
    institution: 'University Dept. of Computer Science',
    domains: ['Consensus Override', 'Security CWE', 'Architecture'],
    status: 'Active', 
    avatar: 'PS',
    assignedAuditsCount: 14
  },
  { 
    id: 2, 
    name: 'David Chen', 
    email: 'david@hackathon.org', 
    role: 'Technical Judge', 
    institution: 'National Hackathon Committee',
    domains: ['Performance', 'Testing QA', 'Database'],
    status: 'Active', 
    avatar: 'DC',
    assignedAuditsCount: 11
  },
  { 
    id: 3, 
    name: 'Sarah Jenkins', 
    email: 's.jenkins@university.edu', 
    role: 'Academic Observer', 
    institution: 'Capstone Evaluation Board',
    domains: ['Read-Only Audit', 'Plagiarism Verification'],
    status: 'Invited', 
    avatar: 'SJ',
    assignedAuditsCount: 6
  },
  { 
    id: 4, 
    name: 'Marcus Johnson', 
    email: 'marcus.j@techcorp.com', 
    role: 'Security Specialist', 
    institution: 'CyberDefense Labs',
    domains: ['AutoReview CWE', 'Static Injection Flaws'],
    status: 'Offline', 
    avatar: 'MJ',
    assignedAuditsCount: 8
  },
];

export default function JudgesPage() {
  const [judges, setJudges] = useState<JudgeMember[]>(INITIAL_JUDGES);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Technical Judge');
  const [institution, setInstitution] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['Security CWE', 'Architecture']);

  // Filters
  const [filter, setFilter] = useState<'All' | 'Active' | 'Invited' | 'Offline'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Load from localStorage for persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('codebeast_judges_directory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJudges(parsed);
        }
      }
    } catch (e) {}
  }, []);

  // 2. Persist to localStorage whenever judges change
  const saveJudges = (updated: JudgeMember[]) => {
    setJudges(updated);
    try {
      localStorage.setItem('codebeast_judges_directory', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleToggleDomain = (domain: string) => {
    setSelectedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    );
  };

  const handleAddJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'JD';

    const newJudge: JudgeMember = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role,
      institution: institution.trim() || 'Academic Faculty / Industry Evaluator',
      domains: selectedDomains.length > 0 ? selectedDomains : ['General Code Quality'],
      status: 'Invited',
      avatar: initials,
      assignedAuditsCount: 0
    };

    const updated = [newJudge, ...judges];
    saveJudges(updated);

    setName('');
    setEmail('');
    setInstitution('');
    setSelectedDomains(['Security CWE', 'Architecture']);
    setIsInviteModalOpen(false);
  };

  const handleDeleteJudge = (id: number | string) => {
    const updated = judges.filter(j => j.id !== id);
    saveJudges(updated);
  };

  const handleToggleStatus = (id: number | string) => {
    const statusCycle: Record<JudgeMember['status'], JudgeMember['status']> = {
      Active: 'Offline',
      Offline: 'Invited',
      Invited: 'Active'
    };
    const updated = judges.map(j => {
      if (j.id === id) {
        return { ...j, status: statusCycle[j.status] };
      }
      return j;
    });
    saveJudges(updated);
  };

  const handleCopyInviteLink = (judge: JudgeMember) => {
    const fakeToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const url = `${typeof window !== 'undefined' ? window.location.origin : 'https://codebeast.ai'}/judges/invite?token=CB-${fakeToken}&evaluator=${encodeURIComponent(judge.email)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(judge.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const filteredJudges = judges.filter(judge => {
    const matchesFilter = filter === 'All' ? true : judge.status === filter;
    const matchesSearch = 
      judge.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      judge.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      judge.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (judge.institution && judge.institution.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const activeCount = judges.filter(j => j.status === 'Active').length;
  const invitedCount = judges.filter(j => j.status === 'Invited').length;
  const offlineCount = judges.filter(j => j.status === 'Offline').length;

  return (
    <div className="space-y-8 pb-16 text-white max-w-7xl mx-auto">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2.5">
              <Users className="w-3.5 h-3.5 text-[#89CFF0]" />
              Consensus Committee Administration
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Evaluation Judges & Committee Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-3xl leading-relaxed">
              Configure human-in-the-loop technical evaluators, head judges, and academic observers who oversee ConsJudge multi-agent scoring consensus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-[#89CFF0] border border-[#89CFF0]/30 rounded-xl transition-all flex items-center gap-2 shadow-xs"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showGuide ? "Hide Purpose Guide" : "What is this used for?"}</span>
            </button>
            <CodeBeastLiquidButton 
              onClick={() => setIsInviteModalOpen(true)}
              variant="primary"
              size="sm"
              label="Invite Evaluator"
              icon={<UserPlus className="w-4 h-4" />}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* 2. "What Is It Used For?" Purpose & Architectural Guide */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-7 border border-[#89CFF0]/30 bg-gradient-to-br from-[#08132B]/90 via-[#0A1B3B]/80 to-[#030816]/95 shadow-[0_12px_40px_rgba(2,6,18,0.7)] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
                <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#89CFF0]" />
                  <span>Why This Directory Exists & Real-World Use Cases</span>
                </div>
                <span className="text-[11px] text-[#89CFF0] bg-[#08132B] px-3 py-1 rounded-full border border-[#89CFF0]/30 font-medium">
                  Academic & Enterprise Governance
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[#8EA6C8]">
                <div className="bg-[#040914]/60 p-4 rounded-2xl border border-[#89CFF0]/15 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>1. Academic Capstone & Defense</span>
                  </div>
                  <p className="leading-relaxed">
                    In university major project reviews, grading cannot rely on AI alone. Professors and external faculty join as <strong>Head Judges</strong> or <strong>Observers</strong> to verify AI-flagged plagiarism and sign off on verified grades.
                  </p>
                </div>

                <div className="bg-[#040914]/60 p-4 rounded-2xl border border-[#89CFF0]/15 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Layers className="w-4 h-4 text-[#89CFF0]" />
                    <span>2. Hackathon Judging Panels</span>
                  </div>
                  <p className="leading-relaxed">
                    Different judges specialize in different domains. Assign a <strong>Security Specialist</strong> to inspect CWE injection flaws, while an <strong>Architecture Judge</strong> inspects SOLID modularity and system design.
                  </p>
                </div>

                <div className="bg-[#040914]/60 p-4 rounded-2xl border border-[#89CFF0]/15 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>3. ConsJudge Consensus Quorum</span>
                  </div>
                  <p className="leading-relaxed">
                    Eliminates individual human bias. When multi-agent scores and human evaluations exhibit a high variance margin (&gt; 4.0 pts), a <strong>Quorum of 2+ Active Judges</strong> is triggered to break the tie and ratify the leaderboard.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Live Governance Telemetry Metric Cards */}
      <StaggerContainer staggerDelay={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-5 border border-[#89CFF0]/25 shadow-md space-y-2">
            <div className="flex items-center justify-between text-[#8EA6C8] text-xs">
              <span>Total Committee</span>
              <Users className="w-4 h-4 text-[#89CFF0]" />
            </div>
            <div className="text-2xl font-black text-white">{judges.length} Evaluators</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeCount} active in session</span>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-5 border border-[#89CFF0]/25 shadow-md space-y-2">
            <div className="flex items-center justify-between text-[#8EA6C8] text-xs">
              <span>Consensus Quorum</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">Quorum Valid</div>
            <div className="text-[11px] text-[#8EA6C8]">
              Min 2 votes required for tie-break
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-5 border border-[#89CFF0]/25 shadow-md space-y-2">
            <div className="flex items-center justify-between text-[#8EA6C8] text-xs">
              <span>Pending Invitations</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{invitedCount} Pending</div>
            <div className="text-[11px] text-[#89CFF0] font-medium">
              Secure access links active
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-card rounded-2xl p-5 border border-[#89CFF0]/25 shadow-md space-y-2">
            <div className="flex items-center justify-between text-[#8EA6C8] text-xs">
              <span>Total Audits Overseen</span>
              <Award className="w-4 h-4 text-[#89CFF0]" />
            </div>
            <div className="text-2xl font-black text-white">
              {judges.reduce((sum, j) => sum + (j.assignedAuditsCount || 0), 0)} Repos
            </div>
            <div className="text-[11px] text-[#8EA6C8]">
              Certified by ConsJudge Committee
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* 4. Directory Toolbar & Table Card */}
      <ScrollReveal direction="up" distance={20} delay={0.1}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-6 border border-[#89CFF0]/25">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-[#89CFF0]/20">
            <div className="relative w-full sm:w-80">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 rounded-full focus-within:border-[#89CFF0] focus-within:ring-2 focus-within:ring-[#89CFF0]/20 transition-all shadow-inner">
                <Search className="w-4 h-4 text-[#8EA6C8] shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search judges by name, email, role, university..." 
                  className="w-full bg-transparent border-none text-xs text-white placeholder-[#8EA6C8] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs flex-wrap">
              {(['All', 'Active', 'Invited', 'Offline'] as const).map((st) => (
                <button 
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    filter === st 
                      ? 'liquid-btn-primary text-[#040914] shadow-xs' 
                      : 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 shadow-xs'
                  }`}
                >
                  {st} ({
                    st === 'All' ? judges.length :
                    st === 'Active' ? activeCount :
                    st === 'Invited' ? invitedCount : offlineCount
                  })
                </button>
              ))}
            </div>
          </div>

          {/* Directory Table */}
          <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs bg-[#040914]/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08132B]/90 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Evaluator Profile</th>
                    <th className="py-3.5 px-4">Role Authority</th>
                    <th className="py-3.5 px-4">Domain Oversight</th>
                    <th className="py-3.5 px-4">Status (Click to toggle)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89CFF0]/15">
                  {filteredJudges.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#8EA6C8]">
                        <Users className="w-8 h-8 text-[#89CFF0]/40 mx-auto mb-2" />
                        <p className="font-semibold text-white">No evaluators match this filter</p>
                        <p className="text-[11px] mt-1">Try clearing your search query or invite a new judge.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredJudges.map((judge) => (
                      <tr key={judge.id} className="hover:bg-white/5 transition-colors group">
                        
                        {/* Profile Column */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                              {judge.avatar}
                            </div>
                            <div>
                              <span className="font-bold text-white block text-sm">{judge.name}</span>
                              <span className="text-[11px] text-[#8EA6C8] flex items-center gap-1.5 mt-0.5">
                                <Mail className="w-3 h-3 text-[#89CFF0]/60 shrink-0" /> {judge.email}
                              </span>
                              {judge.institution && (
                                <span className="text-[10px] text-[#8EA6C8]/80 flex items-center gap-1 mt-0.5">
                                  <Building className="w-2.5 h-2.5 text-[#8EA6C8]/60 shrink-0" /> {judge.institution}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role Authority Column */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className={`inline-block font-semibold px-2.5 py-0.5 rounded-md text-[11px] border ${
                              judge.role === 'Head Judge'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-400/30 font-bold'
                                : judge.role === 'Security Specialist'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-400/30'
                                : 'bg-[#08132B] text-[#BAE6FD] border-[#89CFF0]/25'
                            }`}>
                              {judge.role}
                            </span>
                            <div className="text-[10px] text-[#8EA6C8]">
                              {judge.assignedAuditsCount} audits overseen
                            </div>
                          </div>
                        </td>

                        {/* Domain Oversight Column */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {judge.domains.map((dom, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 rounded-full bg-[#08132B] border border-[#89CFF0]/25 text-[10px] text-[#89CFF0]"
                              >
                                {dom}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Status Column (Interactive click to cycle status) */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleStatus(judge.id)}
                            title="Click to change status"
                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full border shadow-xs cursor-pointer hover:scale-105 transition-all ${
                              judge.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/20' 
                                : judge.status === 'Invited' 
                                ? 'bg-[#89CFF0]/15 text-[#89CFF0] border-[#89CFF0]/30 hover:bg-[#89CFF0]/25' 
                                : 'bg-slate-500/10 text-slate-400 border-slate-400/30 hover:bg-slate-500/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              judge.status === 'Active' ? 'bg-emerald-400 animate-pulse' :
                              judge.status === 'Invited' ? 'bg-[#89CFF0]' : 'bg-slate-400'
                            }`} />
                            <span>{judge.status}</span>
                          </button>
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Copy Invite Link */}
                            <button
                              onClick={() => handleCopyInviteLink(judge)}
                              className="text-[#8EA6C8] hover:text-[#89CFF0] p-2 rounded-xl hover:bg-white/10 transition-colors"
                              title="Copy Secure Evaluator Token Link"
                            >
                              {copiedId === judge.id ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>

                            {/* Delete Judge */}
                            <button 
                              onClick={() => handleDeleteJudge(judge.id)}
                              className="text-[#8EA6C8] hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors"
                              title="Remove Evaluator from Committee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </ScrollReveal>

      {/* Modal Dialog for Inviting Judge */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040914]/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="liquid-glass-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_24px_60px_rgba(2,6,18,0.9)] space-y-5 border border-[#89CFF0]/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#89CFF0]" />
                  <h3 className="text-base font-bold text-white">Invite Evaluation Committee Member</h3>
                </div>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-[#8EA6C8] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddJudge} className="space-y-4 text-xs">
                
                <div>
                  <label className="block text-white font-semibold mb-1.5">Evaluator Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Prof. Arvind Subramanian"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Institutional Email Address *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="arvind@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Institution / Department / Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dept. of Computer Science & Engineering"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Committee Authority Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  >
                    <option value="Head Judge">Head Judge (Score Override & Quorum Certification)</option>
                    <option value="Technical Judge">Technical Judge (Domain Scoring & Code Review)</option>
                    <option value="Security Specialist">Security Specialist (CWE Vulnerability Audit)</option>
                    <option value="Academic Observer">Academic Observer (Read-Only Audit & Verification)</option>
                  </select>
                </div>

                {/* Domain Specialties Checkboxes */}
                <div>
                  <label className="block text-white font-semibold mb-1.5">Assigned Domain Rubrics</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Security CWE', 
                      'Architecture', 
                      'Performance', 
                      'Testing QA', 
                      'Database', 
                      'Plagiarism Verification'
                    ].map((dom) => (
                      <label 
                        key={dom}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                          selectedDomains.includes(dom)
                            ? 'bg-[#89CFF0]/15 border-[#89CFF0] text-white'
                            : 'bg-[#08132B] border-[#89CFF0]/20 text-[#8EA6C8]'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={selectedDomains.includes(dom)}
                          onChange={() => handleToggleDomain(dom)}
                          className="rounded border-[#89CFF0]/30 text-[#89CFF0] focus:ring-0"
                        />
                        <span className="text-[11px]">{dom}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#89CFF0]/20">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 rounded-full shadow-xs transition-all"
                  >
                    Cancel
                  </button>
                  <CodeBeastLiquidButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    label="Issue Evaluator Credentials"
                    icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  />
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
