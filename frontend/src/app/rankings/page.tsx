"use client";
import React, { useEffect, useState } from 'react';
import { Trophy, Download } from 'lucide-react';

export default function RankingsPage() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/leaderboard')
      .then(res => res.json())
      .then(data => setLeaderboard(data.leaderboard || []))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard & Rankings</h1>
          <p className="text-gray-400 text-sm mt-1">Live standings across every submitted repository.</p>
        </div>
      </div>

      {/* Top 3 Podiums */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        {leaderboard.slice(0, 3).map((job: any, idx) => (
          <div key={idx} className={`bg-gradient-to-br from-[#141C2F] to-[#0A0E17] border ${idx === 0 ? 'border-blue-900/30' : 'border-gray-800'} rounded-xl p-8 relative overflow-hidden flex flex-col justify-between h-[250px]`}>
            <div className="absolute top-0 right-0 p-8 text-8xl font-black text-white/5 -z-0 select-none tracking-tighter">#{idx + 1}</div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-4 z-10 ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'border-2 border-gray-600 text-gray-400' : 'border-2 border-orange-700/50 text-orange-600'}`}>
              <Trophy className="w-6 h-6" />
            </div>
            <div className="z-10">
              <h3 className="text-2xl font-bold text-white">{job.repo}</h3>
              <p className="text-sm text-gray-500 mb-6">{job.team}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Overall</p>
                  <p className="text-5xl font-black text-white">{job.overall}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-800 bg-[#0A0E17] mt-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0A0E17]">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team / Repository</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Overall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {leaderboard.map((row: any) => (
              <tr key={row.rank} className="hover:bg-[#141C2F]/50 transition-colors group">
                <td className="p-4 font-bold text-gray-400">{row.rank}</td>
                <td className="p-4">
                  <div className="font-medium text-sm text-white">{row.repo}</div>
                  <div className="text-xs text-gray-500">{row.team}</div>
                </td>
                <td className="p-4 text-center font-bold text-lg text-emerald-400">{row.overall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
