"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { UserProfile } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ROLE_HOME: Record<string, string> = {
  trader: "/dashboard",
  mentor: "/mentor",
  admin:  "/admin",
};

const inputCls =
  "w-full bg-elevated border border-white/[0.10] px-4 py-[11px] font-mono text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors";

// Separated into its own component because useSearchParams() requires Suspense
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res.status === 401 || res.status === 400) {
        setError("Email o contraseña incorrectos.");
        return;
      }

      if (!res.ok) {
        setError("Error al iniciar sesión. Inténtalo de nuevo.");
        return;
      }

      const user: UserProfile = await res.json();
      const destination =
        searchParams.get("redirect") ??
        ROLE_HOME[user.role] ??
        "/dashboard";

      router.push(destination);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      {error && (
        <div className="flex items-center gap-2 p-3 border border-loss/30 bg-loss/[0.06] mb-1">
          <AlertCircle size={13} className="text-loss flex-shrink-0" />
          <p className="font-sans text-[12px] text-loss">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          placeholder="tu@email.com"
          className={inputCls}
          disabled={loading}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
          Contraseña
        </label>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(null); }}
          placeholder="••••••••"
          className={inputCls}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim() || !password}
        className="w-full mt-2 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white py-[11px] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Iniciando sesión…" : "Entrar"}
      </button>

      <div className="flex items-center justify-between pt-1">
        <Link
          href="/recuperar-contrasena"
          className="font-mono text-[10px] text-muted hover:text-secondary transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Link
          href="/registro"
          className="font-mono text-[10px] text-green hover:underline transition-colors"
        >
          Crear cuenta →
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">

        <div className="mb-8 text-center">
          <span className="font-mono text-[22px] font-bold text-primary tracking-tight">
            tradalyst
          </span>
          <p className="font-mono text-[11px] text-muted mt-1">
            El diario que detecta lo que tú no ves.
          </p>
        </div>

        <div className="bg-surface border border-white/[0.08] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-5">
            Iniciar sesión
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

      </div>
    </div>
  );
}
