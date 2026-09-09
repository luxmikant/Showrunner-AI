import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { 
  ChatMessage, 
  ShowrunnerProject, 
  DocumentUploadResponse,
  ProjectFolder,
  ConversationSummary,
  ConversationDetail
} from '../types';
import { 
  Plus, Sparkles, Globe, Download, 
  Film, Settings, ChevronDown, ChevronRight,
  ArrowUp, RefreshCw, X, FileText,
  Clock, Timer, Folder, FolderOpen, PanelLeft,
  ArrowLeft, ArrowRight, CheckCircle2, Mic, Terminal,
  ChevronUp, Trash2, Check, Search, MessageSquare
} from 'lucide-react';

interface DeepSeekChatProps {
  project: ShowrunnerProject | null;
  onSelectProject: (project: ShowrunnerProject) => void;
  onOpenStudio: () => void;
  onOpenSettings: () => void;
  onResetFactoryState: () => void;
  onDownloadPackage: () => void;
  geminiKey?: string;
  parallelKey?: string;
  onReturnToLanding?: () => void;
  initialPrompt?: string;
}

const formatTimeAgo = (iso?: string): string => {
  if (!iso) return '';
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

export const DeepSeekChat: React.FC<DeepSeekChatProps> = ({
  project,
  onSelectProject,
  onOpenStudio,
  onOpenSettings,
  onResetFactoryState,
  onDownloadPackage,
  geminiKey,
  parallelKey,
  onReturnToLanding,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepSearchActive, setIsDeepSearchActive] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentUploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedThinking, setExpandedThinking] = useState<Record<number, boolean>>({});
  const [selectedModel, setSelectedModel] = useState('Gemini 2.5 Flash');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Real Persistent Storage State
  const [projects, setProjects] = useState<ProjectFolder[]>([]);
  const [independentConversations, setIndependentConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newProjectInputRef = useRef<HTMLInputElement>(null);
  const initialPromptSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch real filesystem projects from backend
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: ProjectFolder[] = await res.json();
        setProjects(data);
        if (data.length > 0) {
          setExpandedProjects(prev => {
            if (Object.keys(prev).length === 0) {
              return { [data[0].id]: true };
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Failed to load projects from filesystem:', err);
    }
  }, []);

  // Fetch independent conversations from backend
  const fetchIndependentConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data: ConversationSummary[] = await res.json();
        setIndependentConversations(data);
      }
    } catch (err) {
      console.error('Failed to load independent conversations from filesystem:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProjects();
    fetchIndependentConversations();
  }, [fetchProjects, fetchIndependentConversations]);

  // Auto focus inline project input
  useEffect(() => {
    if (isCreatingProject) {
      newProjectInputRef.current?.focus();
    }
  }, [isCreatingProject]);

  // Handle + New Conversation (independent, disk-backed)
  const handleCreateIndependentConversation = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      if (res.ok) {
        const newConv: ConversationDetail = await res.json();
        setActiveConversationId(newConv.id);
        setActiveProjectId(null);
        setMessages([]);
        onResetFactoryState();
        await fetchIndependentConversations();
        textareaRef.current?.focus();
      }
    } catch (err) {
      console.error('Failed to create independent conversation:', err);
    }
  }, [fetchIndependentConversations, onResetFactoryState]);

  // Shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleCreateIndependentConversation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateIndependentConversation]);

  // Handle auto-send initialPrompt
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !initialPromptSent.current) {
      initialPromptSent.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Create real project directory on disk
  const handleConfirmCreateProject = async () => {
    const trimmed = newProjectName.trim();
    if (!trimmed) {
      setIsCreatingProject(false);
      return;
    }
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed })
      });
      if (res.ok) {
        const created: ProjectFolder = await res.json();
        setNewProjectName('');
        setIsCreatingProject(false);
        setExpandedProjects(prev => ({ ...prev, [created.id]: true }));
        await fetchProjects();
      }
    } catch (err) {
      console.error('Failed to create project folder on disk:', err);
    }
  };

  // Create conversation inside a project directory
  const handleCreateProjectConversation = async (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Session', project_id: projectId })
      });
      if (res.ok) {
        const newConv: ConversationDetail = await res.json();
        setActiveConversationId(newConv.id);
        setActiveProjectId(projectId);
        setMessages([]);
        onResetFactoryState();
        setExpandedProjects(prev => ({ ...prev, [projectId]: true }));
        await fetchProjects();
        textareaRef.current?.focus();
      }
    } catch (err) {
      console.error('Failed to create project conversation:', err);
    }
  };

  // Load conversation from disk
  const handleLoadConversation = async (convId: string, projectId: string | null = null) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const detail: ConversationDetail = await res.json();
        setActiveConversationId(detail.id);
        setActiveProjectId(detail.project_id || projectId || null);
        setMessages(detail.messages || []);
        if (detail.project_state) {
          onSelectProject(detail.project_state);
        } else {
          onResetFactoryState();
        }
        setShowHistoryModal(false);
      }
    } catch (err) {
      console.error('Failed to load conversation from disk:', err);
    }
  };

  // Delete project folder from disk
  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project directory and all its files from disk?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeProjectId === projectId) {
          setActiveProjectId(null);
          setActiveConversationId(null);
          setMessages([]);
          onResetFactoryState();
        }
        await fetchProjects();
      }
    } catch (err) {
      console.error('Failed to delete project folder:', err);
    }
  };

  // Delete conversation file from disk
  const handleDeleteConversation = async (convId: string, projectId: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${convId}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeConversationId === convId) {
          setActiveConversationId(null);
          setMessages([]);
          onResetFactoryState();
        }
        if (projectId) {
          await fetchProjects();
        } else {
          await fetchIndependentConversations();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation file:', err);
    }
  };

  const toggleThinking = (idx: number) => {
    setExpandedThinking(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          project: project || undefined,
          document_context: uploadedDoc?.extracted_text || uploadedDoc?.extracted_text_preview || undefined,
          parallel_api_key: parallelKey || undefined,
          gemini_api_key: geminiKey || undefined,
          deep_search: isDeepSearchActive,
          conversation_id: activeConversationId || undefined,
          project_id: activeProjectId || undefined
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.conversation_id && (!activeConversationId || activeConversationId !== data.conversation_id)) {
        setActiveConversationId(data.conversation_id);
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-reply`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        thinking: data.thinking,
        projectResult: data.updated_project || undefined,
        videoReady: data.video_ready || Boolean(data.updated_project)
      };

      setMessages(prev => {
        const next = [...prev, assistantMessage];
        setExpandedThinking(t => ({ ...t, [next.length - 1]: true }));
        return next;
      });

      if (data.updated_project) {
        onSelectProject(data.updated_project);
      }

      fetchProjects();
      fetchIndependentConversations();
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an issue connecting to the AI Showrunner backend. Please verify that the FastAPI backend server is running on port 8000.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const docData: DocumentUploadResponse = await res.json();
      setUploadedDoc(docData);

      const systemMsg: ChatMessage = {
        id: `msg-${Date.now()}-upload`,
        role: 'assistant',
        content: `Ingested document **${docData.filename}** (${docData.page_count} pages, ${docData.total_characters.toLocaleString()} characters). Showrunner multi-agent context initialized.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thinking: `Document ingested into multi-agent working memory: ${docData.filename}`
      };
      setMessages(prev => [...prev, systemMsg]);
    } catch (err) {
      console.error('Document upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const samplePrompts = [
    {
      title: 'Soviet Kola Borehole Anomaly',
      desc: 'Declassified acoustic recordings at 12,000m depth',
      prompt: 'Create a 12-minute documentary script on the Soviet Kola Superdeep Borehole sonic anomaly.'
    },
    {
      title: 'Baltic Deep-Sea Fiber Sabotage',
      desc: 'Undersea communications cable cuts and AIS ghost ships',
      prompt: 'Produce an investigative video essay on the Baltic Sea undersea fiber cable sabotage.'
    },
    {
      title: 'The Real Reason Concorde Failed',
      desc: 'Supersonic shockwave physics vs transatlantic airline economics',
      prompt: 'Draft a high-retention video essay on why Concorde failed: aerodynamic economics vs fuel burn.'
    },
    {
      title: '1972 Ghost Satellite (LES-1)',
      desc: 'Dormant Lincoln satellite resumes pulsing after 50 years',
      prompt: 'Generate a video short on the 1972 Ghost Satellite LES-1 transmissions.'
    }
  ];

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeConversationTitle = 
    activeProject?.conversations.find(c => c.id === activeConversationId)?.title ||
    independentConversations.find(c => c.id === activeConversationId)?.title ||
    (project ? project.title : 'New Session');

  return (
    <div className="flex h-screen bg-[#121316] text-[#ededf0] font-[family-name:var(--font-body)] overflow-hidden select-none">
      
      {/* ======================================================== */}
      {/* LEFT SIDEBAR: ANTIGRAVITY IDE WORKSPACE NAVIGATION      */}
      {/* ======================================================== */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-200 ease-in-out bg-[#15161a] border-r border-[#282930] flex flex-col justify-between overflow-hidden z-20 shrink-0 text-xs`}
      >
        <div className="p-3 space-y-3 overflow-y-auto flex-1">
          {/* New Independent Conversation Button */}
          <button
            onClick={handleCreateIndependentConversation}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1e1f24] hover:bg-[#25262c] text-[#ededf0] text-xs font-medium border border-[#282930] transition-colors group cursor-pointer"
            title="Start an independent conversation (not under any project)"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-[#92949f] group-hover:text-white transition-colors" />
              <span>New Conversation</span>
            </span>
            <span className="text-[10px] font-mono text-[#5c5e69]">Ctrl+K</span>
          </button>

          {/* Quick Nav Links */}
          <div className="space-y-0.5 pt-1">
            <button 
              onClick={() => setShowHistoryModal(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#92949f] hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 group-hover:text-[#38bdf8] transition-colors" />
                <span>Conversation History</span>
              </span>
              {independentConversations.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#18191d] text-[#5c5e69] border border-[#282930]">
                  {independentConversations.length}
                </span>
              )}
            </button>

            <div className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#5c5e69] cursor-default">
              <Timer className="w-3.5 h-3.5" />
              <span>Scheduled Tasks</span>
            </div>
          </div>

          {/* ==================================================== */}
          {/* REAL FILESYSTEM PROJECTS DIRECTORY SECTION           */}
          {/* ==================================================== */}
          <div className="pt-3 border-t border-[#282930] space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px] font-medium text-[#5c5e69] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <span>Projects</span>
                <span className="text-[10px] font-mono text-[#42444d]">({projects.length})</span>
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsCreatingProject(true)}
                  className="p-1 rounded hover:bg-[#1e1f24] hover:text-white transition-colors cursor-pointer"
                  title="Create real project working directory on disk"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inline Project Directory Creator */}
            {isCreatingProject && (
              <div className="p-2 rounded-lg bg-[#18191d] border border-[#3a3b44] space-y-2 animate-fade-in">
                <div className="text-[10px] font-mono text-[#38bdf8] flex items-center gap-1">
                  <Folder className="w-3 h-3" />
                  <span>New Project Folder</span>
                </div>
                <input
                  ref={newProjectInputRef}
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmCreateProject();
                    if (e.key === 'Escape') {
                      setIsCreatingProject(false);
                      setNewProjectName('');
                    }
                  }}
                  placeholder="e.g. apollo-documentary"
                  className="w-full px-2 py-1 bg-[#121316] border border-[#282930] rounded text-xs text-[#ededf0] focus:outline-none focus:border-[#38bdf8]"
                />
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setIsCreatingProject(false);
                      setNewProjectName('');
                    }}
                    className="p-1 text-[#92949f] hover:text-white rounded hover:bg-[#222328]"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleConfirmCreateProject}
                    disabled={!newProjectName.trim()}
                    className="p-1 text-[#22c55e] hover:text-white rounded hover:bg-[#22c55e]/20 disabled:opacity-40"
                    title="Create directory on disk"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* List of Real Local Projects */}
            {projects.length === 0 && !isCreatingProject ? (
              <div className="px-2 py-3 rounded-lg border border-dashed border-[#282930] text-center space-y-1">
                <div className="text-[11px] text-[#5c5e69]">No projects found on disk.</div>
                <button
                  onClick={() => setIsCreatingProject(true)}
                  className="text-[11px] text-[#e5a93c] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Create Project Folder</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {projects.map((p) => {
                  const isExpanded = expandedProjects[p.id] ?? false;
                  const isCurrentProject = activeProjectId === p.id;

                  return (
                    <div key={p.id} className="space-y-0.5">
                      {/* Project Header Row */}
                      <div 
                        onClick={() => {
                          setExpandedProjects(prev => ({
                            ...prev,
                            [p.id]: !prev[p.id]
                          }));
                        }}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#1e1f24] transition-colors cursor-pointer ${
                          isCurrentProject ? 'text-[#ededf0] bg-[#1a1b20]' : 'text-[#92949f]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate max-w-[170px]">
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-[#5c5e69] shrink-0" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-[#5c5e69] shrink-0" />
                          )}
                          {isExpanded ? (
                            <FolderOpen className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                          )}
                          <span className="truncate font-medium text-xs group-hover:text-white" title={p.name}>
                            {p.name}
                          </span>
                        </div>

                        {/* Project Row Hover Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleCreateProjectConversation(p.id, e)}
                            className="p-1 hover:text-white hover:bg-[#282930] rounded cursor-pointer"
                            title="New conversation in this project"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProject(p.id, e)}
                            className="p-1 hover:text-red-400 hover:bg-[#282930] rounded cursor-pointer"
                            title="Delete project folder from disk"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Project Conversations List (Physical files inside project/conversations/) */}
                      {isExpanded && (
                        <div className="pl-5 space-y-0.5 border-l border-[#282930] ml-3 mt-0.5">
                          {p.conversations.length === 0 ? (
                            <div className="px-2 py-1 text-[11px] text-[#5c5e69] flex items-center justify-between">
                              <span>No sessions yet</span>
                              <button
                                onClick={(e) => handleCreateProjectConversation(p.id, e)}
                                className="text-[10px] text-[#e5a93c] hover:underline cursor-pointer"
                              >
                                + New
                              </button>
                            </div>
                          ) : (
                            p.conversations.map((c) => {
                              const isActive = activeConversationId === c.id;
                              return (
                                <div
                                  key={c.id}
                                  onClick={() => handleLoadConversation(c.id, p.id)}
                                  className={`group/conv flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                                    isActive 
                                      ? 'bg-[#222328] text-white border border-[#2e3036] font-medium shadow-sm' 
                                      : 'text-[#92949f] hover:text-[#ededf0] hover:bg-[#1e1f24]'
                                  }`}
                                  title={c.title}
                                >
                                  <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                                    <MessageSquare className={`w-3 h-3 shrink-0 ${isActive ? 'text-[#e5a93c]' : 'text-[#5c5e69]'}`} />
                                    <span className="truncate">{c.title}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[10px] text-[#5c5e69] font-mono group-hover/conv:hidden">
                                      {formatTimeAgo(c.updated_at)}
                                    </span>
                                    <button
                                      onClick={(e) => handleDeleteConversation(c.id, p.id, e)}
                                      className="hidden group-hover/conv:flex p-0.5 hover:text-red-400 rounded cursor-pointer"
                                      title="Delete conversation from disk"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Sticky Footer */}
        <div className="p-3 border-t border-[#282930] space-y-1">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#92949f] hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#92949f] hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* CONVERSATION HISTORY MODAL (INDEPENDENT SESSIONS)        */}
      {/* ======================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-xl bg-[#18191d] border border-[#282930] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-4 py-3 border-b border-[#282930] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38bdf8]" />
                <span className="font-semibold text-sm text-[#ededf0]">Conversation History</span>
                <span className="text-xs text-[#5c5e69] font-mono">({independentConversations.length})</span>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded text-[#92949f] hover:text-white hover:bg-[#222328]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Filter */}
            <div className="p-3 border-b border-[#282930] bg-[#141518]">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#18191d] border border-[#282930]">
                <Search className="w-3.5 h-3.5 text-[#5c5e69]" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter past conversations..."
                  className="w-full bg-transparent text-xs text-[#ededf0] placeholder-[#5c5e69] focus:outline-none"
                />
                {historySearch && (
                  <button onClick={() => setHistorySearch('')} className="text-[#5c5e69] hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversations List */}
            <div className="p-3 overflow-y-auto space-y-1 flex-1">
              {independentConversations.filter(c => c.title.toLowerCase().includes(historySearch.toLowerCase())).length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5c5e69] space-y-2">
                  <p>No conversations found.</p>
                  <button
                    onClick={() => {
                      setShowHistoryModal(false);
                      handleCreateIndependentConversation();
                    }}
                    className="text-xs text-[#e5a93c] hover:underline"
                  >
                    Start a new conversation
                  </button>
                </div>
              ) : (
                independentConversations
                  .filter(c => c.title.toLowerCase().includes(historySearch.toLowerCase()))
                  .map((conv) => {
                    const isActive = activeConversationId === conv.id;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => handleLoadConversation(conv.id, null)}
                        className={`group p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-[#222328] border-[#3a3b44] text-white'
                            : 'bg-[#15161a] border-[#282930] text-[#92949f] hover:bg-[#1e1f24] hover:text-[#ededf0]'
                        }`}
                      >
                        <div className="space-y-0.5 max-w-[340px]">
                          <div className="text-xs font-medium truncate text-[#ededf0] flex items-center gap-1.5">
                            <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#e5a93c]' : 'text-[#38bdf8]'}`} />
                            <span className="truncate">{conv.title}</span>
                          </div>
                          <div className="text-[10px] text-[#5c5e69] font-mono flex items-center gap-2">
                            <span>{formatTimeAgo(conv.updated_at)}</span>
                            <span>•</span>
                            <span>{conv.message_count} messages</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#e5a93c]/10 text-[#e5a93c] border border-[#e5a93c]/30">
                              Active
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteConversation(conv.id, null, e)}
                            className="p-1.5 rounded text-[#5c5e69] hover:text-red-400 hover:bg-[#282930] transition-colors"
                            title="Delete conversation from disk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MAIN PANE: ANTIGRAVITY IDE WORKSPACE CHAT               */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#121316]">
        
        {/* Top IDE Window Header Bar */}
        <header className="h-10 px-3 border-b border-[#282930] flex items-center justify-between bg-[#121316] shrink-0 text-xs select-none">
          <div className="flex items-center gap-2">
            {/* Sidebar toggle icon */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded text-[#92949f] hover:text-white hover:bg-[#1e1f24] transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <PanelLeft className="w-3.5 h-3.5" />
            </button>

            {/* History navigation */}
            {onReturnToLanding && (
              <button 
                onClick={onReturnToLanding}
                className="p-1 rounded text-[#92949f] hover:text-white hover:bg-[#1e1f24] transition-colors cursor-pointer" 
                title="Back to Landing"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              className="p-1 rounded text-[#5c5e69] cursor-not-allowed" 
              title="Forward" 
              disabled
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Breadcrumb Path from Disk Workspace */}
            <div className="flex items-center gap-1 text-[11px] text-[#92949f] font-mono ml-2">
              <span className="hover:text-white cursor-pointer">workspace</span>
              <span className="text-[#5c5e69]">/</span>
              {activeProject ? (
                <>
                  <span className="hover:text-white cursor-pointer text-[#3b82f6]">{activeProject.name}</span>
                  <span className="text-[#5c5e69]">/</span>
                </>
              ) : (
                <>
                  <span className="text-[#5c5e69]">conversations</span>
                  <span className="text-[#5c5e69]">/</span>
                </>
              )}
              <span className="text-[#ededf0] font-medium truncate max-w-xs">
                {activeConversationTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Studio Canvas Action Button */}
            {project && (
              <button
                onClick={onOpenStudio}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#222328] hover:bg-[#2a2b32] border border-[#3a3b44] text-[11px] text-[#e5a93c] font-medium transition-colors cursor-pointer"
              >
                <Film className="w-3 h-3" />
                <span>Open Canvas</span>
              </button>
            )}

            {/* Engine Status / Action Pill Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e1f24] hover:bg-[#282930] border border-[#282930] text-[11px] text-[#ededf0] font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-[#38bdf8]" />
              <span>Studio Engine</span>
            </button>
          </div>
        </header>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            
            {/* FACTORY RESET EMPTY STATE */}
            {messages.length === 0 && (
              <div className="pt-10 pb-6 flex flex-col items-center text-center space-y-5 animate-fade-in">
                <div className="w-12 h-12 rounded-xl bg-[#1e1f24] border border-[#282930] flex items-center justify-center shadow-lg">
                  <Film className="w-6 h-6 text-[#e5a93c]" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <h1 className="text-xl font-bold tracking-tight text-[#ededf0]">
                    Showrunner AI Studio
                  </h1>
                  <p className="text-xs text-[#92949f] leading-relaxed">
                    Autonomous multi-agent pre-production engine. Pitch a topic, upload a script PDF, or ask for visual directives. Every session persists automatically to your local disk workspace.
                  </p>
                </div>

                {/* Prompt Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left pt-2">
                  {samplePrompts.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-3 rounded-lg bg-[#18191d] hover:bg-[#202127] border border-[#282930] hover:border-[#3a3b44] transition-colors text-left group cursor-pointer"
                    >
                      <div className="text-xs font-semibold text-[#ededf0] group-hover:text-[#e5a93c] transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#92949f] line-clamp-1 mt-0.5">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages Feed */}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isThinkingOpen = expandedThinking[index] !== false;

              return (
                <div 
                  key={msg.id || index}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in text-xs`}
                >
                  <div className={`space-y-2 max-w-[92%] ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Collapsible DeepSeek Reasoning Chain */}
                    {!isUser && msg.thinking && (
                      <div className="rounded-lg bg-[#18191d] border border-[#282930] overflow-hidden text-xs">
                        <button
                          onClick={() => toggleThinking(index)}
                          className="w-full px-3 py-1.5 flex items-center justify-between text-[#92949f] hover:text-[#ededf0] transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                            <span className="font-medium text-[#ededf0]">Agentic Reasoning Chain</span>
                          </span>
                          {isThinkingOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                        
                        {isThinkingOpen && (
                          <div className="px-3 pb-2 pt-1 text-[11px] font-mono text-[#92949f] whitespace-pre-line border-t border-[#282930] bg-[#141518]">
                            {msg.thinking}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 rounded-xl leading-relaxed ${
                        isUser 
                          ? 'bg-[#222328] border border-[#2e3036] text-[#ededf0]'
                          : 'bg-[#18191d] border border-[#282930] text-[#ededf0]'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans space-y-1.5">
                        {msg.content}
                      </div>

                      {/* Verified Citations List */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-[#282930] space-y-1">
                          <div className="text-[10px] font-mono uppercase text-[#22c55e] flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>Parallel Web Grounded Citations</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.citations.map((cite, ci) => (
                              <span 
                                key={ci}
                                className="px-2 py-0.5 rounded bg-[#141518] text-[#92949f] text-[10px] font-mono border border-[#282930] truncate max-w-xs"
                              >
                                {cite}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Multimodal Video Result Card */}
                    {!isUser && msg.projectResult && (
                      <div className="rounded-xl border border-[#3a3b44] bg-[#18191d] overflow-hidden p-3.5 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                              Generated Package: {msg.projectResult.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e1f24] text-[#e5a93c] border border-[#282930]">
                            {msg.projectResult.script_beats.length} AV Beats
                          </span>
                        </div>

                        {/* 16:9 Thumbnail preview */}
                        <div 
                          onClick={onOpenStudio}
                          className="relative aspect-video rounded-lg bg-black border border-[#282930] overflow-hidden flex items-center justify-center group cursor-pointer"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                          <div className="w-10 h-10 rounded-full bg-[#e5a93c] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform z-20">
                            <Film className="w-5 h-5" />
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 z-20 space-y-0.5">
                            <div className="text-[11px] font-bold text-white font-mono uppercase">
                              {msg.projectResult.script_beats[0]?.title || msg.projectResult.title}
                            </div>
                            <div className="text-[10px] text-[#92949f] font-mono">
                              Pacing: {msg.projectResult.metrics.average_cut_duration_sec}s/cut • Hook: {msg.projectResult.packaging.first_60s_hook_score}/100
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                          <button
                            onClick={onDownloadPackage}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#222328] hover:bg-[#2a2b32] text-[#ededf0] text-xs font-semibold border border-[#2e3036] transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-[#22c55e]" />
                            <span>Download Package</span>
                          </button>

                          <button
                            onClick={onOpenStudio}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#e5a93c] hover:bg-[#f0be5c] text-black text-xs font-bold transition shadow cursor-pointer"
                          >
                            <Film className="w-3.5 h-3.5" />
                            <span>Edit in Studio</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Live Loading Spinner */}
            {isLoading && (
              <div className="flex gap-2.5 items-center p-3 rounded-xl bg-[#18191d] border border-[#282930] text-xs text-[#92949f]">
                <RefreshCw className="w-3.5 h-3.5 text-[#e5a93c] animate-spin" />
                <span>Showrunner multi-agent pipeline executing research &amp; screenplay structuring...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* BOTTOM PROMPT CONSOLE                                    */}
        {/* ======================================================== */}
        <div className="p-3 bg-[#121316] shrink-0 border-t border-[#282930]">
          <div className="max-w-3xl mx-auto space-y-2">
            
            {/* Hidden File Input for PDF uploads */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.txt,.md" 
              className="hidden" 
            />

            {/* Uploaded Doc Pill */}
            {uploadedDoc && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18191d] border border-[#3b82f6]/40 text-[11px] text-[#38bdf8]">
                <FileText className="w-3 h-3 text-[#3b82f6]" />
                <span className="font-medium truncate max-w-xs">{uploadedDoc.filename}</span>
                <span className="text-[#5c5e69]">({uploadedDoc.total_characters.toLocaleString()} chars)</span>
                <button onClick={() => setUploadedDoc(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
              </div>
            )}

            {/* Remote Status Card */}
            <div className="px-1 flex items-center justify-between text-[11px] font-mono text-[#92949f]">
              <div className="flex items-center gap-2">
                <span className="text-[#5c5e69]">Disk Workspace</span>
                <span className="text-[#282930]">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[#ededf0]">FastAPI Storage Ready</span>
                </div>
                <span className="text-[#5c5e69] flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>workspace/projects/</span>
                </span>
              </div>
            </div>

            {/* Elevated Rounded Input Box Container */}
            <div className="bg-[#1e1f24] border border-[#282930] focus-within:border-[#3a3b44] rounded-xl p-2.5 shadow-xl transition-colors">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask anything, type a video pitch, or paste lore notes..."
                rows={1}
                className="w-full bg-transparent text-xs text-[#ededf0] placeholder-[#5c5e69] focus:outline-none resize-none leading-relaxed font-sans px-1"
              />

              {/* Bottom Actions Bar Inside Input Container */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#282930]">
                <div className="flex items-center gap-1.5">
                  {/* Plus / Attach button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-1 rounded-md text-[#92949f] hover:text-white hover:bg-[#282930] transition-colors cursor-pointer"
                    title="Attach Script / Treatment PDF"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Model Selector Pill Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowModelPicker(!showModelPicker)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-[#92949f] hover:text-[#ededf0] hover:bg-[#282930] transition-colors cursor-pointer font-sans"
                    >
                      <Sparkles className="w-3 h-3 text-[#e5a93c]" />
                      <span>{selectedModel}</span>
                      <ChevronUp className="w-3 h-3" />
                    </button>

                    {showModelPicker && (
                      <div className="absolute bottom-full left-0 mb-1.5 w-44 rounded-lg bg-[#18191d] border border-[#282930] p-1 shadow-2xl z-50 text-[11px]">
                        {['Gemini 2.5 Flash', 'Gemini 2.5 Pro', 'DeepSeek-R1 Engine'].map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedModel(m);
                              setShowModelPicker(false);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-md text-[#ededf0] hover:bg-[#222328] transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span>{m}</span>
                            {selectedModel === m && <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Parallel Web Deep Search Toggle */}
                  <button
                    onClick={() => setIsDeepSearchActive(!isDeepSearchActive)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                      isDeepSearchActive 
                        ? 'text-[#22c55e] bg-[#22c55e]/10' 
                        : 'text-[#5c5e69] hover:text-[#92949f]'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>DeepSearch</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Mic / Voice Dictation Button */}
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      isRecording ? 'text-red-400 bg-red-500/10' : 'text-[#92949f] hover:text-white hover:bg-[#282930]'
                    }`}
                    title="Voice Pitch Input"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                      inputMessage.trim() && !isLoading
                        ? 'bg-[#ededf0] text-black font-bold hover:bg-white'
                        : 'text-[#5c5e69] hover:text-[#92949f]'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
