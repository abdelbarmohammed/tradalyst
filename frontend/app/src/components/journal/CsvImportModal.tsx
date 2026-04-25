"use client";

import { useRef, useState } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CSV_TEMPLATE_HEADERS = "date,asset,direction,entry_price,exit_price,size,result,pnl,reasoning,emotion";

interface PreviewRow {
  [key: string]: string;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

type Step = 1 | 2 | 3;

interface Props {
  onClose: () => void;
  onImported: () => void;
}

export default function CsvImportModal({ onClose, onImported }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE_HEADERS + "\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tradalyst_plantilla.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function parsePreview(f: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setPreview([]);
        setHeaders([]);
        setErrorCount(0);
        return;
      }
      const cols = lines[0].split(",").map((c) => c.trim());
      setHeaders(cols);
      const rows = lines.slice(1, 6).map((line) => {
        const vals = line.split(",");
        const row: PreviewRow = {};
        cols.forEach((col, i) => {
          row[col] = (vals[i] ?? "").trim();
        });
        return row;
      });
      setPreview(rows);
      const empty = lines.slice(1).filter((l) => l.trim() === "").length;
      setErrorCount(empty);
    };
    reader.readAsText(f);
  }

  function handleFile(f: File) {
    if (!f.name.endsWith(".csv")) return;
    setFile(f);
    parsePreview(f);
    setStep(2);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/api/trades/import/`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data: ImportResult = await res.json();
      setResult(data);
      setStep(3);
      if (data.imported > 0) {
        onImported();
      }
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className="relative w-full max-w-lg"
        style={{ backgroundColor: "var(--elevated)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p className="font-sans text-[14px] font-semibold text-primary">Importar operaciones CSV</p>
            <p className="font-mono text-[10px] text-muted mt-[2px]">
              Paso {step} de 3 —{" "}
              {step === 1 ? "Seleccionar archivo" : step === 2 ? "Previsualizar" : "Resultado"}
            </p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {step === 1 && (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-green/60" : "border-[var(--border-strong)]"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ borderColor: dragOver ? "rgba(47,172,102,0.6)" : "var(--border-strong)" }}
              >
                <Upload size={20} className="mx-auto mb-3 text-muted" />
                <p className="font-sans text-[13px] text-secondary">Arrastra tu CSV aquí o haz clic para seleccionar</p>
                <p className="font-mono text-[10px] text-muted mt-1">Máx. 5 MB · 1.000 filas</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 font-mono text-[11px] text-muted hover:text-primary transition-colors"
              >
                <FileText size={12} />
                Descargar plantilla CSV
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-muted" />
                <span className="font-mono text-[12px] text-secondary truncate">{file?.name}</span>
                {errorCount > 0 && (
                  <span className="ml-auto font-mono text-[10px] text-loss shrink-0">{errorCount} filas vacías</span>
                )}
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto" style={{ border: "1px solid var(--border)" }}>
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.08em] text-muted whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        {headers.map((h) => (
                          <td key={h} className="px-3 py-[7px] font-mono text-[11px] text-secondary whitespace-nowrap max-w-[120px] truncate">
                            {row[h] || <span className="text-muted">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-mono text-[10px] text-muted">Mostrando hasta 5 filas de previsualización</p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 font-sans text-[13px] py-[9px] text-secondary transition-colors hover:text-primary"
                  style={{ border: "1px solid var(--border)" }}
                >
                  Volver
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white py-[9px] transition-colors disabled:opacity-50"
                >
                  {importing ? "Importando…" : "Confirmar importación"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {result.imported > 0 ? (
                  <CheckCircle2 size={18} className="text-green flex-shrink-0 mt-[1px]" />
                ) : (
                  <AlertCircle size={18} className="text-loss flex-shrink-0 mt-[1px]" />
                )}
                <div>
                  <p className="font-sans text-[14px] font-semibold text-primary">
                    {result.imported > 0 ? "Importación completada" : "Sin operaciones importadas"}
                  </p>
                  <p className="font-mono text-[12px] text-secondary mt-1">
                    {result.imported} importadas · {result.skipped} omitidas
                  </p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div
                  className="p-3 space-y-1"
                  style={{ backgroundColor: "rgba(240,96,96,0.06)", border: "1px solid rgba(240,96,96,0.2)" }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-loss mb-2">Errores</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="font-mono text-[11px] text-secondary">{e}</p>
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white py-[9px] transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
