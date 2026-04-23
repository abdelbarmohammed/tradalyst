import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminBottomNav from "@/components/layout/AdminBottomNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-5 lg:p-7 pb-20 lg:pb-7 overflow-auto">
          {children}
        </main>
      </div>
      <AdminBottomNav />
    </div>
  );
}
