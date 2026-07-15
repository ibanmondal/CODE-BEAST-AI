"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, Filter } from 'lucide-react';
import { ScoreDashboard } from '@/components/ScoreDashboard';

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [hiddenReport, setHiddenReport] = useState<any>(null);
  const [viewingReport, setViewingReport] = useState<any>(null);

  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://' + window.location.hostname + ':8000/api/v1/stats/history')
      .then(res => res.json())
      .then(data => {
        const h = data.history || [];
        const completed = h.filter((job: any) => job.status === 'Completed');
        const formattedReports = completed.map((job: any) => ({
          id: 'REP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          repo: job.repo,
          date: new Date().toISOString().split('T')[0], // mockup date based on today
          size: (Math.random() * 5 + 0.5).toFixed(1) + ' MB',
          type: 'Full Analysis',
          score: job.overall_score,
          sec: job.security_score,
          arch: job.arch_score,
          perf: job.perf_score,
          testing_score: job.testing_score,
          db_score: job.db_score,
          orig: job.originality_score,
          final_report: job.final_report
        }));
        setReports(formattedReports);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Generated Reports</h1>
          <p className="text-gray-400 text-sm mt-1">Download PDF or Markdown summaries of past repository evaluations.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-[#141C2F] border border-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:text-white hover:border-gray-700 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 bg-[#141C2F] border border-gray-800 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:text-white hover:border-gray-700 transition-colors">
            <Calendar className="w-4 h-4" /> Date Range
          </button>
        </div>
      </div>

      <div className="bg-[#141C2F] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 text-xs font-medium text-gray-400 uppercase tracking-wider">
              <th className="p-4 font-medium">Report ID</th>
              <th className="p-4 font-medium">Repository</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Date Generated</th>
              <th className="p-4 font-medium">Size</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {reports.map((report) => (
              <tr key={report.id} className="text-sm hover:bg-[#1A233A] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/30 rounded text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-mono text-gray-300">{report.id}</span>
                  </div>
                </td>
                <td className="p-4 text-white font-medium">{report.repo}</td>
                <td className="p-4 text-gray-400">{report.type}</td>
                <td className="p-4 text-gray-400">{report.date}</td>
                <td className="p-4 text-gray-500 text-xs">{report.size}</td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        if (!report.final_report) {
                          alert("Report data not available.");
                          return;
                        }
                        setViewingReport({
                          ...report.final_report,
                          sec: report.sec || 0,
                          arch: report.arch || 0,
                          perf: report.perf || 0,
                          testing_score: report.testing_score || 0,
                          db_score: report.db_score || 0,
                          orig: report.orig || 0, 
                          repoName: report.repo 
                        });
                      }}
                      className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors" 
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (!report.final_report) {
                          alert("Report data not available.");
                          return;
                        }
                        
                        setDownloadingId(report.id);
                        
                        // Set the hidden report so the ScoreDashboard renders off-screen
                        setHiddenReport({
                          ...report.final_report, 
                          sec: report.sec || 0,
                          arch: report.arch || 0,
                          perf: report.perf || 0,
                          testing_score: report.testing_score || 0,
                          db_score: report.db_score || 0,
                          orig: report.orig || 0, 
                          repoName: report.repo 
                        });

                        // Wait for render & charts animation
                        setTimeout(async () => {
                          const element = document.getElementById('hidden-report-dashboard');
                          if (element) {
                            try {
                              const htmlToImage = await import('html-to-image');
                              const jsPDF = (await import('jspdf')).default;
                              
                              const imgData = await htmlToImage.toPng(element, { backgroundColor: '#0A0E17', pixelRatio: 2 });
                              
                              const pdf = new jsPDF('p', 'mm', 'a4');
                              const pdfWidth = pdf.internal.pageSize.getWidth();
                              const imgProps = pdf.getImageProperties(imgData);
                              const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                              
                              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                              pdf.save(`${report.repo}_evaluation_report.pdf`);
                            } catch (e) {
                              console.error("PDF Gen Error:", e);
                              alert("Failed to generate PDF.");
                            } finally {
                              setDownloadingId(null);
                              setHiddenReport(null);
                            }
                          }
                        }, 800);
                      }}
                      className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-400/10 rounded transition-colors flex items-center gap-1" 
                      title="Download PDF"
                    >
                      {downloadingId === report.id ? (
                        <span className="text-xs font-medium text-green-400 px-1">Downloading...</span>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hidden container for PDF Generation */}
      {hiddenReport && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '900px' }}>
          <div id="hidden-report-dashboard">
            <ScoreDashboard report={hiddenReport} />
          </div>
        </div>
      )}

      {/* Viewing Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl my-auto max-h-[90vh] overflow-y-auto rounded-3xl hide-scrollbar">
            <button 
              onClick={() => setViewingReport(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-zinc-900/50 p-2 rounded-full border border-zinc-700 transition-colors z-50"
            >
              <Eye className="w-4 h-4 hidden" /> {/* Just placeholder, using text for Close is also fine but let's just use the 'X' or text */}
              Close
            </button>
            <ScoreDashboard report={viewingReport} />
          </div>
        </div>
      )}
    </div>
  );
}
