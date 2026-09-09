import React, { useState, useCallback } from 'react';
import { HeroLanding } from './components/HeroLanding';
import { DeepSeekChat } from './components/DeepSeekChat';
import { StudioTabs } from './components/StudioTabs';
import { SettingsModal } from './components/SettingsModal';
import type { ShowrunnerProject, ScriptBeat } from './types';

type AppView = 'landing' | 'studio';

export const App: React.FC = () => {
  // Navigation state
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string>('');

  // FACTORY RESET CLEAN STATE: Zero synthetic data on initial load
  const [project, setProject] = useState<ShowrunnerProject | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Stored API Keys
  const [parallelKey, setParallelKey] = useState<string>(() => localStorage.getItem('parallel_key') || '');
  const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('gemini_key') || '');

  // Theme state (wired to SettingsModal)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const handleSaveKeys = (pKey: string, gKey: string) => {
    setParallelKey(pKey);
    setGeminiKey(gKey);
    localStorage.setItem('parallel_key', pKey);
    localStorage.setItem('gemini_key', gKey);
  };

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // Could apply document-level theme class here in the future
  }, []);

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
          beat: updatedBeat,
          all_beats: newBeats
        })
      });
    } catch (err) {
      console.warn('Backend beat sync warning:', err);
    }
  };

  const handleDownloadPackage = async () => {
    if (!project) return;
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      const data = await res.json();
      const blob = new Blob([data.markdown || JSON.stringify(project, null, 2)], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_showrunner_package.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      // Fallback: download direct json
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_package.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleResetFactoryState = () => {
    setProject(null);
    setIsStudioOpen(false);
  };

  // Smooth transition: Landing → Studio
  const handleLaunchStudio = useCallback((prompt?: string) => {
    setInitialPrompt(prompt || '');
    setIsTransitioning(true);
    // Allow the exit animation to play, then switch view
    setTimeout(() => {
      setCurrentView('studio');
      setIsTransitioning(false);
    }, 400);
  }, []);

  // Return to landing page
  const handleReturnToLanding = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('landing');
      setIsTransitioning(false);
      handleResetFactoryState();
    }, 400);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden font-[family-name:var(--font-body)]" style={{ backgroundColor: 'var(--noir-950)', color: 'var(--noir-100)' }}>

      {/* ===== HERO LANDING PAGE ===== */}
      {currentView === 'landing' && (
        <div
          className={`h-full w-full overflow-y-auto transition-all duration-500 ease-out ${
            isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
          }`}
        >
          <HeroLanding onLaunchStudio={handleLaunchStudio} />
        </div>
      )}

      {/* ===== STUDIO WORKSPACE ===== */}
      {currentView === 'studio' && (
        <div
          className={`flex h-full w-full transition-all duration-500 ease-out ${
            isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* LEFT SIDE: DeepSeek Minimalist Chat Harness */}
          <div className={`h-full transition-all duration-300 ease-out ${
            isStudioOpen && project ? 'w-full lg:w-[45%] xl:w-[42%]' : 'w-full'
          } flex flex-col`}>
            <DeepSeekChat
              project={project}
              onSelectProject={(newProj) => {
                setProject(newProj);
              }}
              onOpenStudio={() => {
                if (project) setIsStudioOpen(true);
              }}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onResetFactoryState={handleResetFactoryState}
              onDownloadPackage={handleDownloadPackage}
              onReturnToLanding={handleReturnToLanding}
              geminiKey={geminiKey}
              parallelKey={parallelKey}
              initialPrompt={initialPrompt}
            />
          </div>

          {/* RIGHT SIDE: Dedicated Studio Video Player (Only appears when editing) */}
          {isStudioOpen && project && (
            <div className="hidden lg:flex flex-1 h-full animate-slide-in-right">
              <StudioTabs
                project={project}
                onUpdateBeat={handleUpdateBeat}
                onClosePlayer={() => setIsStudioOpen(false)}
                onDownloadPackage={handleDownloadPackage}
              />
            </div>
          )}
        </div>
      )}

      {/* Bring Your Own API Keys Modal */}
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
