"use client";

import React, { useState } from 'react';
import { Search, Book, MessageSquare, ExternalLink, ChevronDown, ChevronUp, Shield, Cpu, Fingerprint, Zap } from 'lucide-react';

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
    <div className="space-y-8 max-w-[1000px] mx-auto pb-10">
      <div className="text-center py-10 bg-[#141C2F] border border-gray-800 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-4">How can we help you?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation, research papers, FAQs, or setup..." 
              className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 shadow-xl text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Book className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Documentation & GitHub</h3>
          <p className="text-gray-400 text-sm mb-4">Read the comprehensive architecture guide, API references, research citations, and deployment instructions.</p>
          <a href="https://github.com/ibanmondal/CODE-BEAST-AI" target="_blank" rel="noreferrer" className="text-blue-400 text-sm font-medium flex items-center gap-1 hover:underline">
            View GitHub Repository <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Research Architecture</h3>
          <p className="text-gray-400 text-sm mb-4">Grounded in peer-reviewed literature: ConsJudge (2025), AutoReview (ACM FSE 2025), ASTNN & CodeBERT.</p>
          <a href="https://github.com/ibanmondal/CODE-BEAST-AI#grounded-in-peer-reviewed-research" target="_blank" rel="noreferrer" className="text-purple-400 text-sm font-medium flex items-center gap-1 hover:underline">
            Explore Research Roadmap <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {filteredFaqs.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-[#141C2F] border rounded-xl overflow-hidden transition-colors ${
                openFaq === i ? 'border-gray-700' : 'border-gray-800'
              }`}
            >
              <button 
                className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-medium text-gray-200">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {openFaq === i && (
                <div className="px-6 pb-4 pt-2 text-sm text-gray-400 leading-relaxed border-t border-gray-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No matching questions found for "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
