"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface PlanLimitModalProps {
  message: string;
  onClose: () => void;
}

export default function PlanLimitModal({ message, onClose }: PlanLimitModalProps) {
  const t = useTranslations("planLimit");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-elevated border border-white/[0.08] p-6 w-full max-w-sm">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
        >
          <X size={14} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-green mb-3">
          {t("badge")}
        </p>
        <p className="font-sans text-[15px] font-bold text-primary mb-2">
          {t("title")}
        </p>
        <p className="font-sans text-[13px] text-secondary leading-relaxed mb-6">
          {message}
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="/settings?tab=plan"
            onClick={onClose}
            className="w-full font-sans text-[13px] font-semibold bg-green hover:bg-green-hover text-white py-[10px] text-center transition-colors"
          >
            {t("upgradeButton")}
          </Link>
          <button
            onClick={onClose}
            className="w-full font-sans text-[13px] px-4 py-[9px] border border-white/[0.12] text-secondary hover:text-primary transition-colors"
          >
            {t("dismissButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
