"use client";

import React, { useState } from 'react';
import { 
  Save, 
  Key, 
  Sliders, 
  ShieldCheck, 
  Check, 
  Sparkles
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { ScrollReveal } from '@/components/ui/motion-primitives';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings State
  const [githubToken, setGithubToken] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [naraKey, setNaraKey] = useState('');
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');

  const [weights, setWeights] = useState({
    architecture: 20,
    security: 20,
    performance: 15,
    testing: 15,
    database: 15,
    originality: 15
  });

  const [toggles, setToggles] = useState({
    consJudgeMultiPass: true,
    autoReviewCWESlicing: true,
    astCodeBertClones: true,
    gitDiffGeneration: true,
    offlineGracefulDegradation: true
  });

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('cb_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.githubToken) setGithubToken(parsed.githubToken);
        if (parsed.geminiKey) setGeminiKey(parsed.geminiKey);
        if (parsed.groqKey) setGroqKey(parsed.groqKey);
        if (parsed.naraKey) setNaraKey(parsed.naraKey);
        if (parsed.ollamaEndpoint) setOllamaEndpoint(parsed.ollamaEndpoint);
        if (parsed.weights) setWeights(parsed.weights);
        if (parsed.toggles) setToggles(parsed.toggles);
      }
    } catch (e) {}
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      const payload = {
        githubToken,
        geminiKey,
        groqKey,
        naraKey,
        ollamaEndpoint,
        weights,
        toggles
      };
      localStorage.setItem('cb_settings', JSON.stringify(payload));
      setTimeout(() => {
        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }, 400);
    } catch (e) {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 text-white">
      
      {/* 1. Page Header */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/30 text-[#89CFF0] text-[11px] font-semibold tracking-wider uppercase rounded-full shadow-xs mb-2">
              <Sliders className="w-3.5 h-3.5" />
              Consensus Parameters
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Configuration & Settings
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1">
              Configure LLM inference API credentials, specialized agent scoring weights, and pipeline feature toggles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Settings Saved
              </span>
            )}
            <CodeBeastLiquidButton
              onClick={handleSave}
              disabled={isSaving}
              isLoading={isSaving}
              variant="primary"
              size="sm"
              label="Save Configuration"
              icon={<Save className="w-4 h-4" />}
            />
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Navigation Tabs */}
      <ScrollReveal direction="none">
        <div className="flex items-center gap-2 pb-2 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-full transition-all duration-200 ${
              activeTab === 'api'
                ? 'liquid-btn-primary text-[#040914] shadow-md'
                : 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 shadow-xs'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Inference API Keys</span>
          </button>

          <button
            onClick={() => setActiveTab('weights')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-full transition-all duration-200 ${
              activeTab === 'weights'
                ? 'liquid-btn-primary text-[#040914] shadow-md'
                : 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 shadow-xs'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Scoring Dimension Weights</span>
          </button>

          <button
            onClick={() => setActiveTab('toggles')}
            className={`flex items-center gap-2 px-4 py-2 font-bold rounded-full transition-all duration-200 ${
              activeTab === 'toggles'
                ? 'liquid-btn-primary text-[#040914] shadow-md'
                : 'bg-[#08132B] text-[#89CFF0] border border-[#89CFF0]/30 hover:bg-[#89CFF0]/10 shadow-xs'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Research Pipeline Toggles</span>
          </button>
        </div>
      </ScrollReveal>

      {/* 3. Tab Contents Liquid Glass Card */}
      <ScrollReveal direction="up" distance={20} delay={0.1}>
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(2,6,18,0.8)]">
        
          {/* Tab 1: API Keys */}
          {activeTab === 'api' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">
                  LLM Inference Providers & Endpoints
                </h2>
                <span className="text-xs text-[#8EA6C8]">
                  CodeBeast utilizes Google Gemini Flash and Groq Cloud for dual-pass consensus.
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-white font-semibold mb-1.5">GitHub Personal Access Token (PAT)</label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                  <span className="text-[11px] text-[#8EA6C8] mt-1 block">Required for cloning public/private GitHub repositories and preventing 60 req/hr rate limits.</span>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Google Gemini API Key</label>
                  <input
                    type="password"
                    placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                  <span className="text-[11px] text-[#8EA6C8] mt-1 block">Used for the ConsJudge Primary Supervisor, Repository Chat Copilot, and Database analysis node.</span>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Groq Cloud API Key (Llama 3.3 70B)</label>
                  <input
                    type="password"
                    placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                  <span className="text-[11px] text-[#8EA6C8] mt-1 block">Used for ConsJudge Second-Pass Arbiter and Architecture evaluation node.</span>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Nara Router API Key</label>
                  <input
                    type="password"
                    placeholder="sk-nry-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={naraKey}
                    onChange={(e) => setNaraKey(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                  <span className="text-[11px] text-[#8EA6C8] mt-1 block">Used for cloud agent orchestration and high-speed consensus routing.</span>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-1.5">Local Ollama Endpoint (Fallback)</label>
                  <input
                    type="text"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpoint(e.target.value)}
                    className="w-full bg-[#08132B]/90 backdrop-blur-md border border-[#89CFF0]/25 px-4 py-2.5 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#89CFF0] focus:ring-2 focus:ring-[#89CFF0]/20 transition-all shadow-inner"
                  />
                  <span className="text-[11px] text-[#8EA6C8] mt-1 block">Default: http://localhost:11434 for zero-network on-premise execution.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Dimension Weights */}
          {activeTab === 'weights' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">
                  Agent Score Contribution Weights
                </h2>
                <span className="text-xs text-[#8EA6C8]">
                  Configure the percentage contribution of each specialized evaluator node to the overall score.
                </span>
              </div>

              <div className="space-y-4">
                {Object.entries(weights).map(([key, val]) => (
                  <div key={key} className="space-y-2 bg-[#08132B]/80 border border-[#89CFF0]/20 rounded-2xl p-4 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white capitalize">
                        {key} Dimension
                      </span>
                      <span className="font-mono font-bold text-[#89CFF0]">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      value={val}
                      onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
                      className="w-full accent-[#89CFF0] h-2 bg-[#040914] rounded-full cursor-pointer shadow-inner"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Feature Toggles */}
          {activeTab === 'toggles' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-base font-bold text-white">
                  Pipeline Algorithms & Guardrails
                </h2>
                <span className="text-xs text-[#8EA6C8]">
                  Enable or disable specific research algorithms across the multi-agent pipeline.
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'consJudgeMultiPass', label: 'ConsJudge Dual-Pass Consensus (2025)', desc: 'Executes concurrent Gemini + Llama-3.3 passes to bound score hallucination within ±5 points.' },
                  { key: 'autoReviewCWESlicing', label: 'AutoReview 3-Stage CWE Slicing (ACM FSE 2025)', desc: 'Detect → Locate → Repair pipeline extracting exploit triggers and generating unified patches.' },
                  { key: 'astCodeBertClones', label: 'Tree-Sitter AST & CodeBERT Neural Vectors', desc: 'Computes deep semantic clone vectors stored in FAISS for cross-repository clone detection.' },
                  { key: 'gitDiffGeneration', label: 'Automated Git Diff Remediation Synthesis', desc: 'Synthesizes clean unified diff blocks for identified CWE vulnerabilities.' },
                  { key: 'offlineGracefulDegradation', label: 'Offline Graceful Deterministic Fallback', desc: 'Allows the platform to calculate deterministic AST metrics even if external LLM APIs fail.' },
                ].map((toggle) => (
                  <div 
                    key={toggle.key}
                    className="p-4 border border-[#89CFF0]/20 bg-[#08132B]/80 backdrop-blur-md rounded-2xl flex items-center justify-between gap-4 hover:border-[#89CFF0]/50 transition-colors shadow-xs"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-white">{toggle.label}</h3>
                      <p className="text-[11px] text-[#8EA6C8] mt-0.5 leading-relaxed">{toggle.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(toggles as any)[toggle.key]}
                      onChange={(e) => setToggles({ ...toggles, [toggle.key]: e.target.checked })}
                      className="w-5 h-5 text-[#89CFF0] accent-[#89CFF0] cursor-pointer shrink-0 rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </ScrollReveal>

    </div>
  );
}
