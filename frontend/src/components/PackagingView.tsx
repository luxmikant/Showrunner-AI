import React, { useState } from 'react';
import type { PackagingSuite, PacingMetrics } from '../types';
import { Target, Image as ImageIcon, Flame, Copy, Check, TrendingUp, AlertTriangle } from 'lucide-react';

interface PackagingViewProps {
  packaging: PackagingSuite;
  metrics: PacingMetrics;
}

export const PackagingView: React.FC<PackagingViewProps> = ({ packaging, metrics }) => {
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);

  const handleCopyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedTitleIndex(index);
    setTimeout(() => setCopiedTitleIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Retention & Hook Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Hook Score */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white font-mono">
                {packaging.first_60s_hook_score}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              0:00 - 0:45 Cold Hook Score
            </p>
          </div>
        </div>

        {/* Total Visual Cuts */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white font-mono">
                {metrics.total_visual_cuts}
              </span>
              <span className="text-xs text-slate-400 font-mono">Cuts</span>
            </div>
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Avg Cut: {metrics.average_cut_duration_sec}s
            </p>
          </div>
        </div>

        {/* Overall Retention Health */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[var(--gold-500)]/10 border border-[var(--gold-500)]/30 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-[var(--gold-400)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-white font-mono">
                {metrics.retention_health_score}%
              </span>
              <span className="text-xs text-emerald-400 font-mono">Optimal</span>
            </div>
            <p className="text-xs font-semibold text-[var(--gold-400)] uppercase tracking-wider">
              Pacing Retention Index
            </p>
          </div>
        </div>

      </div>

      {/* Pacing Warnings Banner if any */}
      {metrics.pacing_warnings && metrics.pacing_warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Auditor Retention Warnings</span>
          </div>
          <div className="space-y-1.5 pl-6 list-disc text-xs text-rose-200/90">
            {metrics.pacing_warnings.map((warn, i) => (
               <p key={i}>• {warn}</p>
            ))}
          </div>
        </div>
      )}

      {/* High-CTR Titles Section */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--gold-500)]" />
          <span>High-CTR Title Options ({packaging.high_ctr_titles.length})</span>
        </h3>

        <div className="space-y-3">
          {packaging.high_ctr_titles.map((titleOpt, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-[var(--gold-500)]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--gold-500)]/10 text-[var(--gold-400)] border border-[var(--gold-500)]/30">
                    OPTION #{idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {titleOpt.angle}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {titleOpt.estimated_ctr_tier}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100">{titleOpt.title}</h4>
              </div>

              <button
                onClick={() => handleCopyTitle(titleOpt.title, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition self-start sm:self-auto shrink-0"
              >
                {copiedTitleIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Title</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Thumbnail Concepts */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-400" />
          <span>Visual Thumbnail Concepts ({packaging.thumbnail_concepts.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packaging.thumbnail_concepts.map((thumb, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-4 space-y-3 shadow-md"
            >
              {/* Simulated 16:9 Thumbnail Visual */}
              <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 relative flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                  {thumb.concept_name}
                </span>
                
                {/* Bold Click-Driving Text Overlay */}
                <span className="text-xl font-black tracking-tight text-[var(--gold-400)] uppercase drop-shadow-[0_2px_10px_rgba(212,168,83,0.5)]">
                  {thumb.text_overlay}
                </span>

                <span className="text-[10px] text-slate-400 mt-2 font-mono">
                  {thumb.focal_subject}
                </span>
              </div>

              {/* Specs */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Palette:</span>
                  <span className="text-purple-300 font-mono">{thumb.color_contrast_scheme}</span>
                </div>
                <p className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 line-clamp-3">
                  <span className="font-semibold text-slate-400">Prompt: </span>
                  {thumb.visual_prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
