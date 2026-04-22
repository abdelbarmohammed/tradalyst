import Link from "next/link";
import { Users, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base">
      <aside className="hidden lg:flex flex-col w-sidebar flex-shrink-0 bg-surface border-r border-white/[0.06] h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="0" y="0" width="18" height="5" fill="#e8ebe8" />
              <rect x="6.5" y="5" width="5" height="13" fill="#e8ebe8" />
              <rect x="0" y="4" width="18" height="2" fill="#2fac66" />
            </svg>
            <span className="font-sans text-[15px] font-bold text-primary tracking-[-0.02em]">
              tradalyst
            </span>
          </Link>
          <p className="font-mono text-[9px] text-secondary mt-1 uppercase tracking-eyebrow">
            Admin
          </p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-[2px]">
          <Link href="/admin" className="nav-item rounded-md">
            <Users size={16} />
            <span>Usuarios</span>
          </Link>
          <Link href="/settings" className="nav-item rounded-md">
            <Settings size={16} />
            <span>Ajustes</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-5 lg:p-7 overflow-auto">{children}</main>
    </div>
  );
}
