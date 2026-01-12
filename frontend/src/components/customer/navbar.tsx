"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggleSimple } from "@/components/theme-toggle";
import { 
  Search,
  Bell,
  ShoppingCart,
  Users,
  MapPin,
  Menu,
  User,
  Settings,
  LogOut,
  Home,
  Utensils
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface CustomerNavbarProps {
  selectedTable?: string;
  cartItemCount?: number;
  onTableSelect?: () => void;
  onCartOpen?: () => void;
  onCallWaiter?: () => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export function CustomerNavbar({ 
  selectedTable, 
  cartItemCount = 0, 
  onTableSelect,
  onCartOpen,
  onCallWaiter,
  searchTerm = "",
  onSearchChange
}: CustomerNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-slate-900 text-white p-2 rounded-lg">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Restaurant</h1>
                <p className="text-xs text-gray-500">Delicious Food Awaits</p>
              </div>
            </Link>
            
            {selectedTable && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hidden sm:flex">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedTable}
              </Badge>
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
          
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Table Selection */}
            <Button 
              variant="outline" 
              onClick={onTableSelect}
              className="flex items-center gap-2 h-9"
            >
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">{selectedTable || "Select Table"}</span>
              <span className="lg:hidden">{selectedTable ? selectedTable.split(' ')[1] : "Table"}</span>
            </Button>

            {/* Call Waiter */}
            <Button 
              variant="outline" 
              onClick={onCallWaiter}
              className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200 h-9"
            >
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Call Waiter</span>
              <span className="lg:hidden">Waiter</span>
            </Button>

            {/* Cart */}
            <Button 
              onClick={onCartOpen}
              className="relative bg-slate-900 hover:bg-slate-800 text-white h-9"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Cart</span>
              <span className="lg:hidden">Cart</span>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <ThemeToggleSimple />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="Profile" />
                    <AvatarFallback>CU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Customer</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      customer@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {selectedTable && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                {selectedTable}
              </Badge>
            )}
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="bg-slate-900 text-white p-2 rounded-lg">
                      <Utensils className="w-4 h-4" />
                    </div>
                    Restaurant Menu
                  </SheetTitle>
                  <SheetDescription>
                    Browse menu and manage your order
                  </SheetDescription>
                </SheetHeader>
                
                <div className="grid gap-4 py-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="grid gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        onTableSelect?.();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {selectedTable || "Select Table"}
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => {
                        onCallWaiter?.();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Call Waiter
                    </Button>

                    <Button 
                      onClick={() => {
                        onCartOpen?.();
                        setMobileMenuOpen(false);
                      }}
                      className="justify-start bg-slate-900 hover:bg-slate-800 text-white relative"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Cart
                      {cartItemCount > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs">
                          {cartItemCount}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  {/* Mobile User Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/api/placeholder/40/40" alt="Profile" />
                        <AvatarFallback>CU</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Customer</p>
                        <p className="text-xs text-muted-foreground">customer@example.com</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          My Orders
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </Button>

                      <ThemeToggleSimple />
                      
                      <Button variant="ghost" className="justify-start text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}