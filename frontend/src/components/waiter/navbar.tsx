"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Menu,
  Clock,
  Timer,
  Utensils,
  MapPin,
  Receipt
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface WaiterNavbarProps {
  title?: string;
}

interface WaiterUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  staffId: string;
  staffNumber: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  slug: string;
}

export function WaiterNavbar({ title }: WaiterNavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<WaiterUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Get user and restaurant data from localStorage
    const userData = localStorage.getItem("waiter_user");
    const restaurantData = localStorage.getItem("waiter_restaurant");

    if (userData && restaurantData) {
      try {
        setUser(JSON.parse(userData));
        setRestaurant(JSON.parse(restaurantData));
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("waiter_token");
    localStorage.removeItem("waiter_user");
    localStorage.removeItem("waiter_restaurant");
    router.push("/waiter/login");
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathSegments.length > 1) {
      breadcrumbs.push({
        label: "Waiter Dashboard",
        href: "/waiter",
        isActive: false
      });

      if (pathSegments[1] === "orders") {
        if (pathSegments[2] === "new") {
          breadcrumbs.push({
            label: "Orders",
            href: "/waiter/orders",
            isActive: false
          });
          breadcrumbs.push({
            label: "New Order",
            href: "/waiter/orders/new",
            isActive: true
          });
        } else {
          breadcrumbs.push({
            label: "Active Orders",
            href: "/waiter/orders",
            isActive: true
          });
        }
      } else if (pathSegments[1] === "tables") {
        breadcrumbs.push({
          label: "Table Management",
          href: "/waiter/tables",
          isActive: true
        });
      } else if (pathSegments[1] === "menu") {
        breadcrumbs.push({
          label: "Menu Items",
          href: "/waiter/menu",
          isActive: true
        });
      } else if (pathSegments[1] === "reports") {
        breadcrumbs.push({
          label: "My Reports",
          href: "/waiter/reports",
          isActive: true
        });
      } else if (pathSegments[1] === "shifts") {
        breadcrumbs.push({
          label: "Shift History",
          href: "/waiter/shifts",
          isActive: true
        });
      } else if (pathSegments[1] === "feedback") {
        breadcrumbs.push({
          label: "Customer Feedback",
          href: "/waiter/feedback",
          isActive: true
        });
      } else if (pathSegments[1] === "notifications") {
        breadcrumbs.push({
          label: "Notifications",
          href: "/waiter/notifications",
          isActive: true
        });
      } else if (pathSegments[1] === "settings") {
        breadcrumbs.push({
          label: "Settings",
          href: "/waiter/settings",
          isActive: true
        });
      } else if (pathSegments[1] === "help") {
        breadcrumbs.push({
          label: "Help & Support",
          href: "/waiter/help",
          isActive: true
        });
      } else if (pathSegments[1] === "profile") {
        breadcrumbs.push({
          label: "My Profile",
          href: "/waiter/profile",
          isActive: true
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-14 lg:h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-background">
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
          {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : title || "Waiter Dashboard"}
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
              placeholder="Search tables, orders, menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-50 xl:w-75"
            />
          </div>

          {/* Shift Status - Desktop only */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">On Duty</span>
            <div className="flex items-center gap-1 ml-2">
              <Timer className="w-3 h-3 text-green-600" />
              <span className="text-sm text-green-700">6.5h</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Quick Action Buttons - Hidden on small screens */}
            <Button asChild size="sm" className="hidden xl:flex bg-blue-600 hover:bg-blue-700">
              <Link href="/waiter/orders/new">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Link>
            </Button>

            {/* Quick Action Button - Icon only on medium screens */}
            <Button asChild size="sm" className="hidden lg:flex xl:hidden bg-blue-600 hover:bg-blue-700">
              <Link href="/waiter/orders/new">
                <Plus className="h-4 w-4" />
                <span className="sr-only">New Order</span>
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
              <SheetContent side="right" className="w-75 sm:w-100">
                <SheetHeader>
                  <SheetTitle>Waiter Menu</SheetTitle>
                  <SheetDescription>
                    Quick access to waiter functions
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search tables, orders, menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  {/* Shift Status - Mobile */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">On Duty - Day Shift</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Timer className="w-3 h-3 text-green-600" />
                      <span className="text-sm text-green-700">6.5h</span>
                    </div>
                  </div>
                  
                  {/* Mobile Actions */}
                  <div className="grid gap-2">
                    <Button asChild className="justify-start">
                      <Link href="/waiter/orders/new" onClick={() => setMobileMenuOpen(false)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Take New Order
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/waiter/tables" onClick={() => setMobileMenuOpen(false)}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Table Management
                      </Link>
                    </Button>
                    
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/waiter/menu" onClick={() => setMobileMenuOpen(false)}>
                        <Utensils className="h-4 w-4 mr-2" />
                        View Menu
                      </Link>
                    </Button>
                    
                    <ThemeToggleSimple />
                    
                    <Button variant="outline" asChild className="justify-start">
                      <Link href="/waiter/help" onClick={() => setMobileMenuOpen(false)}>
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
                          <div className="font-medium">Table 5 Ready</div>
                          <div className="text-sm text-muted-foreground">Order #T001 is ready for pickup</div>
                          <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
                        </div>
                        <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">New Order</div>
                          <div className="text-sm text-muted-foreground">Table 8 placed a new order</div>
                          <div className="text-xs text-muted-foreground mt-1">5 minutes ago</div>
                        </div>
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start p-4 cursor-pointer">
                      <div className="flex w-full items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">Customer Request</div>
                          <div className="text-sm text-muted-foreground">Table 3 requested the bill</div>
                          <div className="text-xs text-muted-foreground mt-1">8 minutes ago</div>
                        </div>
                        <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center cursor-pointer">
                    <Link href="/waiter/notifications" className="w-full text-center">
                      View All Notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Help */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/waiter/help">
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
                    <AvatarImage src={user?.avatarUrl} alt="Profile" />
                    <AvatarFallback>
                      {user ? getUserInitials(user.fullName) : "W"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.fullName || "Waiter"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role || "Staff"} • {user?.staffNumber || "N/A"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || ""}
                    </p>
                    {restaurant && (
                      <p className="text-xs leading-none text-muted-foreground font-medium">
                        {restaurant.name}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/waiter/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/waiter/shifts">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Shift Details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/waiter/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link href="/waiter/help">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>End Shift & Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}