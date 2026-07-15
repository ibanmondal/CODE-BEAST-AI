"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Clock, PlayCircle, XCircle, CheckCircle2 } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchJobs = () => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/history')
      .then(res => res.json())
      .then(data => {
        const h = data.history || [];
        const formattedJobs = h.map((job: any) => ({
          id: 'job-' + Math.random().toString(36).substr(2, 6),
          repo: job.repo,
          status: job.status,
          progress: job.status === 'Completed' ? 100 : job.status === 'Failed' ? 0 : job.status === 'Running' ? 45 : 0,
          time: job.submitted,
          agent: job.status === 'Completed' ? 'Done' : job.status === 'Running' ? 'Analyzing Codebase...' : 'Waiting in Queue'
        }));
        setJobs(formattedJobs);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'text-blue-400 bg-blue-400/10';
      case 'Completed': return 'text-green-400 bg-green-400/10';
      case 'Failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Running': return <PlayCircle className="w-4 h-4" />;
      case 'Completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'Failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Live Jobs <Activity className="w-6 h-6 text-blue-500 animate-pulse" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time pipeline tracking for Celery background workers.</p>
        </div>
        <div className="flex items-center gap-4 text-sm bg-[#141C2F] px-4 py-2 rounded-lg border border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-gray-300">{jobs.filter((j) => j.status === 'Running').length} Workers Active</span>
          </div>
          <div className="w-px h-4 bg-gray-700"></div>
          <div className="text-gray-300">{jobs.filter((j) => j.status === 'Queued').length} Jobs in Queue</div>
        </div>
      </div>

      <div className="bg-[#141C2F] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="p-4 font-medium">Job ID</th>
              <th className="p-4 font-medium">Repository</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium w-1/3">Progress</th>
              <th className="p-4 font-medium">Current Agent</th>
              <th className="p-4 font-medium">Elapsed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {jobs.map((job) => (
              <tr key={job.id} className="text-sm hover:bg-[#1A233A] transition-colors group">
                <td className="p-4 font-mono text-gray-500">{job.id}</td>
                <td className="p-4 text-white font-medium">{job.repo}</td>
                <td className="p-4">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit font-medium text-xs ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    {job.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          job.status === 'Completed' ? 'bg-green-500' : 
                          job.status === 'Failed' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono w-8">{job.progress}%</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400 text-xs">
                  {job.agent}
                </td>
                <td className="p-4 text-gray-400 font-mono text-xs">
                  {job.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
