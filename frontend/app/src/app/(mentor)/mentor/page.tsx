"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, LayoutDashboard, BookOpen, ChevronRight } from "lucide-react";
import { get } from "@/lib/api";
import { formatDateMedium } from "@/lib/format";
import type { MentorAssignment } from "@/types";

export default function MentorHomePage() {
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<{ count: number; results: MentorAssignment[] }>("/api/mentors/my-traders/")
      .then((res) => setAssignments(res.results))
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar los traders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">
          Mis traders
        </h1>
        {!loading && (
          <p className="font-mono text-[11px] text-muted mt-[3px]">
            {assignments.length} {assignments.length === 1 ? "trader asignado" : "traders asignados"}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-20 w-full rounded-sm" />
          ))}
        </div>
      ) : assignments.length === 0 && !error ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <p className="font-sans text-[15px] text-secondary">
            Todavía no tienes traders asignados.
          </p>
          <p className="font-mono text-[11px] text-muted max-w-xs">
            Cuando un trader te asigne como mentor, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-white/[0.05]">
          {assignments.map(({ trader, assigned_at }) => (
            <div
              key={trader.id}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="min-w-0">
                <p className="font-sans text-[14px] font-semibold text-primary truncate">
                  {trader.display_name || trader.email}
                </p>
                <p className="font-mono text-[10px] text-muted mt-[2px]">
                  {trader.email} · Desde {formatDateMedium(assigned_at)}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/mentor/${trader.id}/dashboard`}
                  className="flex items-center gap-[6px] font-mono text-[11px] text-secondary hover:text-primary border border-white/[0.1] px-3 py-[7px] transition-colors"
                  title="Dashboard"
                >
                  <LayoutDashboard size={13} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  href={`/mentor/${trader.id}`}
                  className="flex items-center gap-[6px] font-mono text-[11px] text-secondary hover:text-primary border border-white/[0.1] px-3 py-[7px] transition-colors"
                  title="Diario"
                >
                  <BookOpen size={13} />
                  <span className="hidden sm:inline">Diario</span>
                  <ChevronRight size={11} className="text-muted" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
