"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Home,
  Utensils,
  ShoppingCart,
  MapPin,
  Clock,
  TrendingUp,
  Settings,
  User,
  ChevronDown,
  HelpCircle,
  Bell,
  Timer,
  Receipt,
  Users
} from "lucide-react";

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

const navItems = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        url: "/waiter",
        icon: Home,
      },
    ],
  },
  {
    title: "Service",
    items: [
      {
        title: "Active Orders",
        url: "/waiter/orders",
        icon: ShoppingCart,
        badge: 5
      },
      {
        title: "Table Management",
        url: "/waiter/tables",
        icon: MapPin,
      },
      {
        title: "Menu Items",
        url: "/waiter/menu",
        icon: Utensils,
      },
      {
        title: "Take Order",
        url: "/waiter/orders/new",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Performance",
    items: [
      {
        title: "My Reports",
        url: "/waiter/reports",
        icon: TrendingUp,
      },
      {
        title: "Shift History",
        url: "/waiter/shifts",
        icon: Clock,
      },
      {
        title: "Customer Feedback",
        url: "/waiter/feedback",
        icon: Users,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Notifications",
        url: "/waiter/notifications",
        icon: Bell,
        badge: 3
      },
      {
        title: "Settings",
        url: "/waiter/settings",
        icon: Settings,
      },
      {
        title: "Help & Support",
        url: "/waiter/help",
        icon: HelpCircle,
      },
    ],
  },
];

export function WaiterSidebar() {
  const [user, setUser] = useState<WaiterUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const pathname = usePathname();

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

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRestaurantInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
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
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName || "Waiter"} />
                    <AvatarFallback>
                      {user ? getUserInitials(user.fullName) : "W"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none truncate">
                        {user?.fullName || "Waiter"}
                      </p>
                      <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {user?.role || "Staff"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-4 w-4 shrink-0">
                        <AvatarFallback className="text-xs">
                          {restaurant ? getRestaurantInitial(restaurant.name) : "R"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground truncate">
                        {restaurant?.name || "Restaurant"}
                      </p>
                    </div>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || "Waiter"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role || "Staff"} • {user?.staffNumber || "N/A"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">
                        {restaurant ? getRestaurantInitial(restaurant.name) : "R"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      {restaurant?.name || "Restaurant"}
                    </p>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || ""}
                  </p>
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
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Shift Status */}
          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-800">On Duty</span>
              </div>
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-700">Day Shift</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-green-700">
              5 active orders
            </div>
          </div>
        </div>

        {/* User Profile Section - Collapsed State */}
        <div className="group-data-[collapsible=icon]:flex hidden justify-center p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-sidebar-accent relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} alt={user?.fullName || "Waiter"} />
                  <AvatarFallback>
                    {user ? getUserInitials(user.fullName) : "W"}
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  5
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || "Waiter"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role || "Staff"} • {user?.staffNumber || "N/A"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">
                        {restaurant ? getRestaurantInitial(restaurant.name) : "R"}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">
                      {restaurant?.name || "Restaurant"}
                    </p>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || ""}
                  </p>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {navItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url || 
                    (item.url !== "/waiter" && pathname.startsWith(item.url));
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <item.icon />
                            <span>{item.title}</span>
                          </div>
                          {item.badge && (
                            <Badge className="ml-auto bg-red-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center">
                              {item.badge}
                            </Badge>
                          )}
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
          © 2026 foodemenu - Waiter App
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}