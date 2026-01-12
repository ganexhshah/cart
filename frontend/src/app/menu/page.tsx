"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RestaurantHeader } from "@/components/customer/restaurant-header";
import { useState, useEffect, useMemo } from "react";
import { 
  Plus,
  Minus,
  Search,
  Star,
  Clock,
  ImageIcon,
  ShoppingCart,
  Bell,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Flame,
  Leaf,
  ShieldCheck,
  Zap,
  Settings,
  MessageSquare,
  Heart,
  Share2,
  Filter,
  ChefHat,
  Truck,
  Utensils
} from "lucide-react";

// Types
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  restaurant: string;
  preparationTime: number;
  rating: number;
  reviews: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  available: boolean;
  discount?: number;
  calories?: number;
  ingredients: string[];
  allergens: string[];
}

interface Table {
  id: string;
  name: string;
  capacity: number;
  location: string;
  available: boolean;
  type: 'indoor' | 'outdoor' | 'private';
}

interface CartItem extends MenuItem {
  quantity: number;
}

type OrderStep = 'menu' | 'table' | 'cart' | 'payment' | 'confirmation' | 'tracking' | 'review';

export default function MenuPage() {
  // Core state
  const [currentStep, setCurrentStep] = useState<OrderStep>('menu');
  const [isLoading, setIsLoading] = useState(false);
  
  // Menu state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating' | 'time'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [showOnlyDiscounted, setShowOnlyDiscounted] = useState(false);
  
  // Order state
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryOption, setDeliveryOption] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<'confirmed' | 'preparing' | 'ready' | 'served'>('confirmed');
  const [orderProgress, setOrderProgress] = useState(0);
  
  // UI state
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showSearchSection, setShowSearchSection] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  
  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  // Mock data
  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: "Truffle Margherita Pizza",
      description: "Artisanal pizza with fresh mozzarella, San Marzano tomatoes, basil, and truffle oil",
      price: 24.99,
      category: "pizza",
      image: "/api/placeholder/400/300",
      restaurant: "Bella Vista",
      preparationTime: 18,
      rating: 4.8,
      reviews: 156,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      available: true,
      discount: 10,
      calories: 320,
      ingredients: ["San Marzano tomatoes", "Fresh mozzarella", "Basil", "Truffle oil", "Sourdough base"],
      allergens: ["Gluten", "Dairy"]
    },
    {
      id: 2,
      name: "Wagyu Beef Burger",
      description: "Premium wagyu beef patty with aged cheddar, caramelized onions, and house sauce",
      price: 32.99,
      category: "burgers",
      image: "/api/placeholder/400/300",
      restaurant: "Gourmet Grill",
      preparationTime: 15,
      rating: 4.9,
      reviews: 203,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      available: true,
      calories: 650,
      ingredients: ["Wagyu beef", "Aged cheddar", "Caramelized onions", "House sauce", "Brioche bun"],
      allergens: ["Gluten", "Dairy", "Eggs"]
    },
    {
      id: 3,
      name: "Dragon Roll Deluxe",
      description: "Premium sushi roll with eel, avocado, cucumber, topped with spicy mayo and eel sauce",
      price: 18.99,
      category: "sushi",
      image: "/api/placeholder/400/300",
      restaurant: "Sakura Sushi",
      preparationTime: 12,
      rating: 4.7,
      reviews: 89,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isSpicy: true,
      isPopular: false,
      available: true,
      calories: 280,
      ingredients: ["Fresh eel", "Avocado", "Cucumber", "Sushi rice", "Nori", "Spicy mayo"],
      allergens: ["Fish", "Eggs"]
    },
    {
      id: 4,
      name: "Mediterranean Quinoa Bowl",
      description: "Nutritious bowl with quinoa, roasted vegetables, feta cheese, and tahini dressing",
      price: 16.99,
      category: "healthy",
      image: "/api/placeholder/400/300",
      restaurant: "Green Garden",
      preparationTime: 10,
      rating: 4.6,
      reviews: 134,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: true,
      isSpicy: false,
      isPopular: false,
      available: true,
      calories: 420,
      ingredients: ["Quinoa", "Roasted vegetables", "Feta cheese", "Tahini", "Mixed greens"],
      allergens: ["Dairy", "Sesame"]
    },
    {
      id: 5,
      name: "Chocolate Lava Cake",
      description: "Decadent chocolate cake with molten center, served with vanilla ice cream",
      price: 12.99,
      category: "desserts",
      image: "/api/placeholder/400/300",
      restaurant: "Sweet Dreams",
      preparationTime: 8,
      rating: 4.9,
      reviews: 267,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: true,
      available: true,
      calories: 580,
      ingredients: ["Dark chocolate", "Butter", "Eggs", "Sugar", "Vanilla ice cream"],
      allergens: ["Gluten", "Dairy", "Eggs"]
    },
    {
      id: 6,
      name: "Craft Beer Selection",
      description: "Rotating selection of local craft beers on tap",
      price: 8.99,
      category: "beverages",
      image: "/api/placeholder/400/300",
      restaurant: "Brew House",
      preparationTime: 2,
      rating: 4.4,
      reviews: 78,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: false,
      isSpicy: false,
      isPopular: false,
      available: true,
      calories: 150,
      ingredients: ["Hops", "Malt", "Yeast", "Water"],
      allergens: ["Gluten"]
    }
  ];

  const tables: Table[] = [
    { id: "T1", name: "Table 1", capacity: 2, location: "Window Side", available: true, type: 'indoor' },
    { id: "T2", name: "Table 2", capacity: 4, location: "Center Hall", available: true, type: 'indoor' },
    { id: "T3", name: "Table 3", capacity: 6, location: "Corner Booth", available: false, type: 'indoor' },
    { id: "T4", name: "Table 4", capacity: 2, location: "Garden View", available: true, type: 'outdoor' },
    { id: "T5", name: "Table 5", capacity: 8, location: "Private Dining", available: true, type: 'private' },
    { id: "T6", name: "Table 6", capacity: 4, location: "Terrace", available: true, type: 'outdoor' },
  ];

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", description: "Visa, Mastercard, Amex" },
    { id: "wallet", name: "Digital Wallet", description: "Apple Pay, Google Pay, PayPal" },
    { id: "upi", name: "UPI Payment", description: "PhonePe, GPay, Paytm" },
  ];

  // Computed values
  const categories = useMemo(() => {
    const cats = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];
    return cats;
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let filtered = menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesDietary = dietaryFilters.length === 0 || dietaryFilters.every(filter => {
        switch (filter) {
          case 'vegetarian': return item.isVegetarian;
          case 'vegan': return item.isVegan;
          case 'gluten-free': return item.isGlutenFree;
          case 'spicy': return item.isSpicy;
          default: return true;
        }
      });
      const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
      const matchesAvailability = !showOnlyAvailable || item.available;
      const matchesDiscount = !showOnlyDiscounted || item.discount;
      
      return matchesSearch && matchesCategory && matchesDietary && matchesPrice && matchesAvailability && matchesDiscount;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'time':
          return a.preparationTime - b.preparationTime;
        case 'popular':
        default:
          return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating;
      }
    });

    return filtered;
  }, [searchTerm, categoryFilter, dietaryFilters, sortBy, priceRange, showOnlyAvailable, showOnlyDiscounted]);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Effects
  useEffect(() => {
    // Keyboard shortcut for command palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Order tracking effect
  useEffect(() => {
    if (currentStep === 'confirmation' && orderStatus === 'confirmed') {
      const timer = setTimeout(() => {
        setOrderStatus('preparing');
        setOrderProgress(33);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'confirmation' && orderStatus === 'preparing') {
      const timer = setTimeout(() => {
        setOrderStatus('ready');
        setOrderProgress(66);
      }, 8000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'confirmation' && orderStatus === 'ready') {
      const timer = setTimeout(() => {
        setOrderStatus('served');
        setOrderProgress(100);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'confirmation' && orderStatus === 'served') {
      const timer = setTimeout(() => {
        setCurrentStep('review');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, orderStatus]);

  // Handlers
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

  const removeFromCart = (itemId: number, quantity: number = 1) => {
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

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setShowTableDialog(false);
    if (currentStep === 'table') {
      setCurrentStep('menu');
    }
  };

  const handleProceedToCart = () => {
    if (cart.length === 0) {
      alert("Please add items to your cart!");
      return;
    }
    setCurrentStep('cart');
  };

  const toggleDietaryFilter = (filter: string) => {
    setDietaryFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const toggleFavorite = (itemId: number) => {
    setFavorites(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setDietaryFilters([]);
    setPriceRange([0, 50]);
    setShowOnlyAvailable(true);
    setShowOnlyDiscounted(false);
  };

  const handleQuickOrder = (item: MenuItem) => {
    addToCart(item);
    if (!selectedTable) {
      setShowTableDialog(true);
    } else {
      setCurrentStep('cart');
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'menu': return 16;
      case 'table': return 33;
      case 'cart': return 50;
      case 'payment': return 66;
      case 'confirmation': return 83;
      case 'tracking': return 100;
      case 'review': return 100;
      default: return 0;
    }
  };

  // Render functions
  const renderMenuItem = (item: MenuItem) => (
    <Card 
      key={item.id} 
      className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        !item.available ? 'opacity-60' : 'cursor-pointer'
      }`}
      onClick={() => item.available && setSelectedItem(item) && setShowItemDialog(true)}
    >
      <div className="relative">
        <div className="aspect-4/3 overflow-hidden">
          <Avatar className="w-full h-full rounded-none">
            <AvatarImage 
              src={item.image} 
              alt={item.name} 
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300" 
            />
            <AvatarFallback className="rounded-none w-full h-full bg-linear-to-br from-gray-100 to-gray-200">
              <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Overlay badges */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
          {item.isPopular && (
            <Badge className="bg-orange-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              <span className="hidden sm:inline">Popular</span>
              <span className="sm:hidden">Pop</span>
            </Badge>
          )}
          {item.discount && (
            <Badge className="bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1">
              {item.discount}% OFF
            </Badge>
          )}
        </div>

        {/* Top right badges */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1">
          {item.isVegetarian && (
            <Badge className="bg-green-500 text-white text-xs px-1 sm:px-1.5 py-0.5">🌱</Badge>
          )}
          {item.isVegan && (
            <Badge className="bg-green-600 text-white text-xs px-1 sm:px-1.5 py-0.5">V</Badge>
          )}
          {item.isGlutenFree && (
            <Badge className="bg-blue-500 text-white text-xs px-1 sm:px-1.5 py-0.5">GF</Badge>
          )}
          {item.isSpicy && (
            <Badge className="bg-red-600 text-white text-xs px-1 sm:px-1.5 py-0.5">🌶️</Badge>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-0.5 sm:gap-1 bg-black/30 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                <Star className="w-2 h-2 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{item.rating}</span>
                <span className="text-xs opacity-75 hidden sm:inline">({item.reviews})</span>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1 bg-black/30 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
                <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                <span className="text-xs">{item.preparationTime}m</span>
              </div>
            </div>
          </div>
        </div>

        {!item.available && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Badge className="bg-red-500 text-white text-xs sm:text-sm">Out of Stock</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          <div>
            <h3 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
            <p className="text-xs text-gray-500 mt-1">{item.restaurant}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-2">
                {item.discount ? (
                  <>
                    <span className="text-base sm:text-lg font-bold text-green-600">
                      ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      ₹{item.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-base sm:text-lg font-bold text-gray-900">
                    ₹{item.price.toFixed(2)}
                  </span>
                )}
              </div>
              {item.calories && (
                <span className="text-xs text-gray-500">{item.calories} cal</span>
              )}
            </div>
            
            {item.available ? (
              <div className="flex items-center gap-1 sm:gap-2">
                {cart.find(cartItem => cartItem.id === item.id) ? (
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 rounded-lg p-0.5 sm:p-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-gray-200"
                    >
                      <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
                    </Button>
                    <span className="font-medium min-w-4 sm:min-w-6 text-center text-xs sm:text-sm">
                      {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(item);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8"
                  >
                    <Plus className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    Add
                  </Button>
                )}
              </div>
            ) : (
              <Button disabled variant="outline" size="sm" className="text-xs h-7 sm:h-8">
                Unavailable
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        {/* Restaurant Header */}
        <RestaurantHeader onCallWaiter={() => alert('Waiter has been called!')} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header with Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {currentStep === 'menu' && 'Our Menu'}
                {currentStep === 'table' && 'Select Table'}
                {currentStep === 'cart' && 'Your Order'}
                {currentStep === 'payment' && 'Payment'}
                {currentStep === 'confirmation' && 'Order Confirmed'}
                {currentStep === 'tracking' && 'Order Tracking'}
                {currentStep === 'review' && 'Leave Review'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {currentStep === 'menu' && 'Discover delicious dishes from our partner restaurants'}
                {currentStep === 'table' && 'Choose your preferred seating'}
                {currentStep === 'cart' && 'Review your items before checkout'}
                {currentStep === 'payment' && 'Complete your order'}
                {currentStep === 'confirmation' && 'Thank you for your order!'}
                {currentStep === 'tracking' && 'Order Tracking'}
                {currentStep === 'review' && 'Share your dining experience'}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0">
              {selectedTable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 cursor-pointer text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {selectedTable.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{selectedTable.location} • {selectedTable.capacity} seats</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {cartItemCount > 0 && currentStep === 'menu' && (
                <Button 
                  onClick={handleProceedToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4 py-2"
                  size="sm"
                >
                  <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Cart ({cartItemCount})
                </Button>
              )}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'menu' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Filter and Category Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearchSection(!showSearchSection)}
                    className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {showSearchSection ? 'Hide Filters' : 'Show Filters'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCategories(!showCategories)}
                    className="bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    {showCategories ? 'Hide Categories' : 'Show Categories'}
                  </Button>
                  
                  {/* Quick Stats */}
                  <span className="text-xs sm:text-sm text-gray-500">
                    {filteredAndSortedItems.length} dishes available
                  </span>
                </div>
                
                {/* Quick Clear Filters */}
                {(searchTerm || categoryFilter !== 'all' || dietaryFilters.length > 0 || !showOnlyAvailable || showOnlyDiscounted) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {/* Advanced Search and Filters */}
              {showSearchSection && (
                <Card className="shadow-sm border animate-in slide-in-from-top-2 duration-200">
                  <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6 pt-3 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg">Find Your Perfect Dish</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                      >
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {showFilters ? 'Hide' : 'Show'} Advanced Filters
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      <Input
                        placeholder="Search dishes, restaurants, ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 sm:pl-10 h-9 sm:h-11 text-sm"
                      />
                      {searchTerm && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 p-0"
                        >
                          <X className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Quick Filters Row */}
                    <div className="flex flex-wrap gap-2">
                      <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                        <SelectTrigger className="w-32 sm:w-40 h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="popular">Most Popular</SelectItem>
                          <SelectItem value="rating">Highest Rated</SelectItem>
                          <SelectItem value="price">Price: Low to High</SelectItem>
                          <SelectItem value="time">Fastest Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={deliveryOption} onValueChange={(value: any) => setDeliveryOption(value)}>
                        <SelectTrigger className="w-24 sm:w-32 h-8 sm:h-9 text-xs sm:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dine-in">Dine In</SelectItem>
                          <SelectItem value="takeaway">Takeaway</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Switch
                          id="available-only"
                          checked={showOnlyAvailable}
                          onCheckedChange={setShowOnlyAvailable}
                          className="scale-75 sm:scale-100"
                        />
                        <Label htmlFor="available-only" className="text-xs sm:text-sm">Available only</Label>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Switch
                          id="discounted-only"
                          checked={showOnlyDiscounted}
                          onCheckedChange={setShowOnlyDiscounted}
                          className="scale-75 sm:scale-100"
                        />
                        <Label htmlFor="discounted-only" className="text-xs sm:text-sm">On sale</Label>
                      </div>
                    </div>
                    
                    {/* Advanced Filters Panel */}
                    {showFilters && (
                      <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t animate-in slide-in-from-top-2 duration-200">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="dietary">
                            <AccordionTrigger className="text-sm sm:text-base py-2 sm:py-4">Dietary Preferences</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                                {[
                                  { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
                                  { id: 'vegan', label: 'Vegan', icon: Leaf },
                                  { id: 'gluten-free', label: 'Gluten Free', icon: ShieldCheck },
                                  { id: 'spicy', label: 'Spicy', icon: Flame }
                                ].map((filter) => (
                                  <div key={filter.id} className="flex items-center space-x-1 sm:space-x-2">
                                    <Checkbox
                                      id={filter.id}
                                      checked={dietaryFilters.includes(filter.id)}
                                      onCheckedChange={() => toggleDietaryFilter(filter.id)}
                                      className="scale-75 sm:scale-100"
                                    />
                                    <Label htmlFor={filter.id} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                                      <filter.icon className="w-2 h-2 sm:w-3 sm:h-3" />
                                      {filter.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="price">
                            <AccordionTrigger className="text-sm sm:text-base py-2 sm:py-4">Price Range</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                  <span>₹{priceRange[0]}</span>
                                  <span>₹{priceRange[1]}</span>
                                </div>
                                <Slider
                                  value={priceRange}
                                  onValueChange={setPriceRange}
                                  max={50}
                                  min={0}
                                  step={1}
                                  className="w-full"
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        
                        <div className="flex justify-between items-center">
                          <Button variant="outline" onClick={clearAllFilters} size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
                            Clear All Filters
                          </Button>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {filteredAndSortedItems.length} items found
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Categories Tabs */}
              {showCategories && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
                    <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 bg-white h-8 sm:h-10 p-0.5 sm:p-1">
                      {categories.map((category) => (
                        <TabsTrigger 
                          key={category} 
                          value={category} 
                          className="capitalize data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs sm:text-sm px-1 sm:px-2 py-1 sm:py-1.5 h-7 sm:h-8"
                        >
                          {category === 'all' ? 'All' : category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Menu Items Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="aspect-4/3 w-full" />
                      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
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
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {filteredAndSortedItems.map(renderMenuItem)}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredAndSortedItems.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No dishes found</AlertTitle>
                  <AlertDescription>
                    Try adjusting your search criteria or filters to find more options.
                    <Button variant="link" onClick={clearAllFilters} className="p-0 h-auto ml-1">
                      Clear all filters
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Cart/Order Step */}
          {currentStep === 'cart' && (
            <div className="space-y-4 sm:space-y-6">
              {cart.length === 0 ? (
                <Card className="text-center py-8 sm:py-12">
                  <CardContent>
                    <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Add some delicious items from our menu</p>
                    <Button onClick={() => setCurrentStep('menu')} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Browse Menu
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                    <Card>
                      <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-base sm:text-lg">Order Items ({cartItemCount})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep('menu')}
                            className="text-blue-600 hover:text-blue-700 self-start sm:self-auto text-sm"
                          >
                            Add More Items
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
                              <AvatarImage src={item.image} alt={item.name} />
                              <AvatarFallback>
                                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base line-clamp-1">{item.name}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-1">{item.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{item.restaurant}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {item.discount ? (
                                  <>
                                    <span className="font-bold text-green-600 text-sm sm:text-base">
                                      ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                                    </span>
                                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                                      ₹{item.price.toFixed(2)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                                    ₹{item.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
                              <div className="flex items-center gap-1 sm:gap-1.5 bg-gray-50 rounded-lg p-0.5 sm:p-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-gray-200"
                                >
                                  <Minus className="w-2 h-2 sm:w-3 sm:h-3" />
                                </Button>
                                <span className="font-medium min-w-4 sm:min-w-6 text-center text-xs sm:text-sm">
                                  {item.quantity}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Plus className="w-2 h-2 sm:w-3 sm:h-3" />
                                </Button>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-sm sm:text-base">
                                  ₹{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="space-y-3 sm:space-y-4">
                    {/* Table Selection */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">Table Selection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedTable ? (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm sm:text-base">{selectedTable.name}</div>
                              <div className="text-xs sm:text-sm text-gray-600 truncate">{selectedTable.location}</div>
                              <div className="text-xs text-gray-500">{selectedTable.capacity} seats</div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowTableDialog(true)}
                              className="ml-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-auto"
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full text-sm sm:text-base py-2 sm:py-3"
                            onClick={() => setShowTableDialog(true)}
                          >
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Select Table
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Order Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Subtotal</span>
                          <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Service Charge (5%)</span>
                          <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>GST (18%)</span>
                          <span>₹{(cartTotal * 0.18).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base sm:text-lg">
                          <span>Total</span>
                          <span>₹{(cartTotal * 1.23).toFixed(2)}</span>
                        </div>
                        
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-3 sm:mt-4 py-2 sm:py-3 text-sm sm:text-base"
                          onClick={() => setCurrentStep('payment')}
                          disabled={!selectedTable}
                        >
                          {selectedTable ? 'Proceed to Payment' : 'Select Table First'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Payment Method</CardTitle>
                  <p className="text-xs sm:text-sm text-gray-600">Choose your preferred payment method</p>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="grid gap-3 sm:gap-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                          paymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setPaymentMethod(method.id)}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 shrink-0 ${
                            paymentMethod === method.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {paymentMethod === method.id && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base">{method.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600 truncate">{method.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-3 sm:pt-4 border-t">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
                      <span className="font-semibold text-sm sm:text-base">Total Amount:</span>
                      <span className="text-lg sm:text-xl font-bold text-blue-600">₹{(cartTotal * 1.23).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep('cart')}
                        className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                      >
                        Back to Cart
                      </Button>
                      <Button
                        onClick={() => {
                          if (!paymentMethod) {
                            alert("Please select a payment method!");
                            return;
                          }
                          // Generate order ID and start tracking
                          const newOrderId = `ORD${Date.now()}`;
                          setOrderId(newOrderId);
                          setOrderStatus('confirmed');
                          setOrderProgress(0);
                          setCurrentStep('confirmation');
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 sm:py-3"
                        disabled={!paymentMethod}
                      >
                        Place Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Confirmation/Tracking Step */}
          {currentStep === 'confirmation' && (
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              {/* Order Header */}
              <Card>
                <CardContent className="py-4 sm:py-6 px-4 sm:px-6">
                  <div className="text-center mb-4 sm:mb-6">
                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-500 mb-3 sm:mb-4" />
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      Order ID: <span className="font-mono font-semibold text-blue-600">#{orderId}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {selectedTable && `Table: ${selectedTable.name} • ${selectedTable.location}`}
                    </p>
                  </div>
                  
                  {/* Order Status Progress */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Order Status</h3>
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Amount</div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">₹{(cartTotal * 1.23).toFixed(2)}</div>
                      </div>
                    </div>
                    
                    {/* Progress Steps */}
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div 
                          className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-in-out"
                          style={{ width: `${orderProgress}%` }}
                        ></div>
                      </div>
                      
                      {/* Status Steps */}
                      <div className="grid grid-cols-4 gap-2 sm:gap-4">
                        {/* Order Confirmed */}
                        <div className={`text-center p-2 sm:p-3 rounded-lg transition-all ${
                          orderStatus === 'confirmed' ? 'bg-blue-100 border-2 border-blue-500' : 
                          orderProgress > 0 ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                            orderStatus === 'confirmed' ? 'bg-blue-500 text-white' :
                            orderProgress > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">Order Confirmed</div>
                          {orderStatus === 'confirmed' && (
                            <div className="text-xs text-blue-600 mt-1">Processing...</div>
                          )}
                        </div>
                        
                        {/* Preparing */}
                        <div className={`text-center p-2 sm:p-3 rounded-lg transition-all ${
                          orderStatus === 'preparing' ? 'bg-orange-100 border-2 border-orange-500' : 
                          orderProgress > 33 ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                            orderStatus === 'preparing' ? 'bg-orange-500 text-white animate-pulse' :
                            orderProgress > 33 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            <ChefHat className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">Preparing</div>
                          {orderStatus === 'preparing' && (
                            <div className="text-xs text-orange-600 mt-1">Cooking...</div>
                          )}
                        </div>
                        
                        {/* Ready */}
                        <div className={`text-center p-2 sm:p-3 rounded-lg transition-all ${
                          orderStatus === 'ready' ? 'bg-green-100 border-2 border-green-500' : 
                          orderProgress > 66 ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                            orderStatus === 'ready' ? 'bg-green-500 text-white animate-bounce' :
                            orderProgress > 66 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">Ready</div>
                          {orderStatus === 'ready' && (
                            <div className="text-xs text-green-600 mt-1">Ready to serve!</div>
                          )}
                        </div>
                        
                        {/* Served */}
                        <div className={`text-center p-2 sm:p-3 rounded-lg transition-all ${
                          orderStatus === 'served' ? 'bg-purple-100 border-2 border-purple-500' : 'bg-gray-100'
                        }`}>
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${
                            orderStatus === 'served' ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="text-xs sm:text-sm font-medium">Served</div>
                          {orderStatus === 'served' && (
                            <div className="text-xs text-purple-600 mt-1">Enjoy your meal!</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Messages */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      {orderStatus === 'confirmed' && (
                        <p className="text-sm sm:text-base text-gray-700">
                          <span className="font-semibold">Your order has been confirmed!</span><br />
                          Our kitchen team is preparing to start cooking your delicious meal.
                        </p>
                      )}
                      {orderStatus === 'preparing' && (
                        <p className="text-sm sm:text-base text-gray-700">
                          <span className="font-semibold">Your food is being prepared!</span><br />
                          Our chefs are carefully cooking your order with fresh ingredients.
                        </p>
                      )}
                      {orderStatus === 'ready' && (
                        <p className="text-sm sm:text-base text-gray-700">
                          <span className="font-semibold">Your order is ready!</span><br />
                          Our staff will serve your meal to your table shortly.
                        </p>
                      )}
                      {orderStatus === 'served' && (
                        <p className="text-sm sm:text-base text-gray-700">
                          <span className="font-semibold">Enjoy your meal!</span><br />
                          Your order has been served. We hope you have a wonderful dining experience!
                        </p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCart([]);
                          setCurrentStep('menu');
                          setPaymentMethod('');
                          setOrderId('');
                          setOrderStatus('confirmed');
                          setOrderProgress(0);
                        }}
                        className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                      >
                        Order More Items
                      </Button>
                      
                      {orderStatus === 'served' && (
                        <Button
                          onClick={() => setCurrentStep('review')}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 sm:py-3"
                        >
                          Leave a Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">How was your experience?</CardTitle>
                  <p className="text-sm sm:text-base text-gray-600">
                    We'd love to hear about your dining experience at Bella Vista Restaurant
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Star Rating */}
                  <div className="text-center">
                    <Label className="text-base sm:text-lg font-semibold mb-3 block">Rate your experience</Label>
                    <div className="flex justify-center gap-1 sm:gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="transition-all hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 sm:w-10 sm:h-10 ${
                              star <= reviewRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">
                      {reviewRating === 0 && 'Click to rate'}
                      {reviewRating === 1 && 'Poor'}
                      {reviewRating === 2 && 'Fair'}
                      {reviewRating === 3 && 'Good'}
                      {reviewRating === 4 && 'Very Good'}
                      {reviewRating === 5 && 'Excellent'}
                    </div>
                  </div>
                  
                  {/* Review Comment */}
                  <div>
                    <Label htmlFor="review-comment" className="text-sm sm:text-base font-medium mb-2 block">
                      Tell us more about your experience (optional)
                    </Label>
                    <textarea
                      id="review-comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about the food, service, ambiance..."
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      rows={4}
                    />
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Your Order</div>
                    <div className="space-y-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>₹{((item.discount ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{(cartTotal * 1.23).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset everything and go back to menu
                        setCart([]);
                        setCurrentStep('menu');
                        setPaymentMethod('');
                        setOrderId('');
                        setOrderStatus('confirmed');
                        setOrderProgress(0);
                        setReviewRating(0);
                        setReviewComment('');
                      }}
                      className="flex-1 text-sm sm:text-base py-2 sm:py-3"
                    >
                      Skip Review
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (reviewRating === 0) {
                          alert("Please provide a rating!");
                          return;
                        }
                        
                        // Show success message
                        alert(`Thank you for your ${reviewRating}-star review! Your feedback helps us improve.`);
                        
                        // Reset everything and go back to menu
                        setCart([]);
                        setCurrentStep('menu');
                        setPaymentMethod('');
                        setOrderId('');
                        setOrderStatus('confirmed');
                        setOrderProgress(0);
                        setReviewRating(0);
                        setReviewComment('');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base py-2 sm:py-3"
                      disabled={reviewRating === 0}
                    >
                      Submit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other steps would be implemented here... */}
        </div>

        {/* Floating Cart - Mobile */}
        {cartItemCount > 0 && currentStep === 'menu' && (
          <div className="fixed bottom-4 left-3 right-3 md:hidden z-50">
            <Button 
              onClick={handleProceedToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl rounded-xl sm:rounded-2xl"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 sm:gap-3">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>View Cart ({cartItemCount})</span>
                </div>
                <div className="bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-sm sm:text-base">
                  ₹{cartTotal.toFixed(2)}
                </div>
              </div>
            </Button>
          </div>
        )}

        {/* Enhanced Item Detail Dialog */}
        <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedItem && (
              <div className="space-y-6">
                <DialogHeader>
                  <div className="aspect-video w-full overflow-hidden rounded-lg mb-4 relative">
                    <Avatar className="w-full h-full rounded-lg">
                      <AvatarImage 
                        src={selectedItem.image} 
                        alt={selectedItem.name} 
                        className="object-cover w-full h-full" 
                      />
                      <AvatarFallback className="rounded-lg w-full h-full">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Action buttons overlay */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => toggleFavorite(selectedItem.id)}
                              className="bg-white/90 hover:bg-white"
                            >
                              <Heart className={`h-4 w-4 ${favorites.includes(selectedItem.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{favorites.includes(selectedItem.id) ? 'Remove from favorites' : 'Add to favorites'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share this dish</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-2xl flex items-center gap-3">
                        {selectedItem.name}
                        {selectedItem.isPopular && (
                          <Badge className="bg-orange-500">
                            <Zap className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </DialogTitle>
                      <DialogDescription className="text-base mt-2">
                        {selectedItem.description}
                      </DialogDescription>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedItem.rating}</span>
                          <span className="text-gray-500">({selectedItem.reviews} reviews)</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{selectedItem.preparationTime} min</span>
                        </div>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="text-gray-600">{selectedItem.restaurant}</span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Ingredients</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {selectedItem.ingredients.map((ingredient, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span className="text-sm">{ingredient}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Dietary Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {selectedItem.isVegetarian && (
                              <Badge className="bg-green-100 text-green-800">
                                <Leaf className="w-3 h-3 mr-1" />
                                Vegetarian
                              </Badge>
                            )}
                            {selectedItem.isVegan && (
                              <Badge className="bg-green-100 text-green-800">
                                <Leaf className="w-3 h-3 mr-1" />
                                Vegan
                              </Badge>
                            )}
                            {selectedItem.isGlutenFree && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <ShieldCheck className="w-3 h-3 mr-1" />
                                Gluten Free
                              </Badge>
                            )}
                            {selectedItem.isSpicy && (
                              <Badge className="bg-red-100 text-red-800">
                                <Flame className="w-3 h-3 mr-1" />
                                Spicy
                              </Badge>
                            )}
                          </div>
                          
                          {selectedItem.allergens.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Allergens:</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedItem.allergens.map((allergen, index) => (
                                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    {allergen}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="nutrition" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Nutritional Facts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Calories</TableCell>
                              <TableCell>{selectedItem.calories || 'N/A'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Preparation Time</TableCell>
                              <TableCell>{selectedItem.preparationTime} minutes</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Serving Size</TableCell>
                              <TableCell>1 portion</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="space-y-4">
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500">Reviews coming soon!</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedItem.discount ? (
                      <>
                        <span className="text-3xl font-bold text-green-600">
                          ₹{(selectedItem.price * (1 - selectedItem.discount / 100)).toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{selectedItem.price.toFixed(2)}
                        </span>
                        <Badge className="bg-red-500 text-white">
                          {selectedItem.discount}% OFF
                        </Badge>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{selectedItem.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleQuickOrder(selectedItem)}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Quick Order
                    </Button>
                    
                    {cart.find(cartItem => cartItem.id === selectedItem.id) ? (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(selectedItem.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium min-w-8 text-center">
                          {cart.find(cartItem => cartItem.id === selectedItem.id)?.quantity || 0}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => addToCart(selectedItem)}
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => addToCart(selectedItem)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Table Selection Sheet */}
        <Sheet open={showTableDialog} onOpenChange={setShowTableDialog}>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Select Your Table</SheetTitle>
              <SheetDescription>
                Choose a table that suits your party size and preferences
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6 space-y-4">
              {tables.map((table) => (
                <Card 
                  key={table.id} 
                  className={`cursor-pointer transition-all ${
                    !table.available ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                  } ${selectedTable?.id === table.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                  onClick={() => table.available && handleTableSelect(table)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{table.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{table.location}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{table.capacity} seats</span>
                          </div>
                          <Badge variant={table.type === 'private' ? 'default' : 'outline'}>
                            {table.type}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {table.available ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Available
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Occupied
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Simple Command Palette */}
        <Dialog open={showCommandPalette} onOpenChange={setShowCommandPalette}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Quick Actions</DialogTitle>
              <DialogDescription>
                Search for dishes or perform quick actions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentStep('cart');
                    setShowCommandPalette(false);
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View Cart ({cartItemCount})
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowTableDialog(true);
                    setShowCommandPalette(false);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Select Table
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    alert('Waiter has been called!');
                    setShowCommandPalette(false);
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Call Waiter
                </Button>
              </div>
              
              {filteredAndSortedItems.length > 0 && (
                <div>
                  <Separator />
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Popular Items</Label>
                    <div className="mt-2 space-y-2">
                      {filteredAndSortedItems.slice(0, 3).map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className="w-full justify-start h-auto p-2"
                          onClick={() => {
                            setSelectedItem(item);
                            setShowItemDialog(true);
                            setShowCommandPalette(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={item.image} alt={item.name} />
                              <AvatarFallback>
                                <ImageIcon className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500">₹{item.price}</div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}