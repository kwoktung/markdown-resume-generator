import { redirect } from "next/navigation";
import { getNextAuthSessionAsync } from "@/lib/auth";
import { AutoSaveProvider } from "@/app/(protected)/editor/auto-save-context";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getNextAuthSessionAsync();
  if (!session) {
    redirect("/sign-in");
  }
  return <AutoSaveProvider>{children}</AutoSaveProvider>;
}
