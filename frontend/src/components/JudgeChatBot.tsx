"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Cpu, 
  Award, 
  Code2, 
  Copy, 
  Check, 
  Terminal,
  X,
  MessageSquare
} from 'lucide-react';
import { FinalReport } from './ScoreDashboard';

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
      // Build conversation history for context
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

  // Simple formatter to format Markdown headers, code snippets, lists, and bold text
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-2 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          // Code block indicator
          if (line.startsWith('```')) {
            return (
              <div key={idx} className="bg-black/60 rounded px-3 py-1 font-mono text-xs text-blue-400 border border-blue-900/30">
                {line.replace(/```/g, '') || 'code'}
              </div>
            );
          }
          // Headers
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-white text-sm mt-3 mb-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="font-bold text-blue-400 text-base mt-3 mb-1">{line.replace('## ', '')}</h3>;
          }
          // Bullet points
          if (line.startsWith('- ') || line.startsWith('* ')) {
            const text = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-blue-500 font-bold">•</span>
                <span className="text-gray-200">{formatInline(text)}</span>
              </div>
            );
          }
          // Regular text with inline bold/code
          return line ? <p key={idx} className="text-gray-200">{formatInline(line)}</p> : <div key={idx} className="h-1" />;
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    // Basic inline formatting: **bold** and `code`
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="bg-zinc-800 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0E17] border border-blue-900/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#141C2F] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Talk to Repository</h3>
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                Judge AI Copilot
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate max-w-[280px]">
              {report.repoName || 'Active Evaluation'} • Overall: {report.overall_score || 0}/100
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1.5 text-gray-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                  : 'bg-[#141C2F]/90 border border-gray-800 text-gray-200 rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div>
                  {renderFormattedContent(msg.content)}
                  
                  {/* Citations / Evidence Tags */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-800/80 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-blue-400" /> Evidence:
                      </span>
                      {msg.citations.map((cite, cIdx) => (
                        <span key={cIdx} className="text-[10px] bg-blue-950/60 border border-blue-800/40 text-blue-300 px-2 py-0.5 rounded font-mono">
                          {cite}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer metadata & Copy button */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>⚡ {msg.modelUsed || 'CodeBeast Copilot'}</span>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
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
                <p className="text-sm font-medium">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs pl-2 py-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
            <span className="text-gray-400 font-mono">Synthesizing multi-agent repository telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 bg-[#0E1422] border-t border-gray-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-gray-500 uppercase font-semibold flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" /> Suggested:
        </span>
        {quickPrompts.map((p, pIdx) => {
          const IconComponent = p.icon;
          return (
            <button
              key={pIdx}
              onClick={() => handleSend(p.query)}
              disabled={loading}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141C2F] hover:bg-blue-900/30 border border-gray-700/60 hover:border-blue-500/50 text-gray-300 hover:text-white text-xs transition-all disabled:opacity-50"
            >
              <IconComponent className="w-3 h-3 text-blue-400" />
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-[#141C2F] border-t border-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a technical question about this repository..."
            disabled={loading}
            className="flex-1 bg-[#0A0E17] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-40 shadow-lg shadow-blue-600/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
