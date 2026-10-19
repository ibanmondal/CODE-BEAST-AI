"use client";

import React, { useEffect, useState } from 'react';
import { Fingerprint, Loader2 } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface HeatmapData {
  labels: string[];
  matrix: number[][];
  count: number;
}

export function PlagiarismMatrix() {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl('/api/v1/matrix/heatmap'));
        if (!res.ok) throw new Error("Failed to fetch matrix data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCellColor = (val: number, isSelf: boolean) => {
    if (isSelf) return 'bg-[#040914] text-transparent'; // Neutral diagonal
    if (val < 15) return 'bg-[#08132B]/80 text-[#8EA6C8]';
    if (val < 35) return 'bg-[#89CFF0]/15 text-[#89CFF0] font-medium';
    if (val < 60) return 'bg-[#89CFF0]/30 text-white font-semibold';
    if (val < 80) return 'bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] font-bold shadow-xs';
    return 'bg-gradient-to-r from-[#89CFF0] to-[#70C0E8] text-[#040914] font-bold shadow-sm';
  };

  return (
    <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] text-white">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#89CFF0]/20">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Fingerprint className="w-6 h-6 text-[#89CFF0]" />
            N × N Code Similarity & Clone Matrix
          </h2>
          <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
            Pairwise AST structure and CodeBERT neural embedding comparison across {data ? data.count : 0} repositories.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-white flex-wrap bg-[#08132B]/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#89CFF0]/25 shadow-xs">
          <span className="text-[#8EA6C8]">Similarity:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#08132B] border border-[#89CFF0]/30 shadow-xs" />
            <span className="text-[#8EA6C8]">&lt;15%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#89CFF0]/20" />
            <span className="text-[#89CFF0]">&lt;35%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#89CFF0]/40" />
            <span className="text-[#89CFF0]">&lt;60%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0]" />
            <span className="text-[#89CFF0]">&lt;80%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#89CFF0] to-[#70C0E8]" />
            <span className="text-[#89CFF0] font-bold">80%+</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#89CFF0]">
          <Loader2 className="w-7 h-7 animate-spin mb-3 text-[#89CFF0]" />
          <p className="text-xs font-semibold">Computing pairwise semantic vectors...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-rose-400 text-xs font-semibold">
          {error}
        </div>
      ) : !data || data.count === 0 ? (
        <div className="py-16 text-center text-[#8EA6C8] text-xs">
          No repositories analyzed yet. Submit repositories in the Analysis or Bulk Ingest view to generate the similarity matrix.
        </div>
      ) : (
        <div className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-3 border-b border-r border-[#89CFF0]/20 bg-[#08132B]/80"></th>
                  {data.labels.map((lbl, i) => (
                    <th key={`h-${i}`} className="p-3 border-b border-r border-[#89CFF0]/20 bg-[#08132B]/80 text-[11px] font-bold text-white whitespace-nowrap">
                      {lbl.length > 16 ? lbl.substring(0, 14) + '..' : lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#89CFF0]/15">
                {data.matrix.map((row, i) => (
                  <tr key={`r-${i}`}>
                    <td className="p-3 border-r border-[#89CFF0]/20 bg-[#08132B]/80 text-[11px] font-bold text-white text-right whitespace-nowrap px-4">
                      {data.labels[i].length > 18 ? data.labels[i].substring(0, 16) + '..' : data.labels[i]}
                    </td>
                    {row.map((val, j) => {
                      const isSelf = i === j;
                      const isHovered = hoveredCell?.row === i && hoveredCell?.col === j;
                      return (
                        <td 
                          key={`c-${i}-${j}`} 
                          onMouseEnter={() => setHoveredCell({row: i, col: j})}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`
                            border-r border-[#89CFF0]/15 w-12 h-10 text-[10px] font-mono cursor-pointer transition-all duration-150
                            ${getCellColor(val, isSelf)}
                            ${isHovered && !isSelf ? 'ring-2 ring-[#89CFF0] z-10 relative scale-105' : ''}
                          `}
                          title={!isSelf ? `${data.labels[i]} vs ${data.labels[j]}\nSimilarity: ${val}%` : 'Self-comparison (diagonal)'}
                        >
                          {!isSelf && val > 0 ? `${val}%` : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
