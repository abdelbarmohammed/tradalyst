"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Eye, Settings } from "lucide-react";

const ITEMS = [
  { href: "/mentor", label: "Traders", icon: Eye },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export default function MentorBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-white/[0.06] flex">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-[3px] py-[10px] transition-colors duration-150 ${
              active ? "text-primary" : "text-secondary"
            }`}
          >
            <Icon size={18} />
            <span className="font-mono text-[9px] tracking-[0.06em]">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
