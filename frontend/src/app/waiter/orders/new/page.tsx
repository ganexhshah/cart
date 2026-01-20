"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WaiterLayout } from "@/components/waiter/layout";
import { useState } from "react";
import Link from "next/link";
import { 
  Plus,
  Minus,
  ShoppingCart,
  User,
  MapPin,
  Utensils,
  DollarSign,
  Clock,
  Save
} from "lucide-react";

export default function NewOrderPage() {
  const [selectedTable, setSelectedTable] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");

  // Mock menu items for quick selection
  const quickMenuItems = [
    { id: 1, name: "Margherita Pizza", price: 18.99, category: "mains" },
    { id: 2, name: "Caesar Salad", price: 12.50, category: "starters" },
    { id: 3, name: "Grilled Salmon", price: 24.99, category: "mains" },
    { id: 4, name: "Chocolate Cake", price: 8.99, category: "desserts" },
    { id: 5, name: "Coke", price: 2.99, category: "beverages" },
    { id: 6, name: "Coffee", price: 3.99, category: "beverages" }
  ];

  const addItemToOrder = (item: any) => {
    const existingItem = orderItems.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setOrderItems(orderItems.map(orderItem => 
        orderItem.id === item.id 
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1, notes: "" }]);
    }
  };

  const updateItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setOrderItems(orderItems.filter(item => item.id !== itemId));
    } else {
      setOrderItems(orderItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const updateItemNotes = (itemId: number, notes: string) => {
    setOrderItems(orderItems.map(item => 
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <WaiterLayout title="Take New Order">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Table Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer & Table Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Table Number</label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          Table {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Customer Name</label>
                  <Input
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number (Optional)</label>
                <Input
                  placeholder="Enter phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          {/* Quick Menu Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Quick Menu Selection
              </CardTitle>
              <CardDescription>
                Tap items to add them to the order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickMenuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => addItemToOrder(item)}
                  >
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-xs text-muted-foreground">₹{item.price}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/waiter/menu">
                  <Button variant="outline" className="w-full">
                    <Utensils className="w-4 h-4 mr-2" />
                    View Full Menu
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requests, allergies, or modifications..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Right Side */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
              {selectedTable && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Table {selectedTable}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Special notes for this item..."
                        value={item.notes}
                        onChange={(e) => updateItemNotes(item.id, e.target.value)}
                        className="text-xs"
                      />
                      <div className="text-right">
                        <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {orderItems.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={orderItems.length === 0 || !selectedTable || !customerName}
            >
              <Save className="w-4 h-4 mr-2" />
              Place Order
            </Button>
            
            <Button variant="outline" className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            
            <Link href="/waiter/orders" className="block">
              <Button variant="ghost" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </WaiterLayout>
  );
}