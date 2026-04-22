"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from "lucide-react";
import { get, post } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import type { AiInsight, ChatMessage } from "@/types";

const AI_MIN_TRADES = 5;

const SUGGESTED_PROMPTS = [
  "¿Por qué sigo perdiendo en cortos?",
  "¿Cuál es mi mejor setup?",
  "¿Qué días opero mejor?",
  "Analiza mis últimas 10 operaciones",
];

// ── Insight accordion item ────────────────────────────────────────────────────

function InsightAccordion({ insight }: { insight: AiInsight }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-white/[0.03] transition-colors text-left"
      >
        <div>
          <span className="font-mono text-[10px] text-muted">
            {insight.period_start} → {insight.period_end}
          </span>
          <span className="font-mono text-[10px] text-muted ml-3">
            · {insight.trade_count} ops
          </span>
        </div>
        {open ? (
          <ChevronUp size={12} className="text-muted flex-shrink-0" />
        ) : (
          <ChevronDown size={12} className="text-muted flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="font-sans text-[12px] text-secondary leading-relaxed">
            {insight.content}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Chat message bubble ───────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-3 ${
          isUser
            ? "bg-green/20 border border-green/25 text-primary"
            : "bg-elevated border border-white/[0.06] text-secondary"
        }`}
      >
        <p className="font-sans text-[13px] leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </p>
        <p className="font-mono text-[9px] text-muted mt-1 text-right">
          {formatRelative(msg.created_at)}
        </p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-elevated border border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[5px] h-[5px] bg-muted rounded-full animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AiPage() {
  // Insights state
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load data
  const loadInsights = useCallback(async () => {
    try {
      const res = await get<{ results: AiInsight[]; count: number }>("/api/analysis/insights/?ordering=-created_at&page_size=5");
      setInsights(res.results);
    } catch {
      // Silently ignore — handled by empty state
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  const loadChat = useCallback(async () => {
    try {
      const res = await get<{ results: ChatMessage[]; count: number }>("/api/analysis/chat/?page_size=100");
      setMessages(res.results);
    } catch {
      // Silently ignore
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
    loadChat();
  }, [loadInsights, loadChat]);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    try {
      const insight = await post<AiInsight>("/api/analysis/insights/generate/", {});
      setInsights((prev) => [insight, ...prev]);
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "No se pudo generar el análisis."
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setSendError(null);

    // Optimistic user message
    const optimisticUser: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setSending(true);

    try {
      const assistantMsg = await post<ChatMessage>("/api/analysis/chat/send/", {
        message: text,
      });
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Error al enviar el mensaje.");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const currentInsight = insights[0] ?? null;
  const previousInsights = insights.slice(1, 5);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)] min-h-[600px]">

        {/* ── Left panel — Insights (40%) ── */}
        <div className="lg:w-[40%] flex flex-col gap-4 overflow-y-auto lg:pr-1">

          {/* Header */}
          <div>
            <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
              IA · Análisis
            </h1>
            <p className="font-mono text-[11px] text-muted mt-[3px]">
              Insights generados por Claude AI
            </p>
          </div>

          {/* Current insight */}
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse flex-shrink-0" />
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-green">
                Insight actual
              </span>
            </div>

            {insightsLoading ? (
              <div className="space-y-2">
                <div className="skeleton h-3 w-full rounded-sm" />
                <div className="skeleton h-3 w-5/6 rounded-sm" />
                <div className="skeleton h-3 w-4/6 rounded-sm" />
              </div>
            ) : currentInsight ? (
              <>
                <p className="font-sans text-[13px] text-secondary leading-relaxed">
                  {currentInsight.content}
                </p>
                <p className="font-mono text-[9px] text-muted">
                  {currentInsight.period_start} → {currentInsight.period_end} · {currentInsight.trade_count} ops · {formatRelative(currentInsight.created_at)}
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <p className="font-sans text-[13px] text-secondary leading-relaxed">
                  Registra {AI_MIN_TRADES} operaciones para activar tu primer análisis de IA.
                </p>
                <div className="h-[4px] bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-green/40 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>
            )}

            {/* Generate button */}
            {generateError && (
              <div className="flex items-center gap-2 p-2 border border-loss/30 bg-loss/[0.06]">
                <AlertCircle size={12} className="text-loss flex-shrink-0" />
                <p className="font-sans text-[11px] text-loss">{generateError}</p>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-2 w-full font-sans text-[12px] font-semibold border border-white/[0.12] text-secondary hover:text-primary hover:border-white/20 py-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={12} className={generating ? "animate-spin" : ""} />
              {generating ? "Generando análisis…" : "Actualizar análisis"}
            </button>
          </div>

          {/* Previous insights accordion */}
          {previousInsights.length > 0 && (
            <div className="card">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted px-4 py-3 border-b border-white/[0.06]">
                Análisis anteriores
              </p>
              {previousInsights.map((ins) => (
                <InsightAccordion key={ins.id} insight={ins} />
              ))}
            </div>
          )}
        </div>

        {/* ── Right panel — Chat (60%) ── */}
        <div className="lg:w-[60%] flex flex-col card overflow-hidden">

          {/* Chat header */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
            <span className="w-[7px] h-[7px] rounded-full bg-green animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-green">
              Chat con la IA
            </span>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5">
            {chatLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <div className="skeleton h-14 w-48 rounded-sm" />
                  </div>
                ))}
              </div>
            ) : messages.length === 0 && !sending ? (
              /* Empty state — suggested prompts */
              <div className="h-full flex flex-col items-center justify-center gap-5">
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted mb-2">
                    Sugerencias
                  </p>
                  <p className="font-sans text-[13px] text-muted">
                    Haz una pregunta sobre tus operaciones
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setInput(prompt);
                        inputRef.current?.focus();
                      }}
                      className="text-left px-4 py-3 bg-elevated border border-white/[0.06] hover:border-white/[0.12] font-sans text-[12px] text-secondary hover:text-primary transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
                {sending && <TypingBubble />}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Send error */}
          {sendError && (
            <div className="flex items-center gap-2 px-5 py-2 border-t border-loss/20 bg-loss/[0.04]">
              <AlertCircle size={12} className="text-loss" />
              <p className="font-mono text-[10px] text-loss">{sendError}</p>
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-end gap-2 p-4 border-t border-white/[0.06] flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter nueva línea)"
              rows={1}
              disabled={sending}
              className="flex-1 bg-elevated border border-white/[0.10] px-3 py-[10px] font-sans text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed disabled:opacity-50"
              style={{ minHeight: 42, maxHeight: 120 }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-green hover:bg-green-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
