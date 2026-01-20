"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WaiterLayout } from "@/components/waiter/layout";
import { useState } from "react";
import Link from "next/link";
import { 
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Eye,
  Plus,
  RefreshCw,
  Timer,
  Utensils,
  User,
  Phone,
  MapPin,
  DollarSign
} from "lucide-react";

export default function WaiterOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for waiter orders
  const orders = [
    {
      id: "#T001",
      tableNumber: 5,
      customerName: "John Smith",
      customerPhone: "+1 (555) 123-4567",
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 18.99, notes: "Extra cheese" },
        { name: "Caesar Salad", quantity: 1, price: 12.50, notes: "" },
        { name: "Coke", quantity: 2, price: 2.99, notes: "No ice" }
      ],
      subtotal: 37.47,
      tax: 3.00,
      total: 40.47,
      status: "preparing",
      priority: "normal",
      orderTime: "14:30",
      estimatedTime: "15 min",
      specialRequests: "Customer has nut allergy",
      paymentMethod: "Card"
    },
    {
      id: "#T002", 
      tableNumber: 8,
      customerName: "Sarah Johnson",
      customerPhone: "+1 (555) 987-6543",
      items: [
        { name: "Burger Deluxe", quantity: 1, price: 16.99, notes: "Medium rare" },
        { name: "Sweet Potato Fries", quantity: 1, price: 6.99, notes: "" },
        { name: "Chocolate Milkshake", quantity: 1, price: 5.99, notes: "Extra whipped cream" }
      ],
      subtotal: 29.97,
      tax: 2.40,
      total: 32.37,
      status: "ready",
      priority: "high",
      orderTime: "14:45",
      estimatedTime: "Ready",
      specialRequests: "",
      paymentMethod: "Cash"
    },
    {
      id: "#T003",
      tableNumber: 3,
      customerName: "Mike Davis",
      customerPhone: "+1 (555) 456-7890",
      items: [
        { name: "Pasta Carbonara", quantity: 1, price: 19.99, notes: "Extra parmesan" },
        { name: "Garlic Bread", quantity: 1, price: 4.99, notes: "" }
      ],
      subtotal: 24.98,
      tax: 2.00,
      total: 26.98,
      status: "pending",
      priority: "normal", 
      orderTime: "15:00",
      estimatedTime: "20 min",
      specialRequests: "Vegetarian option requested",
      paymentMethod: "Card"
    },
    {
      id: "#T004",
      tableNumber: 12,
      customerName: "Lisa Wilson",
      customerPhone: "+1 (555) 321-0987",
      items: [
        { name: "Grilled Salmon", quantity: 1, price: 24.99, notes: "Well done" },
        { name: "Jasmine Rice", quantity: 1, price: 3.99, notes: "" },
        { name: "Steamed Vegetables", quantity: 1, price: 5.99, notes: "" },
        { name: "White Wine", quantity: 1, price: 12.99, notes: "Chilled" }
      ],
      subtotal: 47.96,
      tax: 3.84,
      total: 51.80,
      status: "preparing",
      priority: "normal",
      orderTime: "15:10",
      estimatedTime: "25 min",
      specialRequests: "",
      paymentMethod: "Card"
    },
    {
      id: "#T005",
      tableNumber: 7,
      customerName: "Tom Brown",
      customerPhone: "+1 (555) 654-3210",
      items: [
        { name: "Buffalo Wings", quantity: 12, price: 14.99, notes: "Extra spicy" },
        { name: "Draft Beer", quantity: 2, price: 4.99, notes: "Cold" }
      ],
      subtotal: 24.97,
      tax: 2.00,
      total: 26.97,
      status: "ready",
      priority: "high",
      orderTime: "15:15",
      estimatedTime: "Ready",
      specialRequests: "",
      paymentMethod: "Card"
    },
    {
      id: "#T006",
      tableNumber: 2,
      customerName: "Emma Davis",
      customerPhone: "+1 (555) 789-0123",
      items: [
        { name: "Chicken Tikka", quantity: 1, price: 18.99, notes: "Mild spice" },
        { name: "Naan Bread", quantity: 2, price: 3.99, notes: "Garlic naan" }
      ],
      subtotal: 26.97,
      tax: 2.16,
      total: 29.13,
      status: "served",
      priority: "normal",
      orderTime: "14:00",
      estimatedTime: "Completed",
      specialRequests: "",
      paymentMethod: "Cash"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "ready": return "bg-green-100 text-green-800";
      case "served": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "preparing": return <Package className="w-4 h-4" />;
      case "ready": return <CheckCircle className="w-4 h-4" />;
      case "served": return <Truck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "medium": return "border-l-yellow-500";
      case "normal": return "border-l-green-500";
      default: return "border-l-gray-300";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tableNumber.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
    served: orders.filter(o => o.status === "served").length
  };

  return (
    <WaiterLayout title="Active Orders">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 lg:gap-4 mb-6">
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-lg lg:text-2xl font-bold">{orderStats.total}</p>
            </div>
            <Utensils className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-lg lg:text-2xl font-bold text-blue-600">{orderStats.pending}</p>
            </div>
            <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Preparing</p>
              <p className="text-lg lg:text-2xl font-bold text-yellow-600">{orderStats.preparing}</p>
            </div>
            <Package className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Ready</p>
              <p className="text-lg lg:text-2xl font-bold text-green-600">{orderStats.ready}</p>
            </div>
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Served</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-600">{orderStats.served}</p>
            </div>
            <Truck className="h-6 w-6 lg:h-8 lg:w-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search orders, tables, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
              <TabsTrigger value="preparing" className="text-xs">Preparing</TabsTrigger>
              <TabsTrigger value="ready" className="text-xs">Ready</TabsTrigger>
              <TabsTrigger value="served" className="text-xs">Served</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/waiter/orders/new" className="flex-1 sm:flex-none">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className={`border-l-4 ${getPriorityColor(order.priority)} hover:shadow-lg transition-all duration-200`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium">
                    Table {order.tableNumber}
                  </Badge>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{order.status}</span>
                  </Badge>
                </div>
                {order.priority === "high" && (
                  <Badge variant="destructive" className="text-xs">
                    Priority
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">
                    {order.customerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.orderTime}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div>
                <p className="text-sm font-medium mb-2">Items ({order.items.length})</p>
                <div className="space-y-1">
                  {order.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{order.items.length - 2} more items
                    </p>
                  )}
                </div>
              </div>
              
              {/* Special Requests */}
              {order.specialRequests && (
                <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs font-medium text-yellow-800 mb-1">Special Request:</p>
                  <p className="text-xs text-yellow-700">{order.specialRequests}</p>
                </div>
              )}
              
              {/* Order Summary */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Timer className="w-3 h-3" />
                  {order.estimatedTime}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                {order.status === "ready" && (
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Serve
                  </Button>
                )}
                
                {order.status === "served" && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Receipt className="w-4 h-4 mr-2" />
                    Bill
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders found matching your criteria.</p>
            <Link href="/waiter/orders/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Take New Order
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                Order Details - {selectedOrder.id}
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1">{selectedOrder.status}</span>
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Table {selectedOrder.tableNumber} • {selectedOrder.orderTime}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Table {selectedOrder.tableNumber}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-start py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground">x{item.quantity}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              {selectedOrder.specialRequests && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Special Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-800">{selectedOrder.specialRequests}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
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
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total</span>
                        <span className="font-bold text-lg">₹{selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Payment Method</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
              {selectedOrder.status === "ready" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Served
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </WaiterLayout>
  );
}