import React from 'react';
import type { ResearchDossier } from '../types';
import { Globe, ExternalLink, ShieldCheck, AlertCircle, BookOpen, Image as ImageIcon } from 'lucide-react';

interface ResearchDrawerProps {
  research: ResearchDossier;
}

export const ResearchDrawer: React.FC<ResearchDrawerProps> = ({ research }) => {
  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-2">
          <Globe className="w-4 h-4" />
          <span className="uppercase tracking-wider">Parallel Web Systems Intelligence Dossier</span>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1.5">{research.topic}</h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">{research.summary}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Key Verified Facts & Competitor Blindspots */}
        <div className="space-y-5">
          
          {/* Key Facts */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Historical & Scientific Facts ({research.key_facts.length})</span>
            </h4>
            
            <div className="space-y-2.5">
              {research.key_facts.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5">
                  <p className="text-slate-200 leading-relaxed font-medium">
                    "{item.fact}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <span className="text-slate-400 font-mono truncate max-w-[260px]">
                      {item.source_title}
                    </span>
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono shrink-0"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Blindspots */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--gold-400)]" />
              <span>Competitor Video Blindspots & Narrative Gaps</span>
            </h4>
            <div className="space-y-2">
              {research.competitor_blindspots.map((gap, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--gold-500)]/5 border border-[var(--gold-500)]/20 text-xs text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-[var(--gold-500)]/20 text-[var(--gold-400)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-snug">{gap}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Web Sources & Visual Keywords */}
        <div className="space-y-5">
          
          {/* Parallel Web Sources */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Grounded Web Sources ({research.sources.length})</span>
            </h4>

            <div className="space-y-3">
              {research.sources.map((source, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-slate-200 line-clamp-1">{source.title}</h5>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-200 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <span className="inline-block px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 text-[10px] font-mono">
                    {source.domain || "web"}
                  </span>

                  {source.excerpts && source.excerpts.length > 0 && (
                    <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3 bg-slate-900/50 p-2 rounded border border-slate-800">
                      {source.excerpts[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Visual Keywords */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>Visual & Archive Footage Keywords</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {research.visual_reference_keywords.map((kw, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
