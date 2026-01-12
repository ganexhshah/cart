"use client";

import { CustomerNavbar } from "./navbar";

interface CustomerLayoutProps {
  children: React.ReactNode;
  selectedTable?: string;
  cartItemCount?: number;
  onTableSelect?: () => void;
  onCartOpen?: () => void;
  onCallWaiter?: () => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export function CustomerLayout({
  children,
  selectedTable,
  cartItemCount = 0,
  onTableSelect,
  onCartOpen,
  onCallWaiter,
  searchTerm = "",
  onSearchChange
}: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar
        selectedTable={selectedTable}
        cartItemCount={cartItemCount}
        onTableSelect={onTableSelect}
        onCartOpen={onCartOpen}
        onCallWaiter={onCallWaiter}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
      <main>{children}</main>
    </div>
  );
}