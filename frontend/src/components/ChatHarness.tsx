import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ShowrunnerProject, DocumentUploadResponse } from '../types';
import { 
  Send, Upload, FileText, Sparkles, Globe, Trash2, 
  Bot, User
} from 'lucide-react';

interface ChatHarnessProps {
  project: ShowrunnerProject | null;
  geminiKey?: string;
  parallelKey?: string;
  onUpdateProject?: (project: ShowrunnerProject) => void;
  theme?: 'light' | 'dark';
}

export const ChatHarness: React.FC<ChatHarnessProps> = ({
  project,
  geminiKey,
  parallelKey,
  onUpdateProject,
  theme = 'light'
}) => {
  const isLight = theme === 'light';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: project 
        ? `I am your AI Showrunner and Visual Director for **${project.title}**.\n\nI have loaded your Two-Column AV screenplay and Parallel Web verified sources. How would you like to refine the narrative, pacing, or cinematography? You can also edit typography directly on the visual player to your right, or circle any region for a spatial directive.`
        : 'Welcome to Showrunner AI! Pitch an idea, describe your scene, or upload a PDF screenplay treatment to orchestrate your multi-agent production.',
      timestamp: '00:00'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<DocumentUploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickPrompts = [
    'Audit opening 60-second hook retention',
    'Verify satellite 237 MHz frequency on Parallel Web',
    'Switch color grade to Kodak 2383 cyan/amber',
    'Add pattern interrupt visual cut at 00:08'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

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
          gemini_api_key: geminiKey || undefined
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.updated_project && onUpdateProject) {
        onUpdateProject(data.updated_project);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I could not connect to the backend server. Please verify the FastAPI backend is running.',
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
        role: 'assistant',
        content: `Attached document **"${docData.filename}"** (${docData.page_count} pages, ${docData.total_characters.toLocaleString()} characters) into the Gemini context harness. I will reference its lore and dialogue in our conversation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, noticeMessage]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to parse uploaded document');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden font-sans border transition-colors ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800/80 shadow-2xl'
    }`}>
      
      {/* Chat Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 text-xs ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            isLight ? 'bg-lime-100 text-lime-800 border border-lime-200' : 'bg-lime-500/10 border border-lime-500/20 text-lime-400'
          }`}>
            <Bot className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Showrunner AI Harness</span>
            <div className={`text-[10px] font-mono flex items-center gap-1 ${isLight ? 'text-lime-700' : 'text-emerald-400'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini + Parallel Web Systems
            </div>
          </div>
        </div>

        {/* Upload Doc Action */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-medium cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-2xs' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Attach PDF treatment, lore bible, or script notes"
          >
            <Upload className={`w-3.5 h-3.5 ${isLight ? 'text-lime-700' : 'text-lime-400'}`} />
            <span>{isUploading ? 'Parsing...' : 'Attach PDF Bible'}</span>
          </button>
        </div>
      </div>

      {/* Uploaded Document Badge if Active */}
      {uploadedDoc && (
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs animate-fade-in ${
          isLight ? 'bg-lime-50 border-lime-200 text-lime-900' : 'bg-slate-900 border-slate-800/80 text-slate-300'
        }`}>
          <div className="flex items-center gap-2 truncate">
            <FileText className={`w-4 h-4 shrink-0 ${isLight ? 'text-lime-700' : 'text-lime-400'}`} />
            <span className="font-semibold truncate">{uploadedDoc.filename}</span>
            <span className={`text-[10px] font-mono ${isLight ? 'text-lime-700' : 'text-slate-500'}`}>
              ({uploadedDoc.page_count} pages • {uploadedDoc.total_characters} chars)
            </span>
          </div>
          <button
            onClick={() => setUploadedDoc(null)}
            className={`transition-colors p-1 cursor-pointer ${isLight ? 'text-slate-400 hover:text-rose-600' : 'text-slate-500 hover:text-rose-400'}`}
            title="Remove attached document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isLight ? 'bg-lime-100 border border-lime-200 text-lime-800' : 'bg-lime-500/10 border border-lime-500/30 text-lime-400'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-lime-500 text-slate-950 font-medium rounded-tr-sm shadow-sm'
                    : isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-lg'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                {/* Parallel Web Sources if available */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className={`pt-2 mt-2 border-t space-y-1 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
                    <div className={`text-[10px] font-mono flex items-center gap-1 font-semibold ${
                      isLight ? 'text-lime-700' : 'text-cyan-400'
                    }`}>
                      <Globe className="w-3 h-3" />
                      <span>PARALLEL WEB VERIFIED GROUNDING:</span>
                    </div>
                    {msg.citations.map((c, cIdx) => (
                      <div key={cIdx} className={`text-[10px] font-mono truncate ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-cyan-300'}`}>
                        • {c}
                      </div>
                    ))}
                  </div>
                )}

                <div className={`text-[9px] font-mono text-right ${isUser ? 'text-slate-800' : isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 border border-slate-700 text-slate-300'
                }`}>
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start animate-pulse">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isLight ? 'bg-lime-100 border border-lime-200 text-lime-800' : 'bg-lime-500/10 border border-lime-500/30 text-lime-400'
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            <div className={`rounded-2xl rounded-tl-sm px-4 py-3 text-xs flex items-center gap-2 border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 animate-spin ${isLight ? 'text-lime-600' : 'text-lime-400'}`} />
              <span>AI Showrunner deliberating with Parallel Web &amp; Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className={`px-4 py-2 border-t flex items-center gap-1.5 overflow-x-auto select-none ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-900/50 border-slate-800/60'
      }`}>
        <span className={`text-[10px] font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Quick prompts:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer ${
              isLight 
                ? 'bg-white border border-slate-200 hover:border-lime-500 text-slate-700 hover:text-slate-900 shadow-2xs' 
                : 'bg-slate-900 border border-slate-800 hover:border-lime-500/40 text-slate-300 hover:text-white'
            }`}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <div className={`p-3 border-t ${isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`flex items-center gap-2 rounded-xl p-1.5 border transition-colors ${
            isLight 
              ? 'bg-white border-slate-200 focus-within:border-lime-500' 
              : 'bg-slate-950 border-slate-800 focus-within:border-lime-500'
          }`}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask the Showrunner or direct revisions..."
            className={`flex-1 bg-transparent px-3 py-1.5 text-xs focus:outline-none ${
              isLight ? 'text-slate-900 placeholder-slate-400' : 'text-slate-100 placeholder-slate-500'
            }`}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 rounded-lg bg-lime-500 hover:bg-lime-400 disabled:opacity-30 text-slate-950 font-bold transition-all shadow-md cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};

