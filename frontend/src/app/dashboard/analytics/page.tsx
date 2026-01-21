"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useDashboardData } from "@/hooks/useAnalytics";
import { TimeFrame } from "@/lib/analytics";
import { useState } from "react";
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
  RefreshCw,
  Loader2
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('30days');
  const { data, loading, error, refetch, exportReport } = useDashboardData(timeframe);

  const handleExport = async () => {
    try {
      await exportReport('json');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Analytics Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Analytics Dashboard">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const overviewStats = data?.overview ? [
    {
      title: "Total Revenue",
      value: formatCurrency(data.overview.total_revenue.value),
      change: `${data.overview.total_revenue.change}%`,
      trend: data.overview.total_revenue.trend,
      period: "vs last month",
      icon: () => <span className="text-green-600 text-lg font-bold">₹</span>
    },
    {
      title: "Total Orders",
      value: data.overview.total_orders.value.toString(),
      change: `${data.overview.total_orders.change}%`,
      trend: data.overview.total_orders.trend,
      period: "vs last month",
      icon: ShoppingCart
    },
    {
      title: "New Customers",
      value: data.overview.new_customers.value.toString(),
      change: `${data.overview.new_customers.change}%`,
      trend: data.overview.new_customers.trend,
      period: "vs last month",
      icon: Users
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(data.overview.avg_order_value.value),
      change: `${data.overview.avg_order_value.change}%`,
      trend: data.overview.avg_order_value.trend,
      period: "vs last month",
      icon: Target
    }
  ] : [];

  return (
    <DashboardLayout title="Analytics Dashboard">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={(value: TimeFrame) => setTimeframe(value)}>
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
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Button size="sm" onClick={handleExport}>
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
                <span className={getStatusColor(stat.trend)}>
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
                  {data?.revenue?.map((item) => (
                    <div key={item.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-12">{item.month}</span>
                      <div className="flex items-center gap-3 flex-1 mx-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((item.revenue / 35000) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[60px]">
                          ₹{(item.revenue / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No revenue data available
                    </div>
                  )}
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
                  {data?.hourlyPatterns?.map((hour) => (
                    <div key={hour.hour} className="flex flex-col items-center flex-1">
                      <div className="flex flex-col items-center justify-end h-32 w-full">
                        <div 
                          className="bg-gradient-to-t from-green-600 to-green-400 rounded-t-md w-full transition-all duration-300"
                          style={{ height: `${Math.max((hour.orders / 100) * 100, 5)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-xs font-medium">{hour.orders}</div>
                        <div className="text-xs text-muted-foreground">{hour.hour}</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground w-full">
                      No hourly data available
                    </div>
                  )}
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
                  {data?.revenue?.map((item) => (
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
                          style={{ width: `${Math.min((item.revenue / 35000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No revenue data available
                    </div>
                  )}
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
                    <div className="text-xl font-bold text-green-700">
                      {data?.overview ? formatCurrency(data.overview.total_revenue.value) : '₹0'}
                    </div>
                    <div className="text-xs text-green-600">
                      {data?.overview ? `${data.overview.total_revenue.change}% vs last period` : 'No data'}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Avg Monthly</div>
                    <div className="text-xl font-bold text-blue-700">
                      {data?.revenue?.length ? 
                        formatCurrency(data.revenue.reduce((sum, item) => sum + item.revenue, 0) / data.revenue.length) : 
                        '₹0'
                      }
                    </div>
                    <div className="text-xs text-blue-600">Based on available data</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Best Month</div>
                    <div className="text-xl font-bold text-purple-700">
                      {data?.revenue?.length ? 
                        data.revenue.reduce((best, current) => current.revenue > best.revenue ? current : best).month :
                        'N/A'
                      }
                    </div>
                    <div className="text-xs text-purple-600">
                      {data?.revenue?.length ? 
                        formatCurrency(data.revenue.reduce((best, current) => current.revenue > best.revenue ? current : best).revenue) :
                        'No data'
                      }
                    </div>
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
                {data?.products?.map((product, index) => (
                  <div key={`${product.name}-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
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
                        ₹{product.avg_price.toFixed(2)} avg
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No product data</h3>
                    <p className="text-gray-600">Product performance data will appear here once you have orders.</p>
                  </div>
                )}
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
                  {data?.customerSegments?.map((segment) => {
                    const colors = {
                      'New Customers': 'bg-blue-500',
                      'Returning Customers': 'bg-green-500',
                      'VIP Customers': 'bg-purple-500'
                    };
                    return (
                      <div key={segment.segment} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{segment.segment}</span>
                          <span className="text-sm text-muted-foreground">
                            {segment.count} ({segment.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${colors[segment.segment as keyof typeof colors] || 'bg-gray-500'} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${segment.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="text-center py-8 text-muted-foreground">
                      No customer segment data available
                    </div>
                  )}
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
                    <div className="text-xl font-bold text-blue-700">
                      ₹{data?.customerInsights?.lifetime_value || '0'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium">Retention Rate</div>
                      <div className="text-sm text-muted-foreground">Customers who return</div>
                    </div>
                    <div className="text-xl font-bold text-green-700">
                      {data?.customerInsights?.retention_rate || '0'}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium">Avg Order Frequency</div>
                      <div className="text-sm text-muted-foreground">Orders per month</div>
                    </div>
                    <div className="text-xl font-bold text-purple-700">
                      {data?.customerInsights?.order_frequency || '0'}
                    </div>
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
                {data?.restaurantPerformance?.map((restaurant, index) => (
                  <div key={restaurant.id || `restaurant-${index}`} className="space-y-3">
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
                        style={{ width: `${Math.min((restaurant.revenue / 20000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No performance data</h3>
                    <p className="text-gray-600">Restaurant performance data will appear here once you have multiple restaurants.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}