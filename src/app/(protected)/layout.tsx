import { redirect } from "next/navigation";
import { getNextAuthSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getNextAuthSession();
  if (!session) {
    redirect("/sign-in");
  }
  return <>{children}</>;
}
