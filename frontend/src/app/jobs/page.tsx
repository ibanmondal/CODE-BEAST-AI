"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  Clock, 
  PlayCircle, 
  XCircle, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Search,
  Sparkles,
  Server
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  const fetchJobs = () => {
    fetch(apiUrl('/api/v1/stats/history'))
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const h = data?.history || [];
        const formattedJobs = h.map((job: any) => ({
          id: job.id || 'task-' + Math.random().toString(36).substr(2, 6),
          repo: job.repo,
          repoId: job.repoId || job.repo,
          status: job.status || 'Completed',
          overall: job.overall ?? 0,
          progress: job.status === 'Completed' ? 100 : job.status === 'Failed' ? 0 : job.status === 'Running' ? 55 : 10,
          time: job.submitted || 'recently',
          agent: job.status === 'Completed' ? 'ConsJudge Verified' : job.status === 'Running' ? 'Analyzing Codebase...' : 'Queued'
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#89CFF0]/15 text-[#89CFF0] border border-[#89CFF0]/30 rounded-full shadow-xs">
            <PlayCircle className="w-3.5 h-3.5 text-[#89CFF0] animate-spin" />
            Running
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 rounded-full shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Completed
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-400/30 rounded-full shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-[#08132B] text-[#8EA6C8] border border-[#89CFF0]/20 rounded-full shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#8EA6C8]" />
            Queued
          </span>
        );
    }
  };

  const activeCount = jobs.filter((j) => j.status === 'Running').length;
  const completedCount = jobs.filter((j) => j.status === 'Completed').length;
  const queuedCount = jobs.filter((j) => j.status === 'Queued').length;

  const filteredJobs = jobs.filter(j => 
    !filterQuery || j.repo?.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <Activity className="w-3.5 h-3.5" />
              Worker Fleet Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Live Jobs Queue & Worker Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Real-time status of asynchronous evaluation tasks dispatched to background worker nodes.
            </p>
          </div>

          <button
            onClick={fetchJobs}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 rounded-full shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </ScrollReveal>

      {/* 2. Queue Summary KPI Row with Liquid Glass Cards */}
      <StaggerContainer staggerDelay={0.08} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.6)] relative overflow-hidden group">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Total Audits
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{jobs.length}</span>
            <span className="text-[10px] text-[#8EA6C8] block mt-1">Jobs processed</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.6)] relative overflow-hidden group">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Active Runs
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-[#89CFF0] font-mono">{activeCount}</span>
            <span className="text-[10px] text-[#89CFF0] block mt-1">Workers busy</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.6)] relative overflow-hidden group">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Queued Tasks
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{queuedCount}</span>
            <span className="text-[10px] text-[#8EA6C8] block mt-1">Pending dispatch</span>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-2xl p-5 shadow-[0_12px_32px_rgba(2,6,18,0.6)] relative overflow-hidden group">
            <span className="text-[11px] font-bold text-[#8EA6C8] uppercase tracking-wider block mb-1">
              Completed Verified
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono">{completedCount}</span>
            <span className="text-[10px] text-emerald-400 block mt-1">ConsJudge synthesized</span>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* 3. Jobs Table Liquid Glass Card */}
      <ScrollReveal direction="up" distance={20} delay={0.15}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-6">
          
          {/* Filter Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 rounded-full w-full max-w-sm focus-within:border-[#89CFF0] focus-within:ring-2 focus-within:ring-[#89CFF0]/20 transition-all shadow-inner">
              <Search className="w-4 h-4 text-[#8EA6C8] shrink-0" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter queue by repository name..."
                className="bg-transparent border-none text-xs text-white placeholder-[#8EA6C8] focus:outline-none w-full"
              />
            </div>
            <span className="text-xs font-mono text-[#8EA6C8]">
              Showing {filteredJobs.length} records
            </span>
          </div>

          {/* Table Container with Frosted Glass Borders */}
          <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#08132B]/80 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                  <tr>
                    <th className="py-3 px-4">Job ID</th>
                    <th className="py-3 px-4">Repository</th>
                    <th className="py-3 px-4">Current Node</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#89CFF0]/15">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#8EA6C8]">
                        No evaluation jobs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#8EA6C8]">{job.id}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-white">{job.repo}</td>
                        <td className="py-3.5 px-4 text-[#89CFF0] font-medium">{job.agent}</td>
                        <td className="py-3.5 px-4 w-40">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-[#08132B] h-2 rounded-full overflow-hidden border border-[#89CFF0]/20 shadow-inner">
                              <div 
                                className="h-full bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-[#89CFF0] shrink-0">{job.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">{getStatusBadge(job.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/analysis?repo=${encodeURIComponent(job.repo)}`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full shadow-sm hover:scale-105 transition-transform"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
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

    </div>
  );
}
