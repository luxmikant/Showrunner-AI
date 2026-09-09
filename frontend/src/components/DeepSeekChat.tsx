import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ShowrunnerProject, DocumentUploadResponse } from '../types';
import { 
  Plus, Sparkles, Globe, Download, 
  Film, Settings, ChevronDown, ChevronRight,
  ArrowUp, RefreshCw, X, FileText,
  Clock, Timer, Folder, FolderOpen, PanelLeft,
  ArrowLeft, ArrowRight, CheckCircle2, Mic, Terminal,
  ChevronUp
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialPromptSent = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() && !initialPromptSent.current) {
      initialPromptSent.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setMessages([]);
        onResetFactoryState();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResetFactoryState]);

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
          deep_search: isDeepSearchActive
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();

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

      const noticeMessage: ChatMessage = {
        id: `doc-${Date.now()}`,
        role: 'assistant',
        content: `Attached multimodal document **"${docData.filename}"** (${docData.page_count} pages, ${docData.total_characters.toLocaleString()} characters) into Gemini 2.5 context.\n\nI will incorporate this treatment into the video screenplay beats.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, noticeMessage]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to parse uploaded document.');
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
        <div className="p-3 space-y-3">
          {/* New Conversation Action Button */}
          <button
            onClick={() => {
              setMessages([]);
              onResetFactoryState();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#1e1f24] hover:bg-[#25262c] text-[#ededf0] text-xs font-medium border border-[#282930] transition-colors group cursor-pointer"
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
              onClick={() => {}}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#92949f] hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Conversation History</span>
            </button>
            <button 
              onClick={() => {}}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[#92949f] hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Scheduled Tasks</span>
            </button>
          </div>

          {/* Projects Tree Section */}
          <div className="pt-3 border-t border-[#282930] space-y-2">
            <div className="flex items-center justify-between px-1 text-[11px] font-medium text-[#5c5e69] uppercase tracking-wider">
              <span>Projects</span>
              <div className="flex items-center gap-1">
                <button className="hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
              </div>
            </div>

            {/* Folder 1: Active Showrunner Workspace */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-1 py-1 text-[#92949f] hover:text-[#ededf0] cursor-pointer">
                <FolderOpen className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="truncate font-medium">agentic blockbuster h...</span>
              </div>

              {/* Active Conversation Pill (Matching Screenshot) */}
              <div className="pl-4 space-y-1">
                <div 
                  onClick={onOpenStudio}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#222328] border border-[#2e3036] text-[#ededf0] font-medium cursor-pointer shadow-sm"
                >
                  <span className="truncate max-w-[140px]">
                    {project ? project.title : 'Showrunner AI Product Pl...'}
                  </span>
                  <span className="text-[10px] text-[#5c5e69] font-mono shrink-0">
                    {project ? 'Active' : '20m'}
                  </span>
                </div>

                {/* Other past sessions */}
                <div 
                  onClick={() => handleSendMessage('Create a 12-minute video essay on why the Concorde supersonic airliner failed.')}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[#92949f] hover:text-[#ededf0] hover:bg-[#1e1f24] transition-colors cursor-pointer"
                >
                  <span className="truncate max-w-[140px]">Resume Workspace Sessio...</span>
                  <span className="text-[10px] text-[#5c5e69] font-mono shrink-0">4h</span>
                </div>
              </div>
            </div>

            {/* Folder 2: Secondary Folder */}
            <div className="pt-1">
              <div className="flex items-center gap-1.5 px-1 py-1 text-[#5c5e69]">
                <Folder className="w-3.5 h-3.5" />
                <span className="truncate">personal_portfolio</span>
              </div>
              <div className="pl-6 text-[11px] text-[#5c5e69] py-0.5">
                No conversations yet
              </div>
            </div>
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
      {/* MAIN PANE: ANTIGRAVITY IDE WORKSPACE CHAT               */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#121316]">
        
        {/* Top IDE Window Header Bar (Matching Reference Screenshot) */}
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
            <button 
              onClick={onReturnToLanding}
              className="p-1 rounded text-[#92949f] hover:text-white hover:bg-[#1e1f24] transition-colors cursor-pointer" 
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              className="p-1 rounded text-[#5c5e69] cursor-not-allowed" 
              title="Forward" 
              disabled
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1 text-[11px] text-[#92949f] font-mono ml-2">
              <span className="hover:text-white cursor-pointer">agentic blockbuster hackathon</span>
              <span className="text-[#5c5e69]">/</span>
              <span className="text-[#ededf0] font-medium truncate max-w-xs">
                {project ? project.title : 'Showrunner AI Product Plan'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Engine Status / Action Pill Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e1f24] hover:bg-[#282930] border border-[#282930] text-[11px] text-[#ededf0] font-medium transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-[#38bdf8]" />
              <span>Install IDE</span>
            </button>

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
                    Autonomous multi-agent pre-production engine. Pitch a topic, upload a script PDF, or ask for visual directives. Powered by Gemini 2.5 and Parallel Web Systems.
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

                    {/* Message Bubble (Matching Screenshot Format) */}
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
        {/* BOTTOM PROMPT CONSOLE (Matching Reference Screenshot)    */}
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

            {/* Remote Status Card (Exact match to screenshot) */}
            <div className="px-1 flex items-center justify-between text-[11px] font-mono text-[#92949f]">
              <div className="flex items-center gap-2">
                <span className="text-[#5c5e69]">Remote Status</span>
                <span className="text-[#282930]">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[#ededf0]">1 task running</span>
                </div>
                <span className="text-[#5c5e69] flex items-center gap-1">
                  <Terminal className="w-3 h-3" />
                  <span>python run.py</span>
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
                placeholder="Ask anything, @ to mention, / for actions"
                rows={1}
                className="w-full bg-transparent text-xs text-[#ededf0] placeholder-[#5c5e69] focus:outline-none resize-none leading-relaxed font-sans px-1"
              />

              {/* Bottom Actions Bar Inside Input Container (Matching Screenshot) */}
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
                            className="w-full text-left px-2.5 py-1.5 rounded-md text-[#ededf0] hover:bg-[#222328] transition-colors flex items-center justify-between"
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
