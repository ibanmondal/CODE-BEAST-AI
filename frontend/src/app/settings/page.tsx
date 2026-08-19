"use client";

import React, { useState } from 'react';
import { Save, Key, Sliders, ShieldCheck, GitBranch, Cpu, Fingerprint, Zap, Check, Sparkles } from 'lucide-react';
import { TiltCard } from '@/components/TiltCard';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings State
  const [geminiKey, setGeminiKey] = useState('AIzaSyB*********************************');
  const [groqKey, setGroqKey] = useState('gsk_*******************************************');
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

  // Load Settings from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('cb_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.geminiKey) setGeminiKey(parsed.geminiKey);
        if (parsed.groqKey) setGroqKey(parsed.groqKey);
        if (parsed.ollamaEndpoint) setOllamaEndpoint(parsed.ollamaEndpoint);
        if (parsed.weights) setWeights(parsed.weights);
        if (parsed.toggles) setToggles(parsed.toggles);
      }
    } catch (e) {
      console.error("Failed to load settings from localStorage", e);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      const payload = {
        geminiKey,
        groqKey,
        ollamaEndpoint,
        weights,
        toggles
      };
      localStorage.setItem('cb_settings', JSON.stringify(payload));
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
    }
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  };

  const navTabs = [
    { id: 'api', label: 'API & LLM Endpoints', desc: 'Gemini, Groq, & Ollama', icon: Key },
    { id: 'scoring', label: 'Scoring Weights', desc: 'Relative agent percentages', icon: Sliders },
    { id: 'pipeline', label: 'Pipeline Toggles', desc: 'ConsJudge & AutoReview', icon: Cpu },
  ];

  return (
    <div className="space-y-12 sm:space-y-14 max-w-[1700px] mx-auto pb-20 px-3 sm:px-6 text-[#D4BC9A]">
      
      {/* SECTION 1: Page Header */}
      <section className="border-b border-[#E07A48]/20 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E07A48]/15 border border-[#E07A48]/30 text-[#FF8C42] text-xs font-semibold tracking-wide mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>System Configuration</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#D4BC9A] tracking-tight uppercase leading-none font-normal">
          PLATFORM <span className="text-gradient-copper">SETTINGS</span>
        </h1>
        <p className="text-amber-100/70 text-sm mt-2 max-w-xl font-normal leading-relaxed">
          Configure multi-model LLM credentials, scoring weight contributions, and automated research capabilities.
        </p>
      </section>

      {/* SECTION 2: 2-Column Master-Detail Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Rail: Navigation Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <TiltCard variant="secondary" className="p-4 sm:p-5 shadow-xl space-y-2">
            <span className="text-[10px] font-mono font-bold text-amber-200/50 uppercase tracking-widest px-3 py-1 block">
              Configuration Sections
            </span>
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center gap-3.5 border ${
                    isActive 
                      ? 'bg-[#231109] border-[#FF8C42]/60 text-[#D4BC9A] shadow-[0_0_20px_rgba(224,122,72,0.25)]' 
                      : 'bg-transparent border-transparent text-amber-100/60 hover:bg-[#140803] hover:text-[#D4BC9A]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    isActive ? 'bg-[#2E150B] border-[#FF8C42]/50 text-[#FF8C42]' : 'bg-[#180A04] border-[#E07A48]/20 text-amber-200/50'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-mono tracking-wide">{tab.label}</h4>
                    <p className="text-[10px] text-amber-200/40 mt-0.5">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </TiltCard>

          {/* Quick Help Widget */}
          <div className="p-5 rounded-3xl bg-[#0E0602] border border-[#E07A48]/15 text-xs text-amber-200/60 space-y-2">
            <span className="font-bold text-[#FF8C42] block font-mono">⚡ Zero Downtime Fallback</span>
            <p className="font-normal leading-relaxed">
              If cloud rate limits trigger on Gemini or Groq, the engine automatically falls back to deterministic AST analyzers without dropping active evaluations.
            </p>
          </div>
        </div>

        {/* Right Main Panel: Active Tab Content (8 cols) */}
        <TiltCard variant="hero" className="lg:col-span-8 p-7 sm:p-9 shadow-2xl">
          
          {/* TAB 1: API Endpoints */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-3xl text-[#D4BC9A] uppercase tracking-wider font-normal">API & Model Endpoints</h2>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                    Connected
                  </span>
                </div>
                <p className="text-amber-100/60 text-xs mb-6 font-normal">Configure cloud LLM credentials and local Ollama inference server URLs.</p>
                
                <div className="space-y-6">
                  <div className="space-y-2 bg-[#0E0602] p-5 rounded-2xl border border-[#E07A48]/20">
                    <label className="text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider flex items-center justify-between">
                      <span>Google Gemini API Key</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Supervisor Active</span>
                    </label>
                    <input 
                      type="password" 
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full bg-[#140803] border border-[#E07A48]/30 text-[#D4BC9A] rounded-xl px-4 py-3 outline-none focus:border-[#FF8C42] font-mono text-xs shadow-inner"
                    />
                    <p className="text-[11px] text-amber-200/40 font-mono">Powers Gemini-Flash multi-pass synthesis and DB schema analysis.</p>
                  </div>

                  <div className="space-y-2 bg-[#0E0602] p-5 rounded-2xl border border-[#E07A48]/20">
                    <label className="text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider flex items-center justify-between">
                      <span>Groq Cloud API Key</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Llama-3.3 70B</span>
                    </label>
                    <input 
                      type="password" 
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      className="w-full bg-[#140803] border border-[#E07A48]/30 text-[#D4BC9A] rounded-xl px-4 py-3 outline-none focus:border-[#FF8C42] font-mono text-xs shadow-inner"
                    />
                    <p className="text-[11px] text-amber-200/40 font-mono">Ultra-fast inference for Architecture, Testing, Performance, and Security agents.</p>
                  </div>

                  <div className="space-y-2 bg-[#0E0602] p-5 rounded-2xl border border-[#E07A48]/20">
                    <label className="text-xs font-mono font-bold text-[#FF8C42] uppercase tracking-wider flex items-center justify-between">
                      <span>Ollama Local Inference Host</span>
                      <span className="text-[10px] text-[#FF8C42] font-mono">Offline Local</span>
                    </label>
                    <input 
                      type="text" 
                      value={ollamaEndpoint}
                      onChange={(e) => setOllamaEndpoint(e.target.value)}
                      className="w-full bg-[#140803] border border-[#E07A48]/30 text-[#D4BC9A] rounded-xl px-4 py-3 outline-none focus:border-[#FF8C42] font-mono text-xs shadow-inner"
                    />
                    <p className="text-[11px] text-amber-200/40 font-mono">Local fallback endpoint for Qwen2.5-Coder and DeepSeek-Coder.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E07A48]/20 flex justify-end">
                <CodeBeastLiquidButton 
                  onClick={handleSave}
                  disabled={isSaving}
                  isLoading={isSaving}
                  variant="primary"
                  size="md"
                  label={saved ? "SAVED CREDENTIALS!" : "SAVE CREDENTIALS"}
                  hasArrow={!saved}
                  icon={saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#FF8C42]" />}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Scoring Engine Weights */}
          {activeTab === 'scoring' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl text-[#D4BC9A] mb-2 uppercase tracking-wider font-normal">Scoring Engine Weights</h2>
                <p className="text-amber-100/60 text-xs mb-6 font-normal">Adjust the relative contribution percentage of each agent to the overall repository score (Sum: {Object.values(weights).reduce((a,b) => a+b, 0)}%).</p>
                
                <div className="space-y-5">
                  {[
                    { key: 'architecture', label: 'Architecture & Modularity', icon: Cpu },
                    { key: 'security', label: 'Security & AutoReview', icon: ShieldCheck },
                    { key: 'performance', label: 'Performance & Optimization', icon: Zap },
                    { key: 'testing', label: 'Testing Coverage & Edge Cases', icon: Sliders },
                    { key: 'database', label: 'Database & Data Modeling', icon: GitBranch },
                    { key: 'originality', label: 'AST/CodeBERT Originality', icon: Fingerprint },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2 bg-[#0E0602] p-4 rounded-2xl border border-[#E07A48]/15">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-mono font-bold text-[#D4BC9A] flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-[#FF8C42]" />
                          {item.label}
                        </label>
                        <span className="text-xs text-[#FF8C42] font-mono font-bold">{weights[item.key as keyof typeof weights]}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="50" 
                        value={weights[item.key as keyof typeof weights]}
                        onChange={(e) => setWeights({ ...weights, [item.key]: parseInt(e.target.value) || 0 })}
                        className="w-full h-2 bg-[#26130A] rounded-lg appearance-none cursor-pointer accent-[#FF8C42]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#E07A48]/20 flex justify-end">
                <CodeBeastLiquidButton 
                  onClick={handleSave}
                  disabled={isSaving}
                  isLoading={isSaving}
                  variant="primary"
                  size="md"
                  label={saved ? "SAVED WEIGHTS!" : "SAVE WEIGHTS"}
                  hasArrow={!saved}
                  icon={saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#FF8C42]" />}
                />
              </div>
            </div>
          )}

          {/* TAB 3: Research Pipeline Toggles */}
          {activeTab === 'pipeline' && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-3xl text-[#D4BC9A] mb-2 uppercase tracking-wider font-normal">Research Pipeline Features</h2>
                <p className="text-amber-100/60 text-xs mb-6 font-normal">Enable or disable specific research-grounded evaluation capabilities.</p>
                
                <div className="space-y-4">
                  {[
                    { key: 'consJudgeMultiPass', title: 'ConsJudge Dual-Pass Consistency (2025)', desc: 'Executes parallel consensus judging and bounds variance to guarantee ±5pt margin.' },
                    { key: 'autoReviewCWESlicing', title: 'AutoReview 3-Stage Security Pipeline (FSE 2025)', desc: 'Runs OWASP Detect -> AST Locate -> Syntax Verified Patch generation.' },
                    { key: 'astCodeBertClones', title: 'AST & CodeBERT Semantic Plagiarism Detection', desc: 'Computes normalized statement hash trees and neural CodeBERT cosine similarity.' },
                    { key: 'gitDiffGeneration', title: 'Interactive Unified Git Diff Remediation', desc: 'Produces ready-to-merge git patch syntax blocks in the dashboard.' },
                    { key: 'offlineGracefulDegradation', title: 'Zero-Downtime Offline Fallback Degradation', desc: 'Automatically routes to deterministic engine and Ollama when cloud rate limits occur.' },
                  ].map((feat, i) => (
                    <div key={i} className="p-4 sm:p-5 bg-[#0E0602] rounded-2xl border border-[#E07A48]/15 flex items-center justify-between gap-4">
                      <div className="space-y-1 max-w-lg">
                        <h4 className="text-xs font-bold text-[#D4BC9A] font-mono">{feat.title}</h4>
                        <p className="text-[11px] text-amber-100/60 font-normal leading-relaxed">{feat.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={toggles[feat.key as keyof typeof toggles]}
                          onChange={(e) => setToggles({ ...toggles, [feat.key]: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-[#26130A] border border-[#E07A48]/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8C42]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-[#E07A48]/20 flex justify-end">
                <CodeBeastLiquidButton 
                  onClick={handleSave}
                  disabled={isSaving}
                  isLoading={isSaving}
                  variant="primary"
                  size="md"
                  label={saved ? "SAVED PREFERENCES!" : "SAVE PREFERENCES"}
                  hasArrow={!saved}
                  icon={saved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4 text-[#FF8C42]" />}
                />
              </div>
            </div>
          )}

        </TiltCard>

      </section>

    </div>
  );
}
