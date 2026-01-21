"use client";

import { DashboardLayout } from "@/components/dashboard/layout";

export default function POSPage() {
  return (
    <DashboardLayout title="POS Management">
      <div className="p-6">
        <h1 className="text-2xl font-bold">POS Management</h1>
        <p>Point of Sale system management interface</p>
      </div>
    </DashboardLayout>
  );
}