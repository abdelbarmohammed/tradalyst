"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/journal",    label: "Diario",       icon: BookOpen },
  { href: "/ai",         label: "IA",           icon: BrainCircuit },
  { href: "/analytics",  label: "Analítica",    icon: BarChart2 },
  { href: "/settings",   label: "Ajustes",      icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-sidebar flex-shrink-0 bg-surface border-r border-white/[0.06] h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* T-mark */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="0" y="0" width="18" height="5" fill="#e8ebe8" />
            <rect x="6.5" y="5" width="5" height="13" fill="#e8ebe8" />
            <rect x="0" y="4" width="18" height="2" fill="#2fac66" />
          </svg>
          <span className="font-sans text-[15px] font-bold text-primary tracking-[-0.02em]">
            tradalyst
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-[2px] overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item rounded-md ${active ? "nav-item-active" : ""}`}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="nav-item w-full rounded-md text-left"
        >
          <LogOut size={16} className="flex-shrink-0" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
