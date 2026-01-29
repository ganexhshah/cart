"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DashboardLayout } from "@/components/dashboard/layout";
import { tableApi, RestaurantTable } from "@/lib/tables";
import { restaurantApi } from "@/lib/restaurants";
import { Order, orderApi } from '@/lib/orders';
import { useFloorManagement } from "@/hooks/useFloorManagement";
import { 
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  ShoppingCart,
  Receipt,
  Clock,
  DollarSign,
  Eye,
  CreditCard,
  Utensils,
  ChefHat,
  Timer,
  Bell,
  RefreshCw,
  Plus,
  Minus,
  AlertCircle,
  Check,
  X,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function FloorManagementPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  
  // Table Management State
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableOrders, setTableOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // POS State
  const [showPOSDialog, setShowPOSDialog] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Order Details State
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load restaurants
      const restaurantsResponse = await restaurantApi.getAll();
      if (restaurantsResponse.success) {
        setRestaurants(restaurantsResponse.data);
        if (restaurantsResponse.data.length > 0) {
          setSelectedRestaurant(restaurantsResponse.data[0].id);
        }
      }

      // Load tables
      await loadTables();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        restaurant_id: selectedRestaurant || undefined
      };

      const response = await tableApi.getTables(filters);
      if (response.success) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadTableOrders = async (tableId: string) => {
    try {
      setIsLoadingOrders(true);
      const response = await orderApi.getTableOrders(tableId);
      if (response.success) {
        setTableOrders(response.data);
        // Find active order (not completed/cancelled)
        const active = response.data.find((order: Order) => 
          !['completed', 'cancelled'].includes(order.status)
        );
        setActiveOrder(active || null);
      }
    } catch (error) {
      console.error('Error loading table orders:', error);
      // Set empty arrays on error
      setTableOrders([]);
      setActiveOrder(null);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const openTableManagement = async (table: RestaurantTable) => {
    setSelectedTable(table);
    setShowTableDialog(true);
    await loadTableOrders(table.id);
  };

  const openPOS = async (table: RestaurantTable) => {
    setSelectedTable(table);
    setShowPOSDialog(true);
    setCartItems([]);
    
    // Load menu items
    try {
      const response = await orderApi.getMenuItems(table.restaurant_id);
      if (response.success) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      // Don't show error to user, just log it
      setMenuItems([]);
    }
  };

  const addToCart = (item: any) => {
    const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  const processOrder = async () => {
    if (!selectedTable || cartItems.length === 0) return;

    try {
      setIsProcessingPayment(true);
      
      const orderData = {
        restaurantId: selectedTable.restaurant_id,
        tableId: selectedTable.id,
        orderType: 'dine-in' as const,
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          specialInstructions: ''
        }))
      };

      // Use the regular orders API instead of POS API
      const response = await orderApi.create(orderData);
      if (response.success) {
        // Clear cart and close dialog
        setCartItems([]);
        setShowPOSDialog(false);
        
        // Refresh table data
        await loadTables();
        
        alert('Order created successfully!');
      } else {
        alert('Failed to create order: ' + response.message);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await orderApi.updateOrderStatus(orderId, status);
      if (response.success) {
        // Refresh orders
        if (selectedTable) {
          await loadTableOrders(selectedTable.id);
        }
        await loadTables();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateTableStatus = async (tableId: string, status: RestaurantTable['status']) => {
    try {
      const response = await tableApi.updateTableStatus(tableId, status);
      if (response.success) {
        await loadTables();
      }
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const getStatusColor = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'served': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = searchTerm === "" ||
                         table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.table_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || table.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Floor Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Floor Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Floor Management</h1>
            <p className="text-gray-600 mt-1">Manage table orders, POS, and checkout operations</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => loadTables()}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{table.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {table.location || 'No location'}
                    </CardDescription>
                  </div>
                  
                  <Badge className={`${getStatusColor(table.status)} flex items-center gap-1 capitalize`}>
                    {table.status === 'available' && <CheckCircle className="w-3 h-3" />}
                    {table.status === 'occupied' && <XCircle className="w-3 h-3" />}
                    {table.status === 'reserved' && <Users className="w-3 h-3" />}
                    {table.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{table.capacity} seats</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {table.table_type}
                  </Badge>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => openTableManagement(table)}
                    className="flex-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Manage
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPOS(table)}
                    className="flex-1"
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    POS
                  </Button>
                </div>

                {/* Quick Status Change */}
                <Select
                  value={table.status}
                  onValueChange={(value: any) => updateTableStatus(table.id, value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Management Dialog */}
        <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Utensils className="w-5 h-5 text-blue-600" />
                </div>
                Table Management - {selectedTable?.name}
              </DialogTitle>
              <DialogDescription>
                View and manage orders for this table
              </DialogDescription>
            </DialogHeader>
            
            {selectedTable && (
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="orders">Current Orders</TabsTrigger>
                  <TabsTrigger value="history">Order History</TabsTrigger>
                  <TabsTrigger value="details">Table Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="space-y-4">
                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : activeOrder ? (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Active Order #{activeOrder.id.slice(-6)}</CardTitle>
                          <Badge className={getOrderStatusColor(activeOrder.status)}>
                            {activeOrder.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          Created: {new Date(activeOrder.created_at).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Order Items:</h4>
                            {activeOrder.items && activeOrder.items.length > 0 ? (
                              activeOrder.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-600">
                                      Qty: {item.quantity} × ₹{(Number(item.price) || 0).toFixed(2)}
                                    </div>
                                    {item.specialInstructions && (
                                      <div className="text-sm text-orange-600 mt-1">
                                        Note: {item.specialInstructions}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">₹{((Number(item.price) || 0) * (item.quantity || 0)).toFixed(2)}</div>
                                    <Badge variant="outline" className={getOrderStatusColor(item.status || 'pending')}>
                                      {item.status || 'pending'}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p>No items in this order</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Order Total */}
                          <Separator />
                          <div className="flex items-center justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span>₹{(Number(activeOrder.total) || 0).toFixed(2)}</span>
                          </div>
                          
                          {/* Order Actions */}
                          <div className="flex gap-2 pt-4">
                            <Button
                              onClick={() => updateOrderStatus(activeOrder.id, 'confirmed')}
                              disabled={activeOrder.status !== 'pending'}
                              size="sm"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Confirm
                            </Button>
                            <Button
                              onClick={() => updateOrderStatus(activeOrder.id, 'preparing')}
                              disabled={!['confirmed'].includes(activeOrder.status)}
                              size="sm"
                              variant="outline"
                            >
                              <ChefHat className="w-4 h-4 mr-2" />
                              Preparing
                            </Button>
                            <Button
                              onClick={() => updateOrderStatus(activeOrder.id, 'ready')}
                              disabled={!['preparing'].includes(activeOrder.status)}
                              size="sm"
                              variant="outline"
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              Ready
                            </Button>
                            <Button
                              onClick={() => updateOrderStatus(activeOrder.id, 'served')}
                              disabled={!['ready'].includes(activeOrder.status)}
                              size="sm"
                              variant="outline"
                            >
                              <Utensils className="w-4 h-4 mr-2" />
                              Served
                            </Button>
                            <Button
                              onClick={() => updateOrderStatus(activeOrder.id, 'completed')}
                              disabled={!['served'].includes(activeOrder.status)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Receipt className="w-4 h-4 mr-2" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No active orders for this table</p>
                      <Button
                        onClick={() => {
                          setShowTableDialog(false);
                          openPOS(selectedTable);
                        }}
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Order
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="history" className="space-y-4">
                  <ScrollArea className="h-96">
                    {tableOrders.filter(order => ['completed', 'cancelled'].includes(order.status)).length > 0 ? (
                      <div className="space-y-3">
                        {tableOrders
                          .filter(order => ['completed', 'cancelled'].includes(order.status))
                          .map((order) => (
                            <Card key={order.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Order #{order.id.slice(-6)}</span>
                                  <Badge className={getOrderStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  {new Date(order.created_at).toLocaleString()}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{order.items?.length || 0} items</span>
                                  <span className="font-medium">₹{(Number(order.total) || 0).toFixed(2)}</span>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No order history for this table</p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Table Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Table Name</Label>
                          <p className="text-lg">{selectedTable.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Table Number</Label>
                          <p className="text-lg">{selectedTable.table_number}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Capacity</Label>
                          <p className="text-lg">{selectedTable.capacity} people</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Type</Label>
                          <p className="text-lg capitalize">{selectedTable.table_type}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Location</Label>
                          <p className="text-lg">{selectedTable.location || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Status</Label>
                          <Badge className={getStatusColor(selectedTable.status)}>
                            {selectedTable.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-600 mb-2 block">Change Status</Label>
                        <Select
                          value={selectedTable.status}
                          onValueChange={(value: any) => updateTableStatus(selectedTable.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="occupied">Occupied</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* POS Dialog */}
        <Dialog open={showPOSDialog} onOpenChange={setShowPOSDialog}>
          <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                POS System - {selectedTable?.name}
              </DialogTitle>
              <DialogDescription>
                Create new order and process payment
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Menu Items */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Menu Items</h3>
                <ScrollArea className="h-96">
                  {menuItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {menuItems.map((item) => (
                        <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{item.name}</h4>
                              <span className="font-semibold text-green-600">₹{(Number(item.price) || 0).toFixed(2)}</span>
                            </div>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                            )}
                            <Button
                              onClick={() => addToCart(item)}
                              size="sm"
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No menu items available</p>
                      <p className="text-sm">Please add menu items to the restaurant first</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              {/* Cart */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Cart</h3>
                <Card>
                  <CardContent className="p-4">
                    {cartItems.length > 0 ? (
                      <div className="space-y-3">
                        <ScrollArea className="h-64">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 border-b">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.name}</div>
                                <div className="text-xs text-gray-600">₹{(Number(item.price) || 0).toFixed(2)} each</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-lg font-semibold">
                            <span>Total:</span>
                            <span>₹{calculateTotal().toFixed(2)}</span>
                          </div>
                          
                          <div>
                            <Button
                              onClick={processOrder}
                              disabled={isProcessingPayment}
                              className="w-full"
                            >
                              {isProcessingPayment ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Create Order
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Cart is empty</p>
                        <p className="text-sm">Add items from the menu</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}