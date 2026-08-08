"use client";

import React, { useState } from 'react';
import { Users, Mail, Shield, UserPlus, Trash2, Search, CheckCircle2, X } from 'lucide-react';

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
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Judge Directory</h1>
          <p className="text-gray-400 text-sm mt-1">Manage evaluation committee members, domain roles, and platform permissions.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          <UserPlus className="w-4 h-4" /> Invite Judge
        </button>
      </div>

      <div className="bg-[#141C2F] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search judges by name, email, or role..." 
              className="bg-[#0A0E17] border border-gray-700 text-sm text-white rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 text-xs">
            {['All', 'Active', 'Invited', 'Offline'].map((st) => (
              <button 
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  filter === st 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-400 hover:bg-gray-800/40'
                }`}
              >
                {st} ({st === 'All' ? judges.length : judges.filter(j => j.status === st).length})
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/30 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="p-4 font-medium">Judge Profile</th>
              <th className="p-4 font-medium">Role Access</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredJudges.map((judge) => (
              <tr key={judge.id} className="text-sm hover:bg-[#1A233A] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                      {judge.avatar}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{judge.name}</h4>
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {judge.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span>{judge.role}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${
                    judge.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-500/20' :
                    judge.status === 'Invited' ? 'bg-amber-400/10 text-amber-400 border border-amber-500/20' :
                    'bg-gray-700/30 text-gray-400 border border-gray-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      judge.status === 'Active' ? 'bg-emerald-400' :
                      judge.status === 'Invited' ? 'bg-amber-400' : 'bg-gray-500'
                    }`}></span>
                    {judge.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDeleteJudge(judge.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Remove Judge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredJudges.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                  No judges match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141C2F] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Invite New Judge</h3>
            <p className="text-gray-400 text-xs mb-6">Send an invitation email to add an evaluator to the hackathon committee.</p>

            <form onSubmit={handleAddJudge} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan" 
                  className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@hackathon.org" 
                  className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 block mb-1.5">Evaluation Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option>Technical Judge</option>
                  <option>Head Judge</option>
                  <option>Security Specialist</option>
                  <option>Observer</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                <button 
                  type="button" 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
