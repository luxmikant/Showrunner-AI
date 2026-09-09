import React, { useState } from 'react';
import type { ShowrunnerProject } from '../types';
import { 
  FolderPlus, MessageSquare, Settings, Film, 
  Layers, Compass, Radio, Clapperboard
} from 'lucide-react';

interface SidebarProps {
  project: ShowrunnerProject | null;
  onNewProject: () => void;
  onSelectSampleProject?: () => void;
  onOpenSettings: () => void;
  onReturnToLanding: () => void;
  activeConversation: string;
  onSelectConversation: (name: string) => void;
  parallelConfigured: boolean;
  geminiConfigured: boolean;
  theme?: 'light' | 'dark';
}

export const Sidebar: React.FC<SidebarProps> = ({
  project,
  onNewProject,
  onOpenSettings,
  onReturnToLanding,
  activeConversation,
  onSelectConversation,
  parallelConfigured,
  geminiConfigured,
  theme = 'light'
}) => {
  const [activeCategory, setActiveCategory] = useState('YouTube Narrative Shorts (10-20m)');

  const categories = [
    { name: 'YouTube Narrative Shorts (10-20m)', icon: Film, count: project ? 1 : 0 },
    { name: 'Sci-Fi Video Essays', icon: Compass, count: 0 },
    { name: 'Investigative Lore / Docuseries', icon: Radio, count: 0 },
    { name: 'Scripted Podcasts & Audio Dramas', icon: MessageSquare, count: 0 }
  ];

  const conversationThreads = [
    { id: 'showrunner', name: 'Showrunner Chat Harness', role: 'General Direction' },
    { id: 'visual', name: 'Visual Previs & Cinematography', role: 'Agent 3: Visual Director' },
    { id: 'retention', name: 'Retention & Hook Audit', role: 'Agent 4: Retention Auditor' },
    { id: 'parallel', name: 'Parallel Web Lore Scout', role: 'Agent 1: Trend Scout' }
  ];

  const isLight = theme === 'light';

  return (
    <aside className={`w-72 flex flex-col h-full select-none shrink-0 font-sans border-r transition-colors ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800' 
        : 'bg-slate-950 border-slate-800/80 text-slate-100'
    }`}>
      
      {/* Studio Brand & Return Button */}
      <div className={`p-4 border-b flex items-center justify-between ${
        isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800/80 bg-slate-950'
      }`}>
        <button
          onClick={onReturnToLanding}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
          title="Return to Story Landing Page"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isLight
              ? 'bg-lime-500 text-slate-950 shadow-sm shadow-lime-500/30'
              : 'bg-lime-500/10 border border-lime-500/30 text-lime-400 group-hover:bg-lime-500 group-hover:text-slate-950'
          }`}>
            <Clapperboard className="w-4 h-4" />
          </div>
          <div>
            <div className={`text-xs font-bold transition-colors ${
              isLight ? 'text-slate-900 group-hover:text-lime-700' : 'text-white group-hover:text-lime-400'
            }`}>
              Showrunner AI
            </div>
            <div className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ← Back to Overview
            </div>
          </div>
        </button>

        <button
          onClick={onNewProject}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-[11px] font-medium cursor-pointer ${
            isLight
              ? 'bg-lime-100 hover:bg-lime-200 text-lime-800 border border-lime-300'
              : 'bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/20 hover:border-lime-500/40'
          }`}
          title="Start a new filmmaking project"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* Scrollable Nav Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        
        {/* Active Project Card */}
        {project ? (
          <div className={`p-3 rounded-xl border shadow-sm relative ${
            isLight
              ? 'bg-slate-50 border-lime-500/40 text-slate-900'
              : 'bg-gradient-to-b from-slate-900 to-slate-900/60 border-lime-500/30 text-white shadow-lg'
          }`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold flex items-center gap-1 ${
                isLight ? 'text-lime-700' : 'text-lime-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Project
              </span>
              <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {project.script_beats.length} Beats
              </span>
            </div>
            <div className={`text-xs font-bold line-clamp-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {project.title}
            </div>
            <div className={`text-[11px] line-clamp-2 mt-1 italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              "{project.logline}"
            </div>
          </div>
        ) : (
          <div className={`p-3 rounded-xl border border-dashed text-center space-y-1 ${
            isLight ? 'border-slate-300 bg-slate-50/50' : 'border-slate-800 bg-slate-900/30'
          }`}>
            <div className={`text-xs font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              No Active Project
            </div>
            <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Pitch an idea in chat to orchestrate
            </div>
          </div>
        )}

        {/* PROJECT CATEGORIES SECTION */}
        <div className="space-y-1.5">
          <div className={`px-2 text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center justify-between ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>Project Categories</span>
            <Layers className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-0.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-lime-100 text-lime-900 font-semibold border border-lime-300/80'
                        : 'bg-slate-800 text-lime-300 font-semibold border border-lime-500/30'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    isLight 
                      ? 'bg-white text-slate-500 border-slate-200' 
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONVERSATION THREADS SECTION */}
        <div className="space-y-1.5">
          <div className={`px-2 text-[10px] font-mono font-semibold uppercase tracking-wider flex items-center justify-between ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>Conversations</span>
            <MessageSquare className="w-3 h-3 text-slate-400" />
          </div>

          <div className="space-y-0.5">
            {conversationThreads.map((thread) => {
              const isSelected = activeConversation === thread.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => onSelectConversation(thread.id)}
                  className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? 'bg-lime-50 text-slate-900 border border-lime-400 font-medium'
                        : 'bg-slate-800/90 text-white border border-lime-500/30'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                    isSelected 
                      ? isLight ? 'text-lime-700' : 'text-lime-400' 
                      : 'text-slate-400'
                  }`} />
                  <div className="truncate">
                    <div className="text-xs font-medium truncate">{thread.name}</div>
                    <div className={`text-[10px] font-mono truncate ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      {thread.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Extreme Left Bottom: Settings & Provider Indicators */}
      <div className={`p-3 border-t space-y-2 ${
        isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800/80 bg-slate-950/80'
      }`}>
        
        {/* API Engine Status Pills */}
        <div className="space-y-1">
          <div className={`px-2.5 py-1 rounded-lg border flex items-center justify-between text-[10px] font-mono ${
            isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${parallelConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span>Parallel Web API</span>
            </div>
            <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>
              {parallelConfigured ? 'Live' : 'Ready'}
            </span>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border flex items-center justify-between text-[10px] font-mono ${
            isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${geminiConfigured ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span>Gemini 2.5 Flash</span>
            </div>
            <span className={isLight ? 'text-slate-500' : 'text-slate-500'}>
              {geminiConfigured ? 'Live' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Settings Modal Button */}
        <button
          onClick={onOpenSettings}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-xs cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>API Keys &amp; Settings</span>
          </div>
          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
            BYO-AI
          </span>
        </button>
      </div>

    </aside>
  );
};


