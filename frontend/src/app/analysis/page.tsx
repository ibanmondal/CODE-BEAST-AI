"use client";
import React, { useState, useEffect } from 'react';
import { GitPullRequest, Search, Play, Filter, Eye, Download, Play as PlayIcon, Trash2 } from 'lucide-react';
import { ScoreDashboard } from '@/components/ScoreDashboard';

export default function AnalysisPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState([]);

  const fetchHistory = () => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/history')
      .then(res => res.json())
      .then(data => setHistory(data.history || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchHistory();
    
    // Connect to WebSocket
    const ws = new WebSocket('ws://' + window.location.hostname + ':8000/api/v1/ws/updates');
    
    ws.onmessage = (event) => {
      // Whenever we get a job update, immediately refresh the history
      fetchHistory();
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setReport(null);
    
    try {
      const res = await fetch('http://' + window.location.hostname + ':8000/api/v1/evaluate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: url })
      });
      
      if (!res.ok) throw new Error("Analysis failed.");
      
      const data = await res.json();
      
      // Polling handles updates automatically
      setUrl(''); // clear input on success
      // alert("Job Queued! Check backend celery logs.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repository Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">Submit a single repository or drill into any recent analysis.</p>
      </div>
      
      {report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto max-h-[90vh] overflow-y-auto rounded-3xl hide-scrollbar">
            <button 
              onClick={() => setReport(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-zinc-900/50 p-2 rounded-full border border-zinc-700 transition-colors z-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <ScoreDashboard report={report} />
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-[#141C2F] rounded-xl border border-gray-800 p-6 flex flex-col gap-2">
        <label className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Analyze a Github Repository</label>
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-3 rounded-lg text-blue-500">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="https://github.com/owner/repository"
            className="flex-1 bg-[#0A0E17] border border-gray-800 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button 
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Run analysis
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Estimated 40-90s • 4 specialized agents • full evidence trail</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-800 bg-[#0A0E17]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0A0E17]">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Repository</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Overall</th>
              <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Security</th>
              <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Arch</th>
              <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Perf</th>
              <th className="p-4 text-xs font-semibold text-orange-500/70 uppercase tracking-wider text-center">Testing</th>
              <th className="p-4 text-xs font-semibold text-cyan-500/70 uppercase tracking-wider text-center">Database</th>
              <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Originality</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {history.map((row: any, i) => (
              <tr key={i} className="hover:bg-[#141C2F]/50 transition-colors group">
                <td className="p-4">
                  <div className="font-medium text-sm text-white">{row.repo}</div>
                  <div className="text-xs text-gray-500">{row.repoId}</div>
                </td>
                <td className="p-4 text-sm text-gray-400">{row.team}</td>
                <td className="p-4">
                  <span className="text-xs px-2 py-1 bg-gray-800/50 rounded text-gray-300">{row.lang}</span>
                </td>
                <td className="p-4">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit border ${row.status === 'Completed' ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50' : 'bg-orange-900/20 text-orange-400 border-orange-900/50'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'Completed' ? 'bg-emerald-400' : 'bg-orange-400'}`} /> {row.status}
                  </div>
                </td>
                <td className={`p-4 text-center font-bold text-lg ${getScoreColor(row.overall)}`}>{row.overall}</td>
                <td className="p-4 text-center text-zinc-400 font-medium">{row.sec || 0}</td>
                <td className="p-4 text-center text-zinc-400 font-medium">{row.arch || 0}</td>
                <td className="p-4 text-center text-zinc-400 font-medium">{row.perf || 0}</td>
                <td className="p-4 text-center text-orange-400 font-medium">{row.testing_score || 0}</td>
                <td className="p-4 text-center text-cyan-400 font-medium">{row.db_score || 0}</td>
                <td className="p-4 text-center text-zinc-400 font-medium">{row.orig || 0}</td>
                <td className="p-4 text-xs text-gray-500">{row.submitted}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye 
                      className="w-4 h-4 hover:text-white cursor-pointer" 
                      onClick={() => {
                        if(row.final_report) {
                           setReport({ ...row.final_report, sec: row.sec, arch: row.arch, perf: row.perf, testing_score: row.testing_score, db_score: row.db_score, orig: row.orig, repoName: row.repo });
                        } else {
                           alert("Report data not available for this run.");
                        }
                      }}
                    />
                    <Download 
                      className="w-4 h-4 hover:text-white cursor-pointer" 
                      onClick={() => {
                        if(row.final_report) {
                          // First show the dashboard
                          setReport({ ...row.final_report, sec: row.sec, arch: row.arch, perf: row.perf, testing_score: row.testing_score, db_score: row.db_score, orig: row.orig, repoName: row.repo });
                          
                          // Wait for render & charts animation, then capture PDF
                          setTimeout(async () => {
                            const element = document.getElementById('report-dashboard');
                            if (element) {
                              try {
                                const htmlToImage = await import('html-to-image');
                                const jsPDF = (await import('jspdf')).default;
                                
                                const imgData = await htmlToImage.toPng(element, { backgroundColor: '#0A0E17', pixelRatio: 2 });
                                
                                const pdf = new jsPDF('p', 'mm', 'a4');
                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                // We need to calculate height based on element's aspect ratio
                                const imgProps = pdf.getImageProperties(imgData);
                                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                                
                                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                pdf.save(`${row.repo}_evaluation_report.pdf`);
                              } catch (e) {
                                console.error("PDF Gen Error:", e);
                                alert("Failed to generate PDF.");
                              }
                            }
                          }, 800);
                        } else {
                          alert("Report data not available for this run.");
                        }
                      }}
                    />
                    <Trash2 className="w-4 h-4 hover:text-red-400 cursor-pointer" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
