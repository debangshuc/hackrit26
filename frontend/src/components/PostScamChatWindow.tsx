'use client';

import { useState, useRef, useEffect } from 'react';

export interface IncidentContext {
  incidentType?: string;
  amount?: string;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  whatHappened?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PostScamChatWindowProps {
  incidentContext?: IncidentContext;
  onJumpToSection?: (sectionId: string) => void;
}

const QUICK_PROMPTS = [
  {
    label: '💸 Sent money via UPI',
    prompt: 'I just transferred money to a scammer using UPI (GPay/PhonePe). What immediate steps should I take right now to stop or reverse it?',
  },
  {
    label: '📲 Installed AnyDesk / TeamViewer',
    prompt: 'The scammer made me install AnyDesk/TeamViewer on my phone and access my bank app. How do I secure my phone and prevent them from stealing more money?',
  },
  {
    label: '🔑 Shared OTP or PIN',
    prompt: 'I accidentally shared an OTP and my Netbanking password with a caller claiming to be from my bank. What should I freeze immediately?',
  },
  {
    label: '⚖️ Threat of Digital Arrest',
    prompt: 'Someone claiming to be CBI/Police is on video call threatening me with Digital Arrest and demanding money. Is this real? What should I do?',
  },
  {
    label: '📞 Script for 1930 Helpline',
    prompt: 'I am about to dial the 1930 Cybercrime Helpline. What exact information and details should I keep ready to tell the officer?',
  },
  {
    label: '🏦 Bank Debit Freeze Request',
    prompt: 'What exact words should I use with my bank customer care manager to request an urgent debit freeze under RBI rules?',
  },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  content: `👋 **I am your RedFlag AI Damage Control Specialist**.

If you have already sent money, shared OTPs, or installed unknown apps, **take a deep breath — you are not alone, and fast action makes a huge difference.**

Choose an emergency situation below or type what happened, and I will give you immediate, step-by-step damage control instructions:`,
  timestamp: 'Just now',
};

// Simple markdown formatter helper for clean rendering of AI responses
function formatMarkdown(content: string) {
  // Split into lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-base sm:text-lg font-bold text-[#00e5a3] mt-3 mb-1.5 flex items-center gap-2">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-lg sm:text-xl font-black text-white mt-4 mb-2">
          {renderInline(trimmed.replace(/^##\s+/, ''))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-xl sm:text-2xl font-black text-white mt-4 mb-2">
          {renderInline(trimmed.replace(/^#\s+/, ''))}
        </h1>
      );
      return;
    }

    // Horizontal divider
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={idx} className="border-white/15 my-3" />);
      return;
    }

    // Unordered list
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-sm sm:text-base text-gray-200 leading-relaxed my-1">
          {renderInline(trimmed.replace(/^[*\-]\s+/, ''))}
        </li>
      );
      return;
    }

    // Numbered list (e.g. 1. 2.)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={idx} className="flex items-start gap-2.5 my-1.5 text-sm sm:text-base text-gray-200 leading-relaxed">
          <span className="px-1.5 py-0.5 rounded bg-[#00e5a3]/15 text-[#00e5a3] font-mono text-xs font-bold shrink-0 mt-0.5">
            {numMatch[1]}
          </span>
          <div className="flex-1">{renderInline(numMatch[2])}</div>
        </div>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={idx} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={idx} className="text-sm sm:text-base text-gray-200 leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    );
  });

  return elements;
}

// Inline formatting (bold, links, code)
function renderInline(text: string): React.ReactNode {
  // Regex for bold **text**, code `text`, and [link](url)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Check for bold **...**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Check for link [text](url)
    const linkMatch = remaining.match(/\[(.*?)\]\((.*?)\)/);

    let nextMatchIndex = Infinity;
    let matchType = '';

    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < nextMatchIndex) {
      nextMatchIndex = boldMatch.index;
      matchType = 'bold';
    }
    if (linkMatch && linkMatch.index !== undefined && linkMatch.index < nextMatchIndex) {
      nextMatchIndex = linkMatch.index;
      matchType = 'link';
    }

    if (nextMatchIndex === Infinity) {
      parts.push(remaining);
      break;
    }

    if (nextMatchIndex > 0) {
      parts.push(remaining.substring(0, nextMatchIndex));
    }

    if (matchType === 'bold' && boldMatch) {
      parts.push(
        <strong key={key++} className="font-bold text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.substring(nextMatchIndex + boldMatch[0].length);
    } else if (matchType === 'link' && linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00e5a3] underline font-semibold hover:text-[#1cf0b0] transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.substring(nextMatchIndex + linkMatch[0].length);
    }
  }

  return parts;
}

