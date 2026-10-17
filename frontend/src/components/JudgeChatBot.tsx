"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  ShieldAlert, 
  Cpu, 
  Award, 
  Code2, 
  Copy, 
  Check, 
  Terminal,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';
import { FinalReport } from './ScoreDashboard';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
  modelUsed?: string;
}

interface JudgeChatBotProps {
  report: FinalReport;
  onClose?: () => void;
}

export function JudgeChatBot({ report, onClose }: JudgeChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello! I am your CodeBeast Intelligence Copilot, grounded in this repository's 8-agent evaluation report.\n\nYou can query the ConsJudge score (${report.overall_score || 0}/100), inspect AutoReview security patches, or request an architectural breakdown. Click a recommended question below or type your inquiry.`,
      modelUsed: 'ConsJudge Intelligence Copilot'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      label: "Explain Security Deductions",
      icon: ShieldAlert,
      query: "Why did the Security Agent deduct points, and what are the exact CWE vulnerabilities found?"
    },
    {
      label: "Critique Architecture",
      icon: Cpu,
      query: "Analyze this repository's architectural modularity and SOLID principle compliance."
    },
    {
      label: "Show AutoReview Fixes",
      icon: Code2,
      query: "Show me the AutoReview unified diff remediation patches for the top detected vulnerabilities."
    },
    {
      label: "Executive Summary",
      icon: Award,
      query: "Generate a concise executive summary highlighting this project's top engineering strengths."
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const res = await fetch(`http://${host}:8000/api/v1/chat/repository`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          report_context: report,
          history: historyPayload
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || data.answer || "No response received.",
          citations: data.citations || [],
          modelUsed: data.model || "ConsJudge Engine"
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Unable to connect to the Copilot service (${err.message}). Is the backend active on port 8000?`,
          modelUsed: 'System Notice'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="liquid-glass-card rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(2,6,18,0.8)] flex flex-col text-white">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#89CFF0]/20 bg-[#08132B]/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#08132B] border border-[#89CFF0]/30 shadow-xs flex items-center justify-center text-[#89CFF0]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              Repository Intelligence Copilot
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30">
                Active
              </span>
            </h3>
            <span className="text-[11px] text-[#8EA6C8]">
              Grounded in evaluated Git AST & multi-agent metrics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-1.5 text-[#8EA6C8] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#8EA6C8] hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2.5 bg-[#08132B]/60 border-b border-[#89CFF0]/20 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-[#89CFF0] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#89CFF0]" /> Suggestions:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp.query)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-[#08132B] border border-[#89CFF0]/25 hover:bg-[#89CFF0]/15 hover:text-[#89CFF0] text-white rounded-full shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            <qp.icon className="w-3.5 h-3.5 text-[#89CFF0]" />
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto bg-[#040914]/80 backdrop-blur-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3.5 text-xs leading-relaxed rounded-2xl ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-[#BAE6FD] to-[#89CFF0] text-[#040914] font-semibold shadow-sm'
                  : 'bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 text-white shadow-xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#89CFF0]/20 text-[10px] text-[#89CFF0]">
                  <span className="font-bold block mb-0.5">Grounding Citations:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {m.citations.map((c, ci) => (
                      <li key={ci} className="truncate">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-[#8EA6C8]">
              <span>{m.role === 'user' ? 'You' : m.modelUsed || 'Copilot'}</span>
              {m.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(m.content, idx)}
                  className="hover:text-white transition-colors"
                  title="Copy message"
                >
                  {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#89CFF0] p-2.5 bg-[#08132B] backdrop-blur-sm border border-[#89CFF0]/30 rounded-xl w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#89CFF0]" />
            <span>Synthesizing repository intelligence...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[#89CFF0]/20 bg-[#08132B]/90 backdrop-blur-md flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask a technical evaluation question about this codebase..."
          className="flex-1 bg-[#040914] border border-[#89CFF0]/30 px-3.5 py-2 text-xs text-white placeholder-[#8EA6C8] focus:outline-none focus:border-[#89CFF0] rounded-full shadow-inner"
          disabled={loading}
        />
        <CodeBeastLiquidButton
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          variant="primary"
          size="sm"
          icon={<Send className="w-3.5 h-3.5" />}
          label="Send"
        />
      </div>
    </div>
  );
}
