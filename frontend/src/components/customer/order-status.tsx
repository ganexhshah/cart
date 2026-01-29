"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  Bell,
  Utensils,
  Timer,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status?: 'pending' | 'preparing' | 'ready' | 'served';
}

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  items: OrderItem[];
  total: number;
  created_at: string;
  estimated_time?: number;
  special_instructions?: string;
  table_name?: string;
}

interface OrderStatusProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onRefresh?: () => void;
}

const ORDER_STATUSES = {
  pending: { label: 'Order Received', icon: Clock, color: 'bg-yellow-500', progress: 20 },
  confirmed: { label: 'Order Confirmed', icon: CheckCircle, color: 'bg-blue-500', progress: 40 },
  preparing: { label: 'Being Prepared', icon: ChefHat, color: 'bg-orange-500', progress: 70 },
  ready: { label: 'Ready to Serve', icon: Bell, color: 'bg-green-500', progress: 90 },
  served: { label: 'Served', icon: Utensils, color: 'bg-green-600', progress: 100 },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'bg-red-500', progress: 0 }
};

export default function OrderStatus({
  isOpen,
  onClose,
  orderId,
  onRefresh
}: OrderStatusProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Mock order data - replace with actual API call
  const mockOrder: Order = {
    id: orderId || 'ORD123456',
    status: 'preparing',
    items: [
      { id: '1', name: 'Margherita Pizza', quantity: 1, price: 299, status: 'preparing' },
      { id: '2', name: 'Caesar Salad', quantity: 2, price: 199, status: 'ready' }
    ],
    total: 697,
    created_at: new Date().toISOString(),
    estimated_time: 25,
    special_instructions: 'Extra cheese please',
    table_name: 'Table 5'
  };

  useEffect(() => {
    if (isOpen && orderId) {
      loadOrderStatus();
    }
  }, [isOpen, orderId]);

  // Timer for elapsed time
  useEffect(() => {
    if (!order || !isOpen) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const orderTime = new Date(order.created_at).getTime();
      const elapsed = Math.floor((now - orderTime) / 1000 / 60); // minutes
      setTimeElapsed(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [order, isOpen]);

  const loadOrderStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrder(mockOrder);
    } catch (err) {
      setError('Failed to load order status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadOrderStatus();
    onRefresh?.();
  };

  const getStatusInfo = (status: Order['status']) => {
    return ORDER_STATUSES[status] || ORDER_STATUSES.pending;
  };

  const getEstimatedTimeRemaining = () => {
    if (!order?.estimated_time) return null;
    const remaining = order.estimated_time - timeElapsed;
    return Math.max(0, remaining);
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="w-6 h-6" />
              Order Status
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <Separator className="mb-6" />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Loading order status...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
              <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
              <p className="text-destructive">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : order ? (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* Order Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {order.table_name} • {new Date(order.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusInfo(order.status).color} text-white`}
                    >
                      {getStatusInfo(order.status).label}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getStatusInfo(order.status).progress}%</span>
                    </div>
                    <Progress value={getStatusInfo(order.status).progress} className="h-2" />
                  </div>

                  {/* Time Information */}
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{timeElapsed}</p>
                      <p className="text-xs text-muted-foreground">Minutes Elapsed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {getEstimatedTimeRemaining() || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Minutes Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Timeline</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-4">
                    {Object.entries(ORDER_STATUSES).map(([status, info], index) => {
                      const isActive = order.status === status;
                      const isPassed = getStatusInfo(order.status).progress >= info.progress;
                      const Icon = info.icon;
                      
                      return (
                        <div key={status} className="flex items-center gap-4">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${isPassed ? info.color + ' text-white' : 'bg-muted text-muted-foreground'}
                            ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
                          `}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isPassed ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {info.label}
                            </p>
                            {isActive && (
                              <p className="text-sm text-primary">Current Status</p>
                            )}
                          </div>
                          {isPassed && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Utensils className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity} • ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <Badge variant={item.status === 'ready' ? 'default' : 'secondary'}>
                          {item.status === 'ready' ? 'Ready' : 'Preparing'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Special Instructions */}
              {order.special_instructions && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Special Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-muted-foreground italic">
                      "{order.special_instructions}"
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold">₹{order.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3 pb-6">
                <Button onClick={handleRefresh} variant="outline" className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                
                {order.status === 'ready' && (
                  <Button className="w-full" size="lg">
                    <Bell className="w-4 h-4 mr-2" />
                    Call Waiter - Food is Ready!
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}