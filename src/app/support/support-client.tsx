"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, RefreshCw, ChevronRight, Bot } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Helper to detect if a message is strictly emoji
const isEmojiOnly = (str: string) => {
  const clean = str.trim();
  if (!clean || clean.length > 10) return false;
  return /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\s)+$/u.test(clean);
};

export default function SupportClientPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hello! I am SARA (Smart Automated Response Agent), your 24/7 AI Customer Support Employee. How can I help you today? Ask me about tickets, registrations, awards nominations, organizing committees, or souvenir ads!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Maintain dark background for html and body to eliminate overscroll white space
  useEffect(() => {
    const origHtmlBg = document.documentElement.style.backgroundColor;
    const origBodyBg = document.body.style.backgroundColor;
    document.documentElement.style.backgroundColor = "#020617";
    document.body.style.backgroundColor = "#020617";

    return () => {
      document.documentElement.style.backgroundColor = origHtmlBg;
      document.body.style.backgroundColor = origBodyBg;
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Visual viewport height adjustment for mobile soft keyboard
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
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 350);
  };

  const handleSendMessage = async () => {
    const text = query.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply || "Hello! I am SARA, your 24/7 support agent. How may I help you?";

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
          content:
            "I am SARA, your 24/7 AI Support Assistant. Please ask me any questions about the Dr. B. R. Ambedkar International Awards 2026 in London!",
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
        content:
          "Hello! I am SARA, your 24/7 AI Support Employee. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const renderMessageContent = (content: string, isUser: boolean) => {
    if (!content) return null;
    const lines = content.split("\n");

    return lines.map((line, lineIdx) => {
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

      const inlineElements: React.ReactNode[] = [];
      const currentText = lineContent;
      let elemKey = 0;

      const combinedRegex =
        /(\[([^\]]+)\]\(([^)]+)\))|(\*\*\*([^*]+)\*\*\*)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;
      let lastIdx = 0;
      let match;

      while ((match = combinedRegex.exec(currentText)) !== null) {
        if (match.index > lastIdx) {
          inlineElements.push(currentText.substring(lastIdx, match.index));
        }

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
            <strong key={`bi-${lineIdx}-${elemKey++}`} className={isUser ? "font-extrabold text-white" : "font-extrabold text-slate-900"}>
              <em>{textVal}</em>
            </strong>
          );
        } else if (isBold) {
          const textVal = match[6] ? match[7] : match[5];
          inlineElements.push(
            <strong key={`b-${lineIdx}-${elemKey++}`} className={isUser ? "font-bold text-white" : "font-bold text-slate-900"}>
              {textVal}
            </strong>
          );
        } else if (isItalic) {
          const textVal = match[9];
          inlineElements.push(
            <em key={`i-${lineIdx}-${elemKey++}`} className={isUser ? "text-slate-100" : "text-slate-700"}>
              {textVal}
            </em>
          );
        }

        lastIdx = combinedRegex.lastIndex;
      }

      if (lastIdx < currentText.length) {
        inlineElements.push(currentText.substring(lastIdx));
      }

      if (isList) {
        const isNumeric = /^\d+/.test(listMarker);
        return (
          <div key={`line-${lineIdx}`} className="flex items-start gap-2 my-0.5 pl-3">
            <span className={isUser ? "text-white font-bold shrink-0 select-none" : "text-brandBlue font-bold shrink-0 select-none"}>
              {isNumeric ? listMarker : "•"}
            </span>
            <span className={isUser ? "text-white flex-1" : "text-slate-900 flex-1"}>{inlineElements}</span>
          </div>
        );
      }

      return (
        <div
          key={`line-${lineIdx}`}
          className={line.trim() === "" ? "h-1.5" : "min-h-[1.25rem]"}
        >
          {inlineElements}
        </div>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 flex flex-col bg-slate-950 font-sans text-slate-100 overflow-hidden overscroll-none"
      style={{ height: "var(--visual-viewport-height, 100dvh)" }}
    >
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col justify-between bg-slate-950 relative min-w-0 h-full">
        
        {/* iOS iMessage Top Navigation Header */}
        <div className="px-4 py-2.5 md:px-6 md:py-3.5 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl flex items-center justify-between gap-4 shrink-0 z-10">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/");
              }
            }}
            className="flex items-center gap-1 text-brandBlue hover:text-blue-400 font-medium text-sm transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Back</span>
          </button>

          {/* iMessage Contact Info Center */}
          <div className="flex flex-col items-center min-w-0">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brandBlue shadow-inner relative mb-0.5">
              <Bot className="w-5 h-5 text-brandBlue" />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
            </div>
            <div className="flex items-center gap-1">
              <h1 className="font-semibold text-xs md:text-sm text-slate-100 tracking-tight">SARA AI</h1>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-brandBlue/20 text-amber-300 border border-brandBlue/30">24/7</span>
            </div>
          </div>

          {/* Reset Action */}
          <button
            type="button"
            onClick={handleResetChat}
            title="Reset Chat"
            aria-label="Reset Chat"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-full transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* iMessage Chat Thread */}
        <div className="flex-1 overflow-y-auto px-3 py-4 md:py-6 md:px-6 space-y-1.5 max-w-2xl mx-auto w-full select-text imessage-container">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            const isEmoji = isEmojiOnly(msg.content);
            const nextMsg = messages[index + 1];
            // If the next message is from the same role, suppress tail for iMessage bubble stacking
            const hasTail = !nextMsg || nextMsg.role !== msg.role;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"} w-full`}
              >
                <div
                  className={`imessage-bubble ${isUser ? "from-me" : "from-them"} ${
                    hasTail ? "" : "no-tail"
                  } ${isEmoji ? "emoji" : ""}`}
                >
                  {renderMessageContent(msg.content, isUser)}
                </div>
                {hasTail && (
                  <span className="text-[9px] text-slate-500 px-2 mt-0.5 block select-none">
                    {msg.timestamp}
                  </span>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start w-full my-1">
              <div className="imessage-bubble from-them flex items-center gap-1.5 text-slate-700">
                <span className="text-xs font-medium">SARA typing</span>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* iOS iMessage Input Bar */}
        <div className="p-2.5 md:p-4 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl max-w-2xl mx-auto w-full shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1.5 focus-within:border-brandBlue/70 focus-within:ring-1 focus-within:ring-brandBlue/40 transition-all shadow-lg"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={handleFocusInput}
              placeholder="iMessage"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck="false"
              name="chat-message-input"
              id="chat-message-input"
              className="flex-1 bg-transparent text-white placeholder-slate-500 text-base md:text-sm outline-none px-2 py-1 min-w-0 font-sans"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#248bf5] hover:bg-blue-600 disabled:opacity-30 text-white transition-all shrink-0 cursor-pointer flex items-center justify-center shadow-md active:scale-95"
              aria-label="Send message"
            >
              <ArrowUp className="w-4 h-4 md:w-4.5 md:h-4.5 stroke-[2.5]" />
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}
