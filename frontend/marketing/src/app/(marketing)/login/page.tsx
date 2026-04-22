"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type FieldError = { email?: string; password?: string; form?: string };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: FieldError = {};
    if (!email.trim()) next.email = "El email es obligatorio.";
    if (!password) next.password = "La contraseña es obligatoria.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Response is flat UserProfileSerializer: { id, email, display_name, role, ... }
        const role: string = data.role ?? "trader";
        const appBase =
          process.env.NEXT_PUBLIC_APP_URL ?? "https://app.tradalyst.com";

        if (role === "mentor") {
          window.location.href = `${appBase}/mentor`;
        } else if (role === "admin") {
          window.location.href = `${appBase}/admin`;
        } else {
          window.location.href = `${appBase}/dashboard`;
        }
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 400) {
        setErrors({ form: "Email o contraseña incorrectos." });
      } else if (res.status === 403 && body?.detail?.includes("suspendida")) {
        setErrors({ form: "Tu cuenta ha sido suspendida. Contacta con soporte." });
      } else {
        setErrors({ form: "Ocurrió un error. Inténtalo de nuevo." });
      }
    } catch {
      setErrors({ form: "No se pudo conectar con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-light flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Logo variant="dark" height={22} />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-black/[0.08] p-8">
          <h1 className="font-sans text-[22px] font-bold text-text tracking-[-0.01em] mb-1">
            Iniciar sesión
          </h1>
          <p className="font-sans text-[13px] text-text-muted mb-7">
            Bienvenido de nuevo.
          </p>

          {/* Form-level error */}
          {errors.form && (
            <div className="mb-5 p-3 border border-loss/30 bg-loss/[0.05]">
              <p className="font-sans text-[13px] text-loss">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block font-sans text-[12px] font-semibold text-text mb-[6px]">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className={`w-full font-sans text-[14px] text-text bg-light border px-3 py-[10px] outline-none focus:border-green/60 transition-colors duration-150 placeholder:text-text-muted ${
                  errors.email ? "border-loss" : "border-black/[0.12]"
                }`}
              />
              {errors.email && (
                <p className="font-sans text-[11px] text-loss mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label className="font-sans text-[12px] font-semibold text-text">
                  Contraseña
                </label>
                <Link
                  href="/recuperar-contrasena"
                  className="font-sans text-[11px] text-text-muted hover:text-green transition-colors duration-150"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full font-sans text-[14px] text-text bg-light border px-3 py-[10px] outline-none focus:border-green/60 transition-colors duration-150 placeholder:text-text-muted ${
                  errors.password ? "border-loss" : "border-black/[0.12]"
                }`}
              />
              {errors.password && (
                <p className="font-sans text-[11px] text-loss mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans text-sm font-semibold bg-green hover:bg-green-hover disabled:opacity-60 text-white py-[11px] rounded transition-colors duration-150"
            >
              {loading ? "Entrando…" : "Iniciar sesión"}
            </button>
          </form>
        </div>

        {/* Switch to register */}
        <p className="font-sans text-[13px] text-text-muted text-center mt-5">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="text-green hover:underline font-semibold">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
