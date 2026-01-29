"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useState, useEffect, useCallback } from "react";
import { 
  Search,
  Eye,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  Edit,
  Trash2,
  Send,
  BellRing,
  FileText,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { orderApi, Order } from "@/lib/orders";
import { OrderAnalyticsChart } from "@/components/charts/order-analytics-chart";

export default function OrdersPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newStatus, setNewStatus] = useState<Order['status']>("pending");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);

  // Fetch user's restaurant
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;
      
      if (user.primaryRestaurantId) {
        setRestaurantId(user.primaryRestaurantId);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/restaurants', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setRestaurantId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    };

    fetchRestaurant();
  }, [user]);

  // Fetch orders from backend
  const { orders, loading, error, refetch } = useOrders({
    restaurantId,
    status: statusFilter === "all" ? undefined : statusFilter
  });

  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 10));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-cyan-100 text-cyan-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "ready": return "bg-purple-100 text-purple-800";
      case "served": return "bg-indigo-100 text-indigo-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "preparing": return <Package className="w-4 h-4" />;
      case "ready": return <CheckCircle className="w-4 h-4" />;
      case "served": return <Truck className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
    served: orders.filter(o => o.status === "served").length,
    completed: orders.filter(o => o.status === "completed").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalRevenue: orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.total, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
  };

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await orderApi.updateStatus(orderId, status);
      addNotification(`Order ${orderId} status updated to ${status}`);
      refetch();
    } catch (err: any) {
      addNotification(`Failed to update order: ${err.message}`);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedOrders.length === 0 || !newStatus) return;
    
    try {
      await Promise.all(
        selectedOrders.map(orderId => orderApi.updateStatus(orderId, newStatus))
      );
      addNotification(`${selectedOrders.length} orders updated to ${newStatus}`);
      setSelectedOrders([]);
      setShowStatusDialog(false);
      refetch();
    } catch (err: any) {
      addNotification(`Failed to update orders: ${err.message}`);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const handleDeleteOrders = async () => {
    if (selectedOrders.length === 0) return;
    if (confirm(`Are you sure you want to cancel ${selectedOrders.length} orders?`)) {
      try {
        await Promise.all(
          selectedOrders.map(orderId => orderApi.cancel(orderId))
        );
        addNotification(`${selectedOrders.length} orders cancelled`);
        setSelectedOrders([]);
        refetch();
      } catch (err: any) {
        addNotification(`Failed to cancel orders: ${err.message}`);
      }
    }
  };

  // Check permissions
  if (!user || !['waiter', 'admin', 'owner'].includes(user.role)) {
    return (
      <DashboardLayout title="Order Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You need to be a waiter, admin, or owner to access order management.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurantId) {
    return (
      <DashboardLayout title="Order Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Restaurant Found</h3>
            <p className="text-gray-600 mb-4">
              You need to be associated with a restaurant to view orders.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Order Management">
      {/* Notifications Alert */}
      {notifications.length > 0 && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <BellRing className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>Recent Notifications ({notifications.length})</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {showNotifications ? 'Hide' : 'Show'}
            </Button>
          </AlertTitle>
          {showNotifications && (
            <AlertDescription>
              <div className="mt-2 space-y-1">
                {notifications.slice(0, 3).map((notif, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />
                    {notif}
                  </div>
                ))}
              </div>
            </AlertDescription>
          )}
        </Alert>
      )}

      {/* Ultra Compact Stats Cards - Single Row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 mb-4">
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-slate-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="h-2.5 w-2.5 text-slate-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-sm font-bold text-slate-900">{orderStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-blue-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="h-2.5 w-2.5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Pending</p>
                <p className="text-sm font-bold text-blue-900">{orderStats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-cyan-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-2.5 w-2.5 text-cyan-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Confirmed</p>
                <p className="text-sm font-bold text-cyan-900">{orderStats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-yellow-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="h-2.5 w-2.5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Preparing</p>
                <p className="text-sm font-bold text-yellow-900">{orderStats.preparing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-purple-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-2.5 w-2.5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Ready</p>
                <p className="text-sm font-bold text-purple-900">{orderStats.ready}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-indigo-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="h-2.5 w-2.5 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Served</p>
                <p className="text-sm font-bold text-indigo-900">{orderStats.served}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-green-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-2.5 w-2.5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Completed</p>
                <p className="text-sm font-bold text-green-900">{orderStats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-sm transition-shadow border-l-2 border-l-red-500">
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="h-2.5 w-2.5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
                <p className="text-sm font-bold text-red-900">{orderStats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-2 border-l-emerald-500 hover:scale-105 bg-gradient-to-br from-emerald-50 to-green-50" 
          onClick={() => setShowAnalytics(true)}
        >
          <CardContent className="p-1.5">
            <div className="flex items-center gap-1">
              <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-2.5 w-2.5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Revenue</p>
                <p className="text-sm font-bold text-emerald-900">₹{Number(orderStats.totalRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders, customers, phone numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={refetch} className="h-10">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" className="h-10">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={() => setShowAnalytics(true)} className="h-10">
                    <FileText className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">Filter by Status</Label>
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                  <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto p-1">
                    <TabsTrigger value="all" className="text-xs py-2">All</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs py-2">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed" className="text-xs py-2">Confirmed</TabsTrigger>
                    <TabsTrigger value="preparing" className="text-xs py-2">Preparing</TabsTrigger>
                    <TabsTrigger value="ready" className="text-xs py-2">Ready</TabsTrigger>
                    <TabsTrigger value="served" className="text-xs py-2">Served</TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs py-2">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled" className="text-xs py-2">Cancelled</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Enhanced Bulk Actions */}
        {selectedOrders.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedOrders.length === filteredOrders.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <div>
                    <span className="font-semibold text-blue-900">{selectedOrders.length} orders selected</span>
                    <p className="text-xs text-blue-600">Bulk actions available</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="default" onClick={() => setShowStatusDialog(true)} className="flex-1 sm:flex-none">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleDeleteOrders} className="flex-1 sm:flex-none">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Orders
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedOrders([])} className="flex-1 sm:flex-none">
                    Clear Selection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Quick Analytics Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Analytics</h3>
          <Button variant="ghost" size="sm" onClick={() => setShowAnalytics(true)} className="text-blue-600 hover:text-blue-700">
            View Detailed Analytics
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <TrendingUp className="h-4 w-4" />
                Revenue Trend (7 Days)
              </CardTitle>
              <CardDescription>Daily revenue from completed orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <OrderAnalyticsChart orders={orders} type="revenue-trend" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                <Package className="h-4 w-4" />
                Order Status Distribution
              </CardTitle>
              <CardDescription>Current status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <OrderAnalyticsChart orders={orders} type="status-distribution" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                <Clock className="h-4 w-4" />
                Hourly Order Pattern
              </CardTitle>
              <CardDescription>Orders by time of day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <OrderAnalyticsChart orders={orders} type="hourly-orders" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Manage and track all orders across your restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={refetch}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-30">Order #</TableHead>
                    <TableHead className="hidden md:table-cell">Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="w-17.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedOrders([...selectedOrders, order.id]);
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.customer_name || 'Guest'}</TableCell>
                      <TableCell className="hidden sm:table-cell capitalize">{order.order_type}</TableCell>
                      <TableCell>₹{Number(order.total || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {new Date(order.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedOrderDetail(order)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Order Details - {order.order_number}</DialogTitle>
                              <DialogDescription>Complete order information and management</DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Status and Actions */}
                              <div className="flex items-center justify-between">
                                <Badge className={getStatusColor(order.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                  </span>
                                </Badge>
                                <Select 
                                  value={order.status} 
                                  onValueChange={(value) => handleStatusUpdate(order.id, value as Order['status'])}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="preparing">Preparing</SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="served">Served</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Customer Info */}
                              {order.customer_name && (
                                <div>
                                  <h3 className="font-semibold mb-2">Customer Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-muted-foreground" />
                                      <span>{order.customer_name}</span>
                                    </div>
                                    {order.customer_phone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{order.customer_phone}</span>
                                      </div>
                                    )}
                                    {order.delivery_address && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                        <span>{order.delivery_address}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold mb-2">Order Items</h3>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span>₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div>
                                <h3 className="font-semibold mb-2">Order Summary</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>₹{Number(order.tax || 0).toFixed(2)}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Discount</span>
                                      <span>-₹{Number(order.discount || 0).toFixed(2)}</span>
                                    </div>
                                  )}
                                  {order.delivery_fee > 0 && (
                                    <div className="flex justify-between">
                                      <span>Delivery Fee</span>
                                      <span>₹{Number(order.delivery_fee || 0).toFixed(2)}</span>
                                    </div>
                                  )}
                                  <Separator />
                                  <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span>₹{Number(order.total || 0).toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Info */}
                              <div>
                                <h3 className="font-semibold mb-2">Additional Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Order Type</span>
                                    <span className="capitalize">{order.order_type}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Payment Method</span>
                                    <span className="uppercase">{order.payment_method}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Payment Status</span>
                                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                                      {order.payment_status}
                                    </Badge>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Created</span>
                                    <span>{new Date(order.created_at).toLocaleString()}</span>
                                  </div>
                                  {order.special_instructions && (
                                    <div>
                                      <span className="font-medium">Special Instructions:</span>
                                      <p className="mt-1 text-muted-foreground">{order.special_instructions}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button variant="outline">Print Receipt</Button>
                              <Button>Contact Customer</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedOrders.length} selected orders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Order['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Analytics Dashboard</DialogTitle>
            <DialogDescription>Comprehensive insights and statistics for your orders</DialogDescription>
          </DialogHeader>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">₹{Number(orderStats.totalRevenue || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">From {orderStats.completed} completed orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">₹{Number(orderStats.avgOrderValue || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Across all orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">
                  {orderStats.pending + orderStats.confirmed + orderStats.preparing + orderStats.ready + orderStats.served}
                </p>
                <p className="text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">
                  {orderStats.total > 0 
                    ? ((orderStats.completed / orderStats.total) * 100).toFixed(1) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Successfully completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Trend (Last 7 Days)
                </CardTitle>
                <CardDescription>Daily revenue from completed orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <OrderAnalyticsChart orders={orders} type="revenue-trend" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Status Distribution
                </CardTitle>
                <CardDescription>Current status breakdown of all orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <OrderAnalyticsChart orders={orders} type="status-distribution" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Hourly Order Pattern
                </CardTitle>
                <CardDescription>Orders received by hour of the day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <OrderAnalyticsChart orders={orders} type="hourly-orders" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Order Types Distribution
                </CardTitle>
                <CardDescription>Breakdown by order type (dine-in, takeaway, delivery)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <OrderAnalyticsChart orders={orders} type="order-types" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Peak Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
                      hour,
                      count: orders.filter(order => new Date(order.created_at).getHours() === hour).length
                    }));
                    const peakHours = hourlyData
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3)
                      .filter(h => h.count > 0);
                    
                    return peakHours.map((peak, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{peak.hour}:00 - {peak.hour + 1}:00</span>
                        <span className="font-medium">{peak.count} orders</span>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Order Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Today's Orders</span>
                    <span className="font-medium">
                      {orders.filter(order => 
                        new Date(order.created_at).toDateString() === new Date().toDateString()
                      ).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>This Week</span>
                    <span className="font-medium">
                      {orders.filter(order => {
                        const orderDate = new Date(order.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return orderDate >= weekAgo;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. Daily Orders</span>
                    <span className="font-medium">
                      {orders.length > 0 ? Math.round(orders.length / 7) : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowAnalytics(false)}>
              Close
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
