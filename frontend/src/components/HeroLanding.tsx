import React, { useState } from 'react';
import { 
  Sparkles, Film, Globe, ArrowRight, 
  CheckCircle2, Clapperboard, MousePointerClick
} from 'lucide-react';

interface HeroLandingProps {
  onLaunchStudio: (initialPrompt?: string) => void;
  onLoadSample?: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onLaunchStudio
}) => {
  const [heroPrompt, setHeroPrompt] = useState('');

  const samplePitches = [
    'Why the Concorde really failed: Aerodynamic economics',
    'The Soviet Kola Superdeep Borehole sonic anomaly',
    'Deep-Sea Internet Fiber Sabotage in the Baltic Sea',
    'How IMAX 70mm film projection creates maximum black levels'
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative overflow-hidden font-sans selection:bg-lime-400/40 selection:text-slate-900">
      
      {/* Lime & White Ambient Lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-lime-50/70 via-white to-white pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <nav className="relative z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20 border border-lime-400">
            <Clapperboard className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Showrunner AI</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-300 font-semibold">
                Studio
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Autonomous Filmmaking &amp; Scrimba Canvas
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onLaunchStudio()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-lime-500/25 transition-all"
          >
            <span>Open Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Header & Pitch */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12 text-center flex flex-col items-center space-y-6">
        
        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-50 border border-lime-300 text-xs text-lime-900 font-mono shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-lime-600 animate-pulse" />
          <span>Agentic Cinema: The Blockbuster Hackathon</span>
          <span className="text-lime-400">•</span>
          <span className="text-lime-700 font-semibold">Parallel Partner Track</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15]">
          The Autonomous Showrunner &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 via-emerald-600 to-teal-700">
            Scrimba Canvas
          </span>{' '}
          for High-Retention Filmmakers
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Break through the 3 biggest bottlenecks in digital entertainment: unverified web lore,
          the script-to-previs handoff chasm, and endless re-prompting token loops.
          Direct your narrative short with live web grounding and a 16:9 interactive canvas.
        </p>

        {/* Interactive Prompt Bar */}
        <div className="w-full max-w-2xl pt-4">
          <div className="relative flex items-center bg-white border-2 border-lime-300 focus-within:border-lime-500 rounded-2xl p-2 shadow-xl shadow-lime-500/10 transition-all">
            <input
              type="text"
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onLaunchStudio(heroPrompt)}
              placeholder="Pitch your 12-min YouTube video essay, short film, or narrative script..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => onLaunchStudio(heroPrompt)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <span>Build Film</span>
              <Sparkles className="w-4 h-4 fill-slate-950" />
            </button>
          </div>

          {/* Quick Pitch Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-500">
            <span className="font-mono text-[11px] text-slate-400">Try pitching:</span>
            {samplePitches.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onLaunchStudio(p)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-lime-400 hover:bg-lime-50/50 hover:text-lime-900 text-slate-700 transition-all text-[11px] truncate max-w-[260px] font-medium"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* The 3 Core Bottlenecks Solved */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="text-center mb-10 space-y-2">
          <span className="text-lime-700 text-xs font-mono font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-lime-100">
            ENGINEERED FOR THE CREATOR ECONOMY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 pt-2">
            How Showrunner AI Eliminates Digital Cinema Bottlenecks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-lime-500/60 transition-all group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-lime-100 border border-lime-200 flex items-center justify-center text-lime-700 mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-semibold text-lime-700 mb-1">BOTTLENECK 1: BROWSER TAB HELL</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Parallel Web Grounding</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never get sued or debunked for AI hallucinations. Showrunner AI integrates 
              <strong> Parallel Web Search &amp; Extract</strong> to scour verified research papers, 
              historical logs, and competitor video blindspots in real-time.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
              <span>Full source URL citations in script</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-lime-500/60 transition-all group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-lime-100 border border-lime-200 flex items-center justify-center text-lime-700 mb-4 group-hover:scale-110 transition-transform">
              <Film className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-semibold text-lime-700 mb-1">BOTTLENECK 2: SCRIPT-TO-PREVIS CHASM</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Two-Column AV Screenplay</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Documentary creators don't work in raw text blocks. We generate structured 
              <strong> Two-Column Audio/Visual scripts</strong> complete with sound effects cues, 
              shot compositions, camera moves, and B-roll search queries for your editor.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
              <span>Pacing audit &amp; cut intervals</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-lime-500/60 transition-all group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-lime-100 border border-lime-200 flex items-center justify-center text-lime-700 mb-4 group-hover:scale-110 transition-transform">
              <MousePointerClick className="w-6 h-6" />
            </div>
            <div className="text-xs font-mono font-semibold text-lime-700 mb-1">BOTTLENECK 3: RE-PROMPTING TOKEN TRAP</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive Visual Player</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Why re-render an entire video to fix a subtitle font? Click directly on the video canvas 
              to tweak typography with <strong>0 AI tokens spent</strong>, drag beat trim handles, 
              or use the <strong>Circle &amp; Comment</strong> tool to give spatial directives.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
              <span>Spatial frame markup &amp; instant adjustments</span>
            </div>
          </div>

        </div>
      </section>

      {/* Launch Studio CTA Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-10 w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400 border border-lime-300 shadow-xl shadow-lime-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-md text-slate-950">
            <span className="bg-slate-950 text-lime-400 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider">
              PRODUCTION STUDIO READY
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">
              Ready to direct your next production?
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              Jump directly into Showrunner AI with a blank slate, upload your own treatment, 
              or brainstorm ideas in real-time with verified citations and interactive visual previews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onLaunchStudio()}
              className="px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 cursor-pointer group"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-lime-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 py-8 px-6 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Showrunner AI • Built for <strong>Agentic Cinema: The Blockbuster Hackathon</strong>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Powered by Google Gemini</span>
            <span>•</span>
            <span>Parallel Web Systems</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

