"use client";
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { CheckCircle2, ShieldAlert, Award, FileCode, Trophy, Activity, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ submitted: 0, analyzed: 0, running: 0, avg_score: 0, highest: 0, failed: 0 });
  const [pieData, setPieData] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setPieData(data.pieData);
      })
      .catch(err => console.error(err));
      
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/history')
      .then(res => res.json())
      .then(data => setHistory((data.history || []).slice(0, 5)))
      .catch(err => console.error(err));
  }, []);

  // Mock area data for now until we have time series
  const areaDataTop = [
    { name: 'D1', score: 60, prev: 50 }, { name: 'D2', score: 65, prev: 55 }, { name: 'D3', score: 80, prev: 60 }, { name: 'D4', score: 75, prev: 70 },
    { name: 'D5', score: 85, prev: 72 }, { name: 'D6', score: 88, prev: 75 }, { name: 'D7', score: 90, prev: 80 }, { name: 'D8', score: 95, prev: 82 }
  ];

  const safePieData = pieData.length > 0 ? pieData : [
    { name: 'TypeScript', value: 45, color: '#3178c6' },
    { name: 'Python', value: 30, color: '#3572A5' },
    { name: 'Go', value: 15, color: '#00ADD8' },
    { name: 'Rust', value: 10, color: '#dea584' }
  ];

  const radarData = [
    { subject: 'Security', A: 85, fullMark: 100 },
    { subject: 'Architecture', A: 78, fullMark: 100 },
    { subject: 'Performance', A: 92, fullMark: 100 },
    { subject: 'Testing', A: 65, fullMark: 100 },
    { subject: 'Database', A: 70, fullMark: 100 },
    { subject: 'Originality', A: 95, fullMark: 100 },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hackathon Command Center</h1>
          <p className="text-gray-400 text-sm mt-1">Live overview of all repository submissions, analyses and judge activity.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#141C2F] border border-gray-800 rounded-md text-sm font-medium hover:bg-gray-800 transition">
            Upload CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
            Analyze repo ↗
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "SUBMITTED", value: stats.submitted, subtitle: "Total", icon: FileCode, color: "text-blue-400", bg: "bg-blue-900/20" },
          { title: "ANALYZED", value: stats.analyzed, subtitle: "Completed runs", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-900/20" },
          { title: "RUNNING", value: stats.running, subtitle: "Active workers", icon: Activity, color: "text-blue-400", bg: "bg-blue-900/20" },
          { title: "AVG SCORE", value: stats.avg_score, subtitle: "Across all", icon: Award, color: "text-emerald-400", bg: "bg-emerald-900/20" },
          { title: "HIGHEST", value: stats.highest, subtitle: "Top score", icon: Trophy, color: "text-yellow-400", bg: "bg-yellow-900/20" },
          { title: "FAILED", value: stats.failed, subtitle: "Needs retry", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-900/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D121F] border border-gray-800/60 p-5 rounded-xl hover:scale-[1.02] hover:border-gray-700 transition-all cursor-default shadow-lg hover:shadow-xl relative overflow-hidden group">
            {/* Subtle background glow on hover */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${stat.bg.replace('/20', '')}`} />
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                <p className="text-gray-400 text-xs mt-1">{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg} shadow-inner`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#0D121F] border border-gray-800/60 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold">Repository analysis over time</h3>
              <p className="text-xs text-gray-500">Analyses completed and rolling average score</p>
            </div>
            <div className="flex gap-2">
              {['7d', '14d', '30d'].map(d => (
                <button key={d} className={`px-2 py-1 text-xs rounded ${d === '14d' ? 'bg-[#141C2F] text-white' : 'text-gray-500 hover:text-white'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaDataTop} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4B5563" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4B5563" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                {/* <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} /> */}
                <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#141C2F', borderColor: '#374151', borderRadius: '8px' }} itemStyle={{ color: '#E5E7EB' }} />
                <Area type="monotone" dataKey="prev" stroke="#4B5563" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPrev)" name="Previous Week" />
                <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Current Week" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0D121F] border border-gray-800/60 p-5 rounded-xl">
          <h3 className="font-semibold mb-6">Language distribution</h3>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ backgroundColor: '#141C2F', borderColor: '#374151', borderRadius: '8px' }} itemStyle={{ color: '#E5E7EB' }} />
                <Pie data={safePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                  {safePieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#8B5CF6'} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {safePieData.map((d: any) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color || '#8B5CF6' }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-[#0D121F] border border-gray-800/60 p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Recent uploads</h3>
            <span className="text-xs text-gray-500 hover:text-white cursor-pointer">View all</span>
          </div>
          <div className="space-y-3">
             {history.map((row: any, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-800/50 bg-[#141C2F]/50">
                 <div className="flex items-center gap-3">
                   <FileCode className="w-4 h-4 text-gray-500" />
                   <div>
                     <h4 className="text-sm font-medium">{row.repo}</h4>
                     <p className="text-xs text-gray-500">{row.team} · {row.lang}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-900/20 text-emerald-400 text-xs font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {row.status}
                   </div>
                   <span className="text-xl font-bold text-blue-400 w-8 text-right">{row.overall}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="col-span-1 bg-[#0D121F] border border-gray-800/60 p-5 rounded-xl">
          <h3 className="font-semibold mb-6">Average Agent Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Agents" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                <Tooltip contentStyle={{ backgroundColor: '#141C2F', borderColor: '#374151', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
