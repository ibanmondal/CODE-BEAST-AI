"use client";

import React from 'react';
import { PlagiarismMatrix } from '@/components/PlagiarismMatrix';
import { Fingerprint } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/motion-primitives';

export default function MatrixPage() {
  return (
    <div className="space-y-6 pb-12 text-white">
      <ScrollReveal direction="down" distance={15}>
        <div className="pb-6 border-b border-[#89CFF0]/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
            <Fingerprint className="w-3.5 h-3.5" />
            CodeBERT & AST Clone Detection
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Code Similarity & Plagiarism Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
            Detect mass-scale code clones, template plagiarism, and architectural overlap across evaluated repositories.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" distance={20} delay={0.1}>
        <PlagiarismMatrix />
      </ScrollReveal>
    </div>
  );
}
