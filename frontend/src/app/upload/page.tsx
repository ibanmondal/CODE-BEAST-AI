"use client";

import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  FileSpreadsheet,
  Check,
  Sparkles,
  Layers
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { ScrollReveal } from '@/components/ui/motion-primitives';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const urlIndex = headers.indexOf('github_url');
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(',').map(c => c.trim());
          const url = urlIndex >= 0 ? cols[urlIndex] : cols[0];
          if (url) {
            data.push({
              id: i,
              repo: url.replace('https://github.com/', ''),
              url: url,
              status: url.includes('github.com') ? 'Ready' : 'Error',
              type: 'Repository'
            });
          }
        }
        setParsedData(data);
      }
    };
    reader.readAsText(file);
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

  const handleProcess = async () => {
    setIsProcessing(true);
    const validRepos = parsedData.filter(d => d.status === 'Ready');
    
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    for (const repo of validRepos) {
      try {
        await fetch(`http://${host}:8000/api/v1/evaluate/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ repo_url: repo.url })
        });
      } catch (err) {
        console.error("Failed to queue", repo.url, err);
      }
    }
    
    setIsProcessing(false);
    setFile(null);
    setParsedData([]);
    alert(`Successfully queued ${validRepos.length} repository evaluation jobs.`);
  };

  const handleDownloadSample = () => {
    const csvContent = "github_url,team_name\nhttps://github.com/facebook/react,UI Systems\nhttps://github.com/fastapi/fastapi,PyEngineers\nhttps://github.com/vercel/next.js,Next Team";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "codebeast_bulk_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
            <Layers className="w-3.5 h-3.5" />
            Batch Pipeline Orchestration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Bulk Repository Ingestion (CSV)
          </h1>
          <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
            Evaluate entire hackathon cohorts or organizational repositories concurrently via batch upload.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 rounded-full shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* 2. Upload Grid */}
      <ScrollReveal distance={16} duration={0.45}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left 8-col: Dropzone & Parse Table */}
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
                  File must contain a column with GitHub repository URLs (up to 50MB batch size limit)
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

            {file && (
              <div className="liquid-glass-card rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#89CFF0]/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 text-[#89CFF0] shadow-xs">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white font-mono">{file.name}</h3>
                      <span className="text-[11px] text-[#8EA6C8]">
                        {(file.size / 1024).toFixed(1)} KB &bull; {parsedData.length} records parsed
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setFile(null); setParsedData([]); }}
                    className="p-1.5 text-[#8EA6C8] hover:text-rose-400 rounded-full hover:bg-white/10 transition-colors"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Parsed Records Table */}
                <div className="border border-[#89CFF0]/20 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#08132B]/80 border-b border-[#89CFF0]/20 text-[#8EA6C8] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Repository</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#89CFF0]/15">
                      {parsedData.map((row) => (
                        <tr key={row.id} className="hover:bg-white/5">
                          <td className="py-2.5 px-3 font-mono font-medium text-white">{row.repo}</td>
                          <td className="py-2.5 px-3 text-[#89CFF0] font-medium">{row.type}</td>
                          <td className="py-2.5 px-3">
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

                <div className="flex justify-end pt-2">
                  <CodeBeastLiquidButton
                    onClick={handleProcess}
                    disabled={isProcessing || parsedData.filter(d => d.status === 'Ready').length === 0}
                    isLoading={isProcessing}
                    variant="primary"
                    size="md"
                    label={`Queue ${parsedData.filter(d => d.status === 'Ready').length} Repositories`}
                    hasArrow={true}
                    icon={<Play className="w-4 h-4" />}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Right 4-col: Specification Guide */}
          <div className="lg:col-span-4 liquid-glass-card rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-tight">
              CSV File Structure Specifications
            </h2>
            <p className="text-xs text-[#8EA6C8] leading-relaxed">
              Ensure your uploaded CSV contains standard GitHub URLs. The pipeline will automatically parse, clone, and queue evaluation runs.
            </p>

            <div className="p-3.5 bg-[#08132B]/90 border border-[#89CFF0]/25 rounded-xl space-y-1 font-mono text-[11px] text-white shadow-inner">
              <span className="text-[#8EA6C8] block"># Expected Header Format:</span>
              <span>github_url,team_name</span>
              <span className="text-[#8EA6C8] block pt-1"># Example Record:</span>
              <span className="text-[#89CFF0] font-bold">https://github.com/facebook/react,React Team</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#89CFF0]/20 text-xs text-[#8EA6C8]">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Public repositories are cloned asynchronously</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Capped at 500MB per repository size limit</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Populates both the Live Queue and History records</span>
              </div>
            </div>
          </div>

        </div>
      </ScrollReveal>

    </div>
  );
}
