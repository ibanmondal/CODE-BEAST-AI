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

function renderInlineText(text: string) {
  const clean = text.replace(/<br\s*\/?>/gi, " ");
  const tokens = clean.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code key={i} className="font-mono text-[11px] bg-[#040914] text-[#BAE6FD] px-1.5 py-0.5 rounded border border-[#89CFF0]/25 mx-0.5 shadow-xs">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={i} className="text-[#BAE6FD] font-bold drop-shadow-xs">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return token;
  });
}

function parseMarkdownTable(tableLines: string[]) {
  if (tableLines.length < 2) return null;
  const parsedRows: string[][] = [];
  for (const line of tableLines) {
    if (/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(line)) {
      continue;
    }
    const cells = line
      .split("|")
      .map(c => c.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length);
    if (cells.length > 0) {
      parsedRows.push(cells);
    }
  }
  if (parsedRows.length <= 1) return null;
  return {
    headers: parsedRows[0],
    rows: parsedRows.slice(1)
  };
}

function RenderParsedTable({ rows }: { rows: string[][] }) {
  return (
    <div className="space-y-2.5 my-3">
      {rows.map((row, rIdx) => {
        const title = row[0] || `Point ${rIdx + 1}`;
        const score = row[1] || "";
        const concern = row[2] || "";
        const impact = row[3] || "";

        return (
          <div 
            key={rIdx} 
            className="p-3.5 bg-[#040914]/90 border border-[#89CFF0]/25 rounded-xl shadow-xs transition-colors hover:border-[#89CFF0]/45"
          >
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#89CFF0]/15">
              <span className="font-bold text-[#89CFF0] text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#89CFF0] shadow-[0_0_6px_#89CFF0] shrink-0" />
                {renderInlineText(title.replace(/\*\*/g, ""))}
              </span>
              {score && (
                <span className="font-mono text-[11px] font-bold text-white bg-[#08132B] px-2.5 py-0.5 rounded-md border border-[#89CFF0]/30 shadow-xs">
                  {score.replace(/\*\*/g, "")}
                </span>
              )}
            </div>

            {concern && (
              <div className="text-xs text-white/95 leading-relaxed mb-2 pl-3 border-l-2 border-[#89CFF0]/30">
                {renderInlineText(concern)}
              </div>
            )}

            {impact && (
              <div className="text-[11px] text-[#8EA6C8] pl-3 flex items-start gap-1.5 pt-1 border-t border-white/5">
                <span className="text-[#89CFF0] font-semibold shrink-0">Impact / Remediation:</span>
                <span>{renderInlineText(impact)}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FormattedMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentTableLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushTable = () => {
    if (currentTableLines.length > 0) {
      const parsed = parseMarkdownTable(currentTableLines);
      if (parsed) {
        blocks.push(<RenderParsedTable key={`table-${blocks.length}`} rows={parsed.rows} />);
      } else {
        blocks.push(
          <div key={`table-raw-${blocks.length}`} className="my-1.5 space-y-1">
            {currentTableLines.map((tl, i) => (
              <div key={i} className="text-xs text-white leading-relaxed">
                {renderInlineText(tl)}
              </div>
            ))}
          </div>
        );
      }
      currentTableLines = [];
    }
  };

  const flushCode = () => {
    if (codeBlockLines.length > 0) {
      blocks.push(
        <pre key={`code-${blocks.length}`} className="bg-[#040914] p-3 rounded-xl border border-[#89CFF0]/25 font-mono text-[11px] overflow-x-auto my-2 text-[#BAE6FD] shadow-inner">
          <code>{codeBlockLines.join("\n")}</code>
        </pre>
      );
      codeBlockLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      currentTableLines.push(line.trim());
      continue;
    } else {
      flushTable();
    }

    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    // Header with triple asterisks ***Title***
    if (trimmed.startsWith("***") && trimmed.endsWith("***")) {
      const headerText = trimmed.replace(/\*\*\*/g, "");
      blocks.push(
        <div key={`h-${i}`} className="text-xs font-bold text-[#89CFF0] uppercase tracking-wider mt-3 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-[#89CFF0]/25">
          <Sparkles className="w-3.5 h-3.5 text-[#89CFF0]" />
          <span>{headerText}</span>
        </div>
      );
      continue;
    }

    // Header with markdown hashes ## Title or ### Title
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      const headerText = trimmed.replace(/^#{2,3}\s*/, "");
      blocks.push(
        <div key={`h-${i}`} className="text-xs font-bold text-[#89CFF0] uppercase tracking-wider mt-3 mb-2 flex items-center gap-1.5 pb-1.5 border-b border-[#89CFF0]/25">
          <Sparkles className="w-3.5 h-3.5 text-[#89CFF0]" />
          <span>{headerText}</span>
        </div>
      );
      continue;
    }

    // Bullet points (•, -, *, 1., 2.)
    const bulletMatch = trimmed.match(/^([•\-\*]|\d+\.)\s+(.+)$/);
    if (bulletMatch) {
      const bulletContent = bulletMatch[2];
      blocks.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-2 pl-1 group">
          <span className="w-2 h-2 rounded-full bg-[#89CFF0] mt-1 shrink-0 shadow-[0_0_6px_#89CFF0]" />
          <div className="flex-1 text-xs text-white leading-relaxed">
            {renderInlineText(bulletContent)}
          </div>
        </div>
      );
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-xs text-white/95 leading-relaxed my-1.5">
        {renderInlineText(trimmed)}
      </p>
    );
  }

  flushTable();
  flushCode();

  return <div className="space-y-1">{blocks}</div>;
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
              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap font-medium">{m.content}</p>
              ) : (
                <FormattedMessageContent content={m.content} />
              )}

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
