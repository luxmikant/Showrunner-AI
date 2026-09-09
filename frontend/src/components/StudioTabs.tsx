import React, { useState } from 'react';
import { Film, FileText, Globe, TrendingUp, LayoutGrid } from 'lucide-react';
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

type TabId = 'canvas' | 'screenplay' | 'research' | 'packaging' | 'storyboard';

const tabs: { id: TabId; label: string; icon: React.FC<any> }[] = [
  { id: 'canvas', label: 'Canvas', icon: Film },
  { id: 'screenplay', label: 'Screenplay', icon: FileText },
  { id: 'research', label: 'Research', icon: Globe },
  { id: 'packaging', label: 'Packaging', icon: TrendingUp },
  { id: 'storyboard', label: 'Storyboard', icon: LayoutGrid },
];

export const StudioTabs: React.FC<StudioTabsProps> = ({
  project,
  onUpdateBeat,
  onClosePlayer,
  onDownloadPackage
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('canvas');

  return (
    <div 
      className="flex flex-col h-full w-full"
      style={{ backgroundColor: 'var(--noir-950)' }}
    >
      <div 
        className="flex items-center px-4 overflow-x-auto shrink-0"
        style={{ borderBottom: '1px solid var(--noir-700)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 min-w-max transition-colors relative"
              style={{ 
                color: isActive ? 'var(--gold-500)' : 'var(--noir-400)' 
              }}
            >
              <Icon size={18} />
              <span className="font-medium hidden sm:inline">{tab.label}</span>
              {isActive && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ backgroundColor: 'var(--gold-500)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 animate-fade-in overflow-y-auto">
          {activeTab === 'canvas' && (
            <StudioVideoPlayer
              project={project}
              onUpdateBeat={onUpdateBeat}
              onClosePlayer={onClosePlayer}
              onDownloadPackage={onDownloadPackage}
            />
          )}
          {activeTab === 'screenplay' && (
            <div className="p-6">
              <AVScriptView
                beats={project.script_beats || []}
                projectTitle={project.title}
              />
            </div>
          )}
          {activeTab === 'research' && (
            <div className="p-6">
              <ResearchDrawer
                research={project.research}
              />
            </div>
          )}
          {activeTab === 'packaging' && (
            <div className="p-6">
              <PackagingView
                packaging={project.packaging}
                metrics={project.metrics}
              />
            </div>
          )}
          {activeTab === 'storyboard' && (
            <div className="p-6">
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
