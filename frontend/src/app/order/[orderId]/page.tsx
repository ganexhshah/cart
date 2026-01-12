"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CustomerLayout } from "@/components/customer/layout";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  CheckCircle,
  Clock,
  ChefHat,
  Bell,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  
  const [orderStatus, setOrderStatus] = useState<'confirmed' | 'preparing' | 'ready' | 'delivered'>('confirmed');
  const [orderProgress, setOrderProgress] = useState(0);

  // Mock order data
  const orderData = {
    id: orderId,
    table: "Table 2",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 18.99 },
      { name: "Caesar Salad", quantity: 1, price: 12.50 }
    ],
    total: 31.49,
    paymentMethod: "Credit Card",
    orderTime: new Date().toLocaleTimeString(),
    estimatedTime: "25 minutes"
  };

  // Simulate order progress
  useEffect(() => {
    if (orderStatus === 'confirmed') {
      const timer = setTimeout(() => {
        setOrderStatus('preparing');
        setOrderProgress(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (orderStatus === 'preparing') {
      const interval = setInterval(() => {
        setOrderProgress(prev => {
          if (prev >= 100) {
            setOrderStatus('ready');
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [orderStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5" />;
      case 'preparing': return <ChefHat className="w-5 h-5" />;
      case 'ready': return <Bell className="w-5 h-5" />;
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <CustomerLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/menu">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Tracking</h1>
            <p className="text-gray-600">Order #{orderId}</p>
          </div>
        </div>

        {/* Order Status */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {getStatusIcon(orderStatus)}
                <span>
                  {orderStatus === 'confirmed' && 'Order Confirmed'}
                  {orderStatus === 'preparing' && 'Preparing Your Order'}
                  {orderStatus === 'ready' && 'Order Ready!'}
                  {orderStatus === 'delivered' && 'Order Delivered'}
                </span>
              </CardTitle>
              <Badge className={getStatusColor(orderStatus)}>
                {orderStatus}
              </Badge>
            </div>
            <CardDescription>
              {orderStatus === 'confirmed' && 'Your order has been confirmed and will be prepared shortly.'}
              {orderStatus === 'preparing' && 'Our chefs are preparing your delicious meal.'}
              {orderStatus === 'ready' && 'Your order is ready for pickup!'}
              {orderStatus === 'delivered' && 'Your order has been delivered. Enjoy your meal!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orderStatus === 'preparing' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Preparation Progress</span>
                  <span>{orderProgress}%</span>
                </div>
                <Progress value={orderProgress} className="h-2" />
                <p className="text-sm text-gray-600">
                  Estimated time: {orderData.estimatedTime}
                </p>
              </div>
            )}
            
            {orderStatus === 'ready' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  🎉 Your order is ready! Please collect it from the counter.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Time:</span>
                <span className="font-medium">{orderData.orderTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span className="font-medium">{orderData.table}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium">{orderData.paymentMethod}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                <span>Total:</span>
                <span>₹{orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Call Waiter
          </Button>
          
          {orderStatus === 'delivered' && (
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Leave a Review
            </Button>
          )}
        </div>

        {/* Order Timeline */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-600">{orderData.orderTime}</p>
                </div>
              </div>
              
              {orderStatus !== 'confirmed' && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Confirmed</p>
                    <p className="text-sm text-gray-600">Payment processed</p>
                  </div>
                </div>
              )}
              
              {(orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'delivered') && (
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    orderStatus === 'preparing' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">Preparation Started</p>
                    <p className="text-sm text-gray-600">Kitchen is preparing your order</p>
                  </div>
                </div>
              )}
              
              {(orderStatus === 'ready' || orderStatus === 'delivered') && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Ready</p>
                    <p className="text-sm text-gray-600">Ready for pickup</p>
                  </div>
                </div>
              )}
              
              {orderStatus === 'delivered' && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Order Delivered</p>
                    <p className="text-sm text-gray-600">Enjoy your meal!</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}