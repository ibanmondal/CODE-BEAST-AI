"use client";

import React, { useState } from 'react';
import { UploadCloud, File, Trash2, Play, CheckCircle2, AlertCircle } from 'lucide-react';

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
          const url = urlIndex >= 0 ? cols[urlIndex] : cols[0]; // fallback to first column
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
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Bulk CSV Upload</h1>
        <p className="text-gray-400 text-sm mt-1">Upload a CSV containing GitHub repository URLs to evaluate them in bulk.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-[#141C2F] hover:border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Drag and drop your CSV here</h3>
            <p className="text-gray-400 text-sm mb-6">or click to browse your files (max 50MB)</p>
            <label className="bg-white text-black px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors cursor-pointer inline-block">
              Browse Files
              <input type="file" className="hidden" accept=".csv" onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                  parseCSV(e.target.files[0]);
                }
              }} />
            </label>
          </div>

          {file && (
            <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-900/30 rounded-lg">
                    <File className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{file.name}</h4>
                    <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(2)} KB • CSV Document</p>
                  </div>
                </div>
                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 p-2">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-800/50 text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <th className="p-3 font-medium">Repository</th>
                      <th className="p-3 font-medium">Type</th>
                      <th className="p-3 font-medium">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {parsedData.map((row) => (
                      <tr key={row.id} className="text-sm">
                        <td className="p-3 text-white font-medium">{row.repo}</td>
                        <td className="p-3 text-gray-400">{row.type}</td>
                        <td className="p-3">
                          {row.status === 'Ready' ? (
                            <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium px-2 py-1 bg-green-400/10 rounded-full w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium px-2 py-1 bg-red-400/10 rounded-full w-fit">
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

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Bulk Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-medium mb-4">Instructions</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center shrink-0 text-xs">1</div>
                <p>Upload a standard CSV file with a header row.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center shrink-0 text-xs">2</div>
                <p>Ensure there is a column named <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">github_url</code>.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center shrink-0 text-xs">3</div>
                <p>Optionally include <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">team_id</code> or <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">project_type</code> for better categorization.</p>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-6">
            <h3 className="text-blue-400 font-medium mb-2">Need a template?</h3>
            <p className="text-gray-400 text-sm mb-4">Download our sample CSV template to ensure your formatting is correct before uploading.</p>
            <button className="text-blue-400 text-sm font-medium hover:underline">Download Template (CSV)</button>
          </div>
        </div>
      </div>
    </div>
  );
}
