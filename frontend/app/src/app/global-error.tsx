"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Stale deployment: browser has JS from an old build, server is on a new one.
    // next-intl's request.ts is compiled into an internal Server Action; after a
    // deploy its ID changes. Auto-reload gets the user onto the new build.
    const isStaleDeployment =
      error.message?.includes("Server Action") ||
      error.message?.includes("Failed to find Server Action") ||
      error.message?.includes("NEXT_NOT_FOUND");

    if (isStaleDeployment) {
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#1e1e1e" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            gap: "16px",
            fontFamily: "monospace",
            color: "#9ca3af",
          }}
        >
          <p style={{ fontSize: "13px", margin: 0 }}>Actualizando aplicación…</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontSize: "11px",
              padding: "8px 20px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "#9ca3af",
              cursor: "pointer",
            }}
          >
            Recargar página
          </button>
          <button
            onClick={reset}
            style={{
              fontSize: "11px",
              padding: "8px 20px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              color: "rgba(156,163,175,0.5)",
              cursor: "pointer",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
