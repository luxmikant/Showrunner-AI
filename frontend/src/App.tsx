import React, { useState } from 'react';
import { HeroLanding } from './components/HeroLanding';
import { Sidebar } from './components/Sidebar';
import { ChatHarness } from './components/ChatHarness';
import { InteractiveCanvas } from './components/InteractiveCanvas';
import { AVScriptView } from './components/AVScriptView';
import { StoryboardGallery } from './components/StoryboardGallery';
import { ResearchDrawer } from './components/ResearchDrawer';
import { PackagingView } from './components/PackagingView';
import { SettingsModal } from './components/SettingsModal';
import type { ShowrunnerProject, ScriptBeat } from './types';
import { 
  Film, FileText, Globe, Target, Layers, 
  Download, RefreshCw, Clapperboard,
  Flame, ArrowLeft, Sun, Moon
} from 'lucide-react';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');
  const [project, setProject] = useState<ShowrunnerProject | null>(null);
  const [studioTab, setStudioTab] = useState<'player' | 'script' | 'previs' | 'research' | 'packaging'>('player');
  const [activeConversation, setActiveConversation] = useState<string>('showrunner');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Theme mode: Clean White ('light') by default, with dark cinema option
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme_mode') as 'light' | 'dark') || 'light';
  });

  // Stored API Keys
  const [parallelKey, setParallelKey] = useState(() => localStorage.getItem('parallel_key') || '');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_key') || '');

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme_mode', newTheme);
  };

  const handleSaveKeys = (pKey: string, gKey: string) => {
    setParallelKey(pKey);
    setGeminiKey(gKey);
    localStorage.setItem('parallel_key', pKey);
    localStorage.setItem('gemini_key', gKey);
  };

  const handleLaunchStudio = async (initialPrompt?: string) => {
    if (!initialPrompt) {
      setViewMode('studio');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Agent 1: Parallel Web Systems scouting verified facts and competitor blindspots...');
    setViewMode('studio');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Agent 2: Gemini structuring Two-Column AV screenplay beats...');
    }, 1500);
    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Agent 3: Visual Director crafting cinematography directives & previs prompts...');
    }, 3000);
    const stepTimer3 = setTimeout(() => {
      setLoadingStep('Agent 4: Retention Auditor computing cut intervals & high-CTR packaging...');
    }, 4500);

    try {
      const res = await fetch('/api/project/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: initialPrompt,
          format_category: 'YouTube Narrative Short (12-18 mins)',
          target_duration_mins: 14,
          parallel_api_key: parallelKey || undefined,
          gemini_api_key: geminiKey || undefined
        })
      });

      if (res.ok) {
        const newProject: ShowrunnerProject = await res.json();
        setProject(newProject);
        setStudioTab('player');
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleUpdateBeat = async (updatedBeat: ScriptBeat) => {
    if (!project) return;
    const newBeats = project.script_beats.map(b => 
      b.beat_id === updatedBeat.beat_id ? updatedBeat : b
    );
    setProject({ ...project, script_beats: newBeats });

    try {
      await fetch('/api/player/update-beat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.project_id,
          beat: updatedBeat
        })
      });
    } catch (err) {
      console.warn('Backend beat sync warning:', err);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      if (res.ok) {
        const { markdown } = await res.json();
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_production_bible.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const isLight = theme === 'light';

  if (viewMode === 'landing') {
    return (
      <>
        <HeroLanding
          onLaunchStudio={handleLaunchStudio}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          parallelKey={parallelKey}
          geminiKey={geminiKey}
          onSaveKeys={handleSaveKeys}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
      </>
    );
  }

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-sans transition-colors ${
      isLight 
        ? 'bg-slate-50 text-slate-900 selection:bg-lime-300/60 selection:text-slate-900' 
        : 'bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-white'
    }`}>
      
      {/* EXTREME LEFT: Sidebar (Projects, Conversations, Settings) */}
      <Sidebar
        project={project}
        onNewProject={() => {
          setProject(null);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReturnToLanding={() => setViewMode('landing')}
        activeConversation={activeConversation}
        onSelectConversation={setActiveConversation}
        parallelConfigured={Boolean(parallelKey)}
        geminiConfigured={Boolean(geminiKey)}
        theme={theme}
      />

      {/* RIGHT MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Top Studio Bar */}
        <header className={`px-6 py-3 border-b flex items-center justify-between gap-4 shrink-0 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          
          {/* Project Title & Metadata Pill */}
          <div className="flex items-center gap-3 truncate">
            <button
              onClick={() => setViewMode('landing')}
              className={`p-1.5 rounded-lg transition-colors sm:hidden cursor-pointer ${
                isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {project ? project.title : 'Showrunner AI Studio Workspace'}
                </span>
                {project && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                    isLight 
                      ? 'bg-lime-100 text-lime-800 border-lime-300' 
                      : 'bg-lime-500/10 text-lime-400 border-lime-500/20'
                  }`}>
                    {project.format_category.split('(')[0]}
                  </span>
                )}
              </div>
              <div className={`text-[11px] truncate max-w-xl hidden md:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {project ? project.logline : 'Pitch an idea in chat to orchestrate the multi-agent showrunner pipeline.'}
              </div>
            </div>
          </div>

          {/* Studio Tab Switcher */}
          <div className={`flex items-center p-1 rounded-xl border shrink-0 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <button
              onClick={() => setStudioTab('player')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                studioTab === 'player'
                  ? isLight
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'bg-lime-500 text-slate-950 font-bold shadow-md'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Visual Player</span>
            </button>

            <button
              onClick={() => setStudioTab('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                studioTab === 'script'
                  ? isLight
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'bg-lime-500 text-slate-950 font-bold shadow-md'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Two-Column AV</span>
            </button>

            <button
              onClick={() => setStudioTab('previs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                studioTab === 'previs'
                  ? isLight
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'bg-lime-500 text-slate-950 font-bold shadow-md'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Previs Deck</span>
            </button>

            <button
              onClick={() => setStudioTab('research')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                studioTab === 'research'
                  ? isLight
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'bg-lime-500 text-slate-950 font-bold shadow-md'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Parallel Web</span>
            </button>

            <button
              onClick={() => setStudioTab('packaging')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                studioTab === 'packaging'
                  ? isLight
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'bg-lime-500 text-slate-950 font-bold shadow-md'
                  : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Packaging & CTR</span>
            </button>
          </div>

          {/* Top Actions: Theme Quick Toggle, Hook Score & Export */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Theme Toggle Button */}
            <button
              onClick={() => handleThemeChange(isLight ? 'dark' : 'light')}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title={isLight ? 'Switch to Dark Cinema' : 'Switch to Clean White'}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-lime-400" />}
            </button>

            {project && (
              <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium ${
                isLight 
                  ? 'bg-lime-50 border-lime-200 text-lime-800' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <Flame className="w-3.5 h-3.5 text-lime-600" />
                <span>Hook Score: {project.packaging.first_60s_hook_score}/100</span>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={!project}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer disabled:opacity-40 ${
                isLight
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }`}
              title="Download production markdown bible"
            >
              <Download className={`w-3.5 h-3.5 ${isLight ? 'text-lime-400' : 'text-amber-400'}`} />
              <span className="hidden sm:inline">Export Bible</span>
            </button>
          </div>
        </header>

        {/* Studio Loading Banner */}
        {isLoading && (
          <div className={`px-6 py-2 border-b flex items-center gap-2 text-xs font-mono animate-pulse ${
            isLight ? 'bg-lime-100/70 border-lime-200 text-lime-900' : 'bg-lime-500/10 border-lime-500/30 text-lime-300'
          }`}>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{loadingStep || 'Showrunner AI multi-agent network active...'}</span>
          </div>
        )}

        {/* Dynamic Studio Body */}
        <main className="flex-1 p-4 overflow-hidden min-h-0">
          
          {/* TAB 1: VISUAL PLAYER (Split Center Chat + Right Interactive Player) */}
          {studioTab === 'player' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
              
              {/* Center Column: Multimodal Chat Harness (42% width) */}
              <div className="lg:col-span-5 h-full min-h-0">
                <ChatHarness
                  project={project}
                  geminiKey={geminiKey}
                  parallelKey={parallelKey}
                  onUpdateProject={setProject}
                  theme={theme}
                />
              </div>

              {/* Right Column: Interactive Visual Player (58% width) */}
              <div className="lg:col-span-7 h-full min-h-0">
                {project ? (
                  <InteractiveCanvas
                    project={project}
                    onUpdateBeat={handleUpdateBeat}
                    geminiKey={geminiKey}
                    theme={theme}
                  />
                ) : (
                  <div className={`h-full rounded-2xl border flex flex-col items-center justify-center p-8 text-center space-y-4 transition-colors ${
                    isLight 
                      ? 'bg-white border-slate-200 shadow-sm' 
                      : 'bg-slate-900/60 border-slate-800'
                  }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      isLight 
                        ? 'bg-lime-100 border border-lime-200 text-lime-700' 
                        : 'bg-lime-500/10 border border-lime-500/20 text-lime-400'
                    }`}>
                      <Clapperboard className="w-7 h-7" />
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Studio Canvas Ready
                      </h4>
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
                        Pitch an idea in the Showrunner chat on the left or attach a PDF script treatment to orchestrate your two-column AV script and interactive visual player.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Two-Column AV Screenplay */}
          {studioTab === 'script' && project && (
            <div className="h-full overflow-y-auto pr-2">
              <AVScriptView beats={project.script_beats} projectTitle={project.title} />
            </div>
          )}

          {/* TAB 3: Visual Previs Directives */}
          {studioTab === 'previs' && project && (
            <div className="h-full overflow-y-auto pr-2">
              <StoryboardGallery beats={project.script_beats} projectTitle={project.title} />
            </div>
          )}

          {/* TAB 4: Parallel Web Grounding Dossier */}
          {studioTab === 'research' && project && (
            <div className="h-full overflow-y-auto pr-2">
              <ResearchDrawer research={project.research} />
            </div>
          )}

          {/* TAB 5: Retention Packaging Suite */}
          {studioTab === 'packaging' && project && (
            <div className="h-full overflow-y-auto pr-2">
              <PackagingView packaging={project.packaging} metrics={project.metrics} />
            </div>
          )}

        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        parallelKey={parallelKey}
        geminiKey={geminiKey}
        onSaveKeys={handleSaveKeys}
        theme={theme}
        onThemeChange={handleThemeChange}
      />

    </div>
  );
};

export default App;

