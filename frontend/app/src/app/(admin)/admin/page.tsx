"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Users, TrendingUp, Shield, BookOpen } from "lucide-react";
import { get } from "@/lib/api";
import { formatDateMedium } from "@/lib/format";

interface AdminUser {
  id: number;
  email: string;
  display_name: string;
  role: "trader" | "mentor" | "admin";
  is_active: boolean;
  date_joined: string;
}

interface UserListResponse {
  count: number;
  results: AdminUser[];
}

interface RoleCounts {
  traders: number;
  mentors: number;
  admins: number;
  total: number;
  active: number;
}

function StatTile({ label, value, icon: Icon, href }: { label: string; value: string | number; icon: React.ElementType; href?: string }) {
  const inner = (
    <div className="card p-5 flex items-start justify-between gap-3">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted mb-2">{label}</p>
        <p className="font-mono text-[28px] font-bold text-primary tabular-nums leading-none">{value}</p>
      </div>
      <Icon size={18} className="text-muted mt-1 flex-shrink-0" />
    </div>
  );
  if (href) return <Link href={href} className="hover:opacity-90 transition-opacity">{inner}</Link>;
  return inner;
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<UserListResponse>("/api/users/?page_size=10&ordering=-date_joined")
      .then((res) => {
        setUsers(res.results);
        setTotal(res.count);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar los datos."))
      .finally(() => setLoading(false));
  }, []);

  const counts: RoleCounts = {
    total,
    traders: users.filter((u) => u.role === "trader").length,
    mentors: users.filter((u) => u.role === "mentor").length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.is_active).length,
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">Panel de administración</h1>
        <p className="font-mono text-[11px] text-muted mt-[3px]">Vista general de la plataforma</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
        </div>
      )}

      {/* ── Stats ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-sm" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatTile label="Usuarios totales" value={total} icon={Users} href="/admin/users" />
          <StatTile label="Traders" value={counts.traders} icon={TrendingUp} />
          <StatTile label="Mentores" value={counts.mentors} icon={BookOpen} />
          <StatTile label="Admins" value={counts.admins} icon={Shield} />
        </div>
      )}

      {/* ── Recent registrations ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans text-[15px] font-semibold text-primary">
            Registros recientes
          </h2>
          <Link href="/admin/users" className="font-mono text-[11px] text-green hover:underline">
            Ver todos →
          </Link>
        </div>

        <div className="card divide-y divide-white/[0.05]">
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-sm" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-sans text-[14px] text-secondary">No hay usuarios registrados.</p>
            </div>
          ) : (
            users.slice(0, 8).map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-white/[0.03] transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-sans text-[13px] font-medium text-primary truncate">
                    {user.display_name || user.email}
                  </p>
                  <p className="font-mono text-[10px] text-muted truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-[3px] ${
                    user.role === "trader" ? "text-secondary border border-white/[0.1]"
                    : user.role === "mentor" ? "text-green/80 border border-green/20"
                    : "text-primary border border-white/[0.2]"
                  }`}>
                    {user.role}
                  </span>
                  {!user.is_active && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-loss border border-loss/30 px-2 py-[3px]">
                      Suspendido
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-muted hidden sm:inline">
                    {formatDateMedium(user.date_joined)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
