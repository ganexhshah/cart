"use client";

import { WaiterSidebar } from "./sidebar";
import { WaiterNavbar } from "./navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

interface WaiterLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function WaiterLayout({ children, title }: WaiterLayoutProps) {
  return (
    <SidebarProvider>
      <WaiterSidebar />
      <SidebarInset className="flex flex-col">
        <WaiterNavbar title={title} />
        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}