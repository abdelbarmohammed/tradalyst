import Link from "next/link";
import { Eye, Settings, LogOut } from "lucide-react";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base">
      {/* Slim mentor sidebar */}
      <aside className="hidden lg:flex flex-col w-sidebar flex-shrink-0 bg-surface border-r border-white/[0.06] h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/mentor" className="flex items-center gap-2">
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
            Vista mentor
          </p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-[2px]">
          <Link href="/mentor" className="nav-item rounded-md">
            <Eye size={16} />
            <span>Mis traders</span>
          </Link>
          <Link href="/settings" className="nav-item rounded-md">
            <Settings size={16} />
            <span>Ajustes</span>
          </Link>
        </nav>
        <div className="px-2 py-4 border-t border-white/[0.06]">
          <form action="/api/auth/logout/" method="POST">
            <button type="submit" className="nav-item w-full rounded-md text-left">
              <LogOut size={16} />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-5 lg:p-7 overflow-auto">{children}</main>
    </div>
  );
}
