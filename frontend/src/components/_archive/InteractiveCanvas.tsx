import React, { useState, useEffect, useRef } from 'react';
import type { ScriptBeat, ShowrunnerProject, TextOverlaySettings, BoundingBox } from '../types';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Type, Crosshair, Sparkles, RefreshCw, Check, X, Film,
  Layers, Sparkle
} from 'lucide-react';

interface InteractiveCanvasProps {
  project: ShowrunnerProject;
  onUpdateBeat: (updatedBeat: ScriptBeat) => void;
  onSelectBeat?: (beatId: number) => void;
  geminiKey?: string;
  theme?: 'light' | 'dark';
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  project,
  onUpdateBeat,
  onSelectBeat,
  geminiKey,
  theme = 'light'
}) => {
  const isLight = theme === 'light';
  const beats = project.script_beats;
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '2.39:1'>('16:9');
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  // Direct Manipulation Text Layer State (0 AI Tokens)
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [overlaySettings, setOverlaySettings] = useState<TextOverlaySettings>({
    text: beats[0]?.title ? beats[0].title.toUpperCase() : 'CRAFTING THE NARRATIVE',
    fontFamily: 'Cinzel',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    shadow: true,
    letterSpacing: '0.15em',
    positionY: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  });

  // Spatial Comment / Circle & Markup Mode State
  const [isMarkupMode, setIsMarkupMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<BoundingBox | null>(null);
  const [markupInstruction, setMarkupInstruction] = useState('');
  const [isSubmittingMarkup, setIsSubmittingMarkup] = useState(false);
  const [markupNotification, setMarkupNotification] = useState<string | null>(null);

  // Video viewport container ref
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentBeat = beats[currentBeatIndex] || beats[0];

  // Update overlay title when beat changes if not actively edited
  useEffect(() => {
    if (currentBeat && !isTextSelected) {
      setOverlaySettings(prev => ({
        ...prev,
        text: currentBeat.title.toUpperCase()
      }));
    }
  }, [currentBeatIndex, currentBeat, isTextSelected]);

  // Handle Web Speech Synthesis for Voiceover
  useEffect(() => {
    if (!isPlaying || !voiceoverEnabled || !currentBeat) {
      window.speechSynthesis?.cancel();
      setIsAudioSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentBeat.audio_narration);
      utterance.rate = Math.min(Math.max(playbackSpeed, 0.8), 1.5);
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsAudioSpeaking(true);
      utterance.onend = () => {
        setIsAudioSpeaking(false);
        // Advance to next beat if playing
        if (isPlaying) {
          if (currentBeatIndex < beats.length - 1) {
            setCurrentBeatIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }
      };
      utterance.onerror = () => setIsAudioSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [currentBeatIndex, isPlaying, voiceoverEnabled, playbackSpeed]);

  // Timeline playhead step interval if speech synthesis is muted
  useEffect(() => {
    if (!isPlaying || voiceoverEnabled) return;

    const beatDurationMs = (currentBeat?.estimated_duration_sec || 10) * 1000 / playbackSpeed;
    const timer = setTimeout(() => {
      if (currentBeatIndex < beats.length - 1) {
        setCurrentBeatIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, beatDurationMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentBeatIndex, voiceoverEnabled, playbackSpeed, currentBeat]);

  // Circle & Comment Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMarkupMode || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const curX = ((e.clientX - rect.left) / rect.width) * 100;
    const curY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(startPos.x, curX);
    const y = Math.min(startPos.y, curY);
    const width = Math.abs(curX - startPos.x);
    const height = Math.abs(curY - startPos.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentBox && (currentBox.width < 3 || currentBox.height < 3)) {
      // Ignored accidental tiny click
      setCurrentBox(null);
    }
  };

  const submitSpatialComment = async () => {
    if (!currentBox || !markupInstruction.trim()) return;
    setIsSubmittingMarkup(true);
    try {
      const res = await fetch('/api/player/spatial-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.project_id,
          beat_id: currentBeat.beat_id,
          bounding_box: currentBox,
          instruction: markupInstruction,
          gemini_api_key: geminiKey || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateBeat(data.updated_beat);
        setMarkupNotification(data.applied_directive);
        setTimeout(() => setMarkupNotification(null), 5000);
        setCurrentBox(null);
        setMarkupInstruction('');
        setIsMarkupMode(false);
      }
    } catch (err) {
      console.error('Spatial comment error:', err);
      alert('Failed to submit spatial comment');
    } finally {
      setIsSubmittingMarkup(false);
    }
  };

  const handleTrimBeat = (beatIndex: number, deltaSec: number) => {
    const targetBeat = beats[beatIndex];
    if (!targetBeat) return;
    const newDur = Math.max(3, Math.min(60, targetBeat.estimated_duration_sec + deltaSec));
    const updated = { ...targetBeat, estimated_duration_sec: newDur };
    onUpdateBeat(updated);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[360px] mx-auto';
      case '2.39:1':
        return 'aspect-[2.39/1] w-full';
      case '16:9':
      default:
        return 'aspect-video w-full';
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden border transition-colors ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800/80 shadow-2xl'
    }`}>
      
      {/* Top Player Control Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 text-xs ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono font-medium ${
            isLight ? 'bg-lime-100 text-lime-800 border border-lime-200' : 'bg-lime-500/10 text-lime-400 border border-lime-500/20'
          }`}>
            <Film className="w-3.5 h-3.5" />
            INTERACTIVE CANVAS
          </span>
          <span className={`font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Beat {currentBeatIndex + 1} / {beats.length}
          </span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-500'}>•</span>
          <span className={`font-medium hidden sm:inline truncate max-w-[200px] ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
            {currentBeat?.title}
          </span>
        </div>

        {/* Viewfinder Aspect Ratio & Mode Toggles */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              onClick={() => setAspectRatio('16:9')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                aspectRatio === '16:9' 
                  ? isLight ? 'bg-lime-500 text-slate-950 font-bold' : 'bg-slate-800 text-white font-bold' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9
            </button>
            <button
              onClick={() => setAspectRatio('2.39:1')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                aspectRatio === '2.39:1' 
                  ? isLight ? 'bg-lime-500 text-slate-950 font-bold' : 'bg-slate-800 text-lime-400 font-bold' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              2.39:1
            </button>
            <button
              onClick={() => setAspectRatio('9:16')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                aspectRatio === '9:16' 
                  ? isLight ? 'bg-lime-500 text-slate-950 font-bold' : 'bg-slate-800 text-sky-400 font-bold' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16
            </button>
          </div>

          {/* Circle & Comment Markup Toggle */}
          <button
            onClick={() => {
              setIsMarkupMode(!isMarkupMode);
              setIsTextSelected(false);
              setCurrentBox(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isMarkupMode
                ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 animate-pulse'
                : isLight
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Click and drag on the frame to give spatial feedback to the AI Visual Director"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isMarkupMode ? 'Cancel Markup' : 'Circle & Comment'}</span>
          </button>
        </div>
      </div>

      {/* Main Viewport & Previs Stage */}
      <div className="flex-1 bg-black p-4 flex items-center justify-center relative overflow-hidden select-none">
        
        {/* Floating Notification for AI Spatial Director */}
        {markupNotification && (
          <div className="absolute top-6 z-40 max-w-md px-4 py-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-fade-in">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
            <div>
              <span className="font-bold">Visual Director Update:</span> {markupNotification}
            </div>
          </div>
        )}

        {/* Viewfinder Outer Frame */}
        <div 
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`${getAspectClass()} relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50 shadow-2xl cursor-${
            isMarkupMode ? 'crosshair' : 'default'
          }`}
        >
          {/* Simulated Previs Generative Canvas */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center overflow-hidden">
            
            {/* Dynamic Starfield / Atmospheric Motion Graphic */}
            <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-transparent" />
            
            {/* Animated Grid / Horizon Lines */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Simulated Dynamic Visual Elements based on Beat */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-cyan-300 font-mono tracking-wider backdrop-blur-md">
                <Sparkle className="w-3 h-3 text-cyan-400" />
                PREVIS SHOT: {currentBeat?.shot_type.toUpperCase()}
              </div>

              {/* Graphical Centerpiece */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-amber-500/20 border border-cyan-400/30 flex items-center justify-center shadow-2xl relative group">
                <div className="w-12 h-12 rounded-full border-2 border-amber-400/60 border-dashed animate-spin" />
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping absolute" />
                <div className="text-[10px] text-slate-400 font-mono absolute -bottom-5">
                  {currentBeat?.asset_requirement.split('+')[0] || 'VFX Render'}
                </div>
              </div>

              <p className="text-xs text-slate-400 font-mono italic max-w-md line-clamp-2 px-2">
                "{currentBeat?.visual_description}"
              </p>
            </div>

            {/* 35mm Film Grain & Vignette Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />

            {/* Cinemascope Anamorphic Letterbox Bars if selected */}
            {aspectRatio === '2.39:1' && (
              <>
                <div className="absolute top-0 inset-x-0 h-4 bg-black/90 pointer-events-none border-b border-amber-500/20" />
                <div className="absolute bottom-0 inset-x-0 h-4 bg-black/90 pointer-events-none border-t border-amber-500/20" />
              </>
            )}

            {/* Rule-of-Thirds Grid Guides (subtle) */}
            <div className="absolute inset-0 pointer-events-none opacity-10 flex">
              <div className="w-1/3 border-r border-white" />
              <div className="w-1/3 border-r border-white" />
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-10 flex flex-col">
              <div className="h-1/3 border-b border-white" />
              <div className="h-1/3 border-b border-white" />
            </div>
          </div>

          {/* DIRECT-MANIPULATION ON-CANVAS TEXT LAYER (Scrimba Style) */}
          <div 
            onClick={(e) => {
              if (isMarkupMode) return;
              e.stopPropagation();
              setIsTextSelected(true);
            }}
            className={`absolute inset-x-6 z-20 flex flex-col items-center justify-center cursor-pointer transition-all ${
              overlaySettings.positionY === 'top' ? 'top-8' :
              overlaySettings.positionY === 'bottom' ? 'bottom-12' : 'top-1/2 -translate-y-1/2'
            }`}
          >
            <div
              style={{
                fontFamily: overlaySettings.fontFamily,
                fontSize: `${overlaySettings.fontSize}px`,
                fontWeight: overlaySettings.fontWeight,
                color: overlaySettings.color,
                letterSpacing: overlaySettings.letterSpacing,
                textShadow: overlaySettings.shadow ? '0 4px 16px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)' : 'none',
                backgroundColor: overlaySettings.backgroundColor,
                padding: '6px 16px',
                borderRadius: '8px'
              }}
              className={`select-none text-center transition-all ${
                isTextSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-black scale-105 shadow-2xl' : 'hover:ring-1 hover:ring-amber-400/50'
              }`}
            >
              {overlaySettings.text}
            </div>

            {/* Hint when hovered */}
            {!isTextSelected && !isMarkupMode && (
              <span className="opacity-0 hover:opacity-100 text-[10px] text-amber-400 bg-black/80 px-2 py-0.5 rounded font-mono mt-1 transition-opacity">
                Click to edit text & typography (0 AI tokens)
              </span>
            )}
          </div>

          {/* ACTIVE DRAWING BOUNDING BOX */}
          {currentBox && (
            <div
              style={{
                left: `${currentBox.x}%`,
                top: `${currentBox.y}%`,
                width: `${currentBox.width}%`,
                height: `${currentBox.height}%`
              }}
              className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-md z-30 pointer-events-none transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              <div className="absolute -top-6 left-0 bg-rose-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow">
                TARGET REGION ({Math.round(currentBox.width)}% × {Math.round(currentBox.height)}%)
              </div>
            </div>
          )}

          {/* SPATIAL COMMENT PROMPT MODAL (Anchored to Box) */}
          {currentBox && !isDrawing && (
            <div 
              style={{
                left: `${Math.min(currentBox.x + currentBox.width + 2, 60)}%`,
                top: `${Math.min(currentBox.y, 60)}%`
              }}
              className="absolute z-40 w-72 bg-slate-900/95 border border-rose-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md space-y-2.5 animate-scale-in"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
                <span className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                  Director Spatial Instruction
                </span>
                <button 
                  onClick={() => setCurrentBox(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                value={markupInstruction}
                onChange={(e) => setMarkupInstruction(e.target.value)}
                placeholder="e.g., Add flickering CRT radar screen with green phosphor telemetry..."
                className="w-full h-16 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none font-sans"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setCurrentBox(null)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={submitSpatialComment}
                  disabled={isSubmittingMarkup || !markupInstruction.trim()}
                  className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-md transition-all"
                >
                  {isSubmittingMarkup ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>Direct AI</span>
                </button>
              </div>
            </div>
          )}

          {/* FLOATING TEXT INSPECTOR TOOLBOX (Scrimba On-Canvas Editor) */}
          {isTextSelected && (
            <div className="absolute bottom-4 inset-x-4 z-40 bg-slate-900/95 border border-amber-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-slide-up">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-mono text-xs font-bold flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" />
                  DIRECT TEXT INSPECTOR
                </span>
                <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  0 AI Tokens • Instant Sync
                </span>
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={overlaySettings.text}
                onChange={(e) => setOverlaySettings({ ...overlaySettings, text: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-amber-400 min-w-[200px]"
              />

              {/* Font Family Selector */}
              <select
                value={overlaySettings.fontFamily}
                onChange={(e) => setOverlaySettings({ ...overlaySettings, fontFamily: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="Cinzel">Cinzel (Cinematic)</option>
                <option value="Oswald">Oswald (Documentary)</option>
                <option value="Inter">Inter (Minimal)</option>
                <option value="Impact">Impact (Punchy)</option>
                <option value="JetBrains Mono">JetBrains Mono (Code/Tech)</option>
                <option value="Georgia">Georgia (Editorial)</option>
              </select>

              {/* Font Size Slider */}
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span>Size</span>
                <input
                  type="range"
                  min="16"
                  max="54"
                  value={overlaySettings.fontSize}
                  onChange={(e) => setOverlaySettings({ ...overlaySettings, fontSize: Number(e.target.value) })}
                  className="w-20 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-[11px] text-slate-400">{overlaySettings.fontSize}px</span>
              </div>

              {/* Position Buttons */}
              <div className="flex items-center bg-slate-950 rounded p-0.5 border border-slate-800">
                <button
                  onClick={() => setOverlaySettings({ ...overlaySettings, positionY: 'top' })}
                  className={`px-2 py-0.5 text-[10px] rounded ${overlaySettings.positionY === 'top' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'}`}
                >
                  Top
                </button>
                <button
                  onClick={() => setOverlaySettings({ ...overlaySettings, positionY: 'center' })}
                  className={`px-2 py-0.5 text-[10px] rounded ${overlaySettings.positionY === 'center' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'}`}
                >
                  Mid
                </button>
                <button
                  onClick={() => setOverlaySettings({ ...overlaySettings, positionY: 'bottom' })}
                  className={`px-2 py-0.5 text-[10px] rounded ${overlaySettings.positionY === 'bottom' ? 'bg-slate-800 text-amber-400' : 'text-slate-400'}`}
                >
                  Lower
                </button>
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1">
                {['#ffffff', '#f59e0b', '#38bdf8', '#ef4444', '#10b981'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setOverlaySettings({ ...overlaySettings, color: c })}
                    style={{ backgroundColor: c }}
                    className={`w-4 h-4 rounded-full border border-black transition-transform ${
                      overlaySettings.color === c ? 'scale-125 ring-2 ring-white' : ''
                    }`}
                  />
                ))}
              </div>

              {/* Done Button */}
              <button
                onClick={() => {
                  setIsTextSelected(false);
                  // Sync title back to beat
                  if (currentBeat) {
                    onUpdateBeat({
                      ...currentBeat,
                      title: overlaySettings.text
                    });
                  }
                }}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              >
                <Check className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          )}

          {/* Timecode & HUD Watermark */}
          <div className="absolute bottom-3 left-4 z-10 flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md">
            <span className="text-amber-400 font-semibold">TC {currentBeat?.timestamp}</span>
            <span>•</span>
            <span>{currentBeat?.camera_movement}</span>
            <span>•</span>
            <span className="text-cyan-300">{currentBeat?.lighting_tone}</span>
          </div>
        </div>
      </div>

      {/* Playback Controls & Voiceover Audio Strip */}
      <div className={`px-4 py-3 border-t flex items-center justify-between gap-4 ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        
        {/* Play / Skip / Speed controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentBeatIndex(prev => Math.max(0, prev - 1))}
            disabled={currentBeatIndex === 0}
            className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 ${
              isLight ? 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Previous Beat"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold shadow-md shadow-lime-500/20 transition-all cursor-pointer"
            title={isPlaying ? 'Pause Playback' : 'Play Previs'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950" />}
          </button>

          <button
            onClick={() => setCurrentBeatIndex(prev => Math.min(beats.length - 1, prev + 1))}
            disabled={currentBeatIndex === beats.length - 1}
            className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-30 ${
              isLight ? 'bg-white border border-slate-200 text-slate-700 hover:text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="Next Beat"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Ramping */}
          <div className={`ml-2 flex items-center rounded-lg p-0.5 border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {[0.75, 1.0, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer ${
                  playbackSpeed === s 
                    ? isLight ? 'bg-lime-500 text-slate-950 font-bold' : 'bg-slate-800 text-lime-400 font-bold' 
                    : isLight ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Voiceover Scratch Track & Waveform */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              voiceoverEnabled 
                ? isLight ? 'bg-lime-100 text-lime-800 border-lime-300' : 'bg-lime-500/10 text-lime-400 border-lime-500/30'
                : isLight ? 'bg-white text-slate-500 border-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {voiceoverEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voiceover {voiceoverEnabled ? 'ON' : 'MUTE'}</span>
          </button>

          {/* Audio Waveform Pulse */}
          <div className={`flex items-center gap-1 h-5 px-2 rounded border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {[40, 70, 30, 90, 60, 80, 45, 100].map((h, i) => (
              <div
                key={i}
                style={{ height: isAudioSpeaking ? `${h}%` : '20%' }}
                className={`w-0.5 rounded-full transition-all duration-150 ${
                  isAudioSpeaking 
                    ? isLight ? 'bg-lime-600' : 'bg-lime-400' 
                    : isLight ? 'bg-slate-300' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SCRIMBA-STYLE BEAT TIMELINE & TRIMMING STRIP */}
      <div className={`p-3 border-t space-y-2 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800/80'
      }`}>
        <div className={`flex items-center justify-between text-[11px] font-mono ${
          isLight ? 'text-slate-500' : 'text-slate-400'
        }`}>
          <span className={`flex items-center gap-1 ${isLight ? 'text-slate-800 font-semibold' : 'text-slate-300'}`}>
            <Layers className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-lime-400'}`} />
            INTERACTIVE BEAT TIMELINE (Click Beat to Jump • Click +/- to Trim)
          </span>
          <span>
            Total: {project.metrics.total_runtime_seconds}s (~{Math.round(project.metrics.total_runtime_seconds / 60)}m)
          </span>
        </div>

        {/* Timeline Blocks */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
          {beats.map((beat, idx) => {
            const isActive = idx === currentBeatIndex;
            return (
              <div
                key={beat.beat_id}
                onClick={() => {
                  setCurrentBeatIndex(idx);
                  if (onSelectBeat) onSelectBeat(beat.beat_id);
                }}
                className={`group relative flex-1 min-w-[130px] p-2 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? isLight
                      ? 'bg-lime-50 border-lime-500 shadow-sm ring-1 ring-lime-400'
                      : 'bg-slate-800/90 border-lime-500 shadow-lg ring-1 ring-lime-500/40'
                    : isLight
                      ? 'bg-slate-50 border-slate-200 hover:border-lime-400 hover:bg-lime-50/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {/* Header with Narrative Role */}
                <div className="flex items-center justify-between gap-1 text-[10px] font-mono">
                  <span className={`font-semibold ${
                    beat.narrative_function === 'Hook' ? (isLight ? 'text-lime-700' : 'text-emerald-400') :
                    beat.narrative_function === 'Climax' ? (isLight ? 'text-amber-700' : 'text-amber-400') : (isLight ? 'text-sky-700' : 'text-sky-400')
                  }`}>
                    {beat.narrative_function.toUpperCase()}
                  </span>
                  <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{beat.estimated_duration_sec}s</span>
                </div>

                {/* Title */}
                <div className={`text-xs font-semibold truncate mt-1 ${
                  isLight ? 'text-slate-900' : 'text-slate-200'
                }`}>
                  {beat.title}
                </div>

                {/* Trimming Adjusters (+/-) */}
                <div className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                  isLight ? 'border-slate-200' : 'border-slate-800/60'
                }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrimBeat(idx, -2);
                    }}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-500 hover:text-white hover:bg-slate-700'
                    }`}
                    title="Trim -2 seconds"
                  >
                    -2s
                  </button>
                  <span className={`font-mono text-[9px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>TRIM</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrimBeat(idx, +2);
                    }}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${
                      isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200' : 'text-slate-500 hover:text-white hover:bg-slate-700'
                    }`}
                    title="Extend +2 seconds"
                  >
                    +2s
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

