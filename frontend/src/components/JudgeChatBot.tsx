"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  ShieldAlert, 
  Cpu, 
  Award, 
  Code2, 
  Copy, 
  Check, 
  Terminal,
  X
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
      content: `👋 **Welcome, Judge!** I'm your **CodeBeast Judge Copilot** grounded in this repository's 6-agent evaluation.\n\nYou can interrogate the **ConsJudge score (${report.overall_score || 0}/100)**, inspect AutoReview security patches, or generate an executive briefing. Click a prompt below or type your question!`,
      modelUsed: 'CodeBeast Intelligence System'
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
      label: "30s Awards Pitch",
      icon: Award,
      query: "Generate a 30-second executive awards summary highlighting this project's top engineering strengths."
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

      const res = await fetch('http://' + window.location.hostname + ':8000/api/v1/chat/repository', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          report_context: report,
          history: historyPayload
        })
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        modelUsed: data.model_used || 'CodeBeast Judge Copilot'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error connecting to Judge Copilot:** ${err.message || 'Could not reach backend chat service.'}`,
          modelUsed: 'Fallback System'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat cleared. Ask any new question about **${report.repoName || 'this repository'}**!`,
        modelUsed: 'CodeBeast Intelligence System'
      }
    ]);
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('```')) {
            return (
              <div key={idx} className="bg-[#0D0805] rounded px-3 py-1 font-mono text-xs text-[#FF8C42] border border-[#E07A48]/30">
                {line.replace(/```/g, '') || 'code'}
              </div>
            );
          }
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-[#D4BC9A] text-sm mt-3 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-bold text-[#FF8C42] text-base mt-3 mb-1">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const text = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-[#FF8C42] font-bold">•</span>
                <span className="text-amber-100/90">{formatInline(text)}</span>
              </div>
            );
          }
          return line ? <p key={idx} className="text-amber-100/90">{formatInline(line)}</p> : <div key={idx} className="h-1" />;
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#D4BC9A] font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-[#241209] text-[#FFB085] px-1.5 py-0.5 rounded text-xs font-mono border border-[#E07A48]/20">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#120703] border border-[#E07A48]/40 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#1C0E07] border-b border-[#E07A48]/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E07A48] to-[#FF8C42] flex items-center justify-center text-[#0D0805] shadow-[0_0_15px_rgba(224,122,72,0.4)]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#D4BC9A] text-sm font-mono">Talk to Repository</h3>
              <span className="px-2 py-0.5 bg-[#E07A48]/20 border border-[#E07A48]/40 text-[#FF8C42] text-[10px] font-semibold rounded-full uppercase tracking-wider font-mono">
                Judge AI Copilot
              </span>
            </div>
            <p className="text-xs text-amber-200/50 truncate max-w-[280px]">
              {report.repoName || 'Active Evaluation'} • Overall: {report.overall_score || 0}/100
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CodeBeastLiquidButton
            onClick={clearChat}
            variant="secondary"
            size="sm"
            viewMode="icon"
            icon={<Trash2 className="w-3.5 h-3.5 text-amber-200/60" />}
            aria-label="Clear Chat History"
          />
          {onClose && (
            <CodeBeastLiquidButton
              onClick={onClose}
              variant="secondary"
              size="sm"
              viewMode="icon"
              icon={<X className="w-4 h-4 text-amber-200/60" />}
              aria-label="Close Chat"
            />
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px] custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[#E07A48] to-[#FF8C42] text-[#0D0805] rounded-br-none font-medium'
                  : 'bg-[#1C0E07] border border-[#E07A48]/30 text-amber-100 rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div>
                  {renderFormattedContent(msg.content)}
                  
                  {/* Citations / Evidence Tags */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[#E07A48]/20 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-amber-200/50 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-[#FF8C42]" /> Evidence:
                      </span>
                      {msg.citations.map((cite, cIdx) => (
                        <span key={cIdx} className="text-[10px] bg-[#29130A] border border-[#E07A48]/30 text-[#FF8C42] px-2 py-0.5 rounded font-mono">
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer metadata & Copy button */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-amber-200/40 pt-1 border-t border-[#E07A48]/10">
                    <span>⚡ {msg.modelUsed || 'CodeBeast Copilot'}</span>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="hover:text-[#FF8C42] flex items-center gap-1 transition-colors"
                      title="Copy message text"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#0D0805]">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-amber-200/60 text-xs pl-2 py-2">
            <div className="w-2 h-2 rounded-full bg-[#E07A48] animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-[#FF8C42] animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-[#FFB085] animate-pulse delay-150" />
            <span className="text-amber-200/50 font-mono">Synthesizing multi-agent repository telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-[#180A04] border-t border-[#E07A48]/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-amber-200/40 uppercase font-semibold flex items-center gap-1 shrink-0 font-mono">
          <Sparkles className="w-3 h-3 text-[#FF8C42]" /> Suggested:
        </span>
        {quickPrompts.map((p, pIdx) => {
          const IconComponent = p.icon;
          return (
            <button
              key={pIdx}
              onClick={() => handleSend(p.query)}
              disabled={loading}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241108] hover:bg-[#34180A] border border-[#E07A48]/30 hover:border-[#FF8C42] text-amber-100 hover:text-[#D4BC9A] text-xs transition-all disabled:opacity-50 font-mono shadow-sm"
            >
              <IconComponent className="w-3 h-3 text-[#FF8C42]" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-[#1C0E07] border-t border-[#E07A48]/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a technical question about this repository..."
            disabled={loading}
            className="flex-1 bg-[#100602] border border-[#E07A48]/30 rounded-2xl px-4 py-2.5 text-xs text-[#D4BC9A] placeholder-amber-200/30 outline-none focus:border-[#FF8C42] transition-colors disabled:opacity-50 font-mono"
          />
          <CodeBeastLiquidButton
            type="submit"
            disabled={loading || !input.trim()}
            variant="primary"
            size="sm"
            viewMode="icon"
            icon={<Send className="w-4 h-4 text-[#FF8C42]" />}
            aria-label="Send message"
          />
        </form>
      </div>
    </div>
  );
}
