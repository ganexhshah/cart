"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { menuApi, MenuItem, MenuCategory } from "@/lib/menu";
import { restaurantApi } from "@/lib/restaurants";
import { tableApi } from "@/lib/tables";
import { orderApi } from "@/lib/orders";
import CartCheckout from "@/components/customer/cart-checkout";
import OrderStatus from "@/components/customer/order-status";
import { 
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Clock,
  ImageIcon,
  MapPin,
  Users,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Heart,
  Leaf,
  Flame,
  X,
  ChefHat,
  Phone,
  Info,
  Wifi,
  Bell,
  MessageCircle,
  Store,
  Utensils,
  Menu as MenuIcon,
  Home,
  Share2,
  Copy,
  Check
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  address?: string;
  phone?: string;
  rating?: number;
  total_reviews?: number;
}

interface Table {
  id: string;
  table_number: string;
  name: string;
  capacity: number;
  location: string;
  restaurant_id: string;
  restaurant_name?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function RestaurantMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const restaurantSlug = params.restaurantSlug as string;
  const tableId = params.tableId as string;
  
  // State
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showRestaurantInfo, setShowRestaurantInfo] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showOrderStatus, setShowOrderStatus] = useState(false);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load restaurant and menu data
  useEffect(() => {
    loadRestaurantData();
  }, [restaurantSlug, tableId]);

  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load restaurant by slug
      const restaurantResponse = await restaurantApi.getBySlug(restaurantSlug);
      if (!restaurantResponse.success) {
        throw new Error('Restaurant not found');
      }

      setRestaurant(restaurantResponse.data);

      let tableData;
      const tableResponse = await tableApi.getTable(tableId);
      if (!tableResponse.success) {
        throw new Error('Table not found');
      }
      tableData = tableResponse.data;
      
      // Verify table belongs to restaurant
      if (tableData.restaurant_id !== restaurantResponse.data.id) {
        throw new Error('Table does not belong to this restaurant');
      }
      
      setTable(tableData);

      // Load menu categories for this restaurant
      const categoriesResponse = await menuApi.getCategories(restaurantResponse.data.id);
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Load menu items for this restaurant
      const menuResponse = await menuApi.getMenuItems({
        restaurantId: restaurantResponse.data.id
      });
      if (menuResponse.success) {
        setMenuItems(menuResponse.data);
      }

    } catch (error) {
      console.error('Error loading restaurant data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  // Cart functions
  const addToCart = (item: MenuItem, quantity: number = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  const removeFromCart = (itemId: string, quantity: number = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem) {
      if (existingItem.quantity <= quantity) {
        setCart(cart.filter(cartItem => cartItem.id !== itemId));
      } else {
        setCart(cart.map(cartItem => 
          cartItem.id === itemId 
            ? { ...cartItem, quantity: cartItem.quantity - quantity }
            : cartItem
        ));
      }
    }
  };

  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId, 999); // Remove completely
    } else {
      setCart(cart.map(cartItem => 
        cartItem.id === itemId 
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));
    }
  };

  const removeCartItem = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.id !== itemId));
  };

  // Order functions
  const handlePlaceOrder = async (orderData: any) => {
    try {
      const response = await orderApi.createGuest({
        restaurantId: restaurant?.id || '',
        tableId: tableId,
        items: orderData.items.map((item: any) => ({
          menuItemId: item.menu_item_id,
          quantity: item.quantity,
          specialInstructions: item.special_instructions
        })),
        orderType: 'dine-in',
        specialInstructions: orderData.special_instructions,
        customerInfo: orderData.customerInfo // Optional guest info
      });
      
      if (response.success) {
        setCurrentOrder(response.data);
        setCart([]); // Clear cart after successful order
        return response;
      }
      throw new Error('Failed to place order');
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  // Filter menu items by category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategory);

  const cartTotal = cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Call waiter function
  const callWaiter = () => {
    // In a real app, this would send a notification to the restaurant's system
    alert(`Waiter has been called for ${table?.name}. They will be with you shortly!`);
  };

  // Show WiFi info
  const showWifiInfo = () => {
    setShowRestaurantInfo(true);
  };

  // Share functionality
  const shareMenu = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${restaurant?.name} - Menu`,
          text: `Check out the menu at ${restaurant?.name}`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      setShowShareDialog(true);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Categories Skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 shrink-0" />
              ))}
            </div>
            
            {/* Menu Items Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Enhanced Restaurant Header */}
        {restaurant && (
          <div className="sticky top-0 z-40 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-primary-foreground/20 shrink-0">
                    <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                    <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                      <Store className="w-6 h-6 sm:w-8 sm:h-8" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold truncate">{restaurant.name}</h1>
                    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-primary-foreground/80 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{restaurant.rating || 4.5}</span>
                        <span className="hidden sm:inline">({restaurant.total_reviews || 0} reviews)</span>
                      </div>
                      {restaurant.address && (
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate text-xs sm:text-sm">{restaurant.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shareMenu}
                  className="text-primary-foreground hover:bg-primary-foreground/10 shrink-0"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* Action Buttons Row - Responsive */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={callWaiter}
                  variant="secondary"
                  size="sm"
                  className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                >
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Call Waiter</span>
                </Button>
                
                <Button
                  onClick={showWifiInfo}
                  variant="secondary"
                  size="sm"
                  className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                >
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">WiFi</span>
                </Button>
                
                <Button
                  onClick={() => setShowRestaurantInfo(true)}
                  variant="secondary"
                  size="sm"
                  className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                >
                  <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm">About</span>
                </Button>

                {restaurant.phone && (
                  <Button
                    onClick={() => window.open(`tel:${restaurant.phone}`, '_self')}
                    variant="secondary"
                    size="sm"
                    className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm hidden sm:inline">Call</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table Information Bar */}
        {table && (
          <div className="bg-card border-b sticky top-[120px] sm:top-[140px] z-30">
            <div className="container mx-auto px-4 py-3 max-w-7xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Badge variant="secondary" className="shrink-0">
                    <Utensils className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">{table.name}</span>
                  </Badge>
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    {table.location} • {table.capacity} people
                    {tableId === 'demo-table' && (
                      <span className="ml-2 text-orange-600 font-medium">• Preview</span>
                    )}
                  </span>
                </div>
                
                {cartItemCount > 0 && (
                  <Button 
                    onClick={() => setShowCart(true)}
                    size="sm"
                    className="shrink-0"
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">{cartItemCount} • ₹{cartTotal.toFixed(2)}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Search and Categories */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories - Responsive Tabs */}
            {categories.length > 0 && (
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto h-auto p-1">
                  <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap">
                    All Items
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="text-xs sm:text-sm whitespace-nowrap"
                    >
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* Compact Menu Cards Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {filteredItems
                .filter(item => 
                  searchTerm === "" || 
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.description?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((item) => (
                <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 rounded-lg group">
                  {/* Image Section */}
                  <div className="relative h-32 overflow-hidden">
                    {item.image_url ? (
                      <>
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <ChefHat className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Vegetarian/Vegan Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {item.is_vegetarian && (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                          🌱
                        </Badge>
                      )}
                      {item.is_vegan && (
                        <Badge className="bg-green-600 hover:bg-green-700 text-white text-xs px-1.5 py-0.5 rounded-full">
                          V
                        </Badge>
                      )}
                    </div>

                    {/* Heart Icon - Top Right */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white hover:bg-white/90 w-6 h-6 rounded-full shadow-sm"
                      onClick={() => {
                        const newFavorites = favorites.includes(item.id)
                          ? favorites.filter(id => id !== item.id)
                          : [...favorites, item.id];
                        setFavorites(newFavorites);
                      }}
                    >
                      <Heart 
                        className={`w-3 h-3 ${
                          favorites.includes(item.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600'
                        }`} 
                      />
                    </Button>
                  </div>
                  
                  {/* Content Section */}
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      {/* Title and Description */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 leading-tight">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Meta Information */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          <span>{item.average_rating || 4.2}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.preparation_time || 15}m</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Actions Section */}
                  <div className="px-2 pb-2">
                    <div className="flex items-center justify-between">
                      {/* Price */}
                      <span className="text-base font-bold text-gray-900">
                        ₹{Number(item.price || 0).toFixed(0)}
                      </span>
                      
                      {/* Quantity Controls */}
                      {cart.find(cartItem => cartItem.id === item.id) ? (
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-0.5 py-0.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-semibold min-w-6 text-center text-xs text-gray-900">
                            {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                          </span>
                          <Button
                            size="icon"
                            onClick={() => addToCart(item)}
                            className="h-6 w-6 rounded-full bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          className="rounded-full px-3 py-1 h-7 text-xs bg-primary hover:bg-primary/90"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchTerm ? 'No items found matching your search.' : 'No menu items available for this category.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Floating Action Buttons - Mobile Optimized */}
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={callWaiter}
                size={isMobile ? "default" : "lg"}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0"
              >
                <Bell className="w-4 h-4 sm:w-6 sm:h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Call Waiter</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={showWifiInfo}
                size={isMobile ? "default" : "lg"}
                variant="outline"
                className="bg-background hover:bg-muted shadow-lg rounded-full w-12 h-12 sm:w-14 sm:h-14 p-0"
              >
                <Wifi className="w-4 h-4 sm:w-6 sm:h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>WiFi Info</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Floating Cart Button - Responsive */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button 
              onClick={() => setShowCart(true)}
              size={isMobile ? "default" : "lg"}
              className="shadow-lg rounded-full px-4 py-2 sm:px-6 sm:py-3"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-xs sm:text-sm font-medium">
                {cartItemCount} • ₹{cartTotal.toFixed(2)}
              </span>
            </Button>
          </div>
        )}

        {/* Order Status Button */}
        {currentOrder && (
          <div className="fixed bottom-20 right-4 z-50">
            <Button 
              onClick={() => setShowOrderStatus(true)}
              size={isMobile ? "default" : "lg"}
              variant="outline"
              className="shadow-lg rounded-full px-4 py-2 sm:px-6 sm:py-3 bg-background"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-xs sm:text-sm font-medium">
                Track Order
              </span>
            </Button>
          </div>
        )}

        {/* Cart Checkout */}
        <CartCheckout
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          cartItems={cart}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeCartItem}
          onPlaceOrder={handlePlaceOrder}
          restaurantName={restaurant?.name}
          tableName={table?.name}
        />

        {/* Order Status */}
        <OrderStatus
          isOpen={showOrderStatus}
          onClose={() => setShowOrderStatus(false)}
          orderId={currentOrder?.id}
          onRefresh={() => {
            // Refresh order status
            console.log('Refreshing order status...');
          }}
        />

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Menu</DialogTitle>
              <DialogDescription>
                Share this menu with friends and family
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={() => copyToClipboard(typeof window !== 'undefined' ? window.location.href : '')}
                >
                  {copySuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {copySuccess && (
                <p className="text-sm text-green-600">Link copied to clipboard!</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

      {/* Restaurant Info Dialog - Using shadcn/ui Components */}
      <Sheet open={showRestaurantInfo} onOpenChange={setShowRestaurantInfo}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={restaurant?.logo_url} alt={restaurant?.name} />
                <AvatarFallback>
                  <Store className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h2 className="text-2xl font-bold">{restaurant?.name}</h2>
                <p className="text-sm text-muted-foreground">Restaurant Information</p>
              </div>
            </SheetTitle>
          </SheetHeader>
          
          <Separator className="mb-6" />
          
          <ScrollArea className="h-full">
            <div className="space-y-6 pr-4 pb-8">
              {/* Restaurant Description */}
              {restaurant?.description && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary mt-1 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">About Us</h3>
                        <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {restaurant?.phone && (
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-muted-foreground font-mono">{restaurant.phone}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(`tel:${restaurant.phone}`, '_self')}
                          size="sm"
                        >
                          Call
                        </Button>
                      </div>
                    )}
                    
                    {restaurant?.address && (
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-muted-foreground">{restaurant.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* WiFi Information */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Wifi className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Free WiFi Available</h3>
                      <p className="text-muted-foreground">Connect to enjoy complimentary internet</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Network Name:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          {restaurant?.name?.replace(/\s+/g, '_')}_WiFi
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(restaurant?.name?.replace(/\s+/g, '_') + '_WiFi')}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">Password:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          welcome123
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard('welcome123')}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Table Information */}
              {table && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Utensils className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Your Table</h3>
                        <p className="text-muted-foreground">Current seating information</p>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium flex items-center gap-2">
                          <Utensils className="w-4 h-4" />
                          Table:
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {table.name}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location:
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {table.location}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Capacity:
                        </span>
                        <Badge variant="outline" className="font-semibold">
                          {table.capacity} people
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button 
                      onClick={callWaiter} 
                      className="w-full h-12"
                    >
                      <Bell className="w-5 h-5 mr-2" />
                      Call Waiter
                    </Button>
                    
                    {restaurant?.phone && (
                      <Button
                        onClick={() => window.open(`tel:${restaurant.phone}`, '_self')}
                        variant="outline"
                        className="w-full h-12"
                      >
                        <Phone className="w-5 h-5 mr-2" />
                        Call Restaurant
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
    </TooltipProvider>
  );
}