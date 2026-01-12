"use client";

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
  HelpCircle
} from "lucide-react";

const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    restaurant: "Pizza Palace",
    avatar: "/api/placeholder/40/40",
    restaurantLogo: "/api/placeholder/32/32"
  },
  navMain: [
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
          title: "Orders",
          url: "/dashboard/orders",
          icon: ShoppingCart,
        },
        {
          title: "Menu Items",
          url: "/dashboard/menu",
          icon: Receipt,
        },
        {
          title: "Customers",
          url: "/dashboard/customers",
          icon: Users,
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
  ],
};

export function AppSidebar() {
  const pathname = usePathname();

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
                    <AvatarImage src={data.user.avatar} alt={data.user.name} />
                    <AvatarFallback>{data.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none truncate">{data.user.name}</p>
                      <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-4 w-4 shrink-0">
                        <AvatarImage src={data.user.restaurantLogo} alt={data.user.restaurant} />
                        <AvatarFallback className="text-xs">{data.user.restaurant.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs text-muted-foreground truncate">{data.user.restaurant}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{data.user.email}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{data.user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={data.user.restaurantLogo} alt={data.user.restaurant} />
                      <AvatarFallback className="text-xs">{data.user.restaurant.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">{data.user.restaurant}</p>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {data.user.email}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Profile Section - Collapsed State */}
        <div className="group-data-[collapsible=icon]:flex hidden justify-center p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={data.user.avatar} alt={data.user.name} />
                  <AvatarFallback>{data.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" side="right" sideOffset={8}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{data.user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={data.user.restaurantLogo} alt={data.user.restaurant} />
                      <AvatarFallback className="text-xs">{data.user.restaurant.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-muted-foreground">{data.user.restaurant}</p>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground">
                    {data.user.email}
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {data.navMain.map((group) => (
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