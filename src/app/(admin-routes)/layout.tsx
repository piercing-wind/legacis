import "../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Session } from "@/actions/session";
import { notFound } from "next/navigation";


export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await Session();
  if (!session) {
    notFound();
  }
  if (session?.user?.role !== "ADMIN") {
    notFound();
  }

  return (
    <SidebarProvider className="">
      <AppSidebar />
      <SidebarTrigger />
      {children}
    </SidebarProvider>
  );
}