export default function PostScamChatWindow({
  incidentContext,
  onJumpToSection,
}: PostScamChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (userText?: string) => {
    const textToSend = userText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Map messages for API payload (skip the welcome greeting from system)
      const apiMessages = newMessages
        .filter(m => m.id !== 'welcome-msg')
        .map(m => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/emergency-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          incidentContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Please dial 1930 or contact your bank immediately to freeze your account.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to communicate with emergency chat:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Network connection issue.**\n\n**Immediate Priority:** Call **1930** (National Cybercrime Hotline) or visit **[cybercrime.gov.in](https://cybercrime.gov.in)** immediately to freeze the scammer's bank account. Also contact your bank's 24/7 hotline to freeze your card or Netbanking.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  // Has synced incident details?
  const hasSyncedFacts = Boolean(
    incidentContext?.amount ||
    incidentContext?.paymentMethod ||
    incidentContext?.transactionId ||
    incidentContext?.incidentType
  );

  return (
    <div id="damage-control-chat" className="cyber-card p-6 sm:p-8 lg:p-10 space-y-6 border border-[#00e5a3]/30 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e5a3]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5a3] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00e5a3]">
              REDFLAG POST-SCAM DAMAGE CONTROL CHAT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight mt-1">
            Real-Time Damage Control Assistant
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Ask questions, learn how to freeze bank accounts, or get exact scripts for 1930.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetChat}
            className="text-xs font-mono text-[var(--text-muted)] hover:text-white px-3 py-1.5 rounded border border-white/10 hover:border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Clear and reset chat history"
          >
            <span>🔄</span> RESET CHAT
          </button>
        </div>
      </div>

      {/* Synced Context Indicator */}
      {hasSyncedFacts && (
        <div className="p-3.5 sm:p-4 rounded-lg bg-[#00e5a3]/[0.07] border border-[#00e5a3]/30 text-xs sm:text-sm text-[#00e5a3] flex flex-wrap items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2 font-mono">
            <span>⚡</span>
            <span>
              <strong>Context Synced:</strong>{' '}
              {incidentContext?.incidentType || 'Scam'}
              {incidentContext?.amount && ` • ${incidentContext.amount} ${incidentContext.currency || 'INR'}`}
              {incidentContext?.paymentMethod && ` via ${incidentContext.paymentMethod}`}
              {incidentContext?.transactionId && ` (UTR: ${incidentContext.transactionId})`}
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-wider opacity-80 font-mono">
            RedFlag AI uses these facts for tailored advice
          </span>
        </div>
      )}

      {/* Quick Action Prompt Chips */}
      <div className="space-y-2 relative z-10">
        <div className="text-[11px] font-mono font-bold uppercase text-[var(--text-muted)] tracking-wider">
          Quick One-Tap Damage Control Scenarios:
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              disabled={isLoading}
              onClick={() => handleSend(qp.prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#0e1320] border border-white/15 text-gray-200 hover:text-white hover:border-[#00e5a3]/60 hover:bg-[#00e5a3]/10 transition-all cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="rounded-xl bg-[#070a11] border border-white/10 p-4 sm:p-6 h-[440px] sm:h-[500px] overflow-y-auto space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 max-w-full`}
            >
              <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-[var(--text-muted)]">
                <span>{isUser ? 'YOU' : 'REDFLAG AI ASSISTANT'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base leading-relaxed max-w-[92%] sm:max-w-[85%] ${
                  isUser
                    ? 'bg-[#00e5a3]/15 border border-[#00e5a3]/40 text-white rounded-br-none shadow-[0_0_15px_rgba(0,229,163,0.1)]'
                    : 'cyber-card-inner border border-white/15 text-gray-100 rounded-bl-none shadow-lg'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="space-y-1">{formatMarkdown(msg.content)}</div>
                )}

                {!isUser && msg.id !== 'welcome-msg' && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="font-mono text-[11px]">Indian Cyber-Response Protocol</span>
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="hover:text-white transition-colors flex items-center gap-1 font-mono text-[11px] cursor-pointer"
                    >
                      <span>{copiedId === msg.id ? '✅' : '📋'}</span>
                      {copiedId === msg.id ? 'COPIED!' : 'COPY INSTRUCTIONS'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1.5">
            <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-[#00e5a3]">
              <span className="w-2 h-2 rounded-full bg-[#00e5a3] animate-ping" />
              <span>ANALYZING DAMAGE CONTROL PROTOCOL...</span>
            </div>
            <div className="p-4 rounded-2xl cyber-card-inner border border-[#00e5a3]/30 text-sm text-gray-300 rounded-bl-none flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00e5a3] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#00e5a3] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#00e5a3] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Formulating step-by-step mitigation &amp; reporting actions...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="space-y-2 relative z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask RedFlag AI: e.g. 'I sent ₹25,000 on PhonePe to a scammer 15 mins ago, how to stop it?'"
              disabled={isLoading}
              className="w-full h-[52px] px-4 sm:px-5 rounded-xl bg-[#0e1320] border border-white/20 text-white placeholder-[var(--text-muted)] text-sm sm:text-base focus:border-[#00e5a3] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-cyber-primary h-[52px] px-6 text-sm font-bold shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <span>SEND</span>
            <span>➤</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)] font-mono">
          <span>Official Helpline: <strong>Dial 1930</strong> (National Cybercrime Reporting Portal)</span>
          <span>Tip: Press Enter to send</span>
        </div>
      </div>
    </div>
  );
}
