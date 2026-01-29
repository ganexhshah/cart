"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Store, 
  LayoutDashboard,
  ShoppingCart, 
  TrendingUp,
  Users,
  Settings,
  Receipt,
  Star,
  Bell,
  User,
  ChevronDown,
  HelpCircle,
  Utensils,
  UserCheck,
  ClipboardList,
  UsersRound,
  LogOut,
  CreditCard,
  Package,
  Truck,
  Grid3x3
} from "lucide-react";
import { authApi } from "@/lib/auth";
import { restaurantApi } from "@/lib/restaurants";

const navMain = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Restaurants",
        url: "/dashboard/restaurants",
        icon: Store,
      },
      {
        title: "Floor Management",
        url: "/dashboard/floor-management",
        icon: Grid3x3,
      },
      {
        title: "Orders",
        url: "/dashboard/orders",
        icon: ShoppingCart,
      },
      {
        title: "KOT Management",
        url: "/dashboard/kot",
        icon: ClipboardList,
      },
      {
        title: "POS System",
        url: "/dashboard/pos",
        icon: CreditCard,
      },
      {
        title: "Menu Items",
        url: "/dashboard/menu",
        icon: Utensils,
      },
      {
        title: "Tables",
        url: "/dashboard/tables",
        icon: Utensils,
      },
      {
        title: "Waiters",
        url: "/dashboard/waiters",
        icon: UserCheck,
      },
      {
        title: "Staff",
        url: "/dashboard/staff",
        icon: UsersRound,
      },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: Users,
      },
    ],
  },
  {
    title: "Inventory & Purchasing",
    items: [
      {
        title: "Inventory & Stock",
        url: "/dashboard/inventory",
        icon: Package,
      },
      {
        title: "Purchase Management",
        url: "/dashboard/purchases",
        icon: Truck,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Reviews",
        url: "/dashboard/reviews",
        icon: Star,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: TrendingUp,
      },
      {
        title: "Notifications",
        url: "/dashboard/notifications",
        icon: Bell,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Help & Support",
        url: "/dashboard/help",
        icon: HelpCircle,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);

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

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        {/* User Profile Section - Expanded State */}
        <div className="group-data-[collapsible=icon]:hidden p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-3 h-auto hover:bg-sidebar-accent">
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none truncate">{user?.fullName || 'User'}</p>
                      <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                    </div>
                    {restaurant && (
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-4 w-4 shrink-0">
                          <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                          <AvatarFallback className="text-xs">{restaurant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-muted-foreground truncate">{restaurant.name}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName || 'User'}</p>
                  {restaurant && (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                        <AvatarFallback className="text-xs">{restaurant.name.charAt(0)}</AvatarFallback>
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
                  <span>Edit Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/restaurants">
                  <Store className="mr-2 h-4 w-4" />
                  <span>Edit Shop</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile Section - Collapsed State */}
        <div className="group-data-[collapsible=icon]:flex hidden justify-center p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName || 'User'}</p>
                  {restaurant && (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                        <AvatarFallback className="text-xs">{restaurant.name.charAt(0)}</AvatarFallback>
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
                  <span>Edit Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/restaurants">
                  <Store className="mr-2 h-4 w-4" />
                  <span>Edit Shop</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url || 
                    (item.url !== "/dashboard" && pathname.startsWith(item.url));
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      
      <SidebarFooter>
        <div className="text-xs text-muted-foreground text-center p-2 group-data-[collapsible=icon]:hidden">
          © 2026 foodemenu
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}