import React, { useState } from 'react';
import { Search, Wand2, Compass, Layers, Play, Clock } from 'lucide-react';

interface PromptBarProps {
  onGenerate: (prompt: string, format: string, duration: number) => void;
  isLoading: boolean;
  loadingStep: string;
}

const SAMPLE_TOPICS = [
  "The 1972 Ghost Satellite (Lincoln Experimental Satellite LES-1)",
  "Deep-Sea Internet Fiber Sabotage in the Baltic Sea",
  "The Voynich Manuscript: Cryptography or Medieval Hoax?",
  "The Day Automatic Trading Algorithms Crashed Wall Street"
];

const FORMATS = [
  "YouTube Narrative Short (12-18 mins)",
  "Investigative Video Essay (15-25 mins)",
  "Sci-Fi Narrative Short (10-15 mins)",
  "Scripted Visual Podcast (20-30 mins)"
];

export const PromptBar: React.FC<PromptBarProps> = ({
  onGenerate,
  isLoading,
  loadingStep
}) => {
  const [prompt, setPrompt] = useState(SAMPLE_TOPICS[0]);
  const [format, setFormat] = useState(FORMATS[0]);
  const [duration, setDuration] = useState(14);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onGenerate(prompt, format, duration);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl shadow-black/40">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Main Input Row */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5 text-amber-500/70" />
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a story concept, real-world anomaly, or video essay idea..."
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
            />
          </div>

          {/* Format Selector */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={isLoading}
                aria-label="Target Video Format"
                className="w-full py-3 pl-3 pr-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition cursor-pointer appearance-none"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            {/* Target Duration Selector */}
            <div className="relative w-28 shrink-0">
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isLoading}
                aria-label="Target Runtime Duration"
                className="w-full py-3 pl-7 pr-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition cursor-pointer appearance-none"
              >
                <option value={10}>10 Mins</option>
                <option value={14}>14 Mins</option>
                <option value={18}>18 Mins</option>
                <option value={25}>25 Mins</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                <Clock className="w-3.5 h-3.5 text-amber-500/70" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-orange-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <>
                  <Wand2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Orchestrate</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Quick Suggestions Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
          <span className="flex items-center gap-1 font-medium text-slate-500">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            <span>Story Ideas:</span>
          </span>
          {SAMPLE_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setPrompt(topic)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/60 transition text-[11px] truncate max-w-[280px]"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Live Multi-Agent Progress Notification */}
        {isLoading && (
          <div className="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-semibold text-amber-300">
                Active Multi-Agent Workflow:
              </span>
              <span className="text-xs text-amber-100 font-mono">
                {loadingStep || "Orchestrating agents..."}
              </span>
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono">Parallel Web + Gemini 2.5</span>
          </div>
        )}

      </form>
    </div>
  );
};
