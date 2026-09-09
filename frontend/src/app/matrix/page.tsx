import React from 'react';
import { PlagiarismMatrix } from '@/components/PlagiarismMatrix';
import { Sparkles } from 'lucide-react';

export default function MatrixPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-gradient-copper uppercase tracking-wider leading-tight flex items-center gap-4">
          <Sparkles className="w-10 h-10 text-[#FF8C42]" />
          Code Similarity Grid
        </h1>
        <p className="text-amber-200/60 mt-3 text-sm sm:text-base max-w-3xl leading-relaxed font-mono">
          Detect mass-scale code plagiarism across all evaluated repositories. High-risk similarities are flagged in red.
        </p>
      </header>

      <PlagiarismMatrix />
    </div>
  );
}
