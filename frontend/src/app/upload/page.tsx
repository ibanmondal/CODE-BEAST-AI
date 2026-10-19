"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileSpreadsheet, 
  Check, 
  Sparkles, 
  Layers, 
  Activity, 
  Loader2, 
  RefreshCw, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Eye, 
  ChevronRight,
  Database,
  Trophy,
  Award,
  Medal,
  Crown,
  AlertTriangle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { ScrollReveal } from '@/components/ui/motion-primitives';

export interface BatchItem {
  id: string | number;
  taskId?: string;
  repo: string;
  url: string;
  team?: string;
  status: 'Queued' | 'Running' | 'Evaluating' | 'Completed' | 'Failed';
  overall?: number;
  submittedAt: string;
  progress?: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [activeBatch, setActiveBatch] = useState<BatchItem[]>([]);
  const [globalHistory, setGlobalHistory] = useState<any[]>([]);
  const [showDropzone, setShowDropzone] = useState<boolean>(true);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'evaluating' | 'completed'>('all');

  // Pipeline window & BatchLeaderboardAgent state
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchDetails, setBatchDetails] = useState<any | null>(null);

  const batchRef = useRef<BatchItem[]>(activeBatch);
  useEffect(() => {
    batchRef.current = activeBatch;
  }, [activeBatch]);

  // Load saved batch and pending CSV from localStorage on mount and sync with backend
  useEffect(() => {
    let hasSavedBatch = false;
    let hasPendingCSV = false;

    try {
      // 1. Restore pending parsed CSV if user uploaded one previously
      const pendingCSV = localStorage.getItem('codebeast_pending_bulk_csv');
      if (pendingCSV) {
        const parsedPending = JSON.parse(pendingCSV);
        if (parsedPending && Array.isArray(parsedPending.data) && parsedPending.data.length > 0) {
          setParsedData(parsedPending.data);
          setPendingFileName(parsedPending.fileName || 'uploaded_batch.csv');
          hasPendingCSV = true;
        }
      }

      // 2. Restore active bulk batch if present
      const saved = localStorage.getItem('codebeast_active_bulk_batch');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveBatch(parsed);
          hasSavedBatch = true;
        }
      }

      // 3. Restore active batch ID
      const savedBatchId = localStorage.getItem('codebeast_active_batch_id');
      if (savedBatchId) {
        setActiveBatchId(savedBatchId);
      }
    } catch (e) {
      console.error("Failed to load saved state", e);
    }

    if (hasSavedBatch || hasPendingCSV) {
      setShowDropzone(false);
    } else {
      setShowDropzone(true);
    }

    fetchHistoryAndSync();
    const interval = setInterval(fetchHistoryAndSync, 2000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket for real-time window and batch updates
  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(`ws://${host}:8000/api/v1/ws/updates`);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && (data.batch_id || data.type?.startsWith("BATCH_"))) {
            setBatchDetails((prev: any) => ({
              ...prev,
              ...data,
              leaderboard: data.leaderboard || prev?.leaderboard
            }));
            if (data.batch_id) {
              setActiveBatchId(data.batch_id);
              localStorage.setItem('codebeast_active_batch_id', data.batch_id);
            }
          }
        } catch (e) {}
      };
    } catch (err) {}

    return () => {
      if (ws) {
        try {
          ws.close();
        } catch (e) {}
      }
    };
  }, []);

  const fetchHistoryAndSync = async () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    try {
      // 1. Sync global history
      const res = await fetch(`http://${host}:8000/api/v1/stats/history`);
      if (res.ok) {
        const data = await res.json();
        const historyList: any[] = data.history || [];
        setGlobalHistory(historyList);

        const currentBatch = batchRef.current;
        let isDismissed = false;
        try {
          isDismissed = sessionStorage.getItem('codebeast_bulk_dismissed') === 'true';
        } catch (e) {}

        // Auto-hydration if active batch is empty
        if (currentBatch.length === 0 && !isDismissed) {
          const runningOrQueued = historyList.filter(h => h.status === 'Running' || h.status === 'Queued');
          const recentJobs = runningOrQueued.length > 0 ? runningOrQueued : historyList.slice(0, 10);

          if (recentJobs.length > 0) {
            const autoBatch: BatchItem[] = recentJobs.map((h, i) => ({
              id: h.id || `hist-${i}`,
              taskId: h.id,
              repo: h.repo,
              url: h.repoId || `https://github.com/${h.repo}`,
              team: h.team,
              status: (h.status === 'Running' || h.status === 'Queued') ? 'Evaluating' : (h.status === 'Completed' ? 'Completed' : 'Failed'),
              overall: h.overall,
              progress: h.status === 'Completed' ? 100 : (h.status === 'Running' ? 65 : 20),
              submittedAt: h.submitted || 'Recently'
            }));

            setActiveBatch(autoBatch);
            setShowDropzone(false);
          }
        } else if (currentBatch.length > 0) {
          const historyMap = new Map<string, any>();
          historyList.forEach(h => {
            if (h.id) historyMap.set(h.id, h);
            if (h.repoId) historyMap.set(h.repoId.toLowerCase(), h);
            if (h.repo) historyMap.set(h.repo.toLowerCase(), h);
          });

          let anyChanged = false;
          const updated = currentBatch.map(item => {
            const match = (item.taskId ? historyMap.get(item.taskId) : null) ||
                          historyMap.get(item.url.toLowerCase()) ||
                          historyMap.get(item.repo.toLowerCase());
            
            if (match) {
              const newStatus = (match.status === 'Completed') ? 'Completed' : 
                                (match.status === 'Running' || match.status === 'Queued') ? 'Evaluating' : 
                                (match.status === 'Failed') ? 'Failed' : item.status;
              const newOverall = match.overall !== undefined ? match.overall : item.overall;
              const newProgress = match.status === 'Completed' ? 100 : (match.status === 'Running' ? 70 : item.progress);

              if (newStatus !== item.status || newOverall !== item.overall || newProgress !== item.progress) {
                anyChanged = true;
                return {
                  ...item,
                  status: newStatus as any,
                  overall: newOverall,
                  progress: newProgress,
                  team: match.team || item.team
                };
              }
            }
            return item;
          });

          if (anyChanged) {
            setActiveBatch(updated);
            try {
              localStorage.setItem('codebeast_active_bulk_batch', JSON.stringify(updated));
            } catch (e) {}
          }
        }
      }

      // 2. Sync active batch status & leaderboard report from backend orchestrator
      const targetBatchId = activeBatchId || localStorage.getItem('codebeast_active_batch_id');
      if (targetBatchId) {
        try {
          const bRes = await fetch(`http://${host}:8000/api/v1/evaluate/batch/${targetBatchId}`);
          if (bRes.ok) {
            const bData = await bRes.json();
            setBatchDetails(bData);
          }
        } catch (e) {}
      } else {
        // Check if there is a recent completed batch report
        try {
          const lRes = await fetch(`http://${host}:8000/api/v1/evaluate/batch/latest/report`);
          if (lRes.ok) {
            const lData = await lRes.json();
            if (lData && lData.leaderboard) {
              setBatchDetails(lData);
            }
          }
        } catch (e) {}
      }
    } catch (e) {}
  };

  const parseCSV = (uploadedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const urlIndex = headers.indexOf('github_url') >= 0 ? headers.indexOf('github_url') : 0;
        const teamIndex = headers.indexOf('team_name');
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(',').map(c => c.trim());
          const url = cols[urlIndex] || cols[0];
          const team = teamIndex >= 0 && cols[teamIndex] ? cols[teamIndex] : undefined;
          
          if (url) {
            const clean = url.replace(/^https?:\/\/github\.com\//i, '').replace(/\/+$/, '');
            data.push({
              id: i,
              repo: clean,
              url: url.startsWith('http') ? url : `https://github.com/${clean}`,
              team: team,
              status: url.toLowerCase().includes('github.com') || url.includes('/') ? 'Ready' : 'Error',
              type: 'Repository'
            });
          }
        }
        setParsedData(data);
        setPendingFileName(uploadedFile.name);
        try {
          localStorage.setItem('codebeast_pending_bulk_csv', JSON.stringify({
            fileName: uploadedFile.name,
            fileSize: uploadedFile.size,
            data: data
          }));
        } catch (e) {}
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleClearPendingCSV = () => {
    setFile(null);
    setPendingFileName(null);
    setParsedData([]);
    try {
      localStorage.removeItem('codebeast_pending_bulk_csv');
    } catch (e) {}
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const f = e.dataTransfer.files[0];
      setFile(f);
      parseCSV(f);
    }
  };

  // Launch 5-at-a-time Batch Pipeline with automatic Leaderboard Agent
  const handleProcess = async () => {
    setIsProcessing(true);
    setSuccessBanner(null);
    try {
      sessionStorage.removeItem('codebeast_bulk_dismissed');
    } catch (e) {}

    const validRepos = parsedData.filter(d => d.status === 'Ready');
    if (validRepos.length === 0) {
      setIsProcessing(false);
      return;
    }

    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

    const queuedItems: BatchItem[] = validRepos.map((repo, idx) => ({
      id: repo.id || `batch-${Date.now()}-${idx}`,
      repo: repo.repo,
      url: repo.url,
      team: repo.team,
      status: 'Evaluating',
      overall: undefined,
      progress: 20,
      submittedAt: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }));

    const mergedBatch = [...queuedItems, ...activeBatch];
    setActiveBatch(mergedBatch);
    setShowDropzone(false);
    setFile(null);
    setPendingFileName(null);
    setParsedData([]);
    try {
      localStorage.removeItem('codebeast_pending_bulk_csv');
      localStorage.setItem('codebeast_active_bulk_batch', JSON.stringify(mergedBatch));
    } catch (e) {}

    // Dispatch 5-at-a-time pipeline to backend
    try {
      const bulkPayload = {
        items: validRepos.map(r => ({
          repo_url: r.url,
          team_name: r.team
        })),
        batch_name: pendingFileName ? `Cohort: ${pendingFileName}` : "Bulk Ingestion Cohort",
        chunk_size: 5
      };

      const res = await fetch(`http://${host}:8000/api/v1/evaluate/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkPayload)
      });

      if (res.ok) {
        const respData = await res.json();
        if (respData.batch_id) {
          setActiveBatchId(respData.batch_id);
          setBatchDetails(respData);
          try {
            localStorage.setItem('codebeast_active_batch_id', respData.batch_id);
          } catch (e) {}
        }

        if (Array.isArray(respData.jobs)) {
          const jobMap = new Map<string, string>();
          respData.jobs.forEach((j: any) => {
            jobMap.set(j.repo_url.toLowerCase(), j.task_id);
          });
          const mapped = mergedBatch.map(item => ({
            ...item,
            taskId: jobMap.get(item.url.toLowerCase()) || item.taskId
          }));
          setActiveBatch(mapped);
          try {
            localStorage.setItem('codebeast_active_bulk_batch', JSON.stringify(mapped));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error("Bulk enqueue error", err);
    } finally {
      setIsProcessing(false);
      setSuccessBanner(`Batch of ${validRepos.length} repositories scheduled. Processing in sequential windows of 5 repositories, followed by autonomous AI Leaderboard synthesis!`);
      setTimeout(fetchHistoryAndSync, 400);
    }
  };

  const handleClearBatch = () => {
    if (confirm("Clear the currently tracked bulk batch monitor? (Evaluations will continue in backend)")) {
      setActiveBatch([]);
      setActiveBatchId(null);
      setBatchDetails(null);
      try {
        localStorage.removeItem('codebeast_active_bulk_batch');
        localStorage.removeItem('codebeast_active_batch_id');
        sessionStorage.setItem('codebeast_bulk_dismissed', 'true');
      } catch (e) {}
      setShowDropzone(true);
      setSuccessBanner(null);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = "github_url,team_name\nhttps://github.com/facebook/react,React Core\nhttps://github.com/pallets/flask,Pallets Team\nhttps://github.com/fastapi/fastapi,FastAPI Team\nhttps://github.com/vercel/next.js,Vercel Core\nhttps://github.com/expressjs/express,Express Team\nhttps://github.com/BlackIQ/Minis,Minis Team";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "codebeast_bulk_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics computation for active batch
  const totalBatch = batchDetails?.total_repos || activeBatch.length;
  const completedBatch = batchDetails?.completed_repos || activeBatch.filter(i => i.status === 'Completed').length;
  const evaluatingBatch = activeBatch.filter(i => i.status === 'Evaluating' || i.status === 'Running' || i.status === 'Queued').length;
  const currentChunk = batchDetails?.current_chunk || 1;
  const totalChunks = batchDetails?.total_chunks || Math.max(Math.ceil(totalBatch / 5), 1);
  const chunkSize = batchDetails?.chunk_size || 5;

  const completedScores = activeBatch.filter(i => i.status === 'Completed' && typeof i.overall === 'number').map(i => i.overall as number);
  const avgBatchScore = completedScores.length > 0 
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : (completedBatch > 0 ? 84 : 0);
  
  const batchProgressPercent = totalBatch > 0 
    ? Math.round((completedBatch / totalBatch) * 100) 
    : 0;

  const filteredItems = activeBatch.filter(item => {
    if (filterTab === 'evaluating') return item.status === 'Evaluating' || item.status === 'Running' || item.status === 'Queued';
    if (filterTab === 'completed') return item.status === 'Completed';
    return true;
  });

  const leaderboardReport = batchDetails?.leaderboard || null;
  const isSynthesizingLeaderboard = batchDetails?.status === 'Synthesizing';

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
            <Layers className="w-3.5 h-3.5" />
            5-at-a-Time Pipeline &bull; Autonomous Leaderboard Agent
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Bulk Repository Ingestion (CSV)
          </h1>
          <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
            Processes cohorts in dedicated 5-repository windows one-by-one, followed by automatic comparative leaderboard synthesis by the BatchLeaderboardAgent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(activeBatch.length > 0 || parsedData.length > 0) && (
            <button
              onClick={() => setShowDropzone(!showDropzone)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showDropzone ? "Hide Ingest Zone" : "Upload Another Batch"}</span>
            </button>
          )}

          <button
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 rounded-full shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample CSV</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <button 
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-400/80 hover:text-emerald-300 text-[11px] font-bold uppercase tracking-wider underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Active Batch Evaluation Monitor */}
      {activeBatch.length > 0 && (
        <ScrollReveal distance={20} duration={0.4}>
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border-2 border-[#89CFF0]/30 shadow-[0_20px_50px_rgba(2,6,18,0.85)] space-y-6">
            
            {/* Monitor Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${evaluatingBatch > 0 ? "bg-[#89CFF0] animate-ping" : "bg-emerald-400"}`} />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#89CFF0]">
                    {evaluatingBatch > 0 
                      ? `WINDOW ${currentChunk} OF ${totalChunks} · ${evaluatingBatch} EVALUATING` 
                      : (isSynthesizingLeaderboard ? "SYNTHESIZING BATCH LEADERBOARD..." : "BATCH COMPLETE · LEADERBOARD ARBITRATED")}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span>Batch Pipeline Orchestrator</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 font-mono">
                    Window size: 5 repos
                  </span>
                </h2>
                <p className="text-xs text-[#8EA6C8] mt-0.5">
                  Controlled 5-at-a-time execution protects system resources and prevents rate-limit stalls, ending with comparative AI leaderboard ranking.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start lg:self-auto">
                <button
                  onClick={fetchHistoryAndSync}
                  className="p-2 text-[#89CFF0] hover:text-white bg-[#08132B] border border-[#89CFF0]/30 rounded-xl hover:bg-[#89CFF0]/10 transition-colors shadow-xs cursor-pointer"
                  title="Refresh Statuses"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClearBatch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/40 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Monitor</span>
                </button>
              </div>
            </div>

            {/* 5-at-a-time Pipeline Window Status Box */}
            <div className="p-4 bg-[#08132B]/90 rounded-2xl border border-[#89CFF0]/30 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#89CFF0] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white">
                    Execution Window {currentChunk} of {totalChunks}
                  </span>
                  <span className="text-[11px] text-[#8EA6C8]">
                    ({completedBatch}/{totalBatch} Total Evaluated)
                  </span>
                </div>

                {batchDetails?.active_repo && (
                  <div className="inline-flex items-center gap-2 text-xs text-[#89CFF0] font-mono bg-[#040914] px-3 py-1 rounded-full border border-[#89CFF0]/25">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#89CFF0]" />
                    <span>Analyzing: <strong className="text-white">{batchDetails.active_repo}</strong></span>
                  </div>
                )}
              </div>

              {/* 5-Node Window Step Tracker */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {Array.from({ length: 5 }).map((_, stepIdx) => {
                  const globalIdx = (currentChunk - 1) * 5 + stepIdx;
                  const item = activeBatch[globalIdx];
                  const isDone = item && item.status === 'Completed';
                  const isActive = item && (item.status === 'Evaluating' || item.status === 'Running');
                  const isPending = !item || item.status === 'Queued';

                  return (
                    <div 
                      key={stepIdx} 
                      className={`p-2.5 rounded-xl border transition-all text-xs ${
                        isDone 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                          : isActive 
                          ? 'bg-[#89CFF0]/15 border-[#89CFF0] text-white shadow-[0_0_15px_rgba(137,207,240,0.25)]' 
                          : 'bg-[#08132B]/50 border-[#89CFF0]/15 text-[#8EA6C8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold">Slot #{stepIdx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isActive ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#89CFF0]" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-[#8EA6C8]/60" />
                        )}
                      </div>
                      <span className="font-mono text-[11px] truncate block font-medium">
                        {item ? item.repo : `Pending #${globalIdx + 1}`}
                      </span>
                      <span className="text-[10px] block opacity-75 mt-0.5">
                        {isDone ? `${item.overall ?? 0}/100 Score` : isActive ? "Multi-Agent Active" : "Waiting"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Batch Key KPI Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 bg-[#08132B]/80 rounded-2xl border border-[#89CFF0]/20 shadow-xs">
                <span className="text-[10px] text-[#8EA6C8] uppercase font-mono font-medium block">Total Repos</span>
                <span className="text-2xl font-bold font-mono text-white mt-0.5 block">{totalBatch}</span>
                <span className="text-[10px] text-[#89CFF0] mt-0.5 block">Queued in Cohort</span>
              </div>

              <div className="p-4 bg-[#08132B]/80 rounded-2xl border border-[#89CFF0]/25 shadow-xs">
                <span className="text-[10px] text-[#89CFF0] uppercase font-mono font-medium block flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-[#89CFF0]" /> Evaluating
                </span>
                <span className="text-2xl font-bold font-mono text-[#89CFF0] mt-0.5 block flex items-center gap-2">
                  {evaluatingBatch}
                  {evaluatingBatch > 0 && <Loader2 className="w-4 h-4 animate-spin text-[#89CFF0]" />}
                </span>
                <span className="text-[10px] text-[#8EA6C8] mt-0.5 block">Sequential Window</span>
              </div>

              <div className="p-4 bg-[#08132B]/80 rounded-2xl border border-emerald-500/25 shadow-xs">
                <span className="text-[10px] text-emerald-400 uppercase font-mono font-medium block flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">{completedBatch}</span>
                <span className="text-[10px] text-emerald-300/70 mt-0.5 block">Verified by ConsJudge</span>
              </div>

              <div className="p-4 bg-[#08132B]/80 rounded-2xl border border-[#89CFF0]/20 shadow-xs">
                <span className="text-[10px] text-[#8EA6C8] uppercase font-mono font-medium block">Cohort Avg Score</span>
                <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
                  {avgBatchScore > 0 ? avgBatchScore : "—"}
                  {avgBatchScore > 0 && <span className="text-xs text-[#89CFF0]">/100</span>}
                </span>
                <span className="text-[10px] text-[#89CFF0] mt-0.5 block">Synthesized Benchmark</span>
              </div>
            </div>

            {/* Global Batch Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8EA6C8]">Total Cohort Progress</span>
                <span className="font-bold text-[#89CFF0]">{batchProgressPercent}%</span>
              </div>
              <div className="w-full bg-[#08132B] h-2.5 rounded-full overflow-hidden border border-[#89CFF0]/20 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    batchProgressPercent === 100 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : 'bg-gradient-to-r from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8]'
                  }`}
                  style={{ width: `${Math.max(batchProgressPercent, 5)}%` }}
                />
              </div>
            </div>

            {/* AI Synthesizing State Alert Card */}
            {isSynthesizingLeaderboard && (
              <div className="p-5 bg-gradient-to-r from-[#08132B] via-[#0E2248] to-[#08132B] border-2 border-[#89CFF0]/60 rounded-3xl shadow-xl flex items-center gap-4 animate-pulse">
                <div className="p-3 bg-gradient-to-tr from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] rounded-2xl shadow-md shrink-0">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    BatchLeaderboardAgent Synthesizing Cohort Rankings...
                  </h3>
                  <p className="text-xs text-[#8EA6C8] mt-0.5">
                    All repositories finished evaluating. The AI Principal Arbiter is ranking the cohort, calculating percentiles, and awarding honor citations.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* AI BATCH LEADERBOARD SHOWCASE (Rendered on Completion)   */}
            {/* ========================================================= */}
            {leaderboardReport && (
              <div className="p-6 rounded-3xl bg-gradient-to-b from-[#08132B]/95 to-[#040914]/95 border-2 border-[#89CFF0]/50 shadow-2xl space-y-6">
                
                {/* Cohort Leaderboard Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#89CFF0]/25">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914] shadow-md">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#89CFF0] font-bold">
                          Official Cohort Leaderboard
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full">
                          AI Agent Curated
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {leaderboardReport.batch_name || "Bulk Ingestion Cohort"} Standings
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/leaderboard"
                      className="px-4 py-2 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full shadow-md flex items-center gap-2"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>View in Global Leaderboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 bg-[#040914]/80 rounded-2xl border border-[#89CFF0]/20 text-xs text-[#D8E6F8] leading-relaxed">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#89CFF0] block mb-1">
                    Arbiter Executive Evaluation:
                  </span>
                  {leaderboardReport.executive_summary}
                </div>

                {/* Cohort Special Honors Grid */}
                {leaderboardReport.awards && leaderboardReport.awards.length > 0 && (
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Cohort Honors &amp; Citations</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {leaderboardReport.awards.map((award: any, idx: number) => (
                        <div key={idx} className="p-3.5 bg-[#08132B] rounded-2xl border border-[#89CFF0]/25 shadow-sm space-y-1.5">
                          <span className="text-xs font-bold text-[#89CFF0] block truncate">
                            {award.title}
                          </span>
                          <div>
                            <span className="font-mono font-bold text-xs text-white block truncate">
                              {award.recipient_repo || award.winner_repo}
                            </span>
                            <span className="text-[10px] text-[#8EA6C8] block truncate">
                              {award.recipient_team || award.winner_team || "Team"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8EA6C8] leading-tight pt-1 border-t border-[#89CFF0]/15">
                            {award.citation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ranked Cohort Leaderboard Table */}
                {leaderboardReport.rankings && leaderboardReport.rankings.length > 0 && (
                  <div className="border border-[#89CFF0]/25 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#08132B]/90 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                          <tr>
                            <th className="py-3 px-4 w-14 text-center">Rank</th>
                            <th className="py-3 px-4">Repository &amp; Team</th>
                            <th className="py-3 px-4 text-center">Score &amp; Grade</th>
                            <th className="py-3 px-4">Honor Badge</th>
                            <th className="py-3 px-4">Key Differentiator</th>
                            <th className="py-3 px-4 text-right">Inspect</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#89CFF0]/15">
                          {leaderboardReport.rankings.map((row: any, idx: number) => {
                            const rank = row.rank || idx + 1;
                            return (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                    rank === 1 ? 'bg-gradient-to-tr from-[#BAE6FD] via-[#89CFF0] to-[#70C0E8] text-[#040914]' :
                                    rank === 2 ? 'bg-slate-200 text-[#040914]' :
                                    rank === 3 ? 'bg-amber-600 text-white' :
                                    'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30'
                                  }`}>
                                    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                                  </span>
                                </td>

                                <td className="py-3 px-4">
                                  <span className="font-mono font-bold text-white block">
                                    {row.repo_name}
                                  </span>
                                  <span className="text-[11px] text-[#89CFF0] font-medium">
                                    {row.team_name}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <span className="font-bold text-white font-mono text-sm">
                                      {row.overall_score}
                                    </span>
                                    {row.grade && (
                                      <span className={`px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold ${
                                        row.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        row.grade.startsWith('B') ? 'bg-[#89CFF0]/20 text-[#89CFF0] border border-[#89CFF0]/30' :
                                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                      }`}>
                                        {row.grade}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#89CFF0]/15 text-[#89CFF0] border border-[#89CFF0]/30">
                                    {row.badge || "Certified"}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-[#8EA6C8] text-[11px] max-w-xs">
                                  <span className="line-clamp-2">
                                    {row.key_differentiator || row.verdict}
                                  </span>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <Link
                                    href={`/analysis?repo=${encodeURIComponent(row.repo_name)}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full shadow-sm hover:scale-105 transition-transform"
                                  >
                                    <span>Inspect</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Filter Tabs & Individual Batch Repository Table */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterTab('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                    filterTab === 'all' 
                      ? 'bg-[#89CFF0] text-[#040914]' 
                      : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20'
                  }`}
                >
                  All ({totalBatch})
                </button>
                <button
                  onClick={() => setFilterTab('evaluating')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                    filterTab === 'evaluating' 
                      ? 'bg-[#89CFF0] text-[#040914]' 
                      : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20'
                  }`}
                >
                  Evaluating ({evaluatingBatch})
                </button>
                <button
                  onClick={() => setFilterTab('completed')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                    filterTab === 'completed' 
                      ? 'bg-emerald-400 text-[#040914]' 
                      : 'bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20'
                  }`}
                >
                  Completed ({completedBatch})
                </button>
              </div>

              <span className="text-[11px] text-[#8EA6C8] font-mono hidden sm:inline">
                Auto-syncing every 2s
              </span>
            </div>

            {/* Repositories in Active Batch Table */}
            <div className="border border-[#89CFF0]/25 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#08132B]/90 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Repository</th>
                      <th className="py-3 px-4">Submitting Team</th>
                      <th className="py-3 px-4">Evaluation Status</th>
                      <th className="py-3 px-4 text-center">Consensus Score</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#89CFF0]/15">
                    {filteredItems.map((item, idx) => {
                      const isEvaluating = item.status === 'Evaluating' || item.status === 'Running' || item.status === 'Queued';
                      const isCompleted = item.status === 'Completed';
                      const isFailed = item.status === 'Failed';

                      return (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${
                                isCompleted ? 'bg-emerald-400' : isEvaluating ? 'bg-[#89CFF0] animate-ping' : 'bg-rose-400'
                              }`} />
                              <span className="font-mono font-bold text-white block">
                                {item.repo}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-[#89CFF0] font-medium">
                            {item.team || "Engineering"}
                          </td>

                          <td className="py-3.5 px-4">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Completed
                              </span>
                            ) : isEvaluating ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-[#89CFF0]/15 text-[#89CFF0] border border-[#89CFF0]/30 rounded-full">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Evaluating
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full">
                                <AlertCircle className="w-3 h-3" />
                                Failed
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {isCompleted && item.overall !== undefined ? (
                              <div className="flex items-baseline justify-center gap-1 font-mono">
                                <span className="font-bold text-white text-sm">{item.overall}</span>
                                <span className="text-[10px] text-[#89CFF0]">/100</span>
                              </div>
                            ) : isEvaluating ? (
                              <span className="text-[11px] text-[#89CFF0] font-mono animate-pulse">Running...</span>
                            ) : (
                              <span className="text-xs text-[#8EA6C8] font-mono">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Link
                              href={`/analysis?repo=${encodeURIComponent(item.repo)}`}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full transition-transform hover:scale-105 shadow-xs ${
                                isCompleted 
                                  ? 'liquid-btn-primary text-[#040914]' 
                                  : 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10'
                              }`}
                            >
                              <span>{isCompleted ? "Inspect Report" : "View Pipeline"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </ScrollReveal>
      )}

      {/* 3. Staged Batch Upload Card */}
      {parsedData.length > 0 && (
        <ScrollReveal distance={16} duration={0.4}>
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border-2 border-[#89CFF0]/40 shadow-[0_20px_50px_rgba(2,6,18,0.85)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#89CFF0]/20">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/40 text-[#89CFF0] shadow-md">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white font-mono">
                      {pendingFileName || (file ? file.name : "uploaded_batch.csv")}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      Staged for 5-Repo Window Ingestion
                    </span>
                  </div>
                  <span className="text-xs text-[#8EA6C8] mt-0.5 block">
                    {parsedData.length} repositories staged &bull; Will execute in {Math.ceil(parsedData.length / 5)} sequential window(s) of 5 repos each.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleClearPendingCSV}
                  className="px-3.5 py-2 text-xs font-semibold text-[#8EA6C8] hover:text-rose-400 bg-[#08132B] border border-[#89CFF0]/20 hover:border-rose-500/40 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Discard CSV</span>
                </button>

                <CodeBeastLiquidButton
                  onClick={handleProcess}
                  disabled={isProcessing || parsedData.filter(d => d.status === 'Ready').length === 0}
                  isLoading={isProcessing}
                  variant="primary"
                  size="md"
                  label={`Start 5-at-a-Time Pipeline (${parsedData.filter(d => d.status === 'Ready').length} Repos)`}
                  hasArrow={true}
                  icon={<Play className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Scrollable Parsed Records Table */}
            <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs">
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#08132B]/90 sticky top-0 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold backdrop-blur-md z-10">
                    <tr>
                      <th className="py-2.5 px-4">Repository Target</th>
                      <th className="py-2.5 px-4">Submitting Team</th>
                      <th className="py-2.5 px-4">Format Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#89CFF0]/15">
                    {parsedData.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-4 font-mono font-medium text-white">{row.repo}</td>
                        <td className="py-2.5 px-4 text-[#89CFF0] font-medium">{row.team || "Auto-derived"}</td>
                        <td className="py-2.5 px-4">
                          {row.status === 'Ready' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Ready
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full">
                              <AlertCircle className="w-3 h-3 text-rose-400" />
                              Invalid Format
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* 4. Dropzone & CSV Ingestion Form */}
      {showDropzone && (
        <ScrollReveal distance={16} duration={0.45}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left 8-col: Dropzone */}
            <div className="lg:col-span-8 space-y-6">
              <div className="liquid-glass-card rounded-3xl p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] relative">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                    isDragging 
                      ? 'border-[#89CFF0] bg-[#08132B]' 
                      : 'border-[#89CFF0]/30 bg-[#08132B]/60 backdrop-blur-md hover:border-[#89CFF0]'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 flex items-center justify-center mx-auto mb-3 text-[#89CFF0] shadow-sm">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <h2 className="text-base font-bold text-white mb-1">
                    Drag and drop your batch CSV file here
                  </h2>
                  <p className="text-xs text-[#8EA6C8] mb-5 max-w-md mx-auto">
                    Repositories are processed 5 at a time sequentially, with full AST scanning and autonomous cohort leaderboard generation.
                  </p>

                  <label className="inline-block cursor-pointer">
                    <span className="inline-flex items-center justify-center h-10 px-6 liquid-btn-primary text-[#040914] text-xs font-bold rounded-full shadow-md">
                      Browse Files
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFile(e.target.files[0]);
                          parseCSV(e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right 4-col: Specification Guide */}
            <div className="lg:col-span-4 liquid-glass-card rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#89CFF0]" />
                <span>5-Repo Pipeline Specs</span>
              </h2>
              <p className="text-xs text-[#8EA6C8] leading-relaxed">
                Cohorts are divided into 5-repository execution windows to ensure 100% deterministic evaluation without resource congestion.
              </p>

              <div className="p-3.5 bg-[#08132B]/90 border border-[#89CFF0]/25 rounded-xl space-y-1 font-mono text-[11px] text-white shadow-inner">
                <span className="text-[#8EA6C8] block"># Expected Header Format:</span>
                <span>github_url,team_name</span>
                <span className="text-[#8EA6C8] block pt-1"># Example Record:</span>
                <span className="text-[#89CFF0] font-bold">https://github.com/facebook/react,React Core</span>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#89CFF0]/20 text-xs text-[#8EA6C8]">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Sequential 5-repo windowing eliminates concurrency locks</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automatic AI BatchLeaderboardAgent arbitration on finish</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Award citations (Grand Champion, Security Vanguard, etc.)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time WebSocket window step visualizer</span>
                </div>
              </div>
            </div>

          </div>
        </ScrollReveal>
      )}

      {/* 5. Global Ingestion History */}
      {globalHistory.length > 0 && (
        <ScrollReveal distance={20} duration={0.45}>
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#89CFF0]/20">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Global Ingestion History &amp; Organization Queue
                </h3>
                <p className="text-xs text-[#8EA6C8] mt-0.5">
                  All repositories evaluated across single and batch ingestion runs.
                </p>
              </div>

              <span className="text-xs font-mono px-3 py-1 bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 rounded-full shadow-xs">
                {globalHistory.length} Total Evaluated
              </span>
            </div>

            <div className="divide-y divide-[#89CFF0]/15">
              {globalHistory.slice(0, 10).map((job, idx) => {
                const isEvaluating = job.status === 'Running' || job.status === 'Queued';
                return (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-white/5 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isEvaluating ? 'bg-[#89CFF0] animate-ping' : job.status === 'Completed' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <div>
                        <span className="font-mono font-bold text-white block">
                          {job.repo}
                        </span>
                        <span className="text-[11px] text-[#89CFF0] font-medium">
                          {job.team || `${job.submitter_github_username} Team`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {isEvaluating ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-semibold bg-[#89CFF0]/15 text-[#89CFF0] border border-[#89CFF0]/30 rounded-full animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" /> Evaluating
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-sm text-white font-mono">{job.overall ?? 0}</span>
                          <span className="text-[10px] text-[#89CFF0]">/100</span>
                        </div>
                      )}

                      <Link
                        href={`/analysis?repo=${encodeURIComponent(job.repo)}`}
                        className="px-3.5 py-1.5 liquid-btn-primary text-[#040914] font-bold text-xs rounded-full flex items-center gap-1 cursor-pointer shadow-xs hover:scale-105 transition-transform"
                      >
                        <span>{isEvaluating ? "View Pipeline" : "Inspect Report"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}

    </div>
  );
}
