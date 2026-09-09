import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles, Film, Globe, ArrowRight, Play,
  CheckCircle2, Clapperboard, MousePointerClick,
  Search, FileText, Palette, Monitor, Cpu, Database
} from 'lucide-react';

interface HeroLandingProps {
  onLaunchStudio: (initialPrompt?: string) => void;
}

// Typewriter effect hook
const useTypewriter = (text: string, speed: number = 40, startDelay: number = 1000) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, startDelay);
    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!hasStarted) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, hasStarted]);

  return { displayText, isComplete, hasStarted };
};

// Intersection observer hook for scroll animations
const useInView = (threshold: number = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
};

export const HeroLanding: React.FC<HeroLandingProps> = ({ onLaunchStudio }) => {
  const [heroPrompt, setHeroPrompt] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const { displayText, isComplete } = useTypewriter(
    'Create a 12-minute video essay on the Soviet Kola Superdeep Borehole anomaly',
    35,
    2000
  );

  // Cycle through "How It Works" steps
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Intersection observers for scroll sections
  const problemSection = useInView(0.1);
  const howItWorksSection = useInView(0.1);
  const techSection = useInView(0.15);
  const ctaSection = useInView(0.2);

  const samplePitches = [
    { label: 'Soviet Kola Borehole', prompt: 'Create a 12-minute video essay on the Soviet Kola Superdeep Borehole anomaly' },
    { label: 'Baltic Cable Sabotage', prompt: 'Investigate the 2023 Baltic Sea undersea cable sabotage incidents for a documentary' },
    { label: 'Concorde Economics', prompt: 'Why the Concorde really failed: an aerodynamic economics video essay' },
    { label: 'IMAX 70mm Projection', prompt: 'How IMAX 70mm film projection creates maximum black levels — a visual tech breakdown' },
  ];

  const problems = [
    {
      icon: Search,
      label: 'THE RESEARCH RABBIT HOLE',
      title: 'Hours Lost Fact-Checking',
      description: 'Standard LLMs hallucinate dates, specs, and citations. For documentary makers, one wrong fact destroys credibility. You end up with 40 browser tabs and no progress.',
      solution: 'Parallel Web Systems crawls verified sources in real-time. Every fact in your script links to its original source URL.',
      color: 'cyan',
    },
    {
      icon: FileText,
      label: 'THE WALL-OF-TEXT HANDOFF',
      title: 'Scripts Your Editor Can\'t Visualize',
      description: 'Writers hand editors a 3,000-word Google Doc. Editors can\'t envision the visual pacing, camera movement, or lighting, causing 20+ hours of re-editing.',
      solution: 'Two-Column AV Screenplay with shot composition, camera moves, SFX cues, and lighting direction — your editor sees the film, not just text.',
      color: 'gold',
    },
    {
      icon: MousePointerClick,
      label: 'THE RE-PROMPTING LOOP',
      title: 'Burning Tokens on Pixel Fixes',
      description: 'AI-generated text is 4px too large? Write another 100-word prompt, burn 1,000 tokens, wait 15 seconds, hope the AI doesn\'t break the rest of the scene.',
      solution: 'Click directly on any element in the video canvas. Resize fonts, swap colors, edit text — with zero tokens and zero latency.',
      color: 'emerald',
    },
  ];

  const steps = [
    { icon: Sparkles, title: 'Pitch Your Idea', desc: 'Type or speak your concept. Upload a PDF treatment.' },
    { icon: Globe, title: 'AI Researches', desc: 'Parallel Web crawls live sources. Facts are verified.' },
    { icon: Film, title: 'Screenplay Generated', desc: 'Gemini structures a Two-Column AV script with beats.' },
    { icon: Palette, title: 'Edit in Studio', desc: 'Click-to-edit canvas. Direct manipulation. Zero tokens.' },
  ];

  const techStack = [
    { name: 'Google Gemini 2.5', desc: 'Structured AV screenplay generation', icon: Cpu },
    { name: 'Parallel Web Systems', desc: 'Real-time web grounding & fact verification', icon: Globe },
    { name: 'React 19 + Vite', desc: 'Interactive studio canvas with direct manipulation', icon: Monitor },
    { name: 'FastAPI + Multi-Agent', desc: '4-agent pipeline with parallel orchestration', icon: Database },
  ];

  const getAccentClasses = (color: string) => {
    switch (color) {
      case 'cyan': return { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' };
      case 'gold': return { bg: 'bg-[color:var(--gold-500)]/10', border: 'border-[color:var(--gold-500)]/20', text: 'text-[color:var(--gold-400)]', dot: 'bg-[color:var(--gold-500)]' };
      case 'emerald': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' };
    }
  };

  return (
    <div className="min-h-screen text-[color:var(--noir-100)] flex flex-col relative overflow-x-hidden font-[family-name:var(--font-body)]" style={{ backgroundColor: 'var(--noir-950)' }}>

      {/* ===== AMBIENT LIGHTING ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px] animate-float" style={{ background: 'var(--gold-500)' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px] animate-float" style={{ background: 'var(--cyan-400)', animationDelay: '3s' }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full opacity-[0.03] blur-[80px] animate-float" style={{ background: 'var(--gold-400)', animationDelay: '5s' }} />
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav className="relative z-30 glass-panel border-b border-[color:var(--noir-700)]/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center gold-glow" style={{ background: 'linear-gradient(135deg, var(--gold-500), var(--gold-600))' }}>
              <Clapperboard className="w-5 h-5" style={{ color: 'var(--noir-950)' }} />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--noir-100)' }}>
                Showrunner AI
                <span className="text-[10px] uppercase font-[family-name:var(--font-mono)] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(212, 168, 83, 0.15)', color: 'var(--gold-400)', border: '1px solid rgba(212, 168, 83, 0.25)' }}>
                  Studio
                </span>
              </div>
              <div className="text-[11px] font-[family-name:var(--font-mono)]" style={{ color: 'var(--noir-400)' }}>
                Autonomous Pre-Production Engine
              </div>
            </div>
          </div>

          <button
            onClick={() => onLaunchStudio()}
            className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs cursor-pointer"
          >
            <span>Enter Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-16 text-center flex flex-col items-center">

        {/* Hackathon badge */}
        <div className="animate-fade-in-down inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-[family-name:var(--font-mono)] mb-8" style={{ background: 'rgba(212, 168, 83, 0.08)', border: '1px solid rgba(212, 168, 83, 0.2)', color: 'var(--gold-400)' }}>
          <Sparkles className="w-3.5 h-3.5 animate-pulse" style={{ color: 'var(--gold-500)' }} />
          <span>Agentic Cinema: The Blockbuster Hackathon</span>
          <span style={{ color: 'var(--noir-600)' }}>•</span>
          <span style={{ color: 'var(--gold-300)' }} className="font-semibold">Parallel Partner Track</span>
        </div>

        {/* Main headline */}
        <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          <span style={{ color: 'var(--noir-100)' }}>From Idea to Production.</span>
          <br />
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, var(--gold-400), var(--gold-500), var(--gold-300))' }}>
            Autonomously.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up stagger-2 text-base sm:text-lg max-w-2xl leading-relaxed mb-10" style={{ color: 'var(--noir-400)' }}>
          Transform any creative idea into a production-ready <strong style={{ color: 'var(--noir-200)' }}>Two-Column AV Screenplay</strong> with
          live web research, cinematic previs, and an interactive studio canvas — in under 30 seconds.
        </p>

        {/* Typewriter demo prompt */}
        <div className="animate-fade-in-up stagger-3 w-full max-w-2xl mb-6">
          <div className="relative rounded-2xl p-[1px] gold-glow" style={{ background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.3), rgba(212, 168, 83, 0.05), rgba(212, 168, 83, 0.2))' }}>
            <div className="rounded-2xl p-1 flex items-center" style={{ background: 'var(--noir-900)' }}>
              <div className="flex-1 px-4 py-3 text-sm text-left min-h-[48px] flex items-center" style={{ color: 'var(--noir-300)' }}>
                {displayText}
                {!isComplete && <span className="inline-block w-0.5 h-5 ml-0.5 animate-pulse" style={{ background: 'var(--gold-500)' }} />}
              </div>
              <button
                onClick={() => onLaunchStudio(heroPrompt || 'Create a 12-minute video essay on the Soviet Kola Superdeep Borehole anomaly')}
                className="btn-gold flex items-center gap-2 px-5 py-3 rounded-xl text-xs cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">Launch</span>
              </button>
            </div>
          </div>

          {/* Custom prompt input */}
          <div className="mt-3 relative">
            <input
              type="text"
              value={heroPrompt}
              onChange={(e) => setHeroPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && heroPrompt.trim() && onLaunchStudio(heroPrompt)}
              placeholder="Or type your own pitch..."
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
              style={{
                background: 'var(--noir-850)',
                color: 'var(--noir-200)',
                border: '1px solid var(--noir-700)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--gold-500)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--noir-700)'}
            />
          </div>
        </div>

        {/* Sample pitch chips */}
        <div className="animate-fade-in-up stagger-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-[family-name:var(--font-mono)] text-[11px]" style={{ color: 'var(--noir-500)' }}>Try:</span>
          {samplePitches.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onLaunchStudio(p.prompt)}
              className="px-3 py-1.5 rounded-lg transition-all text-[11px] truncate max-w-[240px] font-medium cursor-pointer"
              style={{
                background: 'var(--noir-850)',
                border: '1px solid var(--noir-700)',
                color: 'var(--noir-300)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold-500)';
                e.currentTarget.style.color = 'var(--gold-400)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--noir-700)';
                e.currentTarget.style.color = 'var(--noir-300)';
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== SECTION 2: PROBLEMS WE SOLVE ===== */}
      <section ref={problemSection.ref} className="relative z-10 max-w-6xl mx-auto px-6 py-20 w-full">
        <div className={`text-center mb-14 transition-all duration-700 ${problemSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-[11px] uppercase font-[family-name:var(--font-mono)] font-semibold tracking-[0.15em] px-3 py-1.5 rounded-full mb-4" style={{ background: 'rgba(212, 168, 83, 0.1)', color: 'var(--gold-400)', border: '1px solid rgba(212, 168, 83, 0.15)' }}>
            The Creator Economy's Bottlenecks
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--noir-100)', fontFamily: 'var(--font-display)' }}>
            Three Problems. One Studio.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((problem, idx) => {
            const accent = getAccentClasses(problem.color);
            return (
              <div
                key={idx}
                className={`group relative rounded-2xl p-6 transition-all duration-700 ${problemSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{
                  transitionDelay: `${(idx + 1) * 150}ms`,
                  background: 'var(--noir-900)',
                  border: '1px solid var(--noir-700)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = problem.color === 'gold' ? 'var(--gold-500)' : problem.color === 'cyan' ? '#22d3ee' : '#34d399';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--noir-700)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${accent.bg} ${accent.border} border flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <problem.icon className={`w-6 h-6 ${accent.text}`} />
                </div>

                {/* Label */}
                <div className={`text-[10px] font-[family-name:var(--font-mono)] font-bold tracking-[0.12em] uppercase mb-2 ${accent.text}`}>
                  {problem.label}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--noir-100)' }}>
                  {problem.title}
                </h3>

                {/* Problem description */}
                <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--noir-400)' }}>
                  {problem.description}
                </p>

                {/* Solution */}
                <div className="pt-3" style={{ borderTop: '1px solid var(--noir-700)' }}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${accent.text} shrink-0 mt-0.5`} />
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--noir-300)' }}>
                      {problem.solution}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== SECTION 3: HOW IT WORKS ===== */}
      <section ref={howItWorksSection.ref} className="relative z-10 max-w-5xl mx-auto px-6 py-20 w-full">
        <div className={`text-center mb-14 transition-all duration-700 ${howItWorksSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block text-[11px] uppercase font-[family-name:var(--font-mono)] font-semibold tracking-[0.15em] px-3 py-1.5 rounded-full mb-4" style={{ background: 'rgba(34, 211, 238, 0.08)', color: '#22d3ee', border: '1px solid rgba(34, 211, 238, 0.15)' }}>
            From Pitch to Production
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--noir-100)', fontFamily: 'var(--font-display)' }}>
            Four Steps. Under 30 Seconds.
          </h2>
        </div>

        {/* Steps */}
        <div className={`relative transition-all duration-700 ${howItWorksSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          {/* Connector line */}
          <div className="hidden md:block absolute top-[44px] left-[12.5%] right-[12.5%] h-[2px]" style={{ background: 'var(--noir-700)' }}>
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: `${((activeStep + 1) / 4) * 100}%`,
                background: 'linear-gradient(90deg, var(--gold-500), var(--gold-400))',
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const isActive = idx <= activeStep;
              return (
                <div key={idx} className="flex flex-col items-center text-center relative">
                  {/* Circle */}
                  <div
                    className={`w-[88px] h-[88px] rounded-full flex items-center justify-center mb-5 transition-all duration-500 ${isActive ? 'animate-pulse-gold' : ''}`}
                    style={{
                      background: isActive ? 'linear-gradient(135deg, var(--gold-500), var(--gold-600))' : 'var(--noir-850)',
                      border: isActive ? '2px solid var(--gold-400)' : '2px solid var(--noir-700)',
                    }}
                  >
                    <step.icon
                      className="w-7 h-7 transition-colors duration-500"
                      style={{ color: isActive ? 'var(--noir-950)' : 'var(--noir-500)' }}
                    />
                  </div>

                  {/* Step number */}
                  <div className="text-[10px] font-[family-name:var(--font-mono)] font-bold tracking-[0.15em] uppercase mb-1.5" style={{ color: isActive ? 'var(--gold-400)' : 'var(--noir-500)' }}>
                    Step {idx + 1}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold mb-1.5 transition-colors duration-500" style={{ color: isActive ? 'var(--noir-100)' : 'var(--noir-400)' }}>
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs leading-relaxed max-w-[180px]" style={{ color: 'var(--noir-500)' }}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: TECH STACK ===== */}
      <section ref={techSection.ref} className="relative z-10 max-w-5xl mx-auto px-6 py-16 w-full">
        <div className={`rounded-2xl p-8 transition-all duration-700 ${techSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ background: 'var(--noir-900)', border: '1px solid var(--noir-700)' }}>
          <div className="text-center mb-8">
            <span className="text-[11px] uppercase font-[family-name:var(--font-mono)] font-semibold tracking-[0.15em]" style={{ color: 'var(--noir-400)' }}>
              Powered By
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center text-center p-4 rounded-xl transition-all duration-700`}
                style={{
                  transitionDelay: `${idx * 100}ms`,
                  opacity: techSection.inView ? 1 : 0,
                  transform: techSection.inView ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(212, 168, 83, 0.08)', border: '1px solid rgba(212, 168, 83, 0.15)' }}>
                  <tech.icon className="w-5 h-5" style={{ color: 'var(--gold-400)' }} />
                </div>
                <div className="text-sm font-bold mb-1" style={{ color: 'var(--noir-100)' }}>
                  {tech.name}
                </div>
                <div className="text-[11px] leading-relaxed" style={{ color: 'var(--noir-400)' }}>
                  {tech.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: CTA FOOTER ===== */}
      <section ref={ctaSection.ref} className="relative z-10 max-w-5xl mx-auto px-6 py-16 w-full">
        <div
          className={`relative overflow-hidden rounded-3xl p-10 sm:p-14 flex flex-col sm:flex-row items-center justify-between gap-8 transition-all duration-700 ${ctaSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{
            background: 'linear-gradient(135deg, var(--noir-900), var(--noir-850))',
            border: '1px solid rgba(212, 168, 83, 0.2)',
          }}
        >
          {/* Ambient glow inside CTA */}
          <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] rounded-full opacity-[0.08] blur-[80px] pointer-events-none" style={{ background: 'var(--gold-500)' }} />

          <div className="space-y-4 max-w-lg relative z-10">
            <span className="inline-block text-[10px] uppercase font-[family-name:var(--font-mono)] font-bold tracking-[0.15em] px-3 py-1 rounded-full" style={{ background: 'rgba(212, 168, 83, 0.15)', color: 'var(--gold-400)', border: '1px solid rgba(212, 168, 83, 0.25)' }}>
              Production Studio Ready
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--noir-100)', fontFamily: 'var(--font-display)' }}>
              Ready to direct your next production?
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--noir-400)' }}>
              Jump into the studio with a blank slate, upload your treatment, or brainstorm ideas with
              verified citations and interactive visual previews.
            </p>
          </div>

          <div className="relative z-10">
            <button
              onClick={() => onLaunchStudio()}
              className="btn-gold flex items-center gap-2.5 px-8 py-4 rounded-xl text-sm cursor-pointer group"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 py-8 px-6 text-center text-xs font-[family-name:var(--font-mono)]" style={{ borderTop: '1px solid var(--noir-700)', color: 'var(--noir-500)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Showrunner AI • Built for <strong style={{ color: 'var(--noir-300)' }}>Agentic Cinema: The Blockbuster Hackathon</strong>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Google Gemini</span>
            <span style={{ color: 'var(--noir-600)' }}>•</span>
            <span>Parallel Web Systems</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
