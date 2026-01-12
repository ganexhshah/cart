"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { 
  Store, 
  Plus, 
  MoreHorizontal, 
  Users, 
  ShoppingCart, 
  Eye,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  BarChart3
} from "lucide-react";

export default function DashboardPage() {
  // Mock data
  const restaurants = [
    {
      id: 1,
      name: "Pizza Palace",
      logo: "/api/placeholder/40/40",
      status: "active",
      orders: 156,
      revenue: 12450,
      rating: 4.8,
      location: "Downtown"
    },
    {
      id: 2,
      name: "Burger Barn",
      logo: "/api/placeholder/40/40",
      status: "active",
      orders: 89,
      revenue: 8900,
      rating: 4.5,
      location: "Mall Area"
    },
    {
      id: 3,
      name: "Sushi Spot",
      logo: "/api/placeholder/40/40",
      status: "inactive",
      orders: 45,
      revenue: 6750,
      rating: 4.9,
      location: "City Center"
    }
  ];

  const recentOrders = [
    { id: "#001", restaurant: "Pizza Palace", customer: "John Doe", amount: 45.99, status: "completed", time: "2 min ago" },
    { id: "#002", restaurant: "Burger Barn", customer: "Jane Smith", amount: 32.50, status: "preparing", time: "5 min ago" },
    { id: "#003", restaurant: "Sushi Spot", customer: "Mike Johnson", amount: 78.25, status: "pending", time: "8 min ago" },
    { id: "#004", restaurant: "Pizza Palace", customer: "Sarah Wilson", amount: 56.75, status: "completed", time: "12 min ago" },
  ];

  // Chart data
  const revenueData = [
    { month: "Jan", revenue: 18500 },
    { month: "Feb", revenue: 22100 },
    { month: "Mar", revenue: 19800 },
    { month: "Apr", revenue: 25400 },
    { month: "May", revenue: 28100 },
    { month: "Jun", revenue: 31200 },
  ];

  const ordersByRestaurant = [
    { name: "Pizza Palace", orders: 156, percentage: 54 },
    { name: "Burger Barn", orders: 89, percentage: 31 },
    { name: "Sushi Spot", orders: 45, percentage: 15 },
  ];

  const dailyOrders = [
    { day: "Mon", orders: 42 },
    { day: "Tue", orders: 38 },
    { day: "Wed", orders: 51 },
    { day: "Thu", orders: 47 },
    { day: "Fri", orders: 65 },
    { day: "Sat", orders: 73 },
    { day: "Sun", orders: 58 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">290</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <span className="text-muted-foreground text-lg">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹28,100</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            </TabsList>
            
            <Link href="/onboarding/create-shop" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Restaurant
              </Button>
            </Link>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                  <CardDescription>Monthly revenue over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueData.map((item, index) => (
                      <div key={item.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.month}</span>
                        <div className="flex items-center gap-3 flex-1 mx-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(item.revenue / 35000) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[60px]">
                            ₹{(item.revenue / 1000).toFixed(1)}k
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Orders by Restaurant */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Orders by Restaurant
                  </CardTitle>
                  <CardDescription>Distribution of orders across restaurants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ordersByRestaurant.map((restaurant, index) => (
                      <div key={restaurant.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{restaurant.name}</span>
                          <span className="text-sm text-muted-foreground">{restaurant.orders} orders</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              index === 0 ? 'bg-green-600' : 
                              index === 1 ? 'bg-blue-600' : 'bg-purple-600'
                            }`}
                            style={{ width: `${restaurant.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Orders Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Daily Orders This Week
                  </CardTitle>
                  <CardDescription>Number of orders received each day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 h-64">
                    {dailyOrders.map((day, index) => (
                      <div key={day.day} className="flex flex-col items-center flex-1">
                        <div className="flex flex-col items-center justify-end h-48 w-full">
                          <div 
                            className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md w-full transition-all duration-300 hover:from-blue-700 hover:to-blue-500"
                            style={{ height: `${(day.orders / 80) * 100}%` }}
                          />
                        </div>
                        <div className="mt-2 text-center">
                          <div className="text-sm font-medium">{day.orders}</div>
                          <div className="text-xs text-muted-foreground">{day.day}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="restaurants">
            <Card>
              <CardHeader>
                <CardTitle>Your Restaurants</CardTitle>
                <CardDescription>
                  Manage and monitor your restaurant locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Restaurant</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">Orders</TableHead>
                        <TableHead className="hidden md:table-cell">Revenue</TableHead>
                        <TableHead className="hidden lg:table-cell">Rating</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {restaurants.map((restaurant) => (
                      <TableRow key={restaurant.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={restaurant.logo} alt={restaurant.name} />
                              <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{restaurant.name}</div>
                              <div className="text-sm text-muted-foreground">{restaurant.location}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(restaurant.status)} hidden sm:inline-flex`}>
                            {restaurant.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{restaurant.orders}</TableCell>
                        <TableCell className="hidden md:table-cell">₹{restaurant.revenue.toLocaleString()}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {restaurant.rating}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Latest orders across all your restaurants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Order ID</TableHead>
                        <TableHead className="hidden sm:table-cell min-w-[120px]">Restaurant</TableHead>
                        <TableHead className="hidden md:table-cell">Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell className="hidden sm:table-cell">{order.restaurant}</TableCell>
                          <TableCell className="hidden md:table-cell">{order.customer}</TableCell>
                          <TableCell>₹{order.amount}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground hidden lg:table-cell">{order.time}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </DashboardLayout>
  );
}