import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center gap-2 px-4 py-2 border-b border-border/40">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-x-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}