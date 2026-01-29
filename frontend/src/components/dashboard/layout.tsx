"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { authApi } from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication on mount (client-side only)
    if (!authApi.isAuthenticated()) {
      router.push('/auth/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Show nothing while checking auth to avoid hydration mismatch
  if (isChecking) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
      <Toaster position="top-right" />
    </SidebarProvider>
  );
}