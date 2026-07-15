"use client";

import React, { useState } from 'react';
import { Search, Book, MessageSquare, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does CodeBeast score repositories?",
      a: "CodeBeast uses a multi-agent system combined with deterministic heuristics. Security, Architecture, and Performance agents analyze the codebase using LLMs to find insights, while the deterministic scoring engine calculates a rigid score based on LOC, test coverage, and hardcaps (e.g., penalty for no README)."
    },
    {
      q: "What happens if a repository fails to clone?",
      a: "The Early Exit Engine or Repository Cloner will flag the repository as 'Failed'. You can check the Live Jobs or Analytics tab to see the exact reason (e.g., repository is private, doesn't exist, or exceeds the 500MB size limit)."
    },
    {
      q: "How do I configure the AI models used?",
      a: "Navigate to the Settings page. By default, CodeBeast uses a mix of Local LLMs (via Ollama) for specific agents, and Google Gemini for final report synthesis. You can input your API keys there."
    },
    {
      q: "Can I export the analysis reports?",
      a: "Yes. Once an analysis is complete, you can download a full Markdown or PDF report from the Reports tab or directly from the Repository Analysis dashboard."
    }
  ];

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto pb-10">
      <div className="text-center py-10 bg-[#141C2F] border border-gray-800 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-4">How can we help you?</h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search documentation, FAQs, or troubleshooting guides..." 
              className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 shadow-xl"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Book className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
          <p className="text-gray-400 text-sm mb-4">Read the comprehensive architecture guide, API references, and deployment instructions.</p>
          <a href="https://github.com/ibanmondal/PAGESENSEAI" target="_blank" rel="noreferrer" className="text-blue-400 text-sm font-medium flex items-center gap-1 hover:underline">
            Read Docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-lg bg-purple-900/30 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Support & Feedback</h3>
          <p className="text-gray-400 text-sm mb-4">Encountered a bug or have a feature request? Open an issue or contact the engineering team.</p>
          <a href="mailto:support@codebeast.ai" className="text-purple-400 text-sm font-medium flex items-center gap-1 hover:underline">
            Contact Support <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
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
        </div>
      </div>
    </div>
  );
}
