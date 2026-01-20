"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { WaiterLayout } from "@/components/waiter/layout";
import { 
  TrendingUp,
  DollarSign,
  Clock,
  Users,
  Star,
  Target,
  Award,
  Calendar,
  Download,
  BarChart3,
  PieChart
} from "lucide-react";

export default function WaiterReportsPage() {
  // Mock data for waiter performance
  const todayStats = {
    tablesServed: 12,
    ordersCompleted: 28,
    totalSales: 1245.50,
    totalTips: 145.50,
    averageOrderValue: 44.48,
    averageRating: 4.8,
    hoursWorked: 6.5,
    efficiency: 92
  };

  const weeklyStats = {
    tablesServed: 78,
    ordersCompleted: 165,
    totalSales: 7234.75,
    totalTips: 892.30,
    averageOrderValue: 43.85,
    averageRating: 4.7,
    hoursWorked: 40,
    efficiency: 89
  };

  const monthlyStats = {
    tablesServed: 312,
    ordersCompleted: 658,
    totalSales: 28945.20,
    totalTips: 3567.80,
    averageOrderValue: 43.98,
    averageRating: 4.8,
    hoursWorked: 160,
    efficiency: 91
  };

  const dailyPerformance = [
    { day: "Mon", sales: 1180, tips: 142, orders: 26, rating: 4.7 },
    { day: "Tue", sales: 1320, tips: 165, orders: 30, rating: 4.8 },
    { day: "Wed", sales: 1050, tips: 128, orders: 24, rating: 4.6 },
    { day: "Thu", sales: 1245, tips: 145, orders: 28, rating: 4.8 },
    { day: "Fri", sales: 1456, tips: 178, orders: 33, rating: 4.9 },
    { day: "Sat", sales: 1623, tips: 195, orders: 37, rating: 4.8 },
    { day: "Sun", sales: 1398, tips: 167, orders: 32, rating: 4.7 }
  ];

  const topPerformingItems = [
    { name: "Margherita Pizza", orders: 45, revenue: 854.55 },
    { name: "Caesar Salad", orders: 38, revenue: 475.00 },
    { name: "Grilled Salmon", orders: 32, revenue: 799.68 },
    { name: "Chocolate Lava Cake", orders: 28, revenue: 251.72 },
    { name: "Craft Beer", orders: 52, revenue: 363.48 }
  ];

  const customerFeedback = [
    { rating: 5, count: 156, percentage: 78 },
    { rating: 4, count: 32, percentage: 16 },
    { rating: 3, count: 8, percentage: 4 },
    { rating: 2, count: 3, percentage: 1.5 },
    { rating: 1, count: 1, percentage: 0.5 }
  ];

  const achievements = [
    {
      title: "Top Performer",
      description: "Highest sales this week",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Customer Favorite",
      description: "4.8+ rating for 30 days",
      icon: Star,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Efficiency Expert",
      description: "90%+ efficiency rating",
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Sales Champion",
      description: "Exceeded monthly target",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ];

  return (
    <WaiterLayout title="My Performance Reports">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Today's Sales</p>
              <p className="text-lg lg:text-2xl font-bold">₹{todayStats.totalSales.toFixed(0)}</p>
            </div>
            <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Tips Earned</p>
              <p className="text-lg lg:text-2xl font-bold">₹{todayStats.totalTips.toFixed(0)}</p>
            </div>
            <Award className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Orders</p>
              <p className="text-lg lg:text-2xl font-bold">{todayStats.ordersCompleted}</p>
            </div>
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Rating</p>
              <p className="text-lg lg:text-2xl font-bold">{todayStats.averageRating}</p>
            </div>
            <Star className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Your key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Efficiency Rating</span>
                    <span>{todayStats.efficiency}%</span>
                  </div>
                  <Progress value={todayStats.efficiency} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Customer Satisfaction</span>
                    <span>{(todayStats.averageRating / 5 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={todayStats.averageRating / 5 * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Daily Target Progress</span>
                    <span>{Math.min((todayStats.ordersCompleted / 30 * 100), 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min((todayStats.ordersCompleted / 30 * 100), 100)} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">₹{todayStats.averageOrderValue.toFixed(0)}</p>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{todayStats.hoursWorked}h</p>
                    <p className="text-sm text-muted-foreground">Hours Worked</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Period Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Period Comparison
                </CardTitle>
                <CardDescription>Compare your performance across different periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Today</p>
                      <p className="text-lg font-bold">₹{todayStats.totalSales.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{todayStats.ordersCompleted} orders</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">This Week</p>
                      <p className="text-lg font-bold">₹{weeklyStats.totalSales.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{weeklyStats.ordersCompleted} orders</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">This Month</p>
                      <p className="text-lg font-bold">₹{monthlyStats.totalSales.toFixed(0)}</p>
                      <p className="text-xs text-muted-foreground">{monthlyStats.ordersCompleted} orders</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Tips Comparison</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-yellow-600">₹{todayStats.totalTips.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Today</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-600">₹{weeklyStats.totalTips.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">This Week</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-yellow-600">₹{monthlyStats.totalTips.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">This Month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Sales Performance
                </CardTitle>
                <CardDescription>Sales and tips for the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyPerformance.map((day, index) => (
                    <div key={day.day} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{day.day}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span>₹{day.sales}</span>
                          <span className="text-muted-foreground">Tips: ₹{day.tips}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(day.sales / 1700) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{day.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Items
                </CardTitle>
                <CardDescription>Items you've sold the most this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformingItems.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.orders} orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{item.revenue.toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Ratings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Customer Ratings
                </CardTitle>
                <CardDescription>Breakdown of customer feedback ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerFeedback.map((rating) => (
                    <div key={rating.rating} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{rating.rating} Star</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < rating.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span>{rating.count}</span>
                          <span className="text-muted-foreground">({rating.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${rating.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-2xl font-bold text-yellow-600">{todayStats.averageRating}</p>
                  <p className="text-sm text-muted-foreground">Overall Average Rating</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Customer Comments</CardTitle>
                <CardDescription>Latest feedback from your customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Table 5 • 2 hours ago</span>
                    </div>
                    <p className="text-sm text-green-800">"Excellent service! Alex was very attentive and made great recommendations."</p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <Star className="w-3 h-3 text-gray-300" />
                      </div>
                      <span className="text-xs text-muted-foreground">Table 8 • 1 day ago</span>
                    </div>
                    <p className="text-sm text-blue-800">"Good service, food came quickly. Very professional waiter."</p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">Table 3 • 2 days ago</span>
                    </div>
                    <p className="text-sm text-purple-800">"Amazing experience! The waiter was knowledgeable about the menu and very friendly."</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${achievement.bgColor} flex items-center justify-center`}>
                      <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge className={`${achievement.bgColor} ${achievement.color} border-0`}>
                      Earned
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performance Goals</CardTitle>
              <CardDescription>Track your progress towards monthly targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                      <Target className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Sales Target</h4>
                  <p className="text-2xl font-bold text-blue-600">₹{monthlyStats.totalSales.toFixed(0)}</p>
                  <p className="text-sm text-muted-foreground">/ ₹30,000 (96%)</p>
                  <Progress value={96} className="mt-2" />
                </div>
                
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Customer Satisfaction</h4>
                  <p className="text-2xl font-bold text-green-600">{monthlyStats.averageRating}</p>
                  <p className="text-sm text-muted-foreground">/ 5.0 (96%)</p>
                  <Progress value={96} className="mt-2" />
                </div>
                
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                      <Award className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <h4 className="font-semibold mb-2">Efficiency</h4>
                  <p className="text-2xl font-bold text-yellow-600">{monthlyStats.efficiency}%</p>
                  <p className="text-sm text-muted-foreground">/ 95% (96%)</p>
                  <Progress value={96} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </WaiterLayout>
  );
}