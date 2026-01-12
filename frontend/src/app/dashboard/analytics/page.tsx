"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard/layout";
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Users, 
  ShoppingCart, 
  Clock,
  Target,
  Calendar,
  Download,
  RefreshCw
} from "lucide-react";

export default function AnalyticsPage() {
  // Mock analytics data
  const overviewStats = [
    {
      title: "Total Revenue",
      value: "₹45,231",
      change: "+12.5%",
      trend: "up",
      period: "vs last month",
      icon: () => <span className="text-green-600 text-lg font-bold">₹</span>
    },
    {
      title: "Total Orders",
      value: "1,247",
      change: "+8.2%",
      trend: "up",
      period: "vs last month",
      icon: ShoppingCart
    },
    {
      title: "New Customers",
      value: "234",
      change: "-2.1%",
      trend: "down",
      period: "vs last month",
      icon: Users
    },
    {
      title: "Avg Order Value",
      value: "₹36.28",
      change: "+4.7%",
      trend: "up",
      period: "vs last month",
      icon: Target
    }
  ];

  const revenueData = [
    { month: "Jan", revenue: 18500, orders: 420, customers: 180 },
    { month: "Feb", revenue: 22100, orders: 510, customers: 220 },
    { month: "Mar", revenue: 19800, orders: 480, customers: 195 },
    { month: "Apr", revenue: 25400, orders: 580, customers: 250 },
    { month: "May", revenue: 28100, orders: 640, customers: 280 },
    { month: "Jun", revenue: 31200, orders: 720, customers: 310 }
  ];

  const topProducts = [
    { name: "Margherita Pizza", revenue: 8450, orders: 156, growth: "+15%" },
    { name: "Classic Burger", revenue: 6720, orders: 134, growth: "+8%" },
    { name: "Chicken Wings", revenue: 5880, orders: 98, growth: "+22%" },
    { name: "Caesar Salad", revenue: 3915, orders: 87, growth: "+5%" },
    { name: "Pasta Carbonara", revenue: 4560, orders: 76, growth: "+12%" }
  ];

  const customerSegments = [
    { segment: "New Customers", count: 234, percentage: 35, color: "bg-blue-500" },
    { segment: "Returning Customers", count: 456, percentage: 45, color: "bg-green-500" },
    { segment: "VIP Customers", count: 89, percentage: 20, color: "bg-purple-500" }
  ];

  const hourlyData = [
    { hour: "6 AM", orders: 12 },
    { hour: "9 AM", orders: 28 },
    { hour: "12 PM", orders: 65 },
    { hour: "3 PM", orders: 42 },
    { hour: "6 PM", orders: 89 },
    { hour: "9 PM", orders: 67 },
    { hour: "12 AM", orders: 23 }
  ];

  const restaurantPerformance = [
    { name: "Pizza Palace", revenue: 18500, orders: 234, rating: 4.8, growth: "+18%" },
    { name: "Burger Barn", revenue: 15200, orders: 189, rating: 4.5, growth: "+12%" },
    { name: "Sushi Spot", revenue: 11500, orders: 156, rating: 4.9, growth: "+25%" }
  ];

  return (
    <DashboardLayout title="Analytics Dashboard">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Button size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{item.month}</span>
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

            {/* Hourly Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Orders by Hour
                </CardTitle>
                <CardDescription>Peak ordering times today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-2 h-48">
                  {hourlyData.map((hour) => (
                    <div key={hour.hour} className="flex flex-col items-center flex-1">
                      <div className="flex flex-col items-center justify-end h-32 w-full">
                        <div 
                          className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-md w-full transition-all duration-300"
                          style={{ height: `${(hour.orders / 100) * 100}%` }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-xs font-medium">{hour.orders}</div>
                        <div className="text-xs text-muted-foreground">{hour.hour}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>Detailed revenue breakdown by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {revenueData.map((item) => (
                    <div key={item.month} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.month}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">₹{item.revenue.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{item.orders} orders</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(item.revenue / 35000) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>Key revenue metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-xl font-bold text-green-700">₹145,000</div>
                    <div className="text-xs text-green-600">+12% vs last period</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Avg Monthly</div>
                    <div className="text-xl font-bold text-blue-700">₹24,167</div>
                    <div className="text-xs text-blue-600">Consistent growth</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Best Month</div>
                    <div className="text-xl font-bold text-purple-700">June</div>
                    <div className="text-xs text-purple-600">₹31,200 revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Top Performing Products
              </CardTitle>
              <CardDescription>
                Your best-selling menu items and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.orders} orders • ₹{product.revenue.toLocaleString()} revenue
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600 mb-1">
                        {product.growth}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        ₹{(product.revenue / product.orders).toFixed(2)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Customer Segments
                </CardTitle>
                <CardDescription>Breakdown of customer types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegments.map((segment) => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{segment.segment}</span>
                        <span className="text-sm text-muted-foreground">
                          {segment.count} ({segment.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${segment.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Insights</CardTitle>
                <CardDescription>Key customer behavior metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Customer Lifetime Value</div>
                      <div className="text-sm text-muted-foreground">Average per customer</div>
                    </div>
                    <div className="text-xl font-bold text-blue-700">₹156</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Retention Rate</div>
                      <div className="text-sm text-muted-foreground">Customers who return</div>
                    </div>
                    <div className="text-xl font-bold text-green-700">68%</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Avg Order Frequency</div>
                      <div className="text-sm text-muted-foreground">Orders per month</div>
                    </div>
                    <div className="text-xl font-bold text-purple-700">3.2</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Restaurant Performance Comparison
              </CardTitle>
              <CardDescription>
                Compare performance across all your restaurants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {restaurantPerformance.map((restaurant, index) => (
                  <div key={restaurant.name} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-green-500' : 
                          index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                        }`} />
                        <span className="font-medium">{restaurant.name}</span>
                        <Badge variant="outline" className="text-green-600">
                          {restaurant.growth}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rating: {restaurant.rating}/5
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Revenue: </span>
                        <span className="font-medium">₹{restaurant.revenue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Orders: </span>
                        <span className="font-medium">{restaurant.orders}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === 0 ? 'bg-green-500' : 
                          index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${(restaurant.revenue / 20000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}