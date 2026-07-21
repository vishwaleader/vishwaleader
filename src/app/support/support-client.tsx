"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Headset, Send, Bot, User, ShieldCheck, ChevronRight, HelpCircle, ArrowLeft, MessageSquare, Plus, Clock, Sparkles, X, Menu, ChevronLeft } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const DUMMY_SESSIONS = [
  { id: "s1", title: "Dr. B. R. Ambedkar Awards 2026", date: "Just now" },
  { id: "s2", title: "Academic Conference & SOAS", date: "1 hour ago" },
  { id: "s3", title: "Business Summit Heathrow", date: "Yesterday" },
  { id: "s4", title: "London Tour Package Details", date: "2 days ago" },
];

const QUICK_SUGGESTIONS = [
  "How can I become a Patron?",
  "Tell me about the London Tour Package",
  "Academic Conference details",
  "Business Summit details",
  "How to book a Souvenir Ad?",
  "When is the Awards Ceremony?",
];

export default function SupportClientPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: "Hello! I am SARA (Smart Automated Response Agent), your 24/7 AI Customer Support Employee. How can I help you today? Ask me about tickets, registrations, awards nominations, organizing committees, or souvenir ads!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize sidebar open state on desktop viewports
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mobile virtual keyboard visual viewport height listener
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const handleResize = () => {
      const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize);
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  const handleFocusInput = () => {
    // Scroll to bottom after mobile keyboard transitions
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    if (!textToSend) setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map((m) => ({ role: m.role, content: m.content })) }),
      });

      const data = await res.json();
      const replyText = data.reply || "Hello! I am SARA, your 24/7 support agent. How may I help you?";

      setMessages((prev) => [
        ...prev,
        {
          id: `sara-${Date.now()}`,
          role: "assistant",
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "I am SARA, your 24/7 AI Support Assistant. Please ask me any questions about the Dr. B. R. Ambedkar International Awards 2026 in London!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: "Hello! I am SARA, your 24/7 support employee. Let's start a fresh chat. How can I help you?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const renderMessageContent = (content: string) => {
    if (!content) return null;

    const lines = content.split("\n");
    
    return lines.map((line, lineIdx) => {
      // 1. Check if the line is a list item
      // e.g. starting with " - ", " * ", "- ", "* ", "1. ", "2. ", etc.
      const listMatch = line.match(/^(\s*)(\*\*\*|\*\*|\*)?([-*•]|\d+\.)\s*(.*)$/);
      
      let lineContent = line;
      let isList = false;
      let listMarker = "";
      
      if (listMatch) {
        isList = true;
        listMarker = listMatch[3];
        const asterisks = listMatch[2] || "";
        lineContent = asterisks + listMatch[4];
      }

      // 2. Parse inline elements (links, bold, italic) within this line
      const inlineElements: React.ReactNode[] = [];
      const currentText = lineContent;
      let elemKey = 0;
      
      const combinedRegex = /(\[([^\]]+)\]\(([^)]+)\))|(\*\*\*([^*]+)\*\*\*)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
      let lastIdx = 0;
      let match;

      while ((match = combinedRegex.exec(currentText)) !== null) {
        // Add plain text before match
        if (match.index > lastIdx) {
          inlineElements.push(currentText.substring(lastIdx, match.index));
        }

        // Check which group matched
        const isLink = match[1];
        const isBoldItalic = match[4];
        const isBold = match[6];
        const isItalic = match[8];

        if (isLink) {
          const label = match[2];
          const url = match[3];
          inlineElements.push(
            <button
              key={`link-${lineIdx}-${elemKey++}`}
              onClick={() => router.push(url)}
              className="inline-flex items-center gap-0.5 mx-1 px-2.5 py-1 bg-brandBlue hover:bg-blue-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all cursor-pointer align-middle"
            >
              <span>{label}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          );
        } else if (isBoldItalic) {
          const textVal = match[5];
          inlineElements.push(
            <strong key={`bi-${lineIdx}-${elemKey++}`} className="font-extrabold text-white">
              <em>{textVal}</em>
            </strong>
          );
        } else if (isBold) {
          const textVal = match[7];
          inlineElements.push(
            <strong key={`b-${lineIdx}-${elemKey++}`} className="font-bold text-white">
              {textVal}
            </strong>
          );
        } else if (isItalic) {
          const textVal = match[9];
          inlineElements.push(
            <em key={`i-${lineIdx}-${elemKey++}`} className="text-slate-300">
              {textVal}
            </em>
          );
        }

        lastIdx = combinedRegex.lastIndex;
      }

      if (lastIdx < currentText.length) {
        inlineElements.push(currentText.substring(lastIdx));
      }

      // 3. Render line wrapper
      if (isList) {
        const isNumeric = /^\d+/.test(listMarker);
        return (
          <div key={`line-${lineIdx}`} className="flex items-start gap-2 my-1 pl-4">
            <span className="text-brandBlue font-semibold shrink-0 select-none">
              {isNumeric ? listMarker : "•"}
            </span>
            <span className="text-slate-200 flex-1">{inlineElements}</span>
          </div>
        );
      }

      return (
        <div key={`line-${lineIdx}`} className={line.trim() === "" ? "h-2" : "min-h-[1.25rem] text-slate-200"}>
          {inlineElements}
        </div>
      );
    });
  };

  return (
    <div 
      className="fixed inset-0 flex bg-slate-950 font-sans text-slate-100 overflow-hidden"
      style={{ height: "var(--visual-viewport-height, 100dvh)" }}
    >
      
      {/* Collapsible Sidebar Panel */}
      <aside 
        className={`bg-slate-950 p-4 flex flex-col justify-between shrink-0 transition-all duration-300 border-r border-slate-800 h-full ${
          isSidebarOpen 
            ? "w-full md:w-64 opacity-100" 
            : "w-0 p-0 opacity-0 border-r-0 overflow-hidden"
        } ${
          /* On mobile, make it absolute or overlay when open so it doesn't squish the chat screen */
          "absolute inset-0 md:relative md:inset-auto z-30 shadow-2xl md:shadow-none"
        }`}
      >
        <div className="space-y-6 md:min-w-[224px] w-full">
          {/* Header with close button (Mobile only) */}
          <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-900 mb-4">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Chat Menu</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              handleResetChat();
              if (window.innerWidth < 768) setIsSidebarOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition-all cursor-pointer hover:bg-slate-900/60"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-brandBlue" />
              <span>New Chat</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-500 hidden md:inline-block">Ctrl K</kbd>
          </button>

          {/* Chat Sessions list */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">History</h4>
            <div className="space-y-1.5">
              {DUMMY_SESSIONS.map((sess) => (
                <button
                  key={sess.id}
                  onClick={() => {
                    handleSendMessage(sess.title);
                    if (window.innerWidth < 768) setIsSidebarOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 text-xs text-slate-400 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-600 group-hover:text-brandBlue shrink-0" />
                  <span className="truncate flex-1">{sess.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Support disclaimer */}
        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl space-y-1 md:min-w-[224px] w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure Connection</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            SARA Support Agent is powered by secure 256-bit encryption.
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay (closes when clicked outside) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col justify-between bg-slate-950 relative min-w-0">
        {/* Chat Top Info Bar */}
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Collapse toggle button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-all cursor-pointer shrink-0 flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="p-2 md:p-2.5 rounded-xl bg-brandBlue text-white shadow-md relative shrink-0 hidden xs:block">
              <Headset className="w-4 h-4 md:w-5 md:h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                <h1 className="font-bold text-xs md:text-sm tracking-tight text-white truncate">SARA Chatbot</h1>
                <span className="text-[8px] md:text-[9px] font-extrabold uppercase px-1 py-0.5 md:px-1.5 md:py-0.5 rounded bg-brandBlue/20 text-amber-300 border border-brandBlue/35 shrink-0">
                  24/7 Support
                </span>
              </div>
              <p className="text-[10px] md:text-[11px] text-slate-500 truncate hidden sm:block">Ask questions, get ticket links, or browse committees.</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Chat Thread Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:py-6 md:px-8 space-y-3.5 md:space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 md:gap-3.5 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-brandBlue text-white flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </div>
              ) : (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                  <User className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </div>
              )}

              <div className={`space-y-1 max-w-[85%] md:max-w-xl ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <div
                  className={`inline-block px-3.5 py-2.5 md:px-4 md:py-3 rounded-2xl text-xs md:text-sm leading-relaxed break-words text-left ${
                    msg.role === "user"
                      ? "bg-brandBlue text-white rounded-tr-none shadow-md"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
                <span className="text-[9px] md:text-[10px] text-slate-600 block px-1">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 md:gap-3.5 text-slate-500 text-xs p-1 md:p-2 animate-pulse">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-brandBlue text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 md:w-4.5 md:h-4.5" />
              </div>
              <div className="bg-slate-900 border border-slate-800 px-3.5 py-2.5 md:px-4 md:py-3 rounded-2xl flex items-center gap-1.5 text-slate-300">
                <span>SARA is writing</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Bottom Input Bar */}
        <div className="p-3 md:p-6 pb-4 md:pb-6 border-t border-slate-800 bg-slate-950 max-w-4xl mx-auto w-full">
          {/* Quick Suggestion Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2.5 mb-1 text-xs -mx-3 px-3 md:-mx-6 md:px-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Suggestions:</span>
            </span>
            {QUICK_SUGGESTIONS.slice(0, 4).map((sug) => (
              <button
                key={sug}
                onClick={() => handleSendMessage(sug)}
                className="px-2.5 py-1.5 rounded-full bg-slate-900 hover:bg-brandBlue text-slate-300 hover:text-white border border-slate-800 transition-all shrink-0 cursor-pointer text-[11px]"
              >
                {sug}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center bg-slate-900 border border-slate-850 rounded-2xl p-1.5 md:p-2.5 focus-within:border-brandBlue transition-all shadow-xl"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocusInput}
              placeholder="Ask SARA anything..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="false"
              name="chat-message-input"
              id="chat-message-input"
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-base md:text-sm outline-none px-2.5 py-1.5 md:px-3 md:py-2 min-w-0"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="p-2 md:p-2.5 rounded-xl bg-brandBlue hover:bg-blue-600 disabled:opacity-40 text-white transition-all shrink-0 cursor-pointer flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          
          <p className="text-center text-[10px] text-slate-600 mt-2.5 leading-relaxed">
            SARA (Smart Automated Response Agent) • 24/7 AI Event Concierge •
            <br />
            All sessions are encrypted.
          </p>
        </div>

      </main>

    </div>
  );
}
