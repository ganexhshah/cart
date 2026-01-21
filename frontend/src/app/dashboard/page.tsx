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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { restaurantApi } from "@/lib/restaurants";
import { orderApi } from "@/lib/orders";
import { authApi } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        if (!authApi.isAuthenticated()) {
          router.push('/auth/login');
          return;
        }

        const storedUser = authApi.getStoredUser();
        setUser(storedUser);

        // Fetch restaurants
        const restaurantsResponse = await restaurantApi.getAll();
        setRestaurants(restaurantsResponse.data || []);

        // Fetch recent orders
        const ordersResponse = await orderApi.getAll({ limit: 10 });
        setOrders(ordersResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Calculate stats
  const totalRestaurants = restaurants.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const activeRestaurants = restaurants.filter(r => r.is_active).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      case "completed": return "bg-green-100 text-green-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-purple-100 text-purple-800";
      case "served": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    
    try {
      await restaurantApi.delete(id);
      setRestaurants(restaurants.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
      alert('Failed to delete restaurant');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
              <div className="text-2xl font-bold">{totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">
                {activeRestaurants} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Recent orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <span className="text-muted-foreground text-lg">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Number(totalRevenue || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From recent orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Welcome</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.fullName || 'Owner'}</div>
              <p className="text-xs text-muted-foreground">
                {user?.email}
              </p>
            </CardContent>
          </Card>
      </div>

      {/* Main Content Tabs */}
        <Tabs defaultValue="restaurants" className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
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

          <TabsContent value="restaurants">
            {restaurants.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Store className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Restaurants Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first restaurant to get started</p>
                  <Link href="/onboarding/create-shop">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Restaurant
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
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
                          <TableHead className="hidden lg:table-cell">Rating</TableHead>
                          <TableHead className="hidden md:table-cell">Phone</TableHead>
                          <TableHead className="w-[70px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {restaurants.map((restaurant) => (
                        <TableRow key={restaurant.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                                <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{restaurant.name}</div>
                                <div className="text-sm text-muted-foreground">{restaurant.city || restaurant.address}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(restaurant.is_active ? 'active' : 'inactive')} hidden sm:inline-flex`}>
                              {restaurant.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              {restaurant.rating || '0.0'}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{restaurant.phone || 'N/A'}</TableCell>
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
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteRestaurant(restaurant.id)}
                                >
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
            )}
          </TabsContent>

          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                  <p className="text-gray-600">Orders will appear here once customers start ordering</p>
                </CardContent>
              </Card>
            ) : (
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
                          <TableHead className="min-w-[100px]">Order #</TableHead>
                          <TableHead className="hidden md:table-cell">Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead className="hidden sm:table-cell">Status</TableHead>
                          <TableHead className="hidden lg:table-cell">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.order_number}</TableCell>
                            <TableCell className="hidden md:table-cell">{order.customer_name || 'Guest'}</TableCell>
                            <TableCell>₹{order.total}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden lg:table-cell capitalize">{order.order_type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
    </DashboardLayout>
  );
}
