import React, { useState } from 'react';
import type { ScriptBeat } from '../types';
import { 
  Volume2, 
  Video, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  Compass, 
  Camera, 
  Zap 
} from 'lucide-react';

interface AVScriptViewProps {
  beats: ScriptBeat[];
  projectTitle?: string;
}

export const AVScriptView: React.FC<AVScriptViewProps> = ({ beats, projectTitle }) => {
  const [selectedBeatId, setSelectedBeatId] = useState<number>(beats[0]?.beat_id || 1);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!beats || beats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Video className="w-12 h-12 mb-4 opacity-50" />
        <p>No narrative beats generated yet.</p>
      </div>
    );
  }

  const handleCopyBeat = (beat: ScriptBeat) => {
    const text = `[${beat.timestamp}] ${beat.title}\nAUDIO:\n${beat.audio_narration}\n(SFX: ${beat.audio_sfx_cues})\n\nVISUAL:\n${beat.visual_description}\n(Shot: ${beat.shot_type} | Move: ${beat.camera_movement} | Light: ${beat.lighting_tone})`;
    navigator.clipboard.writeText(text);
    setCopiedId(beat.beat_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Column Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>{projectTitle ? `${projectTitle} - AV Screenplay` : 'Two-Column AV Screenplay'}</span>
            <span className="text-xs font-normal text-slate-400">({beats.length} Narrative Beats)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Synchronized Audio & Visual directions for showrunner, voice actor, video editor & 3D animator.
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-sky-400 font-medium">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Audio / Narration</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 font-medium" style={{ color: 'var(--gold-400)' }}>
            <Video className="w-3.5 h-3.5" />
            <span>Visual Storyboard</span>
          </div>
        </div>
      </div>

      {/* Synchronized Beat Rows */}
      <div className="space-y-4">
        {beats.map((beat) => {
          const isSelected = selectedBeatId === beat.beat_id;
          
          return (
            <div
              key={beat.beat_id}
              onClick={() => setSelectedBeatId(beat.beat_id)}
              className={`rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/90 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
              style={isSelected ? {
                borderColor: 'color-mix(in srgb, var(--gold-500) 50%, transparent)',
                boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--gold-500) 5%, transparent)',
                outline: '1px solid color-mix(in srgb, var(--gold-500) 30%, transparent)'
              } : undefined}
            >
              {/* Beat Banner */}
              <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span 
                    className="px-2 py-0.5 rounded font-mono font-bold text-[11px] border"
                    style={{ 
                      backgroundColor: 'color-mix(in srgb, var(--gold-500) 20%, transparent)',
                      color: 'var(--gold-400)',
                      borderColor: 'color-mix(in srgb, var(--gold-500) 30%, transparent)'
                    }}
                  >
                    BEAT #{beat.beat_id}
                  </span>
                  <span className="font-semibold text-slate-200">{beat.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-400">
                    {beat.narrative_function}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{beat.timestamp}</span>
                    <span className="text-slate-600">({beat.estimated_duration_sec}s)</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyBeat(beat);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                    title="Copy Beat Text"
                  >
                    {copiedId === beat.beat_id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Two-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
                
                {/* Left Column: AUDIO (Voiceover & Sound Design) */}
                <div className="p-4 space-y-3 bg-slate-950/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
                    <Volume2 className="w-4 h-4" />
                    <span className="tracking-wide uppercase text-[11px]">Audio Narration & Voiceover</span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-serif italic selection:bg-sky-500/30">
                    "{beat.audio_narration}"
                  </p>

                  {beat.audio_sfx_cues && (
                    <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/30 text-xs">
                      <div className="flex items-center gap-1.5 text-sky-300 font-semibold mb-1 text-[11px]">
                        <Zap className="w-3.5 h-3.5 text-sky-400" />
                        <span>Sound Design & SFX Cues</span>
                      </div>
                      <p className="text-sky-200/80 text-[11px] leading-normal font-mono">
                        {beat.audio_sfx_cues}
                      </p>
                    </div>
                  )}

                  {beat.source_citations.length > 0 && (
                    <div className="pt-1 text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-slate-400">Grounding Sources:</span>
                      {beat.source_citations.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline truncate max-w-[200px]"
                          style={{ color: 'color-mix(in srgb, var(--gold-400) 80%, transparent)' }}
                        >
                          {url.replace('https://', '').split('/')[0]}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: VISUAL (Cinematography & Storyboard Cues) */}
                <div className="p-4 space-y-3 bg-slate-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--gold-400)' }}>
                      <Video className="w-4 h-4" />
                      <span className="tracking-wide uppercase text-[11px]">Visual Storyboard Directives</span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {beat.asset_requirement}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {beat.visual_description}
                  </p>

                  {/* Badges: Shot Type, Camera Move, Lighting */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1 border border-slate-700">
                      <Camera className="w-3 h-3" style={{ color: 'var(--gold-400)' }} />
                      <span>{beat.shot_type}</span>
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1 border border-slate-700">
                      <Compass className="w-3 h-3 text-sky-400" />
                      <span>{beat.camera_movement}</span>
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-medium flex items-center gap-1 border border-slate-700">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>{beat.lighting_tone}</span>
                    </span>
                  </div>

                  {/* Retention Alert Banner if scene duration is long */}
                  {beat.retention_flag && (
                    <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 flex items-start gap-2 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-rose-300 text-[11px]">
                          Retention Pacing Alert:
                        </span>
                        <p className="text-rose-200/80 text-[11px] leading-tight mt-0.5">
                          {beat.retention_advice || "Narration duration exceeds recommended cut interval. Insert dynamic B-roll or kinetic typography."}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
