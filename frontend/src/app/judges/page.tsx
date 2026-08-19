"use client";

import React, { useState } from 'react';
import { Mail, Shield, UserPlus, Trash2, Search, X, Sparkles, Users } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';

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
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#E07A48]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Committee Governance</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
            JUDGE <span className="text-gradient-copper">DIRECTORY</span>
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
            Manage evaluation committee members, domain roles, consensus overrides, and platform permissions.
          </p>
        </div>

        <CodeBeastLiquidButton 
          onClick={() => setIsInviteModalOpen(true)}
          variant="primary"
          size="md"
          label="INVITE JUDGE"
          hasArrow
          icon={<UserPlus className="w-4 h-4" />}
          className="self-start sm:self-auto shrink-0"
        />
      </section>

      {/* SECTION 2: Filter Toolbar & Directory Table */}
      <section>
        <TiltCard variant="primary" className="p-0 overflow-hidden shadow-2xl">
          <div className="p-5 sm:p-6 border-b border-[#E07A48]/15 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#120703]">
            <div className="relative w-full sm:w-88">
              <Search className="w-4 h-4 text-amber-200/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search judges by name, email, or role..." 
                className="bg-[#0E0602] border border-[#E07A48]/25 text-xs text-[#D4BC9A] rounded-2xl pl-11 pr-4 py-2.5 w-full outline-none focus:border-[#FF8C42] placeholder-amber-200/30 font-mono shadow-inner"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs">
              {['All', 'Active', 'Invited', 'Offline'].map((st) => (
                <button 
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider font-mono ${
                    filter === st 
                      ? 'bg-[#E07A48] text-[#0D0805] font-extrabold shadow-[0_0_12px_rgba(224,122,72,0.4)]' 
                      : 'text-amber-100/60 bg-[#0E0602] border border-[#E07A48]/15 hover:bg-[#1A0B05]'
                  }`}
                >
                  {st} ({st === 'All' ? judges.length : judges.filter(j => j.status === st).length})
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#140803] border-b border-[#E07A48]/20 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider">
                  <th className="p-5">Judge Profile</th>
                  <th className="p-5">Role Access</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E07A48]/10 text-xs">
                {filteredJudges.map((judge) => (
                  <tr key={judge.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E07A48] to-[#FF8C42] text-[#0D0805] flex items-center justify-center font-bold text-sm font-mono shadow-[0_0_15px_rgba(224,122,72,0.4)] shrink-0">
                          {judge.avatar}
                        </div>
                        <div>
                          <h4 className="text-[#D4BC9A] font-bold text-sm font-mono">{judge.name}</h4>
                          <p className="text-amber-200/50 text-xs flex items-center gap-1.5 font-mono mt-0.5">
                            <Mail className="w-3 h-3 text-[#FF8C42]" /> {judge.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-xs text-amber-100/80 font-mono font-semibold">
                        <Shield className="w-4 h-4 text-[#FF8C42]" />
                        <span>{judge.role}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 font-mono ${
                        judge.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        judge.status === 'Invited' ? 'bg-[#E07A48]/20 text-[#FF8C42] border border-[#E07A48]/30' :
                        'bg-[#261208] text-amber-200/40 border border-[#E07A48]/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          judge.status === 'Active' ? 'bg-emerald-400' :
                          judge.status === 'Invited' ? 'bg-[#FF8C42]' : 'bg-amber-200/30'
                        }`} />
                        {judge.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => handleDeleteJudge(judge.id)}
                        className="text-amber-200/40 hover:text-red-400 p-2 transition-colors rounded-xl hover:bg-red-500/10"
                        title="Remove Judge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TiltCard>
      </section>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070402]/90 backdrop-blur-md">
          <TiltCard variant="hero" className="w-full max-w-md p-7 shadow-2xl relative">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 text-amber-200/40 hover:text-[#D4BC9A]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-display text-2xl text-[#D4BC9A] uppercase tracking-wider font-normal">Invite Evaluator</h3>
              <p className="text-xs text-amber-100/60 mt-1 font-normal">Send an invitation to join the hackathon evaluation committee.</p>
            </div>

            <form onSubmit={handleAddJudge} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-amber-200/60 block">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dr. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0E0602] border border-[#E07A48]/30 rounded-xl px-4 py-2.5 text-xs text-[#D4BC9A] focus:outline-none focus:border-[#FF8C42] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-amber-200/60 block">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. jane@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0E0602] border border-[#E07A48]/30 rounded-xl px-4 py-2.5 text-xs text-[#D4BC9A] focus:outline-none focus:border-[#FF8C42] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-amber-200/60 block">Committee Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0E0602] border border-[#E07A48]/30 rounded-xl px-3 py-2.5 text-xs text-[#D4BC9A] focus:outline-none focus:border-[#FF8C42] font-mono"
                >
                  <option value="Head Judge">Head Judge (Supervisor Override)</option>
                  <option value="Technical Judge">Technical Judge (Domain Reviewer)</option>
                  <option value="Observer">Observer (Read-Only Telemetry)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-amber-200/60 hover:text-[#D4BC9A]"
                >
                  Cancel
                </button>
                <CodeBeastLiquidButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  label="SEND INVITATION"
                  hasArrow
                />
              </div>
            </form>
          </TiltCard>
        </div>
      )}

    </div>
  );
}
