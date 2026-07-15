"use client";

import React, { useState } from 'react';
import { Users, Mail, Shield, UserPlus, MoreHorizontal, Search } from 'lucide-react';

export default function JudgesPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const judges = [
    { id: 1, name: 'Priya Sharma', email: 'priya@codebeast.ai', role: 'Head Judge', status: 'Active', avatar: 'PS' },
    { id: 2, name: 'David Chen', email: 'david@hackathon.org', role: 'Technical Judge', status: 'Active', avatar: 'DC' },
    { id: 3, name: 'Sarah Jenkins', email: 's.jenkins@university.edu', role: 'Observer', status: 'Invited', avatar: 'SJ' },
    { id: 4, name: 'Marcus Johnson', email: 'marcus.j@techcorp.com', role: 'Technical Judge', status: 'Offline', avatar: 'MJ' },
  ];

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Judge Directory</h1>
          <p className="text-gray-400 text-sm mt-1">Manage team members, roles, and platform access.</p>
        </div>
        <button 
          onClick={() => { setIsInviteModalOpen(true); setInviteSent(false); setInviteEmail(''); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite Judge
        </button>
      </div>

      <div className="bg-[#141C2F] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search judges by name or email..." 
              className="bg-[#0A0E17] border border-gray-700 text-sm text-white rounded-lg pl-9 pr-4 py-2 w-80 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-gray-400 px-3 py-1 bg-gray-800/50 rounded-lg cursor-pointer">All (4)</span>
            <span className="text-gray-500 px-3 py-1 hover:bg-gray-800/30 rounded-lg cursor-pointer">Active (2)</span>
            <span className="text-gray-500 px-3 py-1 hover:bg-gray-800/30 rounded-lg cursor-pointer">Invited (1)</span>
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
            {judges.map((judge) => (
              <tr key={judge.id} className="text-sm hover:bg-[#1A233A] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-900/50 text-blue-300 flex items-center justify-center font-bold border border-blue-800">
                      {judge.avatar}
                    </div>
                    <div>
                      <div className="text-white font-medium">{judge.name}</div>
                      <div className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {judge.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">{judge.role}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit font-medium text-xs ${
                    judge.status === 'Active' ? 'text-green-400 bg-green-400/10' :
                    judge.status === 'Invited' ? 'text-yellow-400 bg-yellow-400/10' :
                    'text-gray-400 bg-gray-400/10'
                  }`}>
                    {judge.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>}
                    {judge.status === 'Invited' && <Mail className="w-3 h-3" />}
                    {judge.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[#141C2F] border border-gray-800 rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-2">Invite New Judge</h2>
            <p className="text-sm text-gray-400 mb-6">Send an email invitation to add a new judge to the platform.</p>
            
            {inviteSent ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-white font-medium mb-1">Invitation Sent!</h3>
                <p className="text-sm text-gray-400">They will receive an email shortly.</p>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="mt-6 w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="judge@example.com"
                    className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1.5">Role</label>
                  <select className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-500 text-sm">
                    <option>Technical Judge</option>
                    <option>Design Judge</option>
                    <option>Observer</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 bg-transparent border border-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if(inviteEmail) setInviteSent(true);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
