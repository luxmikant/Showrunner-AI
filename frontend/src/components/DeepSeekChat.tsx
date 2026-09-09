import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ShowrunnerProject, DocumentUploadResponse } from '../types';
import { 
  Plus, Paperclip, Sparkles, Globe, Download, 
  Film, Settings, ChevronDown, ChevronRight,
  User, ArrowUp, RefreshCw, X, FileText, Layers,
  Clapperboard, ArrowLeft
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Reset textarea height
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
        // Auto-expand latest thinking accordion
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
      desc: 'Declassified acoustic recordings at 12,000 meters depth',
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
    <div className="flex h-screen bg-[var(--noir-850)] text-slate-100 font-[family-name:var(--font-body)] overflow-hidden">
      
      {/* ======================================================== */}
      {/* DEEPSEEK MINIMALIST SIDEBAR                             */}
      {/* ======================================================== */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 ease-in-out bg-[var(--noir-950)] border-r border-[var(--noir-700)] flex flex-col justify-between overflow-hidden z-20 shrink-0`}
      >
        <div className="p-3 space-y-3">
          {/* New Chat / Factory Reset Button */}
          <button
            onClick={() => {
              setMessages([]);
              onResetFactoryState();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[var(--noir-800)] hover:bg-[var(--noir-700)] text-slate-200 text-xs font-semibold border border-[var(--noir-600)] transition-all shadow-sm group"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" style={{ color: 'var(--gold-500)' }} />
              <span>New Studio Session</span>
            </span>
            <span className="text-[10px] font-[family-name:var(--font-mono)] text-slate-500">Ctrl+K</span>
          </button>

          {/* Active Model & Engine Badges */}
          <div className="p-2.5 rounded-xl bg-[var(--noir-850)] border border-[var(--noir-700)] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>LLM Engine</span>
              </span>
              <span className="text-blue-400 font-[family-name:var(--font-mono)] font-medium text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                Gemini 2.5
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Web Grounding</span>
              </span>
              <span className="text-emerald-400 font-[family-name:var(--font-mono)] font-medium text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Parallel MCP
              </span>
            </div>
          </div>

          {/* Active Project Card in Sidebar if exists */}
          {project && (
            <div 
              className="p-3 rounded-xl bg-[var(--noir-800)] border space-y-2 animate-fade-in"
              style={{ borderColor: 'var(--gold-600)' }}
            >
              <div 
                className="flex items-center justify-between text-[10px] font-[family-name:var(--font-mono)] uppercase tracking-wide"
                style={{ color: 'var(--gold-500)' }}
              >
                <span>Active Project</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">
                {project.title}
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-2">
                {project.logline}
              </div>
              <button
                onClick={onOpenStudio}
                className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-black font-bold text-xs shadow-md transition hover:opacity-90"
                style={{ background: 'var(--gold-500)' }}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Open Video Studio</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer: Back & Bring Your Own API Keys */}
        <div className="p-3 border-t border-[var(--noir-700)] space-y-2">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[var(--noir-800)] border border-transparent hover:border-[var(--noir-600)] transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-[var(--noir-800)] border border-transparent hover:border-[var(--noir-600)] transition"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>API Keys &amp; Settings</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN CHAT CANVAS (DeepSeek Layout)                      */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Floating App Bar */}
        <header className="h-12 px-4 border-b border-[var(--noir-700)] flex items-center justify-between bg-[var(--noir-850)] shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[var(--noir-800)] border border-transparent hover:border-[var(--noir-600)] transition"
              title="Toggle Sidebar"
            >
              <Layers className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5 font-[family-name:var(--font-display)]">
              <span>Showrunner AI</span>
              <span 
                className="text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded-full border uppercase"
                style={{ color: 'var(--gold-500)', backgroundColor: 'color-mix(in srgb, var(--gold-500) 10%, transparent)', borderColor: 'var(--gold-600)' }}
              >
                Studio
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {project && (
              <button
                onClick={onOpenStudio}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition hover:opacity-80"
                style={{ color: 'var(--gold-500)', backgroundColor: 'color-mix(in srgb, var(--gold-500) 15%, transparent)', borderColor: 'var(--gold-600)' }}
              >
                <Film className="w-3.5 h-3.5" />
                <span>View Video Canvas</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[var(--noir-800)] transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat Message Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* FACTORY RESET EMPTY STATE (DeepSeek Inspired) */}
            {messages.length === 0 && (
              <div className="pt-12 pb-8 flex flex-col items-center text-center space-y-6 animate-fade-in">
                <div 
                  className="w-16 h-16 rounded-2xl border flex items-center justify-center shadow-2xl gold-glow"
                  style={{ backgroundColor: 'var(--noir-800)', borderColor: 'var(--gold-600)' }}
                >
                  <Clapperboard className="w-8 h-8" style={{ color: 'var(--gold-500)' }} />
                </div>

                <div className="space-y-2 max-w-lg">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-[family-name:var(--font-display)]">
                    Showrunner AI Studio
                  </h1>
                  <p 
                    className="text-xs sm:text-sm leading-relaxed font-[family-name:var(--font-body)]"
                    style={{ color: 'var(--noir-400)' }}
                  >
                    Autonomous multimodal pre-production studio. Pitch a topic, upload a screenplay PDF, or describe an audiovisual scene. Powered by Gemini 2.5 &amp; Parallel Web.
                  </p>
                </div>

                {/* Prompt Suggestion Pill Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left pt-4">
                  {samplePrompts.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="p-4 rounded-xl bg-[var(--noir-800)] hover:bg-[var(--noir-700)] border border-[var(--noir-600)] transition-all duration-200 hover:-translate-y-0.5 text-left group shadow-sm hover:shadow-md"
                      style={{ '--hover-border-color': 'var(--gold-500)' } as React.CSSProperties}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--gold-500)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--noir-600)'; }}
                    >
                      <div 
                        className="text-xs font-bold text-slate-200 transition-colors"
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold-500)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                      >
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-[family-name:var(--font-body)]">
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Stream */}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isThinkingOpen = expandedThinking[index] !== false;

              return (
                <div 
                  key={msg.id || index}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div 
                      className="w-8 h-8 rounded-xl bg-[var(--noir-800)] border border-[var(--noir-600)] flex items-center justify-center shrink-0 shadow-sm mt-0.5"
                      style={{ color: 'var(--gold-500)' }}
                    >
                      <Film className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-3 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* DeepSeek-R1 Style Collapsible Thinking Process Accordion */}
                    {!isUser && msg.thinking && (
                      <div className="rounded-xl bg-[var(--noir-800)] border border-[var(--noir-600)] overflow-hidden text-xs">
                        <button
                          onClick={() => toggleThinking(index)}
                          className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 transition"
                        >
                          <span className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                            <span className="font-semibold text-slate-300">Agentic Reasoning Chain</span>
                          </span>
                          {isThinkingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                        
                        {isThinkingOpen && (
                          <div className="px-3 pb-2.5 pt-1 text-[11px] font-[family-name:var(--font-mono)] text-slate-400 whitespace-pre-line border-t border-[var(--noir-700)] bg-[var(--noir-850)]">
                            {msg.thinking}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text Message Content */}
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser 
                          ? 'text-black font-medium rounded-tr-sm shadow-md'
                          : 'bg-[var(--noir-800)] border border-[var(--noir-600)] text-slate-200 rounded-tl-sm shadow-sm'
                      }`}
                      style={isUser ? { background: 'var(--gold-500)' } : {}}
                    >
                      <div className="whitespace-pre-line">
                        {msg.content}
                      </div>

                      {/* Verified Citations List */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-[var(--noir-600)] space-y-1">
                          <div className="text-[10px] font-[family-name:var(--font-mono)] uppercase text-emerald-400 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            <span>Parallel Web Grounded Citations</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.citations.map((cite, ci) => (
                              <span 
                                key={ci}
                                className="px-2 py-0.5 rounded bg-[var(--noir-850)] text-slate-400 text-[10px] font-[family-name:var(--font-mono)] border border-[var(--noir-600)] truncate max-w-xs"
                              >
                                {cite}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ======================================================== */}
                    {/* MULTIMODAL VIDEO RESULT CARD IN CHAT                     */}
                    {/* Provides [Download Video] and [Edit in Studio] Buttons    */}
                    {/* ======================================================== */}
                    {!isUser && msg.projectResult && (
                      <div 
                        className="rounded-2xl border bg-[var(--noir-800)] overflow-hidden shadow-2xl p-4 space-y-3.5 animate-scale-in"
                        style={{ borderColor: 'var(--gold-600)' }}
                      >
                        
                        {/* Video Card Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-[family-name:var(--font-display)]">
                              Generated Production Video: {msg.projectResult.title}
                            </span>
                          </div>
                          <span 
                            className="text-[10px] font-[family-name:var(--font-mono)] px-2 py-0.5 rounded border"
                            style={{ color: 'var(--gold-500)', backgroundColor: 'color-mix(in srgb, var(--gold-500) 10%, transparent)', borderColor: 'var(--gold-600)' }}
                          >
                            {msg.projectResult.script_beats.length} AV Beats
                          </span>
                        </div>

                        {/* Simulated 16:9 Video Canvas Thumbnail Preview */}
                        <div className="relative aspect-video rounded-xl bg-black border border-[var(--noir-600)] overflow-hidden flex items-center justify-center group cursor-pointer film-grain" onClick={onOpenStudio}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                          
                          {/* Center Big Play Button */}
                          <div 
                            className="w-12 h-12 rounded-full text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform z-20 animate-pulse-slow"
                            style={{ background: 'var(--gold-500)' }}
                          >
                            <Film className="w-6 h-6" />
                          </div>

                          {/* Overlay Title */}
                          <div className="absolute bottom-3 left-3 z-20 space-y-0.5">
                            <div className="text-[11px] font-bold text-white font-[family-name:var(--font-mono)] uppercase tracking-wider">
                              {msg.projectResult.script_beats[0]?.title || msg.projectResult.title}
                            </div>
                            <div className="text-[10px] text-slate-300 font-[family-name:var(--font-mono)]">
                              Pacing: {msg.projectResult.metrics.average_cut_duration_sec}s/cut • First-60s Hook: {msg.projectResult.packaging.first_60s_hook_score}/100
                            </div>
                          </div>
                        </div>

                        {/* Two Primary Action Buttons: Download & Edit in Studio */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          
                          {/* BUTTON 1: DOWNLOAD VIDEO PACKAGE */}
                          <button
                            onClick={onDownloadPackage}
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[var(--noir-700)] hover:bg-[var(--noir-600)] text-slate-100 text-xs font-bold border border-[var(--noir-600)] transition shadow cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                            <span>Download Package</span>
                          </button>

                          {/* BUTTON 2: EDIT IN STUDIO (Opens on Right Side) */}
                          <button
                            onClick={onOpenStudio}
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-black text-xs font-bold transition shadow-lg cursor-pointer hover:opacity-90"
                            style={{ background: 'var(--gold-500)', boxShadow: '0 4px 14px 0 color-mix(in srgb, var(--gold-500) 20%, transparent)' }}
                          >
                            <Film className="w-4 h-4" />
                            <span>Edit in Studio</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div 
                      className="w-8 h-8 rounded-xl text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-sm mt-0.5"
                      style={{ background: 'var(--gold-500)' }}
                    >
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3.5 animate-fade-in">
                <div 
                  className="w-8 h-8 rounded-xl bg-[var(--noir-800)] border border-[var(--noir-600)] flex items-center justify-center shrink-0"
                  style={{ color: 'var(--gold-500)' }}
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-[var(--noir-800)] border border-[var(--noir-600)] text-xs text-slate-400 flex flex-col gap-2 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-ping"
                      style={{ background: 'var(--gold-500)' }}
                    />
                    <span className="font-[family-name:var(--font-mono)]">Searching verified sources...</span>
                  </div>
                  {/* Shimmer animation bar */}
                  <div className="h-1 w-full bg-[var(--noir-700)] rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-transparent via-[var(--gold-500)] to-transparent w-1/2 animate-[shimmer_1.5s_infinite]"
                      style={{ animationName: 'shimmer' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ======================================================== */}
        {/* DEEPSEEK FLOATING PROMPT INPUT BOX                      */}
        {/* ======================================================== */}
        <div className="p-4 bg-gradient-to-t from-[var(--noir-850)] via-[var(--noir-850)] to-transparent shrink-0">
          <div className="max-w-3xl mx-auto">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf,.txt,.md" 
              className="hidden" 
            />

            {/* Document Attachment Indicator Pill if uploaded */}
            {uploadedDoc && (
              <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--noir-800)] border border-blue-500/40 text-[11px] text-blue-300">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium truncate max-w-xs">{uploadedDoc.filename}</span>
                <span className="text-slate-500">({uploadedDoc.total_characters.toLocaleString()} chars)</span>
                <button 
                  onClick={() => setUploadedDoc(null)} 
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Floating Card Input Container */}
            <div 
              className="bg-[var(--noir-800)] border border-[var(--noir-600)] rounded-2xl p-3 shadow-2xl transition-all"
              style={{ '--tw-ring-color': 'var(--gold-500)' } as React.CSSProperties}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold-500)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--noir-600)'; }}
            >
              
              {/* Text Area */}
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message Showrunner AI (e.g. 'Create a 12-min video on the Soviet Kola Borehole anomaly')..."
                rows={1}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-[family-name:var(--font-body)]"
              />

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--noir-700)] mt-2">
                
                <div className="flex items-center gap-2">
                  {/* File Attachment Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--noir-850)] hover:bg-[var(--noir-700)] border border-[var(--noir-600)] text-slate-300 text-[11px] transition"
                    title="Upload PDF Screenplay Treatment / Notes"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Attach Treatment</span>
                  </button>

                  {/* Parallel Web Deep Search Toggle */}
                  <button
                    onClick={() => setIsDeepSearchActive(!isDeepSearchActive)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-[family-name:var(--font-mono)] border transition ${
                      isDeepSearchActive 
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                        : 'bg-[var(--noir-850)] text-slate-500 border-[var(--noir-600)]'
                    }`}
                  >
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Deep Search (Parallel)</span>
                  </button>
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className={`flex items-center justify-center w-8 h-8 rounded-xl transition shadow ${
                    inputMessage.trim() && !isLoading
                      ? 'text-black font-bold hover:opacity-90'
                      : 'bg-[var(--noir-700)] text-slate-500 cursor-not-allowed'
                  }`}
                  style={inputMessage.trim() && !isLoading ? { background: 'var(--gold-500)' } : {}}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Global styles for animations if they don't exist */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};
