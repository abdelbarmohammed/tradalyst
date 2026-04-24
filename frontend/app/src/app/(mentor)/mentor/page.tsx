"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, BookOpen, LayoutDashboard, Plus, Search,
  X, Clock, TrendingUp, UserMinus,
} from "lucide-react";
import { get, post, del } from "@/lib/api";
import { formatPnl, formatDateMedium } from "@/lib/format";
import type { MentorAssignment, MentorRequest } from "@/types";

export default function MentorHomePage() {
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [sentRequests, setSentRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search modal state
  const [showSearch, setShowSearch] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      get<{ count: number; results: MentorAssignment[] }>("/api/mentors/my-traders/"),
      get<{ count: number; results: MentorRequest[] }>("/api/mentors/requests/sent/"),
    ])
      .then(([traders, requests]) => {
        setAssignments(traders.results);
        setSentRequests(requests.results.filter((r) => r.status === "pending"));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar datos."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    const email = searchEmail.trim();
    if (!email) return;
    setSearching(true);
    setSearchError(null);
    setSearchSuccess(null);
    try {
      const req = await post<MentorRequest>("/api/mentors/requests/", { trader_email: email });
      setSentRequests((prev) => [req, ...prev]);
      setSearchSuccess(`Solicitud enviada a ${email}.`);
      setSearchEmail("");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error al enviar solicitud.");
    } finally {
      setSearching(false);
    }
  }

  async function handleRevoke(assignmentId: number) {
    try {
      await del(`/api/mentors/assignments/${assignmentId}/`);
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al revocar acceso.");
    }
  }

  const pendingCount = sentRequests.length;

  return (
    <div className="max-w-[900px] mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">Mis alumnos</h1>
          {!loading && (
            <p className="font-mono text-[11px] text-muted mt-[3px]">
              {assignments.length} {assignments.length === 1 ? "alumno activo" : "alumnos activos"}
              {pendingCount > 0 && ` · ${pendingCount} solicitud${pendingCount > 1 ? "es" : ""} pendiente${pendingCount > 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <button
          onClick={() => { setShowSearch(true); setSearchError(null); setSearchSuccess(null); setSearchEmail(""); }}
          className="flex items-center gap-2 font-sans text-[12px] font-semibold bg-green hover:bg-green-hover text-white px-4 py-[8px] transition-colors flex-shrink-0"
        >
          <Plus size={14} />
          Buscar trader
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06]">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-sm" />)}
        </div>
      ) : (
        <>
          {/* ── Pending sent requests ── */}
          {sentRequests.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">Solicitudes enviadas</p>
              <div className="card divide-y divide-white/[0.05]">
                {sentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] text-secondary truncate">
                        {req.trader_detail.display_name || req.trader_detail.email}
                      </p>
                      <p className="font-mono text-[10px] text-muted">{req.trader_detail.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Clock size={11} className="text-muted" />
                      <span className="font-mono text-[10px] text-muted">Pendiente</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Active students ── */}
          {assignments.length === 0 ? (
            <div className="card p-12 flex flex-col items-center text-center gap-3">
              <p className="font-sans text-[15px] text-secondary">No tienes alumnos activos todavía.</p>
              <p className="font-mono text-[11px] text-muted max-w-xs">
                Busca un trader por su email y envíale una solicitud.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((a) => (
                <div key={a.id} className="card p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <p className="font-sans text-[15px] font-semibold text-primary truncate">
                        {a.trader_detail.display_name || a.trader_detail.email}
                      </p>
                      <p className="font-mono text-[10px] text-muted mt-[2px]">
                        {a.trader_detail.email} · Desde {formatDateMedium(a.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRevoke(a.id)}
                      className="flex items-center gap-1 font-mono text-[10px] text-muted hover:text-loss transition-colors flex-shrink-0"
                      title="Dejar de mentorizar"
                    >
                      <UserMinus size={12} />
                      <span className="hidden sm:inline">Dejar</span>
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-base px-3 py-2">
                      <p className="font-mono text-[9px] text-muted uppercase tracking-[0.08em]">Operaciones</p>
                      <p className="font-mono text-[14px] text-primary mt-[2px]">{a.stats.total_trades}</p>
                    </div>
                    <div className="bg-base px-3 py-2">
                      <p className="font-mono text-[9px] text-muted uppercase tracking-[0.08em]">Win rate</p>
                      <div className="flex items-center gap-1 mt-[2px]">
                        <TrendingUp size={11} className={a.stats.win_rate >= 50 ? "text-profit" : "text-loss"} />
                        <p className={`font-mono text-[14px] ${a.stats.win_rate >= 50 ? "text-profit" : "text-loss"}`}>
                          {a.stats.win_rate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-base px-3 py-2">
                      <p className="font-mono text-[9px] text-muted uppercase tracking-[0.08em]">P&L total</p>
                      <p className={`font-mono text-[14px] mt-[2px] ${a.stats.total_pnl >= 0 ? "text-profit" : "text-loss"}`}>
                        {formatPnl(a.stats.total_pnl)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/mentor/${a.trader_detail.id}/dashboard`}
                      className="flex items-center gap-[6px] font-mono text-[11px] text-secondary hover:text-primary border border-white/[0.1] px-3 py-[7px] transition-colors"
                    >
                      <LayoutDashboard size={13} />
                      Dashboard
                    </Link>
                    <Link
                      href={`/mentor/${a.trader_detail.id}`}
                      className="flex items-center gap-[6px] font-mono text-[11px] text-secondary hover:text-primary border border-white/[0.1] px-3 py-[7px] transition-colors"
                    >
                      <BookOpen size={13} />
                      Diario
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Search modal ── */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-white/[0.10] p-6 w-full max-w-[380px]">
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Buscar trader</p>
              <button onClick={() => setShowSearch(false)} className="text-muted hover:text-primary transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
                  Email del trader
                </label>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => { setSearchEmail(e.target.value); setSearchError(null); setSearchSuccess(null); }}
                    placeholder="trader@email.com"
                    className="w-full bg-elevated border border-white/[0.10] pl-9 pr-3 py-[11px] font-mono text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors"
                    autoFocus
                    disabled={searching}
                  />
                </div>
                {searchError && <p className="font-mono text-[10px] text-loss">{searchError}</p>}
                {searchSuccess && <p className="font-mono text-[10px] text-profit">{searchSuccess}</p>}
              </div>

              <p className="font-sans text-[12px] text-muted leading-relaxed">
                El trader recibirá tu solicitud y podrá aceptarla o rechazarla desde su configuración.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="flex-1 font-sans text-[12px] font-semibold border border-white/[0.10] text-secondary hover:text-primary py-[8px] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={searching || !searchEmail.trim()}
                  className="flex-1 font-sans text-[12px] font-semibold bg-green hover:bg-green-hover text-white py-[8px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {searching ? "Enviando…" : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
