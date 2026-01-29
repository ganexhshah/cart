"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Clock,
  CheckCircle,
  Loader2,
  CreditCard,
  Utensils,
  X
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number | string | null;
  quantity: number;
  image_url?: string | null;
  preparation_time?: number;
}

interface CartCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onPlaceOrder: (orderData: any) => Promise<any>;
  restaurantName?: string;
  tableName?: string;
}

// Utility function to safely convert price to number
const safePrice = (price: number | string | null | undefined): number => {
  if (price === null || price === undefined) return 0;
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(numPrice) ? 0 : numPrice;
};

export default function CartCheckout({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  restaurantName,
  tableName
}: CartCheckoutProps) {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const subtotal = cartItems.reduce((total, item) => total + (safePrice(item.price) * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const estimatedTime = Math.max(...cartItems.map(item => item.preparation_time || 15));

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: safePrice(item.price)
        })),
        special_instructions: specialInstructions,
        subtotal,
        tax,
        total
      };

      const result = await onPlaceOrder(orderData);
      if (result.success) {
        setOrderPlaced(true);
        setPlacedOrderId(result.data.id);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleClose = () => {
    if (orderPlaced) {
      setOrderPlaced(false);
      setPlacedOrderId(null);
      setSpecialInstructions('');
    }
    onClose();
  };

  if (orderPlaced) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className={isMobile ? "h-[90vh]" : "h-[80vh]"}>
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 sm:space-y-6 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-green-800">Order Placed Successfully!</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your order has been sent to the kitchen
              </p>
            </div>

            <Card className="w-full max-w-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      #{placedOrderId?.slice(-8).toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Items:</span>
                    <span className="font-medium text-sm">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-bold text-base">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Time:</span>
                    <span className="font-medium text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {estimatedTime} mins
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 w-full max-w-sm">
              <Button onClick={handleClose} className="w-full h-11" size="lg">
                Continue Browsing
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-11"
                onClick={() => {
                  // This would open order status
                  handleClose();
                }}
              >
                Track Order Status
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className={isMobile ? "h-[95vh]" : "h-[90vh]"}>
        <SheetHeader className="pb-2">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingCart className="w-5 h-5" />
            Your Order
            {cartItems.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <Separator className="mb-2" />

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 px-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">Add some delicious items to get started!</p>
            </div>
            <Button onClick={onClose} variant="outline" className="mt-2">
              Continue Browsing
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Cart Items */}
            <ScrollArea className="flex-1 pr-2 sm:pr-4">
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-3">
                      {/* Mobile Layout */}
                      {isMobile ? (
                        <div>
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Utensils className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm leading-tight mb-1">{item.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                ₹{safePrice(item.price).toFixed(2)} each
                              </p>
                              {item.preparation_time && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {item.preparation_time} mins
                                </p>
                              )}
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onRemoveItem(item.id)}
                              className="h-6 w-6 text-destructive hover:text-destructive shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 bg-muted rounded-full px-1 py-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 rounded-full"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="font-medium min-w-6 text-center text-sm px-2">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 rounded-full"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">
                                {item.quantity} × ₹{safePrice(item.price).toFixed(2)}
                              </div>
                              <div className="font-semibold text-sm">
                                ₹{(safePrice(item.price) * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Desktop Layout */
                        <div>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Utensils className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ₹{safePrice(item.price).toFixed(2)} each
                              </p>
                              {item.preparation_time && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />
                                  {item.preparation_time} mins
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 bg-muted rounded-full px-1 py-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                  className="h-6 w-6 rounded-full"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="font-medium min-w-6 text-center text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="icon"
                                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                  className="h-6 w-6 rounded-full"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onRemoveItem(item.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              {item.quantity} × ₹{safePrice(item.price).toFixed(2)}
                            </span>
                            <span className="font-semibold">
                              ₹{(safePrice(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Special Instructions */}
            <div className="py-2 space-y-2">
              <Label htmlFor="instructions" className="text-sm font-medium">Special Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Any special requests for your order..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Order Summary */}
            <Card className="mt-2">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground pt-1">
                    <span>Estimated Time</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {estimatedTime} mins
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <div className="pt-3">
              <Button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cartItems.length === 0}
                className="w-full h-11 text-base font-medium"
                size="lg"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Place Order • ₹{total.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}