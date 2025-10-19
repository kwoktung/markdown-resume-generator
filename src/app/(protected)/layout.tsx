import { redirect } from "next/navigation";
import { getNextAuthSessionAsync } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getNextAuthSessionAsync();
  if (!session) {
    redirect("/sign-in");
  }
  return <>{children}</>;
}
