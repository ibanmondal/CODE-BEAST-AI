"use client";

import React, { useEffect, useState } from 'react';
import { Fingerprint, Loader2, Search } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';

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
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
        const res = await fetch(`http://${host}:8000/api/v1/matrix/heatmap`);
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
    if (isSelf) return 'bg-[#1a1a1a] text-transparent'; // Diagonal
    if (val < 10) return 'bg-[#1F0F08] text-amber-200/30';
    if (val < 30) return 'bg-[#2A1309] text-amber-200/50';
    if (val < 50) return 'bg-[#5c2a11] text-[#FF8C42]';
    if (val < 70) return 'bg-amber-600/60 text-amber-100';
    if (val < 90) return 'bg-rose-500/60 text-rose-100';
    return 'bg-red-600/80 text-white font-bold';
  };

  return (
    <TiltCard variant="primary" className="p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] tracking-wider uppercase font-normal flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-[#FF8C42]" />
            N x N Plagiarism Heatmap
          </h2>
          <p className="text-sm text-amber-200/60 mt-1 font-mono">
            Cross-repository similarity matrix analyzing {data ? data.count : 0} projects.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-amber-200/50">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#FF8C42]" />
          <p className="font-mono text-sm">Computing pairwise vectors...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center text-rose-400 font-mono text-sm">
          {error}
        </div>
      ) : !data || data.count === 0 ? (
        <div className="py-12 text-center text-amber-200/50 font-mono text-sm">
          No repositories analyzed yet. Run an analysis first.
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="inline-block min-w-full">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-[#E07A48]/10 bg-[#120703]"></th>
                  {data.labels.map((lbl, i) => (
                    <th key={`h-${i}`} className="p-2 border border-[#E07A48]/10 bg-[#120703] text-[10px] font-mono text-amber-200/70 writing-vertical transform -rotate-45 whitespace-nowrap origin-bottom-left w-12 h-24">
                      {lbl.substring(0, 15)}...
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.matrix.map((row, i) => (
                  <tr key={`r-${i}`}>
                    <td className="p-2 border border-[#E07A48]/10 bg-[#120703] text-[10px] font-mono text-amber-200/70 text-right whitespace-nowrap w-32 truncate">
                      {data.labels[i].substring(0, 20)}
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
                            border border-[#E07A48]/10 w-10 h-10 text-[9px] font-mono cursor-pointer transition-all duration-200
                            ${getCellColor(val, isSelf)}
                            ${isHovered && !isSelf ? 'scale-110 shadow-[0_0_15px_#FF8C42] z-10 relative border-[#FF8C42]' : ''}
                          `}
                          title={!isSelf ? `${data.labels[i]} vs ${data.labels[j]}\nSimilarity: ${val}%` : ''}
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
    </TiltCard>
  );
}
