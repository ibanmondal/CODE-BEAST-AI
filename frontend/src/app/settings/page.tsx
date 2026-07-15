"use client";

import React, { useState } from 'react';
import { Save, Key, Sliders, Webhook, ShieldCheck, GitBranch } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Platform Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure integrations, scoring weights, and agent behaviors.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar Nav for Settings */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {[
            { id: 'api', label: 'API Integrations', icon: Key },
            { id: 'scoring', label: 'Scoring Weights', icon: Sliders },
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
        <div className="flex-1 bg-[#141C2F] border border-gray-800 rounded-xl p-8">
          {activeTab === 'api' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">API Integrations</h2>
                <p className="text-gray-400 text-sm mb-6">Manage API keys for external language models and services.</p>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">OpenAI API Key</label>
                    <input 
                      type="password" 
                      defaultValue="sk-proj-**********************************" 
                      className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Used for GPT-4 fallback if Gemini is unavailable.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Google Gemini API Key</label>
                    <input 
                      type="password" 
                      defaultValue="AIzaSyB*********************************" 
                      className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Primary model for Database agent & Supervisor node.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Groq API Key</label>
                    <input 
                      type="password" 
                      defaultValue="gsk_*******************************************" 
                      className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Used for the high-speed Testing agent (llama-3.1-8b).</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Ollama Local Endpoint</label>
                    <input 
                      type="text" 
                      defaultValue="http://localhost:11434" 
                      className="w-full bg-[#0A0E17] border border-gray-700 text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">Local endpoint for Security, Architecture, and Performance agents.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={() => {
                    setIsSaving(true);
                    setTimeout(() => { setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1000);
                  }}
                  disabled={isSaving || saved}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Scoring Engine Weights</h2>
                <p className="text-gray-400 text-sm mb-6">Adjust the impact of different evaluation metrics on the final deterministic score.</p>
                
                <div className="space-y-6">
                  {[
                    { label: 'Architecture & Modularity', value: 20 },
                    { label: 'Security & Best Practices', value: 15 },
                    { label: 'Performance & Efficiency', value: 15 },
                    { label: 'Testing & CI/CD', value: 20 },
                    { label: 'Database & Data Modeling', value: 20 },
                    { label: 'Originality Penalty', value: 10 },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-medium text-gray-300">{item.label}</label>
                        <span className="text-sm text-blue-400 font-mono">{item.value}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="100" 
                        defaultValue={item.value} 
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 border-t border-gray-800 flex justify-end">
                <button 
                  onClick={() => {
                    setIsSaving(true);
                    setTimeout(() => { setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1000);
                  }}
                  disabled={isSaving || saved}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : saved ? 'Saved!' : <><Save className="w-4 h-4" /> Save Weights</>}
                </button>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
