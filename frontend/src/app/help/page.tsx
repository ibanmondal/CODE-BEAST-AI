"use client";

import React, { useState } from 'react';
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  FileCode,
  Sparkles
} from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/motion-primitives';
import { apiUrl } from '@/lib/api';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: "How does CodeBeast AI evaluate software repositories?",
      a: "CodeBeast AI executes an 8-Agent parallel fan-out architecture via LangGraph (AutoReview Security, Architecture, Performance, Testing, Database, Originality, Developer Experience, and FinOps). Findings are synthesized by the ConsJudge Supervisor Node using multi-pass consensus bounding (ConsJudge 2025) to guarantee score consistency within statistically verified margins."
    },
    {
      q: "What is the AutoReview 3-Stage Security Pipeline (ACM FSE 2025)?",
      a: "AutoReview runs a 3-stage sequential sub-pipeline: (1) DETECT classifies vulnerabilities mapped to OWASP Top 10 and CWE taxonomy (e.g., CWE-89, CWE-798); (2) LOCATE uses AST code slicing to isolate exact file paths, line ranges, and exploit triggers; (3) REPAIR generates ready-to-merge unified git diffs and defensive test assertions."
    },
    {
      q: "How does AST & CodeBERT Originality Verification work?",
      a: "Unlike simplistic string matching, CodeBeast normalizes code into Abstract Syntax Tree (AST) statement hash trees and leverages deep transformer CodeBERT embeddings stored in FAISS indices to detect Type-1 through Type-4 semantic code clones and boilerplate plagiarism."
    },
    {
      q: "What happens if a repository fails to clone or is invalid?",
      a: "The ingestion layer validates repository accessibility (public vs. private, size caps up to 500MB). If cloning fails, the job is cleanly marked as 'Failed' with detailed diagnostics recorded in the Live Jobs and History tabs."
    },
    {
      q: "How do I configure API keys or local Ollama models?",
      a: "Navigate to the Settings tab (/settings). CodeBeast exclusively supports Groq Cloud (Llama-3.3 70B & Qwen) and NaraRouter (Agnes 2.5 Flash), with automatic offline graceful degradation."
    },
    {
      q: "Can I export evaluation reports as PDFs or Markdown?",
      a: "Yes! On both the Analysis (/analysis) and Reports (/reports) pages, you can view the full interactive dashboard or copy markdown badges and export comprehensive executive reports."
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              Knowledge Base
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Documentation & Help Center
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Frequently asked questions, methodology guides, and technical architecture specifications.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 rounded-full focus-within:border-[#89CFF0] focus-within:ring-2 focus-within:ring-[#89CFF0]/20 transition-all shadow-inner">
              <Search className="w-4 h-4 text-[#8EA6C8] shrink-0" />
              <input
                type="text"
                placeholder="Search documentation and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-white placeholder-[#8EA6C8] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Quick Topic Resource Cards */}
      <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StaggerItem>
          <a 
            href={apiUrl("/docs")} 
            target="_blank" 
            rel="noopener noreferrer"
            className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)] block group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 flex items-center justify-center text-[#89CFF0] mb-4 group-hover:scale-105 transition-transform shadow-xs">
              <FileCode className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">FastAPI OpenAPI Specs</h3>
              <ExternalLink className="w-4 h-4 text-[#89CFF0]" />
            </div>
            <p className="text-xs text-[#8EA6C8] mt-1.5 leading-relaxed">
              Direct interactive API endpoint documentation hosted at /docs.
            </p>
          </a>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)]">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 flex items-center justify-center text-[#89CFF0] mb-4 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">ConsJudge 2025 Paper</h3>
            <p className="text-xs text-[#8EA6C8] mt-1.5 leading-relaxed">
              Multi-pass consensus bounding for LLM-as-a-Judge score stabilization within ±5 pts.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="liquid-glass-interactive rounded-3xl p-6 shadow-[0_12px_36px_rgba(2,6,18,0.7)]">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#08132B] to-[#0E2248] border border-[#89CFF0]/30 flex items-center justify-center text-[#89CFF0] mb-4 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AutoReview ACM FSE 2025</h3>
            <p className="text-xs text-[#8EA6C8] mt-1.5 leading-relaxed">
              Detect → Locate → Repair vulnerability isolation and unified git diff generation.
            </p>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* 3. FAQs Accordion */}
      <ScrollReveal direction="up" distance={20} delay={0.15}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)] space-y-4">
          <h2 className="text-base font-bold text-white pb-3 border-b border-[#89CFF0]/20">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="border border-[#89CFF0]/20 rounded-2xl overflow-hidden bg-[#08132B]/80 backdrop-blur-md transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#89CFF0] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#8EA6C8] shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 bg-[#040914] border-t border-[#89CFF0]/20 text-xs text-[#8EA6C8] leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>

    </div>
  );
}
