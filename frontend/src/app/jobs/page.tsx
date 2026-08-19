"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Clock, PlayCircle, XCircle, CheckCircle2, Sparkles, Cpu, Layers } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchJobs = () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    fetch(`http://${host}:8000/api/v1/stats/history`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const h = data?.history || [];
        const formattedJobs = h.map((job: any) => ({
          id: 'job-' + Math.random().toString(36).substr(2, 6),
          repo: job.repo,
          status: job.status,
          progress: job.status === 'Completed' ? 100 : job.status === 'Failed' ? 0 : job.status === 'Running' ? 45 : 0,
          time: job.submitted || 'recently',
          agent: job.status === 'Completed' ? 'Done' : job.status === 'Running' ? 'Analyzing Codebase...' : 'Waiting in Queue'
        }));
        setJobs(formattedJobs);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'text-[#FF8C42] bg-[#E07A48]/20 border border-[#E07A48]/40';
      case 'Completed': return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
      case 'Failed': return 'text-red-400 bg-red-500/10 border border-red-500/20';
      default: return 'text-amber-200/50 bg-[#261208] border border-[#E07A48]/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running': return <PlayCircle className="w-4 h-4 text-[#FF8C42] animate-spin" />;
      case 'Completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'Failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const activeCount = jobs.filter((j) => j.status === 'Running').length;
  const queuedCount = jobs.filter((j) => j.status === 'Queued').length;

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#E07A48]/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
            <Activity className="w-3.5 h-3.5 text-[#FF8C42] animate-pulse" />
            <span>Celery Async Workers</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
            LIVE JOBS & <span className="text-gradient-copper">WORKER QUEUE</span>
          </h1>
          <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
            Real-time pipeline tracking for Celery background workers and active LangGraph repository evaluations.
          </p>
        </div>

        {/* Worker Telemetry Strip */}
        <div className="flex items-center gap-4 text-xs font-mono bg-[#0E0602] px-5 py-3 rounded-2xl border border-[#E07A48]/25 shadow-md self-start sm:self-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF8C42] animate-ping" />
            <span className="text-[#D4BC9A] font-bold">{activeCount} Active Workers</span>
          </div>
          <div className="w-px h-4 bg-[#E07A48]/25" />
          <div className="text-amber-200/60">{queuedCount} In Queue</div>
        </div>
      </section>

      {/* SECTION 2: Jobs Queue Table */}
      <section>
        <TiltCard variant="primary" className="p-0 overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-7 border-b border-[#E07A48]/15 flex items-center justify-between">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] tracking-wider uppercase font-normal">Active Worker Queue</h3>
              <p className="text-xs text-amber-200/50 mt-0.5 font-normal">Auto-refreshing every 3 seconds via background poll</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
              ● Live Stream
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#120703] border-b border-[#E07A48]/20 text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider">
                  <th className="p-5">Job ID</th>
                  <th className="p-5">Repository</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 w-1/3">Progress</th>
                  <th className="p-5">Current Agent</th>
                  <th className="p-5">Elapsed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E07A48]/10 text-xs">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 font-mono text-amber-200/50">{job.id}</td>
                    <td className="p-5 text-[#D4BC9A] font-bold font-mono text-sm">{job.repo}</td>
                    <td className="p-5">
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full w-fit font-bold font-mono ${getStatusColor(job.status)}`}>
                        {getStatusIcon(job.status)}
                        {job.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#26130A] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#E07A48] to-[#FF8C42] transition-all duration-1000"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#FF8C42] font-mono font-bold w-10">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="p-5 text-amber-100/70">
                      {job.agent}
                    </td>
                    <td className="p-5 text-amber-200/50 font-mono">
                      {job.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TiltCard>
      </section>

    </div>
  );
}
