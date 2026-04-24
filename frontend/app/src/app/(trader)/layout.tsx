import { cookies } from "next/headers";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import MentorSidebar from "@/components/layout/MentorSidebar";
import MentorBottomNav from "@/components/layout/MentorBottomNav";

function getRoleFromCookie(): string | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

export default function TraderLayout({ children }: { children: React.ReactNode }) {
  const role = getRoleFromCookie();
  const isMentor = role === "mentor";

  return (
    <div className="flex min-h-screen bg-base">
      {isMentor ? <MentorSidebar /> : <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-5 lg:p-7 pb-20 lg:pb-7 overflow-auto">
          {children}
        </main>
      </div>
      {isMentor ? <MentorBottomNav /> : <BottomNav />}
    </div>
  );
}
