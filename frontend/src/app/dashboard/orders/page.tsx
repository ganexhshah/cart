"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useState } from "react";
import { 
  Search,
  MoreHorizontal, 
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
  Calendar
} from "lucide-react";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const orders = [
    {
      id: "#ORD-001",
      restaurant: "Pizza Palace",
      restaurantLogo: "/api/placeholder/40/40",
      customer: "John Doe",
      customerPhone: "+1 (555) 123-4567",
      customerAddress: "123 Main St, Apt 4B, Downtown",
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 18.99 },
        { name: "Caesar Salad", quantity: 1, price: 12.50 },
        { name: "Garlic Bread", quantity: 2, price: 6.99 }
      ],
      subtotal: 38.48,
      tax: 3.08,
      deliveryFee: 4.99,
      total: 46.55,
      status: "delivered",
      orderTime: "2024-01-12 14:30",
      deliveryTime: "2024-01-12 15:15",
      paymentMethod: "Credit Card",
      notes: "Extra cheese, no onions"
    },
    {
      id: "#ORD-002",
      restaurant: "Burger Barn",
      restaurantLogo: "/api/placeholder/40/40",
      customer: "Jane Smith",
      customerPhone: "+1 (555) 987-6543",
      customerAddress: "456 Oak Ave, Suite 12, Midtown",
      items: [
        { name: "Classic Burger", quantity: 2, price: 14.99 },
        { name: "French Fries", quantity: 2, price: 4.99 },
        { name: "Coke", quantity: 2, price: 2.99 }
      ],
      subtotal: 37.96,
      tax: 3.04,
      deliveryFee: 3.99,
      total: 44.99,
      status: "preparing",
      orderTime: "2024-01-12 15:45",
      deliveryTime: null,
      paymentMethod: "PayPal",
      notes: "Medium rare, no pickles"
    },
    {
      id: "#ORD-003",
      restaurant: "Sushi Spot",
      restaurantLogo: "/api/placeholder/40/40",
      customer: "Mike Johnson",
      customerPhone: "+1 (555) 456-7890",
      customerAddress: "789 Pine St, Floor 3, Uptown",
      items: [
        { name: "Salmon Roll", quantity: 2, price: 12.99 },
        { name: "Tuna Sashimi", quantity: 1, price: 18.99 },
        { name: "Miso Soup", quantity: 1, price: 4.99 }
      ],
      subtotal: 49.97,
      tax: 4.00,
      deliveryFee: 5.99,
      total: 59.96,
      status: "pending",
      orderTime: "2024-01-12 16:20",
      deliveryTime: null,
      paymentMethod: "Credit Card",
      notes: "No wasabi"
    },
    {
      id: "#ORD-004",
      restaurant: "Pizza Palace",
      restaurantLogo: "/api/placeholder/40/40",
      customer: "Sarah Wilson",
      customerPhone: "+1 (555) 321-0987",
      customerAddress: "321 Elm St, House 15, Suburb",
      items: [
        { name: "Pepperoni Pizza", quantity: 1, price: 21.99 },
        { name: "Buffalo Wings", quantity: 12, price: 16.99 }
      ],
      subtotal: 38.98,
      tax: 3.12,
      deliveryFee: 4.99,
      total: 47.09,
      status: "out_for_delivery",
      orderTime: "2024-01-12 17:10",
      deliveryTime: null,
      paymentMethod: "Cash",
      notes: "Ring doorbell twice"
    },
    {
      id: "#ORD-005",
      restaurant: "Burger Barn",
      restaurantLogo: "/api/placeholder/40/40",
      customer: "David Brown",
      customerPhone: "+1 (555) 654-3210",
      customerAddress: "654 Maple Dr, Unit 8, Downtown",
      items: [
        { name: "Veggie Burger", quantity: 1, price: 13.99 },
        { name: "Sweet Potato Fries", quantity: 1, price: 5.99 },
        { name: "Iced Tea", quantity: 1, price: 2.99 }
      ],
      subtotal: 22.97,
      tax: 1.84,
      deliveryFee: 3.99,
      total: 28.80,
      status: "cancelled",
      orderTime: "2024-01-12 13:20",
      deliveryTime: null,
      paymentMethod: "Credit Card",
      notes: "Customer cancelled - refund processed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "out_for_delivery": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "preparing": return <Package className="w-4 h-4" />;
      case "out_for_delivery": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    out_for_delivery: orders.filter(o => o.status === "out_for_delivery").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length
  };

  return (
    <DashboardLayout title="Order Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{orderStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Preparing</p>
                <p className="text-2xl font-bold text-yellow-600">{orderStats.preparing}</p>
              </div>
              <Package className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivery</p>
                <p className="text-2xl font-bold text-purple-600">{orderStats.out_for_delivery}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{orderStats.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search orders, customers, restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs">Preparing</TabsTrigger>
              <TabsTrigger value="out_for_delivery" className="text-xs">Delivery</TabsTrigger>
              <TabsTrigger value="delivered" className="text-xs">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-30">Order ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Restaurant</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Order Time</TableHead>
                  <TableHead className="w-17.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={order.restaurantLogo} alt={order.restaurant} />
                          <AvatarFallback>{order.restaurant.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{order.restaurant}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <div className="font-medium text-sm">{order.customer}</div>
                        <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.orderTime).toLocaleString()}
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault();
                                setSelectedOrder(order);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                Order Details - {selectedOrder.id}
              </DialogTitle>
              <DialogDescription>
                Complete order information and status
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1`}>
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Restaurant</Label>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedOrder.restaurantLogo} alt={selectedOrder.restaurant} />
                          <AvatarFallback>{selectedOrder.restaurant.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{selectedOrder.restaurant}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Order Time</Label>
                      <span className="text-sm">{new Date(selectedOrder.orderTime).toLocaleString()}</span>
                    </div>
                    
                    {selectedOrder.deliveryTime && (
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">Delivery Time</Label>
                        <span className="text-sm">{new Date(selectedOrder.deliveryTime).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                      <span className="text-sm">{selectedOrder.paymentMethod}</span>
                    </div>
                    
                    {selectedOrder.notes && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                        <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedOrder.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{selectedOrder.customerAddress}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items and Pricing */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>₹{selectedOrder.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Total</span>
                          <span className="font-bold text-lg">
                            ₹{selectedOrder.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}