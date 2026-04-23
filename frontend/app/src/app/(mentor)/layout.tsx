import MentorSidebar from "@/components/layout/MentorSidebar";
import MentorBottomNav from "@/components/layout/MentorBottomNav";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-base">
      <MentorSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-5 lg:p-7 pb-20 lg:pb-7 overflow-auto">
          {children}
        </main>
      </div>
      <MentorBottomNav />
    </div>
  );
}
