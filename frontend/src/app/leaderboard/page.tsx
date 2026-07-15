"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Database, Layout, Code2, Zap } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/leaderboard')
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const renderBadges = (row: any) => {
    const badges = [];
    if (row.sec >= 90) badges.push({ name: 'Fort Knox', icon: Shield, color: 'text-blue-400 bg-blue-900/20 border-blue-900/50' });
    if (row.arch >= 90) badges.push({ name: 'Clean Coder', icon: Layout, color: 'text-emerald-400 bg-emerald-900/20 border-emerald-900/50' });
    if (row.perf >= 90) badges.push({ name: 'Perf Master', icon: Zap, color: 'text-amber-400 bg-amber-900/20 border-amber-900/50' });
    if (row.testing_score >= 90) badges.push({ name: 'Test Driven', icon: Code2, color: 'text-red-400 bg-red-900/20 border-red-900/50' });
    if (row.db_score >= 90) badges.push({ name: 'Data Wizard', icon: Database, color: 'text-cyan-400 bg-cyan-900/20 border-cyan-900/50' });
    
    if (badges.length === 0) return <span className="text-gray-600 text-xs italic">No Badges</span>;
    
    return (
      <div className="flex gap-2 flex-wrap">
        {badges.map((b, i) => (
          <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${b.color}`}>
            <b.icon className="w-3 h-3" />
            {b.name}
          </div>
        ))}
      </div>
    );
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    if (rank === 2) return 'text-gray-300 bg-gray-400/10 border-gray-400/20';
    if (rank === 3) return 'text-amber-600 bg-amber-600/10 border-amber-600/20';
    return 'text-gray-500 bg-transparent border-transparent';
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            Global Leaderboard
          </h1>
          <p className="text-gray-400 text-base mt-2">Live rankings of all evaluated hackathon submissions.</p>
        </div>
      </div>

      <div className="bg-[#0A0E17] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-gray-800 border-t-blue-500 rounded-full animate-spin mb-4" />
            Loading Leaderboard...
          </div>
        ) : leaderboard.length === 0 ? (
           <div className="p-12 text-center text-gray-500">
             No evaluated repositories found yet.
           </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141C2F] border-b border-gray-800">
                <th className="p-5 text-sm font-semibold text-gray-400 uppercase tracking-wider w-20 text-center">Rank</th>
                <th className="p-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Repository / Team</th>
                <th className="p-5 text-sm font-semibold text-gray-400 uppercase tracking-wider text-center">Overall</th>
                <th className="p-5 text-sm font-semibold text-gray-400 uppercase tracking-wider">Special Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {leaderboard.map((row) => (
                <tr key={row.rank} className="hover:bg-[#1A233A] transition-colors group">
                  <td className="p-5 text-center">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full border text-lg font-bold ${getRankStyle(row.rank)}`}>
                      {row.rank}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-white text-lg">{row.repo}</div>
                    <div className="text-sm text-gray-500 mt-1">Team: <span className="text-blue-400">{row.team}</span></div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="text-3xl font-black text-white drop-shadow-md">{row.overall}</span>
                  </td>
                  <td className="p-5">
                    {renderBadges(row)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
