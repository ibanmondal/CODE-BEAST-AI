"use client";

import React, { useState } from 'react';
import { Search, Book, MessageSquare, ExternalLink, ChevronDown, ChevronUp, Sparkles, HelpCircle } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      q: "How does CodeBeast AI evaluate software repositories?",
      a: "CodeBeast AI executes a 6-Agent parallel fan-out architecture via LangGraph (AutoReview Security, Architecture, Performance, Testing, Database, and AST/CodeBERT Similarity). Findings are synthesized by the ConsJudge Supervisor Node using multi-pass consensus bounding (ConsJudge 2025) to guarantee score consistency within ±5 points."
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
      a: "Navigate to the Settings tab (/settings). CodeBeast seamlessly supports Google Gemini Flash API, Groq Cloud (Llama-3.3 70B & Llama-3.1 8B), and local Ollama models with automatic offline graceful degradation."
    },
    {
      q: "Can I export evaluation reports as PDFs or Markdown?",
      a: "Yes! On both the Analysis (/analysis) and Reports (/reports) pages, you can view the full interactive dashboard or click Download PDF to render a 2x pixel-ratio high-resolution executive report with charts, CWE findings, and patch diffs."
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Hero Knowledge Base Search */}
      <section>
        <TiltCard variant="hero" className="text-center py-12 sm:py-16 px-6 sm:px-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[#E07A48]/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Knowledge Center & Documentation</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
              HOW CAN WE <span className="text-gradient-copper">HELP YOU?</span>
            </h1>
            
            <p className="text-amber-100/70 text-sm max-w-xl mx-auto font-normal leading-relaxed">
              Explore multi-agent architecture guides, API setup documentation, research methodologies, and frequently asked questions.
            </p>

            <div className="relative max-w-xl mx-auto pt-2">
              <Search className="w-5 h-5 text-amber-200/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, research papers, FAQs, or setup..." 
                className="w-full bg-[#0D0502] border border-[#E07A48]/30 text-[#D4BC9A] rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:border-[#FF8C42] shadow-inner text-xs font-mono placeholder-amber-200/30 transition-all"
              />
            </div>
          </div>
        </TiltCard>
      </section>

      {/* SECTION 2: Dual Resource Panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        <TiltCard variant="primary" className="p-8 shadow-xl flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#261208] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-inner">
              <Book className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] mb-2 uppercase tracking-wider font-normal">
              Documentation & GitHub
            </h3>
            <p className="text-amber-100/70 text-xs mb-6 leading-relaxed font-normal">
              Read the complete architecture guide, API references, research citations, and deployment instructions for local and cloud swarm nodes.
            </p>
          </div>
          <a 
            href="https://github.com/ibanmondal/CODE-BEAST-AI" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#FF8C42] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:underline pt-4 border-t border-[#E07A48]/15"
          >
            <span>View GitHub Repository</span> <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </TiltCard>

        <TiltCard variant="primary" className="p-8 shadow-xl flex flex-col justify-between group">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#261208] border border-[#E07A48]/30 text-[#FF8C42] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-inner">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl text-[#D4BC9A] mb-2 uppercase tracking-wider font-normal">
              Research Architecture
            </h3>
            <p className="text-amber-100/70 text-xs mb-6 leading-relaxed font-normal">
              Grounded in peer-reviewed literature: ConsJudge multi-pass consensus (2025), AutoReview 3-stage security repair (ACM FSE 2025), ASTNN & CodeBERT.
            </p>
          </div>
          <a 
            href="https://github.com/ibanmondal/CODE-BEAST-AI#grounded-in-peer-reviewed-research" 
            target="_blank" 
            rel="noreferrer" 
            className="text-[#FF8C42] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:underline pt-4 border-t border-[#E07A48]/15"
          >
            <span>Explore Research Roadmap</span> <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </TiltCard>

      </section>

      {/* SECTION 3: Frequently Asked Questions Accordion */}
      <section className="space-y-6">
        <div className="border-b border-[#E07A48]/20 pb-4">
          <h2 className="font-display text-3xl sm:text-4xl text-[#D4BC9A] uppercase tracking-wider font-normal">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-amber-200/50 mt-1 font-normal">Direct answers regarding scoring algorithms, security patches, and inference topology</p>
        </div>

        <TiltCard variant="secondary" className="p-0 overflow-hidden shadow-xl divide-y divide-[#E07A48]/15">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="transition-all">
              <button 
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between focus:outline-none hover:bg-white/[0.02] transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-bold text-sm text-[#D4BC9A] font-mono">{faq.q}</span>
                <div className={`p-1.5 rounded-xl border transition-all shrink-0 ml-4 ${
                  openFaq === i ? 'bg-[#E07A48]/20 border-[#E07A48]/40 text-[#FF8C42]' : 'bg-[#180A04] border-[#E07A48]/20 text-amber-200/50'
                }`}>
                  {openFaq === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              
              {openFaq === i && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs text-amber-100/70 leading-relaxed border-t border-[#E07A48]/10 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-amber-200/40 text-xs font-mono">
              No matching questions found for "{searchQuery}".
            </div>
          )}
        </TiltCard>
      </section>

    </div>
  );
}
