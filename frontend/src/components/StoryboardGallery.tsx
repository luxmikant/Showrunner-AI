import React, { useState } from 'react';
import type { ScriptBeat } from '../types';
import { Palette, Film, Sparkles, Copy, Check, Layers } from 'lucide-react';

interface StoryboardGalleryProps {
  beats: ScriptBeat[];
  projectTitle?: string;
}

export const StoryboardGallery: React.FC<StoryboardGalleryProps> = ({ beats }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyPrompt = (promptText: string, index: number) => {
    navigator.clipboard.writeText(promptText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-500" />
            <span>Visual Storyboard & Previs Gallery</span>
          </h3>
          <p className="text-xs text-slate-400">
            Cinematography directives, composition frames, and asset blueprints for animators and editors.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-850 px-2.5 py-1 rounded border border-slate-750">
          16:9 Widescreen Framing
        </span>
      </div>

      {/* Grid of Storyboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {beats.map((beat, index) => {
          const previsPrompt = `Cinematic ${beat.shot_type.toLowerCase()}, ${beat.visual_description.toLowerCase()}, lighting: ${beat.lighting_tone.toLowerCase()}, 35mm film grain, 8k cinematic frame, masterpiece.`;
          
          return (
            <div
              key={beat.beat_id}
              className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col shadow-lg shadow-black/30 hover:border-amber-500/40 transition group"
            >
              {/* 16:9 Simulated Cinematic Viewfinder */}
              <div className="aspect-video w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative p-3 flex flex-col justify-between border-b border-slate-800/80 overflow-hidden">
                
                {/* Viewfinder Overlay Markers */}
                <div className="absolute inset-2 border border-slate-700/30 rounded pointer-events-none flex items-center justify-center">
                  <div className="w-6 h-6 border-t border-l border-slate-500/40 absolute top-0 left-0" />
                  <div className="w-6 h-6 border-t border-r border-slate-500/40 absolute top-0 right-0" />
                  <div className="w-6 h-6 border-b border-l border-slate-500/40 absolute bottom-0 left-0" />
                  <div className="w-6 h-6 border-b border-r border-slate-500/40 absolute bottom-0 right-0" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                </div>

                {/* Card Top Info */}
                <div className="relative z-10 flex items-center justify-between text-[11px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-amber-400 border border-amber-500/30 font-bold">
                    BEAT #{beat.beat_id}
                  </span>
                  <span className="text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded">
                    {beat.timestamp}
                  </span>
                </div>

                {/* Center Visual Summary */}
                <div className="relative z-10 text-center px-4">
                  <p className="text-xs font-semibold text-slate-200 line-clamp-3 leading-snug drop-shadow-md">
                    {beat.visual_description}
                  </p>
                </div>

                {/* Bottom Badges */}
                <div className="relative z-10 flex items-center justify-between text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                    {beat.shot_type}
                  </span>
                  <span className="text-slate-400 font-mono">
                    {beat.camera_movement}
                  </span>
                </div>

              </div>

              {/* Card Body: Blueprint & Asset Needs */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{beat.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                      {beat.narrative_function}
                    </span>
                  </div>

                  {/* Lighting & Tone */}
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-300">
                    <Palette className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{beat.lighting_tone}</span>
                  </div>

                  {/* Asset Requirement for Editor */}
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{beat.asset_requirement}</span>
                  </div>
                </div>

                {/* Previs Image Prompt for Artists */}
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-amber-400/90">
                      <Sparkles className="w-3 h-3" />
                      <span>Previs Generation Prompt</span>
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(previsPrompt, index)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition"
                      title="Copy Previs Prompt"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="p-2 rounded bg-slate-950/80 border border-slate-850 font-mono text-[10px] text-slate-400 line-clamp-3 select-all">
                    {previsPrompt}
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
