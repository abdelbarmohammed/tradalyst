import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Tradalyst";
  const category = searchParams.get("category") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#eceee8",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#2fac66",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "14px", height: "14px", backgroundColor: "#eceee8", borderRadius: "50%" }} />
          </div>
          <span style={{ fontSize: "20px", fontWeight: "600", color: "#0f1110", letterSpacing: "-0.02em" }}>
            Tradalyst
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, justifyContent: "center" }}>
          {category && (
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#2fac66",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {category}
            </span>
          )}
          <div
            style={{
              fontSize: title.length > 50 ? "44px" : "52px",
              fontWeight: "700",
              color: "#0f1110",
              lineHeight: "1.1",
              letterSpacing: "-0.025em",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(15,17,16,0.12)",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "14px", color: "#5a5f5c", fontWeight: "400" }}>tradalyst.com</span>
          <div
            style={{
              backgroundColor: "#2fac66",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "600",
              padding: "8px 18px",
            }}
          >
            Diario de Trading con IA
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
