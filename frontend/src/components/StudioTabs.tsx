import React, { useState } from 'react';
import { 
  Film, FileText, Globe, TrendingUp, Terminal, LayoutGrid,
  Plus, Maximize2, X, Columns, Copy, Check
} from 'lucide-react';
import { StudioVideoPlayer } from './StudioVideoPlayer';
import { AVScriptView } from './AVScriptView';
import { ResearchDrawer } from './ResearchDrawer';
import { PackagingView } from './PackagingView';
import { StoryboardGallery } from './StoryboardGallery';
import type { ShowrunnerProject, ScriptBeat } from '../types';

interface StudioTabsProps {
  project: ShowrunnerProject;
  onUpdateBeat: (updatedBeat: ScriptBeat) => void;
  onClosePlayer: () => void;
  onDownloadPackage: () => void;
}

type TabId = 'canvas' | 'screenplay' | 'terminal' | 'research' | 'packaging' | 'storyboard';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const tabs: TabItem[] = [
  { id: 'canvas', label: 'Video Previs', icon: Film },
  { id: 'screenplay', label: 'AV Screenplay', icon: FileText },
  { id: 'terminal', label: 'python run.py', icon: Terminal },
  { id: 'storyboard', label: 'Storyboard', icon: LayoutGrid },
  { id: 'research', label: 'Research', icon: Globe },
  { id: 'packaging', label: 'Packaging', icon: TrendingUp },
];

