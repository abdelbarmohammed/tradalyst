"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { MARKETING_URL } from "@/lib/urls";
import type { UserProfile } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ROLE_HOME: Record<string, string> = {
  trader: "/dashboard",
  mentor: "/mentor",
  admin: "/admin",
};

const inputCls =
  "w-full bg-elevated border border-white/[0.10] px-4 py-[11px] font-mono text-[13px] text-primary placeholder:text-muted focus:outline-none focus:border-white/25 transition-colors";

function LanguageToggle() {
  const router = useRouter();

  function switchLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="absolute top-4 right-4 flex gap-1">
      {(["ES", "EN"] as const).map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc.toLowerCase())}
          className="font-mono text-[10px] px-[6px] py-[3px] text-muted hover:text-primary transition-colors"
        >
          {loc}
        </button>
      ))}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

      if (res.ok) {
        const user: UserProfile = await res.json();
        const theme = user.theme_preference ?? "dark";
        document.cookie = `THEME=${theme};path=/;max-age=31536000`;
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
        const destination =
          searchParams.get("redirect") ?? ROLE_HOME[user.role] ?? "/dashboard";
        router.push(destination);
        return;
      }

      if (res.status === 401 || res.status === 400) {
        setError(t("errorCredentials"));
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (res.status === 403 && body?.detail?.toLowerCase().includes("suspendida")) {
        setError(t("errorSuspended"));
      } else {
        setError(t("errorGeneral"));
      }
    } catch {
      setError(t("errorNetwork"));
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
          {t("email")}
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
          {t("password")}
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
        className="w-full mt-2 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white py-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("submitting") : t("submit")}
      </button>

      <p className="font-mono text-[11px] text-muted text-center pt-1">
        {t("noAccount")}{" "}
        <Link href="/registro" className="text-green hover:underline">
          {t("register")}
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  const t = useTranslations("auth.login");

  return (
    <div className="relative min-h-screen bg-base flex items-center justify-center p-4">
      <LanguageToggle />
      <div className="w-full max-w-[360px]">
        <div className="flex justify-center mb-8">
          <a href={MARKETING_URL} aria-label="Tradalyst — inicio">
            <svg height="22" width="auto" viewBox="0 0 172.22 40.63" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g>
                <g fill="var(--text-primary)">
                  <path d="M26.46,32.72V11.98h4.68v3.47h.22c.37-1.2,1.02-2.12,1.95-2.77.93-.65,1.99-.97,3.17-.97.27,0,.58.01.91.04.33.02.62.06.85.09v4.43c-.2-.06-.52-.12-.96-.17-.45-.05-.88-.07-1.32-.07-.89,0-1.69.19-2.4.58-.71.38-1.27.91-1.67,1.59-.4.67-.6,1.45-.6,2.33v12.21h-4.82Z"/>
                  <path d="M46.98,33.15c-1.31,0-2.49-.24-3.54-.71-1.05-.48-1.88-1.18-2.49-2.11-.61-.93-.91-2.07-.91-3.43,0-1.18.22-2.15.66-2.91.44-.77,1.03-1.38,1.78-1.84.75-.46,1.59-.8,2.53-1.04.94-.23,1.92-.4,2.93-.5,1.2-.14,2.18-.25,2.93-.35.75-.1,1.31-.26,1.66-.48s.53-.57.53-1.04v-.09c0-.68-.14-1.26-.41-1.73-.27-.48-.68-.84-1.22-1.09-.54-.25-1.2-.38-2-.38s-1.5.12-2.09.37c-.59.25-1.07.57-1.44.96-.37.4-.64.82-.82,1.28l-4.47-.91c.41-1.22,1.04-2.24,1.89-3.03.85-.8,1.87-1.39,3.05-1.79,1.18-.4,2.46-.59,3.85-.59.98,0,1.96.11,2.96.34,1,.23,1.91.62,2.74,1.16s1.5,1.27,2,2.19c.51.92.76,2.07.76,3.45v13.86h-4.62v-2.86h-.19c-.31.58-.73,1.12-1.27,1.62s-1.21.9-2,1.21-1.74.45-2.83.45ZM48.23,29.57c1,0,1.86-.2,2.59-.59s1.29-.92,1.69-1.57c.4-.65.6-1.36.6-2.12v-2.45c-.16.12-.43.24-.81.35-.38.11-.8.21-1.26.3s-.92.16-1.37.22-.83.11-1.14.15c-.72.1-1.37.26-1.95.48-.58.22-1.04.54-1.36.94-.33.4-.49.92-.49,1.57,0,.59.15,1.09.45,1.49.3.4.72.71,1.24.92.53.21,1.13.32,1.81.32Z"/>
                  <path d="M70.66,33.09c-1.63,0-3.1-.42-4.39-1.25s-2.31-2.05-3.05-3.65-1.11-3.53-1.11-5.81.38-4.25,1.14-5.84,1.79-2.79,3.08-3.61c1.29-.82,2.73-1.22,4.31-1.22,1.24,0,2.25.21,3.03.62s1.41.91,1.87,1.48.81,1.1,1.05,1.6h.2V5.07h4.82v27.65h-4.73v-3.28h-.3c-.25.5-.61,1.03-1.09,1.6-.48.57-1.1,1.05-1.88,1.46-.78.4-1.77.6-2.97.6ZM71.98,29.12c1.05,0,1.94-.28,2.67-.84.73-.56,1.29-1.35,1.67-2.37.38-1.01.58-2.2.58-3.54s-.19-2.52-.57-3.52c-.38-1-.93-1.77-1.67-2.33-.74-.56-1.63-.84-2.68-.84s-2,.29-2.73.86c-.73.57-1.28,1.37-1.65,2.38s-.56,2.16-.56,3.44.19,2.44.56,3.46.92,1.82,1.66,2.41,1.64.88,2.72.88Z"/>
                  <path d="M92.52,33.15c-1.31,0-2.49-.24-3.54-.71-1.05-.48-1.88-1.18-2.49-2.11-.61-.93-.91-2.07-.91-3.43,0-1.18.22-2.15.66-2.91.44-.77,1.03-1.38,1.78-1.84.75-.46,1.59-.8,2.53-1.04.94-.23,1.92-.4,2.93-.5,1.2-.14,2.18-.25,2.93-.35.75-.1,1.31-.26,1.66-.48s.53-.57.53-1.04v-.09c0-.68-.14-1.26-.41-1.73-.27-.48-.68-.84-1.22-1.09-.54-.25-1.2-.38-2-.38s-1.5.12-2.09.37-1.07.57-1.44.96c-.37.4-.64.82-.82,1.28l-4.47-.91c.41-1.22,1.04-2.24,1.89-3.03.85-.8,1.87-1.39,3.05-1.79,1.18-.4,2.46-.59,3.85-.59.98,0,1.96.11,2.96.34,1,.23,1.91.62,2.74,1.16s1.5,1.27,2,2.19c.51.92.76,2.07.76,3.45v13.86h-4.62v-2.86h-.19c-.31.58-.73,1.12-1.27,1.62s-1.21.9-2,1.21-1.74.45-2.83.45ZM93.76,29.57c1,0,1.86-.2,2.59-.59s1.29-.92,1.69-1.57c.4-.65.6-1.36.6-2.12v-2.45c-.16.12-.43.24-.81.35-.38.11-.8.21-1.26.3s-.92.16-1.37.22-.83.11-1.14.15c-.72.1-1.37.26-1.95.48s-1.04.54-1.36.94c-.33.4-.49.92-.49,1.57,0,.59.15,1.09.45,1.49.3.4.72.71,1.24.92.53.21,1.13.32,1.81.32Z"/>
                  <path d="M113.38,5.07v27.65h-4.82V5.07h4.82Z"/>
                  <path d="M118.61,40.12l1.13-3.77.57.15c.73.19,1.38.24,1.95.16.57-.08,1.05-.33,1.43-.74.38-.41.66-1.02.82-1.81l.3-1.32-7.83-20.82h5.16l3.79,11.28c.45,1.34.81,2.67,1.1,3.99.28,1.32.6,2.68.95,4.06h-1.26c.33-1.39.67-2.74,1-4.07.33-1.33.72-2.66,1.17-3.98l3.92-11.28h5.1l-8.91,23.42c-.42,1.1-.95,2.04-1.58,2.83-.63.79-1.4,1.38-2.32,1.79-.92.41-2,.61-3.25.61-.68,0-1.31-.05-1.88-.15-.58-.1-1.02-.22-1.35-.35Z"/>
                  <path d="M149.02,33.15c-1.6,0-3.01-.23-4.23-.69-1.22-.46-2.23-1.13-3.02-2-.79-.88-1.3-1.94-1.53-3.19l4.51-.85c.28,1.03.79,1.79,1.51,2.29s1.67.75,2.85.75,2.13-.24,2.83-.71c.7-.48,1.05-1.07,1.05-1.77,0-.59-.23-1.09-.69-1.48-.46-.39-1.16-.69-2.12-.9l-3.54-.76c-1.96-.42-3.41-1.11-4.38-2.08s-1.45-2.21-1.45-3.73c0-1.29.35-2.4,1.06-3.34s1.69-1.67,2.94-2.19c1.26-.52,2.71-.78,4.37-.78,1.57,0,2.92.22,4.05.67,1.13.45,2.05,1.07,2.75,1.86.7.8,1.18,1.73,1.46,2.81l-4.3.85c-.24-.73-.66-1.35-1.28-1.85-.62-.5-1.49-.75-2.62-.75-1.03,0-1.88.23-2.57.68-.69.45-1.03,1.03-1.03,1.73,0,.61.23,1.11.69,1.5.46.4,1.21.71,2.26.93l3.53.74c1.97.42,3.43,1.09,4.38,2.02.95.93,1.43,2.12,1.43,3.58,0,1.31-.38,2.46-1.13,3.46-.75,1-1.8,1.78-3.15,2.34-1.34.56-2.89.84-4.63.84Z"/>
                  <path d="M171.64,11.98v3.79h-11.78v-3.79h11.78ZM162.81,7.04h4.82v19.84c0,.75.16,1.31.48,1.66s.85.53,1.58.53c.22,0,.52-.03.88-.08.36-.06.66-.11.88-.16l.76,3.73c-.53.16-1.08.27-1.63.34s-1.09.1-1.6.1c-1.99,0-3.52-.49-4.58-1.48-1.06-.99-1.6-2.4-1.6-4.23V7.04Z"/>
                  <rect y="4.95" width="18.05" height="5.07"/>
                  <rect x="1.42" y="16.51" width="28.2" height="5.07" transform="translate(34.56 3.53) rotate(90)"/>
                </g>
                <rect x="18.05" width="12.98" height="5.07" fill="#2fac66"/>
              </g>
            </svg>
          </a>
        </div>

        <div className="bg-surface border border-white/[0.08] p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-5">
            {t("title")}
          </p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
