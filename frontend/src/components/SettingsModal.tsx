import React, { useState } from 'react';
import { X, Key, Globe, Sparkles, ExternalLink, Check, Sun, Moon, Palette, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parallelKey: string;
  geminiKey: string;
  onSaveKeys: (parallelKey: string, geminiKey: string) => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  parallelKey: initialParallel,
  geminiKey: initialGemini,
  onSaveKeys,
  theme = 'light',
  onThemeChange
}) => {
  const [parallelKey, setParallelKey] = useState(initialParallel);
  const [geminiKey, setGeminiKey] = useState(initialGemini);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(theme);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(parallelKey, geminiKey);
    if (onThemeChange) {
      onThemeChange(currentTheme);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleSelectTheme = (selectedTheme: 'light' | 'dark') => {
    setCurrentTheme(selectedTheme);
    if (onThemeChange) {
      onThemeChange(selectedTheme);
    }
  };

  const isDark = currentTheme === 'dark';

  const renderKeyIndicator = (key: string) => {
    if (!key) {
      return <AlertCircle className="w-4 h-4 text-amber-500 absolute right-3 top-2.5" />;
    }
    if (key.length > 10) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 transition-all animate-scale-in ${
        isDark ? 'bg-[var(--noir-900)] border border-[var(--noir-800)] text-slate-100' : 'bg-white border border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-[var(--noir-800)]' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <div className="w-7 h-7 rounded-lg border flex items-center justify-center"
                 style={{ backgroundColor: 'color-mix(in srgb, var(--gold-500) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--gold-500) 30%, transparent)', color: 'var(--gold-600)' }}>
              <Key className="w-4 h-4" />
            </div>
            <span>Studio Settings &amp; Appearance</span>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              isDark ? 'text-[var(--noir-400)] hover:text-slate-200 hover:bg-[var(--noir-800)]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* THEME MODE TOGGLE */}
          <div className="space-y-2">
            <label className={`font-semibold flex items-center gap-1.5 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <Palette className="w-3.5 h-3.5" style={{ color: 'var(--gold-600)' }} />
              <span>Studio Appearance Theme</span>
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  currentTheme === 'light'
                    ? 'shadow-sm'
                    : isDark ? 'bg-[var(--noir-950)] border-[var(--noir-800)] text-[var(--noir-400)] hover:border-[var(--noir-700)]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                style={currentTheme === 'light' ? { backgroundColor: 'color-mix(in srgb, var(--gold-500) 10%, transparent)', borderColor: 'var(--gold-500)', color: 'var(--gold-900)', boxShadow: '0 0 0 1px var(--gold-500)' } : {}}
              >
                <Sun className="w-4 h-4" style={{ color: currentTheme === 'light' ? 'var(--gold-600)' : 'currentColor' }} />
                <span>Clean White</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  currentTheme === 'dark'
                    ? 'bg-[var(--noir-800)] text-white shadow-sm'
                    : isDark ? 'bg-[var(--noir-950)] border-[var(--noir-800)] text-[var(--noir-400)] hover:border-[var(--noir-700)]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                style={currentTheme === 'dark' ? { borderColor: 'var(--gold-500)', boxShadow: '0 0 0 1px var(--gold-500)' } : {}}
              >
                <Moon className="w-4 h-4" style={{ color: currentTheme === 'dark' ? 'var(--gold-400)' : 'currentColor' }} />
                <span>Dark Cinema</span>
              </button>
            </div>
          </div>

          {/* Parallel API Key */}
          <div className="space-y-1.5 pt-1 relative">
            <div className="flex items-center justify-between">
              <label className={`font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>Parallel Search &amp; Extract Key</span>
              </label>
              <a
                href="https://platform.parallel.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] hover:underline flex items-center gap-1 font-medium"
                style={{ color: 'var(--gold-600)' }}
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                value={parallelKey}
                onChange={(e) => setParallelKey(e.target.value)}
                placeholder="par_live_..."
                className={`w-full px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 transition ${
                  isDark 
                    ? 'bg-[var(--noir-950)] border border-[var(--noir-800)] text-slate-200' 
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                style={{ '--tw-ring-color': 'var(--gold-500)' } as any}
              />
              {renderKeyIndicator(parallelKey)}
            </div>
            <p className={`text-[11px] ${isDark ? 'text-[var(--noir-400)]' : 'text-slate-500'}`}>
              Enables live web grounding, fact verification, and competitor blindspot analysis.
            </p>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className={`font-semibold flex items-center gap-1.5 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] hover:underline flex items-center gap-1 font-medium"
                style={{ color: 'var(--gold-600)' }}
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full px-3 py-2 rounded-xl font-[family-name:var(--font-mono)] text-xs focus:outline-none focus:ring-2 transition ${
                  isDark 
                    ? 'bg-[var(--noir-950)] border border-[var(--noir-800)] text-slate-200' 
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
                style={{ '--tw-ring-color': 'var(--gold-500)' } as any}
              />
              {renderKeyIndicator(geminiKey)}
            </div>
            <p className={`text-[11px] ${isDark ? 'text-[var(--noir-400)]' : 'text-slate-500'}`}>
              Powers Gemini 2.5 Flash for Two-Column AV screenplay and visual directing.
            </p>
          </div>

          {/* Buttons */}
          <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
            isDark ? 'border-[var(--noir-800)]' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                isDark ? 'bg-[var(--noir-800)] hover:bg-[var(--noir-700)] text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold px-4 py-2 rounded-xl text-slate-950 font-bold transition flex items-center gap-1.5 shadow-md"
              style={{ backgroundColor: 'var(--gold-500)', boxShadow: '0 4px 14px 0 color-mix(in srgb, var(--gold-500) 20%, transparent)' }}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
