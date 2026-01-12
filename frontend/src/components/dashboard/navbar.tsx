"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggleSimple } from "@/components/theme-toggle";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  Search,
  Bell,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Plus,
  Menu
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathSegments.length > 1) {
      breadcrumbs.push({
        label: "Dashboard",
        href: "/dashboard",
        isActive: false
      });

      if (pathSegments[1] === "restaurants") {
        breadcrumbs.push({
          label: "Restaurants",
          href: "/dashboard/restaurants",
          isActive: true
        });
      } else if (pathSegments[1] === "orders") {
        breadcrumbs.push({
          label: "Orders",
          href: "/dashboard/orders",
          isActive: true
        });
      } else if (pathSegments[1] === "menu") {
        breadcrumbs.push({
          label: "Menu Items",
          href: "/dashboard/menu",
          isActive: true
        });
      } else if (pathSegments[1] === "customers") {
        breadcrumbs.push({
          label: "Customers",
          href: "/dashboard/customers",
          isActive: true
        });
      } else if (pathSegments[1] === "reviews") {
        breadcrumbs.push({
          label: "Reviews",
          href: "/dashboard/reviews",
          isActive: true
        });
      } else if (pathSegments[1] === "analytics") {
        breadcrumbs.push({
          label: "Analytics",
          href: "/dashboard/analytics",
          isActive: true
        });
      } else if (pathSegments[1] === "notifications") {
        breadcrumbs.push({
          label: "Notifications",
          href: "/dashboard/notifications",
          isActive: true
        });
      } else if (pathSegments[1] === "settings") {
        breadcrumbs.push({
          label: "Settings",
          href: "/dashboard/settings",
          isActive: true
        });
      } else if (pathSegments[1] === "help") {
        breadcrumbs.push({
          label: "Help & Support",
          href: "/dashboard/help",
          isActive: true
        });
      } else if (pathSegments[1] === "profile") {
        breadcrumbs.push({
          label: "Profile",
          href: "/dashboard/profile",
          isActive: true
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-14 lg:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background">
      <div className="flex items-center gap-2 px-3 lg:px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        {/* Breadcrumbs - Hidden on mobile */}
        {breadcrumbs.length > 0 ? (
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  <BreadcrumbItem>
                    {crumb.isActive ? (
                      <BreadcrumbPage className="line-clamp-1">{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="line-clamp-1">{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : (
          title && (
            <h1 className="text-base lg:text-lg font-semibold line-clamp-1 hidden sm:block">
              {title}
            </h1>
          )
        )}

        {/* Mobile Title - Only show on mobile */}
        <h1 className="text-base font-semibold line-clamp-1 sm:hidden">
          {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : title || "Dashboard"}
        </h1>
      </div>

      {/* Spacer */}
      <div className="ml-auto px-2 lg:px-3">
        <div className="flex items-center gap-1 lg:gap-2">
          {/* Search Bar - Desktop only */}
          <div className="relative hidden lg:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search restaurants, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[200px] xl:w-[300px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Add Restaurant Button - Hidden on small screens */}
            <Button asChild size="sm" className="hidden xl:flex">
              <Link href="/onboarding/create-shop">
                <Plus className="h-4 w-4 mr-2" />
                Add Restaurant
              </Link>
            </Button>

            {/* Add Restaurant Button - Icon only on medium screens */}
            <Button asChild size="sm" className="hidden lg:flex xl:hidden">
              <Link href="/onboarding/create-shop">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Restaurant</span>
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    Access your account and quick actions
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search restaurants, orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="grid gap-2">
                    <Button asChild className="justify-start">
                      <Link href="/onboarding/create-shop" onClick={() => setMobileMenuOpen(false)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Restaurant
                      </Link>
                    </Button>
                    
                    <ThemeToggleSimple />
                    
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/dashboard/help" onClick={() => setMobileMenuOpen(false)}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Help & Support
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Dark Mode Toggle */}
              <ThemeToggleSimple />

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      3
                    </Badge>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    <Badge variant="secondary" className="ml-2">3</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-64 overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">New Order Received</div>
                          <div className="text-sm text-muted-foreground">Pizza Palace - Order #1234</div>
                          <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
                        </div>
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">Restaurant Approved</div>
                          <div className="text-sm text-muted-foreground">Burger Barn is now live</div>
                          <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
                        </div>
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">Low Stock Alert</div>
                          <div className="text-sm text-muted-foreground">Sushi Spot - Salmon running low</div>
                          <div className="text-xs text-muted-foreground mt-1">3 hours ago</div>
                        </div>
                        <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center cursor-pointer">
                    <Link href="/dashboard/notifications" className="w-full text-center">
                      View All Notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/help">
                  <HelpCircle className="h-4 w-4" />
                  <span className="sr-only">Help</span>
                </Link>
              </Button>
            </div>

            {/* User Profile - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="Profile" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      john@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link href="/dashboard/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
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
        </div>
      </div>
    </header>
  );
}