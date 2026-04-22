import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-5 lg:p-7 pb-20 lg:pb-7 overflow-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
