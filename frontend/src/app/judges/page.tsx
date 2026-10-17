"use client";

import React, { useState } from 'react';
import { 
  Mail, 
  UserPlus, 
  Trash2, 
  Search, 
  X, 
  Users,
  Sparkles
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion-primitives';

export default function JudgesPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Technical Judge');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [judges, setJudges] = useState([
    { id: 1, name: 'Dr. Priya Sharma', email: 'priya@codebeast.ai', role: 'Head Judge', status: 'Active', avatar: 'PS' },
    { id: 2, name: 'David Chen', email: 'david@hackathon.org', role: 'Technical Judge', status: 'Active', avatar: 'DC' },
    { id: 3, name: 'Sarah Jenkins', email: 's.jenkins@university.edu', role: 'Observer', status: 'Invited', avatar: 'SJ' },
    { id: 4, name: 'Marcus Johnson', email: 'marcus.j@techcorp.com', role: 'Technical Judge', status: 'Offline', avatar: 'MJ' },
  ]);

  const handleAddJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'JD';
    const newJudge = {
      id: Date.now(),
      name,
      email,
      role,
      status: 'Invited',
      avatar: initials
    };

    setJudges([newJudge, ...judges]);
    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
  };

  const handleDeleteJudge = (id: number) => {
    setJudges(judges.filter(j => j.id !== id));
  };

  const filteredJudges = judges.filter(judge => {
    const matchesFilter = filter === 'All' ? true : judge.status === filter;
    const matchesSearch = judge.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          judge.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          judge.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <Users className="w-3.5 h-3.5" />
              Consensus Committee Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Evaluation Judges Directory
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Manage evaluation committee members, technical judges, and domain scoring permissions.
            </p>
          </div>

          <CodeBeastLiquidButton 
            onClick={() => setIsInviteModalOpen(true)}
            variant="primary"
            size="sm"
            label="Invite Evaluator"
            icon={<UserPlus className="w-4 h-4" />}
          />
        </div>
      </ScrollReveal>

      {/* 2. Directory Toolbar & Table Card */}
      <ScrollReveal direction="up" distance={20} delay={0.1}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-6">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pb-4 border-b border-[#89CFF0]/20">
            <div className="relative w-full sm:w-80">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 rounded-full focus-within:border-[#89CFF0] focus-within:ring-2 focus-within:ring-[#89CFF0]/20 transition-all shadow-inner">
                <Search className="w-4 h-4 text-[#8EA6C8] shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search judges by name or email..." 
                  className="w-full bg-transparent border-none text-xs text-white placeholder-[#8EA6C8] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs flex-wrap">
              {['All', 'Active', 'Invited', 'Offline'].map((st) => (
                <button 
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                    filter === st 
                      ? 'liquid-btn-primary text-[#040914] shadow-xs' 
                      : 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 shadow-xs'
                  }`}
                >
                  {st} ({st === 'All' ? judges.length : judges.filter(j => j.status === st).length})
                </button>
              ))}
            </div>
          </div>

          {/* Directory Table */}
          <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08132B]/80 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Evaluator Profile</th>
                    <th className="py-3 px-4">Role Authority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89CFF0]/15">
                  {filteredJudges.map((judge) => (
                    <tr key={judge.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {judge.avatar}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{judge.name}</span>
                            <span className="text-[11px] text-[#8EA6C8] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#8EA6C8]" /> {judge.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white">{judge.role}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full border shadow-xs ${
                          judge.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30' :
                          judge.status === 'Invited' ? 'bg-[#89CFF0]/15 text-[#89CFF0] border-[#89CFF0]/30' :
                          'bg-slate-500/10 text-slate-400 border-slate-400/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            judge.status === 'Active' ? 'bg-emerald-400' :
                            judge.status === 'Invited' ? 'bg-[#89CFF0]' : 'bg-slate-400'
                          }`} />
                          {judge.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteJudge(judge.id)}
                          className="text-[#8EA6C8] hover:text-rose-400 p-2 rounded-full hover:bg-white/10 transition-colors"
                          title="Remove Evaluator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
              className="liquid-glass-card rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-[0_24px_60px_rgba(2,6,18,0.9)] space-y-5 border border-[#89CFF0]/30"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
                <h3 className="text-base font-bold text-white">Invite Technical Evaluator</h3>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-[#8EA6C8] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddJudge} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white font-semibold mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Dr. Priya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="priya@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Evaluation Role</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  >
                    <option value="Head Judge">Head Judge (Consensus Override)</option>
                    <option value="Technical Judge">Technical Judge</option>
                    <option value="Security Specialist">Security Specialist</option>
                    <option value="Observer">Observer</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#89CFF0]/20">
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
                    label="Send Invitation"
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
