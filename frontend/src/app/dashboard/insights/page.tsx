"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard/layout";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  ShoppingCart, 
  Clock,
  Star,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

export default function InsightsPage() {
  // Mock insights data
  const performanceMetrics = [
    {
      title: "Revenue Growth",
      value: "+23.5%",
      change: "+4.2%",
      trend: "up",
      period: "vs last month",
      icon: () => <span className="text-green-600 text-lg font-bold">₹</span>,
      color: "text-green-600"
    },
    {
      title: "Order Volume",
      value: "1,247",
      change: "+12.8%",
      trend: "up",
      period: "vs last month",
      icon: ShoppingCart,
      color: "text-blue-600"
    },
    {
      title: "Customer Retention",
      value: "84.2%",
      change: "-2.1%",
      trend: "down",
      period: "vs last month",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Avg Order Value",
      value: "₹42.85",
      change: "+8.7%",
      trend: "up",
      period: "vs last month",
      icon: Target,
      color: "text-orange-600"
    }
  ];

  const topPerformingItems = [
    { name: "Margherita Pizza", orders: 156, revenue: 2340, growth: "+15%" },
    { name: "Classic Burger", orders: 134, revenue: 2010, growth: "+8%" },
    { name: "Chicken Wings", orders: 98, revenue: 1470, growth: "+22%" },
    { name: "Caesar Salad", orders: 87, revenue: 1305, growth: "+5%" },
    { name: "Pasta Carbonara", orders: 76, revenue: 1140, growth: "+12%" }
  ];

  const customerInsights = [
    { metric: "Peak Hours", value: "6-8 PM", description: "Highest order volume" },
    { metric: "Avg Session", value: "4.2 min", description: "Time spent browsing" },
    { metric: "Return Rate", value: "68%", description: "Customers who reorder" },
    { metric: "Rating", value: "4.7/5", description: "Average customer rating" }
  ];

  const weeklyTrends = [
    { day: "Mon", orders: 45, revenue: 1890 },
    { day: "Tue", orders: 52, revenue: 2180 },
    { day: "Wed", orders: 48, revenue: 2010 },
    { day: "Thu", orders: 61, revenue: 2550 },
    { day: "Fri", orders: 78, revenue: 3270 },
    { day: "Sat", orders: 89, revenue: 3730 },
    { day: "Sun", orders: 67, revenue: 2810 }
  ];

  const restaurantComparison = [
    { name: "Pizza Palace", orders: 234, revenue: 9840, rating: 4.8, growth: "+18%" },
    { name: "Burger Barn", orders: 189, revenue: 7560, rating: 4.5, growth: "+12%" },
    { name: "Sushi Spot", orders: 156, revenue: 8970, rating: 4.9, growth: "+25%" }
  ];

  return (
    <DashboardLayout title="Business Insights">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={metric.trend === "up" ? "text-green-600" : "text-red-600"}>
                  {metric.change}
                </span>
                <span className="text-muted-foreground">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Insights Tabs */}
      <Tabs defaultValue="performance" className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Weekly Performance
                </CardTitle>
                <CardDescription>Orders and revenue by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyTrends.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{day.day}</span>
                      <div className="flex items-center gap-4 flex-1 mx-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Orders: {day.orders}</span>
                            <span>Revenue: ₹{day.revenue}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(day.orders / 100) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Restaurant Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Restaurant Performance
                </CardTitle>
                <CardDescription>Compare your restaurants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurantComparison.map((restaurant, index) => (
                    <div key={restaurant.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{restaurant.name}</span>
                        <Badge variant="outline" className="text-green-600">
                          {restaurant.growth}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>Orders: {restaurant.orders}</div>
                        <div>Revenue: ₹{restaurant.revenue}</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {restaurant.rating}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === 0 ? 'bg-green-600' : 
                            index === 1 ? 'bg-blue-600' : 'bg-purple-600'
                          }`}
                          style={{ width: `${(restaurant.orders / 250) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                Top Performing Menu Items
              </CardTitle>
              <CardDescription>
                Your best-selling items and their performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.orders} orders • ₹{item.revenue} revenue
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {item.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerInsights.map((insight, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {insight.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{insight.value}</div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Customer Behavior Insights
              </CardTitle>
              <CardDescription>
                Key patterns and behaviors from your customer base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Order Patterns</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Weekend orders</span>
                      <span className="text-sm font-medium">+35% higher</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Repeat customers</span>
                      <span className="text-sm font-medium">68% of orders</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average items per order</span>
                      <span className="text-sm font-medium">2.4 items</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Popular Combinations</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pizza + Drink</span>
                      <span className="text-sm font-medium">42% of orders</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Burger + Fries</span>
                      <span className="text-sm font-medium">38% of orders</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sushi + Soup</span>
                      <span className="text-sm font-medium">29% of orders</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Seasonal Trends
                </CardTitle>
                <CardDescription>How your business performs across seasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <div className="font-medium">Winter Peak</div>
                      <div className="text-sm text-muted-foreground">Hot items perform 40% better</div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Summer Growth</div>
                      <div className="text-sm text-muted-foreground">Cold beverages up 60%</div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <div className="font-medium">Holiday Boost</div>
                      <div className="text-sm text-muted-foreground">Orders increase 25% during holidays</div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time-based Insights
                </CardTitle>
                <CardDescription>When your customers are most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Lunch Rush (11 AM - 2 PM)</span>
                      <span className="text-sm text-muted-foreground">35% of daily orders</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full w-[35%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Dinner Peak (6 PM - 9 PM)</span>
                      <span className="text-sm text-muted-foreground">45% of daily orders</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full w-[45%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Late Night (9 PM - 12 AM)</span>
                      <span className="text-sm text-muted-foreground">20% of daily orders</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full w-[20%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}