"use client";

import React, { useState } from 'react';
import { UploadCloud, File, Trash2, Play, CheckCircle2, AlertCircle, FileText, Download, Sparkles } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';

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
    
    for (const repo of validRepos) {
      try {
        await fetch('http://' + window.location.hostname + ':8000/api/v1/evaluate/', {
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
    alert(`Successfully dispatched ${validRepos.length} analysis jobs to the Celery workers!`);
  };

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Page Header */}
      <section className="border-b border-[#E07A48]/20 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Batch Ingestion Pipeline</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
          BULK CSV <span className="text-gradient-copper">UPLOAD</span>
        </h1>
        <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
          Upload a structured CSV containing GitHub repository URLs to evaluate entire hackathon cohorts concurrently.
        </p>
      </section>

      {/* SECTION 2: 2-Column Asymmetric Dropzone & Instructions */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8-col: Dropzone & Uploaded Table */}
        <div className="lg:col-span-8 space-y-6">
          <TiltCard variant="hero" className="p-8 sm:p-10 shadow-2xl">
            <div 
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all ${
                isDragging ? 'border-[#FF8C42] bg-[#E07A48]/10' : 'border-[#E07A48]/30 bg-[#0E0602] hover:border-[#FF8C42]/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#261208] border border-[#E07A48]/40 flex items-center justify-center mx-auto mb-4 text-[#FF8C42] shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] uppercase tracking-wider mb-2 font-normal">Drag and drop your CSV here</h3>
              <p className="text-amber-100/60 text-xs sm:text-sm mb-6 font-normal">or browse your filesystem (up to 50MB batch files)</p>
              
              <label className="inline-block cursor-pointer">
                <CodeBeastLiquidButton
                  variant="primary"
                  size="md"
                  label="BROWSE FILES"
                  hasArrow
                />
                <input type="file" className="hidden" accept=".csv" onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                    parseCSV(e.target.files[0]);
                  }
                }} />
              </label>
            </div>
          </TiltCard>

          {file && (
            <TiltCard variant="primary" className="p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E07A48]/15">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#261208] border border-[#E07A48]/30 rounded-xl text-[#FF8C42] shrink-0 shadow-inner">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[#D4BC9A] font-bold text-sm sm:text-base font-mono">{file.name}</h4>
                    <p className="text-amber-100/50 text-xs font-mono">{(file.size / 1024).toFixed(2)} KB &bull; CSV Document &bull; {parsedData.length} records</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-amber-200/40 hover:text-red-400 p-2 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="border border-[#E07A48]/20 rounded-2xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#120703] text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider">
                      <th className="p-4">Repository</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E07A48]/10 text-xs">
                    {parsedData.map((row) => (
                      <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 text-[#D4BC9A] font-mono">{row.repo}</td>
                        <td className="p-4 text-amber-100/60">{row.type}</td>
                        <td className="p-4">
                          {row.status === 'Ready' ? (
                            <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full w-fit">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Invalid URL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <CodeBeastLiquidButton 
                  onClick={handleProcess}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                  variant="primary"
                  size="md"
                  label="START BULK ANALYSIS"
                  hasArrow
                  icon={<Play className="w-4 h-4 fill-current" />}
                />
              </div>
            </TiltCard>
          )}
        </div>

        {/* Right 4-col: Instructions & Sample Template Card */}
        <div className="lg:col-span-4 space-y-6">
          <TiltCard variant="secondary" className="p-6 sm:p-7 shadow-xl">
            <h3 className="font-display text-2xl text-[#D4BC9A] uppercase tracking-wider mb-4 font-normal">Formatting Guide</h3>
            <ul className="space-y-4 text-xs text-amber-100/70">
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#261208] border border-[#E07A48]/40 text-[#FF8C42] flex items-center justify-center shrink-0 font-mono font-bold">1</div>
                <p>Upload a standard comma-separated CSV with a header row.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#261208] border border-[#E07A48]/40 text-[#FF8C42] flex items-center justify-center shrink-0 font-mono font-bold">2</div>
                <p>Ensure there is a column named <code className="bg-[#261208] border border-[#E07A48]/30 px-1.5 py-0.5 rounded text-[#FF8C42] font-mono">github_url</code>.</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-[#261208] border border-[#E07A48]/40 text-[#FF8C42] flex items-center justify-center shrink-0 font-mono font-bold">3</div>
                <p>Optionally include <code className="bg-[#261208] border border-[#E07A48]/30 px-1.5 py-0.5 rounded text-[#FF8C42] font-mono">team_name</code> or <code className="bg-[#261208] border border-[#E07A48]/30 px-1.5 py-0.5 rounded text-[#FF8C42] font-mono">project_type</code>.</p>
              </li>
            </ul>
          </TiltCard>
          
          <TiltCard variant="primary" className="p-6 sm:p-7 shadow-xl">
            <h3 className="font-display text-2xl text-[#FF8C42] uppercase tracking-wider mb-2 font-normal">Need a template?</h3>
            <p className="text-amber-100/70 text-xs mb-5 font-normal leading-relaxed">
              Download our sample CSV template to ensure your headers and formatting match the parser.
            </p>
            <CodeBeastLiquidButton 
              onClick={() => {
                const csvContent = "github_url,team_name,project_type\nhttps://github.com/torvalds/subsurface-for-dir,Team Alpha,Desktop App\nhttps://github.com/pallets/flask,Team Beta,Web Backend\nhttps://github.com/expressjs/express,Team Gamma,Node API\n";
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', 'codebeast_bulk_template.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="outline"
              size="sm"
              label="DOWNLOAD TEMPLATE (CSV)"
              icon={<Download className="w-4 h-4 text-[#FF8C42]" />}
            />
          </TiltCard>
        </div>

      </section>

    </div>
  );
}