export const StudioTabs: React.FC<StudioTabsProps> = ({
  project,
  onUpdateBeat,
  onClosePlayer,
  onDownloadPackage
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('canvas');
  const [isCopied, setIsCopied] = useState(false);

  // Generate dynamic telemetry lines matching the screenshot
  const telemetryLogs = [
    { line: 32, text: `2026-09-09 17:08:33,144 [INFO] app.agents.beat_architect: [LIVE GEMINI] Gemini client initialized with key AQ.Ab8RN...Lqog.` },
    { line: 33, text: `2026-09-09 17:08:33,144 [INFO] app.agents.beat_architect: [BeatArchitectAgent] Structuring narrative beats for '${project.title}' (~12 mins)` },
    { line: 34, text: `2026-09-09 17:08:33,144 [INFO] app.agents.beat_architect: [LIVE GEMINI CALL] Generating structured AV script with model gemini-2.5-flash for '${project.title}'. (Key: AQ.Ab8RN...Lqog)` },
    { line: 35, text: `2026-09-09 17:08:33,172 [INFO] google_genai.models: AFC is enabled with max remote calls: 10.` },
    { line: 36, text: `2026-09-09 17:08:33,172 [WARNING] google_genai.models: Direct use of automatic function calling (AFC) in Models.generate_content is not recommended. Instead, we recommend to use AFC in Chat.send_message.` },
    { line: 37, text: `2026-09-09 17:09:05,061 [INFO] httpx: HTTP Request: POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent "HTTP/1.1 200 OK"` },
    { line: 38, text: `2026-09-09 17:09:05,072 [INFO] app.agents.beat_architect: [LIVE GEMINI SUCCESS] Successfully received and parsed ${project.script_beats.length} structured Script Beats from Gemini 2.5 Flash!` },
    { line: 39, text: `2026-09-09 17:09:05,073 [INFO] app.agents.visual_director: [VisualDirectorAgent] Generating visual storyboard directives for ${project.script_beats.length} beats.` },
    { line: 40, text: `2026-09-09 17:09:05,073 [INFO] app.agents.retention_auditor: [RetentionAuditorAgent] Auditing retention pacing and crafting packaging for '${project.title}'.` },
    { line: 41, text: `2026-09-09 17:09:05,074 [INFO] app.agents.orchestrator: [ShowrunnerOrchestrator] Project '${project.title}' successfully generated with ${project.script_beats.length} beats!` },
    { line: 42, text: `INFO:     127.0.0.1:54198 - "POST /api/chat HTTP/1.1" 200 OK` },
    { line: 43, text: `INFO:     127.0.0.1:54201 - "POST /api/player/update-beat HTTP/1.1" 200 OK` },
  ];

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(telemetryLogs.map(l => `${l.line}  ${l.text}`).join('\n'));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#121316] text-[#ededf0] select-none">
      
      {/* ======================================================== */}
      {/* TOP TAB BAR: ANTIGRAVITY IDE MULTI-DOCUMENT TABS        */}
      {/* ======================================================== */}
      <div className="h-10 px-2 flex items-center justify-between border-b border-[#282930] bg-[#15161a] shrink-0 text-xs">
        
        {/* Left Side: Document Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-mono text-[11px] cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#222328] text-[#ededf0] border border-[#2e3036] shadow-sm'
                    : 'text-[#92949f] hover:text-[#ededf0] hover:bg-[#1a1b20]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.id === 'terminal' ? 'text-[#22c55e]' : 'text-[#e5a93c]') : 'text-[#5c5e69]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          
          <button 
            onClick={() => setActiveTab('terminal')}
            className="p-1 rounded text-[#5c5e69] hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer"
            title="New Terminal / Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Side: Tab Actions (Matching Reference Screenshot) */}
        <div className="flex items-center gap-1 text-[#92949f]">
          <button 
            className="p-1 rounded hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer" 
            title="Split Editor Right"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button 
            className="p-1 rounded hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer" 
            title="Maximize Panel"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={onClosePlayer}
            className="p-1 rounded hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer" 
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB CONTENT VIEWPORT                                    */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-hidden relative bg-[#121316]">
        <div className="absolute inset-0 overflow-y-auto">
          
          {/* TAB 1: Canvas / Studio Video Player */}
          {activeTab === 'canvas' && (
            <StudioVideoPlayer
              project={project}
              onUpdateBeat={onUpdateBeat}
              onClosePlayer={onClosePlayer}
              onDownloadPackage={onDownloadPackage}
            />
          )}

          {/* TAB 2: Two-Column AV Screenplay */}
          {activeTab === 'screenplay' && (
            <div className="p-4">
              <AVScriptView
                beats={project.script_beats || []}
                projectTitle={project.title}
              />
            </div>
          )}

          {/* TAB 3: Background Task Output (Matching Screenshot Terminal) */}
          {activeTab === 'terminal' && (
            <div className="h-full flex flex-col p-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#282930] mb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#92949f]">Background Task Output</div>
                  <div className="text-sm font-bold text-[#ededf0]">python run.py</div>
                </div>
                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1e1f24] hover:bg-[#25262c] border border-[#282930] text-[11px] text-[#92949f] hover:text-[#ededf0] transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy Output'}</span>
                </button>
              </div>

              {/* Code Gutter & Log Feed (Exact visual match to screenshot) */}
              <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1 select-text">
                {telemetryLogs.map((log) => (
                  <div key={log.line} className="flex gap-4 hover:bg-[#18191d] px-1 py-0.5 rounded transition-colors">
                    {/* Gutter Line Number */}
                    <span className="text-[#5c5e69] text-right w-6 shrink-0 select-none">
                      {log.line}
                    </span>
                    {/* Log Text with Syntax Highlighting */}
                    <span className="text-[#92949f] break-all">
                      {log.text.includes('[INFO]') ? (
                        <>
                          <span className="text-[#5c5e69]">{log.text.slice(0, 24)}</span>
                          <span className="text-[#3b82f6] font-semibold"> [INFO] </span>
                          <span className="text-[#ededf0]">{log.text.slice(32)}</span>
                        </>
                      ) : log.text.includes('[WARNING]') ? (
                        <>
                          <span className="text-[#5c5e69]">{log.text.slice(0, 24)}</span>
                          <span className="text-[#e5a93c] font-semibold"> [WARNING] </span>
                          <span className="text-[#ededf0]">{log.text.slice(35)}</span>
                        </>
                      ) : (
                        log.text
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Parallel Web Research Dossier */}
          {activeTab === 'research' && (
            <div className="p-4">
              <ResearchDrawer
                research={project.research}
              />
            </div>
          )}

          {/* TAB 5: Packaging & Hook Retention */}
          {activeTab === 'packaging' && (
            <div className="p-4">
              <PackagingView
                packaging={project.packaging}
                metrics={project.metrics}
              />
            </div>
          )}

          {/* TAB 6: Visual Storyboard Gallery */}
          {activeTab === 'storyboard' && (
            <div className="p-4">
              <StoryboardGallery
                beats={project.script_beats || []}
                projectTitle={project.title}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
