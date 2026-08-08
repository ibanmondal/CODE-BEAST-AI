"use client";

import React, { useState } from 'react';
import { Save, Key, Sliders, ShieldCheck, GitBranch, Cpu, Fingerprint, Zap } from 'lucide-react';

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

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure LLM integrations, scoring weights, and agent pipeline behaviors.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar Nav for Settings */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: 'api', label: 'API & LLM Endpoints', icon: Key },
            { id: 'scoring', label: 'Scoring Weights', icon: Sliders },
            { id: 'pipeline', label: 'Research Pipeline Toggles', icon: Cpu },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-900/50' 
                  : 'text-gray-400 hover:bg-[#141C2F] hover:text-white border border-transparent'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#141C2F] border border-gray-800 rounded-xl p-8 shadow-xl">
          {activeTab === 'api' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">API & Model Endpoints</h2>
                <p className="text-gray-400 text-sm mb-6">Configure cloud LLM credentials and local Ollama inference server URLs.</p>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                      <span>Google Gemini API Key</span>
                      <span className="text-xs text-emerald-400 font-mono">Active (Supervisor & Database)</span>
                    </label>
                    <input 
                      type="password" 
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Powers Gemini-Flash multi-pass synthesis and DB schema analysis.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                      <span>Groq Cloud API Key</span>
                      <span className="text-xs text-emerald-400 font-mono">Active (Llama-3.3 70B & Llama-3.1 8B)</span>
                    </label>
                    <input 
                      type="password" 
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Ultra-fast inference for Architecture, Testing, Performance, and Security agents.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center justify-between">
                      <span>Ollama Local Host</span>
                      <span className="text-xs text-blue-400 font-mono">Offline Fallback</span>
                    </label>
                    <input 
                      type="text" 
                      value={ollamaEndpoint}
                      onChange={(e) => setOllamaEndpoint(e.target.value)}
                      className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Local fallback endpoint for Qwen2.5-Coder and DeepSeek-Coder.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Credentials</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Scoring Engine Weights</h2>
                <p className="text-gray-400 text-sm mb-6">Adjust the relative contribution percentage of each agent to the overall repository score (Sum: {Object.values(weights).reduce((a,b) => a+b, 0)}%).</p>
                
                <div className="space-y-6">
                  {[
                    { key: 'architecture', label: 'Architecture & Modularity', icon: Cpu },
                    { key: 'security', label: 'Security & AutoReview', icon: ShieldCheck },
                    { key: 'performance', label: 'Performance & Optimization', icon: Zap },
                    { key: 'testing', label: 'Testing Coverage & Edge Cases', icon: Sliders },
                    { key: 'database', label: 'Database & Data Modeling', icon: GitBranch },
                    { key: 'originality', label: 'AST/CodeBERT Originality', icon: Fingerprint },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-blue-400" />
                          {item.label}
                        </label>
                        <span className="text-sm text-blue-400 font-mono font-bold">{weights[item.key as keyof typeof weights]}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="50" 
                        value={weights[item.key as keyof typeof weights]}
                        onChange={(e) => setWeights({ ...weights, [item.key]: parseInt(e.target.value) || 0 })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Weights</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Research Pipeline Features</h2>
                <p className="text-gray-400 text-sm mb-6">Enable or disable specific research-grounded evaluation capabilities.</p>
                
                <div className="space-y-4">
                  {[
                    { key: 'consJudgeMultiPass', title: 'ConsJudge Dual-Pass Consistency (2025)', desc: 'Executes parallel consensus judging and bounds variance to guarantee ±5pt margin.' },
                    { key: 'autoReviewCWESlicing', title: 'AutoReview 3-Stage Security Pipeline (FSE 2025)', desc: 'Runs OWASP Detect -> AST Locate -> Syntax Verified Patch generation.' },
                    { key: 'astCodeBertClones', title: 'AST & CodeBERT Semantic Plagiarism Detection', desc: 'Computes normalized statement hash trees and neural CodeBERT cosine similarity.' },
                    { key: 'gitDiffGeneration', title: 'Interactive Unified Git Diff Remediation', desc: 'Produces ready-to-merge git patch syntax blocks in the dashboard.' },
                    { key: 'offlineGracefulDegradation', title: 'Zero-Downtime Offline Fallback Degradation', desc: 'Automatically routes to deterministic engine and Ollama when cloud rate limits occur.' },
                  ].map((feat, i) => (
                    <div key={i} className="p-4 bg-black/40 rounded-xl border border-gray-800 flex items-center justify-between">
                      <div className="space-y-1 max-w-lg">
                        <h4 className="text-sm font-medium text-white">{feat.title}</h4>
                        <p className="text-xs text-gray-400">{feat.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={toggles[feat.key as keyof typeof toggles]}
                          onChange={(e) => setToggles({ ...toggles, [feat.key]: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Preferences</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
