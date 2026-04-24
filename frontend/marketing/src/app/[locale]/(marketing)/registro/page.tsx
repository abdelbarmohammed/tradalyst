import { redirect } from "next/navigation";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.tradalyst.com";

export default function RegistroRedirect() {
  redirect(`${APP_URL}/registro`);
}
