"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

type FieldError = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
  form?: string;
};

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Muy débil", color: "#d94040" },
    { label: "Débil", color: "#d94040" },
    { label: "Regular", color: "#f59e0b" },
    { label: "Buena", color: "#2fac66" },
    { label: "Fuerte", color: "#2fac66" },
  ];
  return { score, ...map[score] };
}

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const requirements = [
    { text: "8 caracteres mínimo", met: password.length >= 8 },
    { text: "Al menos un número", met: /[0-9]/.test(password) },
    { text: "Al menos una mayúscula", met: /[A-Z]/.test(password) },
  ];

  function validate(): boolean {
    const next: FieldError = {};
    if (!name.trim()) next.name = "El nombre es obligatorio.";
    if (!email.trim()) next.email = "El email es obligatorio.";
    if (password.length < 8) next.password = "La contraseña debe tener al menos 8 caracteres.";
    if (password !== confirm) next.confirm = "Las contraseñas no coinciden.";
    if (!terms) next.terms = "Debes aceptar los términos para continuar.";
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: name,
            email,
            password,
            password_confirm: confirm,
          }),
        }
      );

      if (res.ok) {
        window.location.href = "https://app.tradalyst.com/onboarding";
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (body?.email) {
        setErrors({ email: "Ya existe una cuenta con este email." });
      } else if (body?.password) {
        setErrors({ password: Array.isArray(body.password) ? body.password[0] : body.password });
      } else {
        setErrors({ form: "Ocurrió un error al crear la cuenta. Inténtalo de nuevo." });
      }
    } catch {
      setErrors({ form: "No se pudo conectar con el servidor." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-light flex items-center justify-center py-16 px-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <Logo variant="dark" height={22} />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white border border-black/[0.08] p-8">
          <h1 className="font-sans text-[22px] font-bold text-text tracking-[-0.01em] mb-1">
            Crear cuenta gratis
          </h1>
          <p className="font-sans text-[13px] text-text-muted mb-7">
            Sin tarjeta de crédito. Sin permanencia.
          </p>

          {errors.form && (
            <div className="mb-5 p-3 border border-loss/30 bg-loss/[0.05]">
              <p className="font-sans text-[13px] text-loss">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full name */}
            <div>
              <label className="block font-sans text-[12px] font-semibold text-text mb-[6px]">
                Nombre completo
              </label>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex García"
                className={`w-full font-sans text-[14px] text-text bg-light border px-3 py-[10px] outline-none focus:border-green/60 transition-colors duration-150 placeholder:text-text-muted ${
                  errors.name ? "border-loss" : "border-black/[0.12]"
                }`}
              />
              {errors.name && (
                <p className="font-sans text-[11px] text-loss mt-1">{errors.name}</p>
              )}
            </div>

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
              <label className="block font-sans text-[12px] font-semibold text-text mb-[6px]">
                Contraseña
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full font-sans text-[14px] text-text bg-light border px-3 py-[10px] outline-none focus:border-green/60 transition-colors duration-150 placeholder:text-text-muted ${
                  errors.password ? "border-loss" : "border-black/[0.12]"
                }`}
              />

              {/* Strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-[3px] mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-[3px] transition-all duration-300"
                        style={{
                          background: i <= strength.score ? strength.color : "rgba(0,0,0,0.08)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="font-mono text-[10px]" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}

              {/* Requirements checklist */}
              {password && (
                <ul className="mt-2 space-y-[3px]">
                  {requirements.map((r) => (
                    <li key={r.text} className="flex items-center gap-2">
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: r.met ? "#2fac66" : "#9ca3af" }}
                      >
                        {r.met ? "✓" : "○"}
                      </span>
                      <span
                        className="font-sans text-[11px]"
                        style={{ color: r.met ? "#2fac66" : "#9ca3af" }}
                      >
                        {r.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {errors.password && (
                <p className="font-sans text-[11px] text-loss mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block font-sans text-[12px] font-semibold text-text mb-[6px]">
                Confirmar contraseña
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`w-full font-sans text-[14px] text-text bg-light border px-3 py-[10px] outline-none focus:border-green/60 transition-colors duration-150 placeholder:text-text-muted ${
                  errors.confirm ? "border-loss" : "border-black/[0.12]"
                }`}
              />
              {errors.confirm && (
                <p className="font-sans text-[11px] text-loss mt-1">{errors.confirm}</p>
              )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-[2px] flex-shrink-0 accent-green"
                />
                <span className="font-sans text-[12px] text-text-secondary leading-relaxed">
                  He leído y acepto los{" "}
                  <Link href="/terminos" className="text-green hover:underline">
                    Términos de uso
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacidad" className="text-green hover:underline">
                    Política de privacidad
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="font-sans text-[11px] text-loss mt-1">{errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans text-sm font-semibold bg-green hover:bg-green-hover disabled:opacity-60 text-white py-[11px] rounded transition-colors duration-150"
            >
              {loading ? "Creando cuenta…" : "Crear cuenta gratis"}
            </button>
          </form>
        </div>

        {/* Switch to login */}
        <p className="font-sans text-[13px] text-text-muted text-center mt-5">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-green hover:underline font-semibold">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
