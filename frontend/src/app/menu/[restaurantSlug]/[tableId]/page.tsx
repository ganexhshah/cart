"use client";

import { useParams, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RestaurantHeader } from "@/components/customer/restaurant-header";
import { menuApi, MenuItem, MenuCategory } from "@/lib/menu";
import { restaurantApi } from "@/lib/restaurants";
import { tableApi } from "@/lib/tables";
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
  Loader2
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Load table information
      let tableData;
      if (tableId === 'demo-table') {
        // Create a demo table for menu preview
        tableData = {
          id: 'demo-table',
          table_number: 'DEMO',
          name: 'Demo Table',
          capacity: 4,
          location: 'Preview Mode',
          restaurant_id: restaurantResponse.data.id,
          restaurant_name: restaurantResponse.data.name
        };
      } else {
        const tableResponse = await tableApi.getTable(tableId);
        if (!tableResponse.success) {
          throw new Error('Table not found');
        }
        tableData = tableResponse.data;
        
        // Verify table belongs to restaurant
        if (tableData.restaurant_id !== restaurantResponse.data.id) {
          throw new Error('Table does not belong to this restaurant');
        }
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

  // Filter menu items by category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategory);

  const cartTotal = cart.reduce((total, item) => total + (Number(item.price || 0) * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      {restaurant && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20 rounded-lg">
                <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                <AvatarFallback className="rounded-lg text-2xl">
                  {restaurant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                {restaurant.description && (
                  <p className="text-gray-600 mb-3">{restaurant.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating || 0}</span>
                    <span>({restaurant.total_reviews || 0} reviews)</span>
                  </div>
                  {restaurant.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Information */}
      {table && (
        <div className={`border-b ${tableId === 'demo-table' ? 'bg-orange-50' : 'bg-blue-50'}`}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={`${tableId === 'demo-table' ? 'bg-orange-600' : 'bg-blue-600'} text-white px-3 py-1`}>
                  <Users className="w-4 h-4 mr-2" />
                  {table.name}
                </Badge>
                <span className="text-sm text-gray-600">
                  {table.location} • Capacity: {table.capacity} people
                  {tableId === 'demo-table' && (
                    <span className="ml-2 text-orange-600 font-medium">• Menu Preview Mode</span>
                  )}
                </span>
              </div>
              
              {cartItemCount > 0 && (
                <Button className={`${tableId === 'demo-table' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart ({cartItemCount}) • ₹{cartTotal.toFixed(2)}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className="whitespace-nowrap"
              >
                All Items
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage 
                      src={item.image_url || "/api/placeholder/400/300"} 
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                    <AvatarFallback className="rounded-none w-full h-full">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {item.is_vegetarian && (
                      <Badge className="bg-green-500 text-white text-xs">🌱 Veg</Badge>
                    )}
                    {item.is_vegan && (
                      <Badge className="bg-green-600 text-white text-xs">Vegan</Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{item.average_rating || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparation_time}m</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{Number(item.price || 0).toFixed(2)}
                      </span>
                      
                      {cart.find(cartItem => cartItem.id === item.id) ? (
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium min-w-6 text-center">
                            {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => addToCart(item)}
                            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => addToCart(item)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No menu items available for this category. Please try another category.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            size="lg"
            className={`${tableId === 'demo-table' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white shadow-lg rounded-full px-6 py-3`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {cartItemCount} items • ₹{cartTotal.toFixed(2)}
          </Button>
        </div>
      )}
    </div>
  );
}