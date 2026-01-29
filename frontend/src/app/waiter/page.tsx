"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { WaiterLayout } from "@/components/waiter/layout";
import { TableOrderCard } from "@/components/waiter/table-order-card";
import Link from "next/link";
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Bell,
  Plus,
  Eye,
  Timer,
  Utensils,
  MapPin
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

export default function WaiterDashboard() {
  const [user, setUser] = useState<WaiterUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("waiter_token");
    const userData = localStorage.getItem("waiter_user");
    const restaurantData = localStorage.getItem("waiter_restaurant");

    if (!token || !userData || !restaurantData) {
      router.push("/waiter/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setRestaurant(JSON.parse(restaurantData));
    } catch (error) {
      console.error("Error parsing stored data:", error);
      router.push("/waiter/login");
      return;
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !restaurant) {
    return null; // Will redirect to login
  }

  // Mock data for waiter dashboard
  const todayStats = {
    tablesServed: 12,
    ordersCompleted: 28,
    totalTips: 145.50,
    averageRating: 4.8,
    hoursWorked: 6.5,
    activeOrders: 5
  };

  const activeOrders = [
    {
      tableNumber: "5",
      status: "preparing" as const,
      customerName: "John Smith",
      customerInitials: "JS",
      orderTime: "14:30",
      items: [
        { name: "Margherita Pizza" },
        { name: "Caesar Salad" }
      ],
      totalAmount: 32.50,
      estimatedTime: 15,
      additionalItemsCount: 1
    },
    {
      tableNumber: "8",
      status: "ready" as const,
      customerName: "Sarah Johnson",
      customerInitials: "SJ",
      orderTime: "14:45",
      items: [
        { name: "Burger Deluxe" },
        { name: "Fries" },
        { name: "Milkshake" }
      ],
      totalAmount: 28.99,
      estimatedTime: 0
    },
    {
      tableNumber: "3",
      status: "pending" as const,
      customerName: "Mike Davis",
      customerInitials: "MD",
      orderTime: "15:00",
      items: [
        { name: "Pasta Carbonara" },
        { name: "Garlic Bread" }
      ],
      totalAmount: 24.75,
      estimatedTime: 20
    },
    {
      tableNumber: "12",
      status: "preparing" as const,
      customerName: "Lisa Wilson",
      customerInitials: "LW",
      orderTime: "15:10",
      items: [
        { name: "Grilled Salmon" },
        { name: "Rice" },
        { name: "Vegetables" }
      ],
      totalAmount: 45.80,
      estimatedTime: 25,
      additionalItemsCount: 1
    },
    {
      tableNumber: "7",
      status: "ready" as const,
      customerName: "Tom Brown",
      customerInitials: "TB",
      orderTime: "15:15",
      items: [
        { name: "Chicken Wings" },
        { name: "Beer" }
      ],
      totalAmount: 18.50,
      estimatedTime: 0
    }
  ];

  const recentActivity = [
    { action: "Order completed", table: "Table 4", time: "2 min ago", type: "success" },
    { action: "New order received", table: "Table 9", time: "5 min ago", type: "info" },
    { action: "Customer requested bill", table: "Table 6", time: "8 min ago", type: "warning" },
    { action: "Order ready for pickup", table: "Table 2", time: "12 min ago", type: "success" }
  ];

  const handleViewDetails = (tableNumber: string) => {
    console.log(`View details for table ${tableNumber}`);
    // Navigate to order details page
  };

  const handleUpdateStatus = (tableNumber: string, newStatus: string) => {
    console.log(`Update table ${tableNumber} status to ${newStatus}`);
    // Update order status logic here
  };

  const handleMoreActions = (tableNumber: string) => {
    console.log(`More actions for table ${tableNumber}`);
    // Show more actions menu
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning": return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "info": return <Bell className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <WaiterLayout title="Waiter Dashboard">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Tables</p>
              <p className="text-lg lg:text-2xl font-bold">{todayStats.tablesServed}</p>
            </div>
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Orders</p>
              <p className="text-lg lg:text-2xl font-bold">{todayStats.ordersCompleted}</p>
            </div>
            <ShoppingCart className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Tips</p>
              <p className="text-lg lg:text-2xl font-bold">₹{todayStats.totalTips}</p>
            </div>
            <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Rating</p>
              <p className="text-lg lg:text-2xl font-bold">{todayStats.averageRating}</p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Hours</p>
              <p className="text-lg lg:text-2xl font-bold">{todayStats.hoursWorked}</p>
            </div>
            <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Active</p>
              <p className="text-lg lg:text-2xl font-bold text-red-600">{todayStats.activeOrders}</p>
            </div>
            <Timer className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Active Orders ({activeOrders.length})
                  </CardTitle>
                  <CardDescription>Orders currently being processed</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="flex-1 sm:flex-none">
                    <Plus className="w-4 h-4 mr-2" />
                    New Order
                  </Button>
                  <Link href="/waiter/orders" className="flex-1 sm:flex-none">
                    <Button size="sm" variant="outline" className="w-full">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeOrders.map((order) => (
                <TableOrderCard
                  key={order.tableNumber}
                  order={order}
                  onViewDetails={() => handleViewDetails(order.tableNumber)}
                  onUpdateStatus={(status) => handleUpdateStatus(order.tableNumber, status)}
                  onMoreActions={() => handleMoreActions(order.tableNumber)}
                />
              ))}
              
              {activeOrders.length === 0 && (
                <div className="text-center py-8">
                  <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No active orders at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Shift Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Today's Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Shift Progress</span>
                  <span>{todayStats.hoursWorked}/8 hours</span>
                </div>
                <Progress value={(todayStats.hoursWorked / 8) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Daily Target</span>
                  <span>{todayStats.ordersCompleted}/30 orders</span>
                </div>
                <Progress value={(todayStats.ordersCompleted / 30) * 100} className="h-2" />
              </div>
              
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground mb-1">Performance</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs">Excellent</span>
                  </div>
                  <span className="text-sm font-medium">⭐ {todayStats.averageRating}/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/waiter/tables" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  Table Management
                </Button>
              </Link>
              
              <Link href="/waiter/orders/new" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Take New Order
                </Button>
              </Link>
              
              <Link href="/waiter/menu" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Utensils className="w-4 h-4 mr-2" />
                  View Menu
                </Button>
              </Link>
              
              <Link href="/waiter/reports" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  My Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.table}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WaiterLayout>
  );
}