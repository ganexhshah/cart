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
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/auth";
import { restaurantApi } from "@/lib/restaurants";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = authApi.getStoredUser();
      setUser(storedUser);

      // Fetch user's restaurants (get the first one as primary)
      if (storedUser?.role === 'owner' || storedUser?.role === 'admin') {
        try {
          const response = await restaurantApi.getAll();
          if (response.success && response.data && response.data.length > 0) {
            // Use the first restaurant as primary
            setRestaurant(response.data[0]);
          }
        } catch (error) {
          console.error('Failed to fetch restaurants:', error);
          // Don't show error to user, just log it
        }
      }
    };

    // Only fetch if user is authenticated
    if (authApi.isAuthenticated()) {
      fetchUserData();
    }
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/auth/login');
  };

  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  };

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
                  {/* User & Restaurant Info */}
                  {(user || restaurant) && (
                    <div className="border-b pb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user?.fullName || 'User'}</p>
                          {restaurant && (
                            <div className="flex items-center gap-2 mt-1">
                              <Avatar className="h-4 w-4">
                                <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                                <AvatarFallback className="text-xs">{restaurant.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <p className="text-xs text-muted-foreground truncate">{restaurant.name}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                      0
                    </Badge>
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    <Badge variant="secondary" className="ml-2">0</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
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
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName || 'User'}</p>
                    {restaurant && (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                          <AvatarFallback className="text-xs">{restaurant.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-muted-foreground">{restaurant.name}</p>
                      </div>
                    )}
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
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
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
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