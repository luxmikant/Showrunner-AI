import React from 'react';
import { Clapperboard, Sparkles, Globe, Download, Settings, Film } from 'lucide-react';
import type { ShowrunnerProject } from '../types';

interface HeaderProps {
  project: ShowrunnerProject | null;
  onOpenSettings: () => void;
  onExport: () => void;
  onLoadExample: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onOpenSettings,
  onExport,
  onLoadExample,
  isLoading
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-white/20">
            <Clapperboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">
                SHOWRUNNER<span className="text-amber-500">.AI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PROD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Autonomous Pre-Production Studio for Digital Filmmakers</span>
            </p>
          </div>
        </div>

        {/* Partner & Tech Badges */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Model:</span>
            <span className="font-medium text-slate-200">Gemini 2.5 Pro</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Search Engine:</span>
            <span className="font-medium text-emerald-300">Parallel Web MCP</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onLoadExample}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition disabled:opacity-50"
            title="Load Flagship Sample Project"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Demo</span>
          </button>

          {project && (
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 transition"
              title="Export Production Bible as Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Script</span>
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-xs border border-slate-700 transition"
            title="Configure API Keys (Parallel & Gemini)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
