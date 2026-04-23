"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
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
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

type RoleFilter = "" | "trader" | "mentor" | "admin";

const PAGE_SIZE = 20;

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "trader", label: "Traders" },
  { value: "mentor", label: "Mentores" },
  { value: "admin", label: "Admins" },
];

function TabGroup({
  options, value, onChange,
}: { options: { value: RoleFilter; label: string }[]; value: RoleFilter; onChange: (v: RoleFilter) => void }) {
  return (
    <div className="flex gap-[2px] bg-surface border border-white/[0.08] w-fit rounded-sm overflow-hidden">
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`font-mono text-[10px] px-3 py-[6px] transition-colors duration-150 ${
            value === opt.value ? "bg-elevated text-primary" : "text-muted hover:text-secondary"
          }`}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const buildParams = useCallback((role: RoleFilter, q: string, p: number): string => {
    const params = new URLSearchParams();
    params.set("ordering", "-date_joined");
    params.set("page_size", String(PAGE_SIZE));
    params.set("page", String(p));
    if (role) params.set("role", role);
    if (q) params.set("search", q);
    return params.toString();
  }, []);

  const fetchUsers = useCallback(async (role: RoleFilter, q: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await get<UserListResponse>(`/api/users/?${buildParams(role, q, p)}`);
      setUsers(res.results);
      setCount(res.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchUsers(roleFilter, search, page);
  }, [roleFilter, search, page, fetchUsers]);

  function handleRoleChange(role: RoleFilter) {
    setPage(1);
    setRoleFilter(role);
  }

  function handleSearchInput(raw: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearch(raw.trim());
    }, 350);
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="max-w-[1100px] mx-auto space-y-5">

      {/* ── Top bar ── */}
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 font-mono text-[11px] text-muted hover:text-secondary transition-colors mb-3">
          <ChevronLeft size={12} />
          Admin
        </Link>
        <h1 className="font-sans text-[22px] font-bold text-primary leading-tight">Usuarios</h1>
        {!loading && (
          <p className="font-mono text-[11px] text-muted mt-[3px]">
            {count} {count === 1 ? "usuario" : "usuarios"}
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 border border-loss/30 bg-loss/[0.06] rounded-sm">
          <AlertCircle size={15} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[13px] text-loss">{error}</p>
          <button onClick={() => fetchUsers(roleFilter, search, page)} className="ml-auto font-mono text-[10px] text-loss underline">
            Reintentar
          </button>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar por email o nombre…"
          onChange={(e) => handleSearchInput(e.target.value)}
          className="w-full sm:w-64 bg-surface border border-white/[0.08] px-3 py-[8px] font-mono text-[12px] text-primary placeholder:text-muted focus:outline-none focus:border-white/20 transition-colors"
        />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase text-muted tracking-[0.1em]">Rol</span>
          <TabGroup options={ROLE_TABS} value={roleFilter} onChange={handleRoleChange} />
        </div>
      </div>

      {/* ── Table (desktop) / Card stack (mobile) ── */}
      <div className="card overflow-x-auto">
        {/* Desktop header */}
        <div className="hidden lg:grid grid-cols-[1fr_200px_90px_100px_120px_60px] gap-3 px-5 py-3 border-b border-white/[0.06]">
          {["Email", "Nombre", "Rol", "Estado", "Registrado", "Ver"].map((h) => (
            <span key={h} className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-12 w-full rounded-sm" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <p className="font-sans text-[14px] text-secondary">No hay usuarios que coincidan.</p>
          </div>
        ) : (
          <>
            {/* Desktop rows */}
            <div className="hidden lg:block">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-[1fr_200px_90px_100px_120px_60px] gap-3 px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors items-center cursor-pointer"
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                >
                  <span className="font-mono text-[11px] text-secondary truncate">{user.email}</span>
                  <span className="font-sans text-[12px] font-medium text-primary truncate">{user.display_name || "—"}</span>
                  <span className={`font-mono text-[9px] uppercase tracking-[0.08em] px-2 py-[3px] w-fit ${
                    user.role === "trader" ? "text-secondary border border-white/[0.1]"
                    : user.role === "mentor" ? "text-green/80 border border-green/20"
                    : "text-primary border border-white/[0.2]"
                  }`}>
                    {user.role}
                  </span>
                  <span className={`font-mono text-[10px] ${user.is_active ? "text-profit" : "text-loss"}`}>
                    {user.is_active ? "Activo" : "Suspendido"}
                  </span>
                  <span className="font-mono text-[10px] text-muted">{formatDateMedium(user.date_joined)}</span>
                  <Link href={`/admin/users/${user.id}`} onClick={(e) => e.stopPropagation()}
                    className="font-mono text-[10px] text-green hover:underline">
                    Ver →
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-white/[0.05]">
              {users.map((user) => (
                <Link key={user.id} href={`/admin/users/${user.id}`}
                  className="flex items-start justify-between gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors">
                  <div className="min-w-0">
                    <p className="font-sans text-[13px] font-medium text-primary truncate">
                      {user.display_name || user.email}
                    </p>
                    <p className="font-mono text-[10px] text-muted truncate">{user.email}</p>
                    <p className="font-mono text-[10px] text-muted mt-[2px]">{formatDateMedium(user.date_joined)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
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
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted">
            Página {page} de {totalPages} · {count} resultados
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="p-[6px] text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1)
              .map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`font-mono text-[11px] w-7 h-7 transition-colors ${
                    page === n ? "bg-elevated text-primary" : "text-muted hover:text-secondary"
                  }`}>
                  {n}
                </button>
              ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="p-[6px] text-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
