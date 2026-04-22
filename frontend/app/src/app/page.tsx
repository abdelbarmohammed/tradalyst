import { redirect } from "next/navigation";

// Root "/" is handled by middleware.ts which redirects based on JWT role.
// This page is a fallback for unauthenticated users with no token.
export default function RootPage() {
  redirect("/login");
}
