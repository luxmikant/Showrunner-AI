import React, { useState, useEffect } from 'react';
import type { ScriptBeat, ShowrunnerProject, TextOverlaySettings } from '../types';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Download, X, Film, Check,
  Sliders
} from 'lucide-react';

interface StudioVideoPlayerProps {
  project: ShowrunnerProject;
  onUpdateBeat: (updatedBeat: ScriptBeat) => void;
  onClosePlayer: () => void;
  onDownloadPackage: () => void;
}

export const StudioVideoPlayer: React.FC<StudioVideoPlayerProps> = ({
  project,
  onUpdateBeat,
  onClosePlayer,
  onDownloadPackage
}) => {
  const beats = project.script_beats;
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '2.39:1' | '9:16'>('16:9');
  const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
  const [isAudioSpeaking, setIsAudioSpeaking] = useState(false);

  // Active selected component for editing: 'title' | 'subtitle' | null
  const [selectedComponent, setSelectedComponent] = useState<'title' | 'subtitle' | null>(null);

  // Fix stale editor bug
  useEffect(() => {
    setSelectedComponent(null);
  }, [currentBeatIndex]);

  // Direct On-Canvas Typography Settings
  const currentBeat = beats[currentBeatIndex] || beats[0];

  const [titleSettings, setTitleSettings] = useState<TextOverlaySettings>({
    text: currentBeat?.title || 'THE COLD OPEN',
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    shadow: true,
    letterSpacing: '0.12em',
    positionY: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)'
  });

  const [subtitleSettings, setSubtitleSettings] = useState<TextOverlaySettings>({
    text: currentBeat?.audio_narration || 'Voiceover narration text appears here.',
    fontFamily: 'var(--font-body)',
    fontSize: 16,
    fontWeight: 'normal',
    color: '#f1f5f9',
    shadow: true,
    letterSpacing: '0.02em',
    positionY: 'bottom',
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  });

  // Sync state when active beat changes
  useEffect(() => {
    if (currentBeat && selectedComponent === null) {
      setTitleSettings(prev => ({
        ...prev,
        text: currentBeat.title.toUpperCase()
      }));
      setSubtitleSettings(prev => ({
        ...prev,
        text: currentBeat.audio_narration
      }));
    }
  }, [currentBeatIndex, currentBeat, selectedComponent]);

  // Web Speech API Voiceover
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
  }, [currentBeatIndex, isPlaying, voiceoverEnabled, playbackSpeed, currentBeat]);

  // Timed playhead progression if speech synthesis is disabled
  useEffect(() => {
    if (!isPlaying || voiceoverEnabled) return;

    const beatDurationMs = ((currentBeat?.estimated_duration_sec || 10) * 1000) / playbackSpeed;
    const timer = setTimeout(() => {
      if (currentBeatIndex < beats.length - 1) {
        setCurrentBeatIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, beatDurationMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentBeatIndex, voiceoverEnabled, playbackSpeed, currentBeat]);

  const handleApplyTitleEdit = () => {
    if (currentBeat) {
      onUpdateBeat({
        ...currentBeat,
        title: titleSettings.text
      });
    }
    setSelectedComponent(null);
  };

  const handleApplySubtitleEdit = () => {
    if (currentBeat) {
      onUpdateBeat({
        ...currentBeat,
        audio_narration: subtitleSettings.text
      });
    }
    setSelectedComponent(null);
  };

  // Preset color swatches
  const colorSwatches = [
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Cinema Gold', hex: 'var(--gold-500)' },
    { name: 'Cyan Anamorphic', hex: 'var(--cyan-400)' },
    { name: 'Noir Dark', hex: 'var(--noir-800)' },
    { name: 'Crimson Red', hex: 'var(--rose-400)' }
  ];

  const fontOptions = [
    'var(--font-display)', 'var(--font-body)', 'var(--font-mono)', 'Oswald', 'Bebas Neue', 'Impact', 'Georgia'
  ];
  
  // Create a transition key for crossfade
  const beatTransitionKey = currentBeat?.beat_id || currentBeatIndex;

  return (
    <div className="flex flex-col h-full bg-[var(--noir-950)] border-l border-[var(--noir-700)] text-slate-100 overflow-hidden select-none">
      
      {/* Top Bar: Clean Minimalist Player Header */}
      <div className="h-12 px-4 border-b border-[var(--noir-700)] flex items-center justify-between glass-panel text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--noir-800)] border border-[var(--noir-600)] font-[family-name:var(--font-mono)] text-[11px] font-semibold" style={{ color: 'var(--gold-400)' }}>
            <Film className="w-3.5 h-3.5" />
            <span>STUDIO VIDEO CANVAS</span>
          </div>
          <span className="font-[family-name:var(--font-mono)] text-slate-400 text-[11px]">
            Beat {currentBeatIndex + 1}/{beats.length}
          </span>
          <span className="text-[var(--noir-600)]">•</span>
          <span className="text-slate-200 font-medium truncate max-w-[220px]">
            {currentBeat?.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Aspect Ratio Selector */}
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--noir-800)] border border-[var(--noir-600)] text-[10px] font-[family-name:var(--font-mono)]">
            {(['16:9', '2.39:1', '9:16'] as const).map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2 py-0.5 rounded transition ${
                  aspectRatio === ratio ? 'bg-[var(--noir-600)] text-white font-bold' : 'text-[var(--noir-400)] hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Download Package Button */}
          <button
            onClick={onDownloadPackage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg hover:brightness-110 border text-xs font-medium transition"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--gold-600) 20%, transparent)',
              borderColor: 'color-mix(in srgb, var(--gold-500) 30%, transparent)',
              color: 'var(--gold-400)'
            }}
            title="Download Full Screenplay, Storyboard & Telemetry Package"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Close Studio Button */}
          <button
            onClick={onClosePlayer}
            className="p-1 rounded-lg text-[var(--noir-400)] hover:text-white hover:bg-[var(--noir-800)] border border-transparent hover:border-[var(--noir-600)] transition"
            title="Close Video Canvas"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div 
        onClick={() => setSelectedComponent(null)}
        className="flex-1 bg-black p-4 flex items-center justify-center relative overflow-hidden"
      >
        {/* Dynamic Aspect Ratio Container */}
        <div 
          className={`relative overflow-hidden rounded-xl shadow-2xl transition-all border border-[var(--noir-700)] bg-[var(--noir-950)] vignette ${
            aspectRatio === '9:16' 
              ? 'aspect-[9/16] h-full max-h-[580px]' 
              : aspectRatio === '2.39:1'
                ? 'aspect-[2.39/1] w-full max-w-[900px]'
                : 'aspect-video w-full max-w-[850px]'
          }`}
        >
          {/* Simulated Cinematic Video Footage Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--noir-900)] via-[var(--noir-850)] to-[var(--noir-950)] flex items-center justify-center film-grain">
            
            {/* Visual tone / lighting effect */}
            <div 
              className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none transition-all duration-700"
              style={{
                background: currentBeat?.lighting_tone?.toLowerCase().includes('cyan') 
                  ? 'radial-gradient(circle at 60% 40%, rgba(34, 211, 238, 0.25) 0%, transparent 70%)'
                  : currentBeat?.lighting_tone?.toLowerCase().includes('amber')
                    ? 'radial-gradient(circle at 40% 30%, rgba(212, 168, 83, 0.25) 0%, transparent 70%)'
                    : 'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.15) 0%, transparent 70%)'
              }}
            />

            {/* Cinematic Center Visual Placeholder / Shot Graphics (Crossfading) */}
            <div 
              key={beatTransitionKey}
              className="flex flex-col items-center justify-center space-y-2 text-center p-6 z-0 pointer-events-none animate-fade-in transition-opacity duration-500"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--noir-900)]/80 border border-[var(--noir-700)]/60 flex items-center justify-center shadow-inner gold-glow">
                <Film className="w-8 h-8" style={{ color: 'var(--gold-400)' }} />
              </div>
              <div className="text-[11px] font-[family-name:var(--font-mono)] uppercase tracking-widest text-[var(--noir-400)] max-w-sm">
                {currentBeat?.shot_type} • {currentBeat?.camera_movement}
              </div>
              <div className="text-xs text-[var(--noir-400)] max-w-md italic line-clamp-2">
                "{currentBeat?.visual_description}"
              </div>
            </div>
          </div>

          {/* Anamorphic Letterbox Bars (if in 2.39:1 mode) */}
          {aspectRatio === '2.39:1' && (
            <>
              <div className="absolute top-0 inset-x-0 h-4 bg-black/90 pointer-events-none border-b border-[var(--gold-500)]/10" />
              <div className="absolute bottom-0 inset-x-0 h-4 bg-black/90 pointer-events-none border-t border-[var(--gold-500)]/10" />
            </>
          )}

          {/* HUD Watermark Header */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 text-[10px] font-[family-name:var(--font-mono)] text-[var(--noir-400)] bg-black/70 px-2 py-0.5 rounded border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[var(--rose-400)] animate-pulse" />
            <span>REC • 4K 24FPS</span>
            <span className="text-[var(--noir-600)]">|</span>
            <span>{currentBeat?.timestamp}</span>
          </div>

          {/* Asset Directives Badge */}
          {currentBeat?.asset_requirement && (
            <div className="absolute top-3 right-3 z-10 text-[9px] font-[family-name:var(--font-mono)] bg-[var(--noir-900)]/70 border px-2 py-0.5 rounded backdrop-blur-md"
                 style={{ borderColor: 'color-mix(in srgb, var(--gold-500) 30%, transparent)', color: 'var(--gold-300)' }}>
              ASSET: {currentBeat.asset_requirement}
            </div>
          )}

          {/* ======================================================== */}
          {/* COMPONENT 1: DIRECT CLICKABLE TITLE OVERLAY              */}
          {/* ======================================================== */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent('title');
            }}
            style={{
              top: titleSettings.positionY === 'top' ? '15%' : titleSettings.positionY === 'bottom' ? '65%' : '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              outline: selectedComponent === 'title' ? '2px solid var(--gold-400)' : 'none',
              outlineOffset: '4px'
            }}
            className={`absolute z-20 cursor-pointer transition-all ${
              selectedComponent === 'title' 
                ? 'rounded-lg shadow-2xl scale-105 gold-glow' 
                : 'hover:outline hover:outline-1 hover:outline-[var(--gold-400)]/60 hover:scale-[1.02]'
            }`}
          >
            <div
              style={{
                fontFamily: titleSettings.fontFamily,
                fontSize: `${titleSettings.fontSize}px`,
                fontWeight: titleSettings.fontWeight,
                color: titleSettings.color,
                letterSpacing: titleSettings.letterSpacing,
                textShadow: titleSettings.shadow ? '0 4px 16px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.7)' : 'none',
                backgroundColor: titleSettings.backgroundColor,
                padding: '6px 18px',
                borderRadius: '8px'
              }}
              className="text-center font-[family-name:var(--font-display)] uppercase transition-all whitespace-nowrap"
            >
              {titleSettings.text}
            </div>

            {/* Click to Edit Tooltip */}
            {selectedComponent !== 'title' && (
              <div className="opacity-0 hover:opacity-100 absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded whitespace-nowrap border transition-opacity pointer-events-none"
                   style={{ color: 'var(--gold-400)', borderColor: 'color-mix(in srgb, var(--gold-500) 30%, transparent)' }}>
                Click to edit text &amp; font size
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* COMPONENT 2: DIRECT CLICKABLE SUBTITLE NARRATION OVERLAY */}
          {/* ======================================================== */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setSelectedComponent('subtitle');
            }}
            style={{
              outline: selectedComponent === 'subtitle' ? '2px solid var(--cyan-400)' : 'none',
              outlineOffset: '2px'
            }}
            className={`absolute inset-x-8 bottom-6 z-20 cursor-pointer transition-all flex justify-center ${
              selectedComponent === 'subtitle'
                ? 'rounded-lg scale-105 shadow-2xl'
                : 'hover:outline hover:outline-1 hover:outline-[var(--cyan-400)]/50'
            }`}
          >
            <div
              style={{
                fontFamily: subtitleSettings.fontFamily,
                fontSize: `${subtitleSettings.fontSize}px`,
                color: subtitleSettings.color,
                backgroundColor: subtitleSettings.backgroundColor,
                letterSpacing: subtitleSettings.letterSpacing,
                textShadow: '0 2px 8px rgba(0,0,0,0.9)'
              }}
              className="max-w-xl text-center px-4 py-2 rounded-lg leading-relaxed line-clamp-2"
            >
              {subtitleSettings.text}
            </div>
          </div>

          {/* ======================================================== */}
          {/* FLOATING INLINE ON-CANVAS FORMATTING TOOLBAR             */}
          {/* ======================================================== */}
          {selectedComponent && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-12 inset-x-4 z-40 bg-[var(--noir-800)]/95 border border-[var(--gold-500)]/30 rounded-xl p-3 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3 animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-mono)] text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--gold-400)' }}>
                  <Sliders className="w-3.5 h-3.5" />
                  <span>EDITING {selectedComponent === 'title' ? 'TITLE TEXT' : 'SUBTITLE'}</span>
                </span>
                <span className="text-[var(--gold-300)] text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded border"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--gold-500) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--gold-500) 20%, transparent)' }}>
                  Instant Sync • 0 Tokens
                </span>
              </div>

              {/* Text Input Editor */}
              <input
                type="text"
                value={selectedComponent === 'title' ? titleSettings.text : subtitleSettings.text}
                onChange={(e) => {
                  if (selectedComponent === 'title') {
                    setTitleSettings({ ...titleSettings, text: e.target.value });
                  } else {
                    setSubtitleSettings({ ...subtitleSettings, text: e.target.value });
                  }
                }}
                placeholder="Edit text content..."
                className="bg-[var(--noir-900)] border border-[var(--noir-600)] rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:ring-2 min-w-[200px] transition-colors"
                style={{ '--tw-ring-color': 'var(--gold-400)' } as any}
              />

              {/* Font Family Selector */}
              <select
                value={selectedComponent === 'title' ? titleSettings.fontFamily : subtitleSettings.fontFamily}
                onChange={(e) => {
                  if (selectedComponent === 'title') {
                    setTitleSettings({ ...titleSettings, fontFamily: e.target.value });
                  } else {
                    setSubtitleSettings({ ...subtitleSettings, fontFamily: e.target.value });
                  }
                }}
                className="bg-[var(--noir-900)] border border-[var(--noir-600)] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 transition-colors"
                style={{ '--tw-ring-color': 'var(--gold-400)' } as any}
              >
                {fontOptions.map(font => (
                  <option key={font} value={font}>{font.replace('var(--font-', '').replace(')', '')}</option>
                ))}
              </select>

              {/* Font Size Buttons & Slider */}
              <div className="flex items-center gap-1.5 text-xs text-[var(--noir-400)]">
                <span className="text-[11px]">Size:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedComponent === 'title') {
                      setTitleSettings(prev => ({ ...prev, fontSize: Math.max(14, prev.fontSize - 2) }));
                    } else {
                      setSubtitleSettings(prev => ({ ...prev, fontSize: Math.max(12, prev.fontSize - 1) }));
                    }
                  }}
                  className="w-6 h-6 rounded bg-[var(--noir-900)] hover:bg-[var(--noir-700)] border border-[var(--noir-600)] flex items-center justify-center text-slate-200 text-xs font-bold transition-colors"
                  title="Decrease Font Size"
                >
                  -
                </button>
                <span className="font-[family-name:var(--font-mono)] text-xs font-bold min-w-[32px] text-center" style={{ color: 'var(--gold-400)' }}>
                  {selectedComponent === 'title' ? titleSettings.fontSize : subtitleSettings.fontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedComponent === 'title') {
                      setTitleSettings(prev => ({ ...prev, fontSize: Math.min(72, prev.fontSize + 2) }));
                    } else {
                      setSubtitleSettings(prev => ({ ...prev, fontSize: Math.min(36, prev.fontSize + 1) }));
                    }
                  }}
                  className="w-6 h-6 rounded bg-[var(--noir-900)] hover:bg-[var(--noir-700)] border border-[var(--noir-600)] flex items-center justify-center text-slate-200 text-xs font-bold transition-colors"
                  title="Increase Font Size"
                >
                  +
                </button>
              </div>

              {/* Color Presets */}
              <div className="flex items-center gap-1.5">
                {colorSwatches.map(swatch => (
                  <button
                    key={swatch.hex}
                    onClick={() => {
                      if (selectedComponent === 'title') {
                        setTitleSettings({ ...titleSettings, color: swatch.hex });
                      } else {
                        setSubtitleSettings({ ...subtitleSettings, color: swatch.hex });
                      }
                    }}
                    style={{ backgroundColor: swatch.hex }}
                    className="w-4 h-4 rounded-full border border-black/80 transition-transform hover:scale-125 cursor-pointer"
                    title={swatch.name}
                  />
                ))}
              </div>

              {/* Apply / Save Button */}
              <button
                onClick={selectedComponent === 'title' ? handleApplyTitleEdit : handleApplySubtitleEdit}
                className="btn-gold flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar: Playback, Timeline Scrubber, & Beat Navigation */}
      <div className="p-3.5 bg-[var(--noir-900)] border-t border-[var(--noir-700)] flex flex-col gap-2">
        
        {/* Scrubber Timeline with Beat Markers */}
        <div className="flex items-center gap-1.5 w-full">
          {beats.map((beat, idx) => {
            const isActive = idx === currentBeatIndex;
            return (
              <button
                key={beat.beat_id}
                onClick={() => setCurrentBeatIndex(idx)}
                style={{
                  backgroundColor: isActive ? 'var(--gold-400)' : idx < currentBeatIndex ? 'var(--noir-600)' : 'var(--noir-700)',
                  outline: isActive ? '2px solid var(--gold-400)' : 'none',
                  outlineOffset: '2px'
                }}
                className={`flex-1 h-2 rounded-full transition-all cursor-pointer relative group hover:brightness-125`}
                title={`Beat ${idx + 1}: ${beat.title} (${beat.timestamp})`}
              >
                 <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[var(--noir-800)] text-[var(--gold-300)] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 font-[family-name:var(--font-mono)] border border-[var(--gold-600)]">
                    Beat {idx + 1}: {beat.title}
                 </span>
              </button>
            );
          })}
        </div>

        {/* Playback Controls & Status */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentBeatIndex(prev => Math.max(0, prev - 1))}
              disabled={currentBeatIndex === 0}
              className="p-1.5 rounded-lg text-[var(--noir-400)] hover:text-white hover:bg-[var(--noir-800)] disabled:opacity-40 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-black font-bold shadow-lg transition hover:scale-105 btn-gold"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
            </button>

            <button
              onClick={() => setCurrentBeatIndex(prev => Math.min(beats.length - 1, prev + 1))}
              disabled={currentBeatIndex === beats.length - 1}
              className="p-1.5 rounded-lg text-[var(--noir-400)] hover:text-white hover:bg-[var(--noir-800)] disabled:opacity-40 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            
            {/* Playback Speed Controls */}
            <div className="flex items-center gap-1 ml-2 mr-2 bg-[var(--noir-800)] rounded-lg p-0.5 border border-[var(--noir-700)]">
              {[0.75, 1.0, 1.5, 2.0].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 text-[10px] rounded font-[family-name:var(--font-mono)] transition-colors ${
                    playbackSpeed === speed ? 'bg-[var(--noir-600)] text-white font-bold' : 'text-[var(--noir-400)] hover:text-white hover:bg-[var(--noir-700)]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Voiceover Toggle */}
            <button
              onClick={() => setVoiceoverEnabled(!voiceoverEnabled)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                voiceoverEnabled 
                  ? 'bg-[var(--noir-800)]' 
                  : 'bg-[var(--noir-900)] text-[var(--noir-400)] border-[var(--noir-600)]'
              }`}
              style={voiceoverEnabled ? { color: 'var(--gold-300)', borderColor: 'color-mix(in srgb, var(--gold-500) 30%, transparent)' } : {}}
              title="Toggle AI Speech Synthesis Voiceover"
            >
              {voiceoverEnabled ? <Volume2 className="w-3.5 h-3.5" style={{ color: 'var(--gold-400)' }} /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isAudioSpeaking ? 'Speaking...' : voiceoverEnabled ? 'VO On' : 'Muted'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-[var(--noir-400)] text-[11px] font-[family-name:var(--font-mono)]">
            <span>SFX: <span className="text-[var(--noir-200)]">{currentBeat?.audio_sfx_cues || 'Atmospheric tone'}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};
