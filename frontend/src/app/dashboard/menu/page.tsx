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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useState } from "react";
import { 
  Plus,
  Search,
  MoreHorizontal, 
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Star,
  Clock,
  ChefHat,
  Utensils,
  ImageIcon
} from "lucide-react";

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: "Margherita Pizza",
      description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
      price: 18.99,
      category: "pizza",
      image: "/api/placeholder/80/80",
      restaurant: "Pizza Palace",
      restaurantLogo: "/api/placeholder/32/32",
      status: "available",
      preparationTime: 15,
      rating: 4.8,
      orders: 156,
      ingredients: ["Tomato sauce", "Mozzarella cheese", "Fresh basil", "Olive oil"],
      allergens: ["Gluten", "Dairy"],
      calories: 280,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false
    },
    {
      id: 2,
      name: "Pepperoni Pizza",
      description: "Traditional pizza topped with spicy pepperoni and mozzarella",
      price: 21.99,
      category: "pizza",
      image: "/api/placeholder/80/80",
      restaurant: "Pizza Palace",
      restaurantLogo: "/api/placeholder/32/32",
      status: "available",
      preparationTime: 18,
      rating: 4.7,
      orders: 203,
      ingredients: ["Tomato sauce", "Mozzarella cheese", "Pepperoni", "Italian herbs"],
      allergens: ["Gluten", "Dairy"],
      calories: 320,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false
    },
    {
      id: 3,
      name: "Classic Burger",
      description: "Juicy beef patty with lettuce, tomato, onion, and special sauce",
      price: 14.99,
      category: "burgers",
      image: "/api/placeholder/80/80",
      restaurant: "Burger Barn",
      restaurantLogo: "/api/placeholder/32/32",
      status: "available",
      preparationTime: 12,
      rating: 4.5,
      orders: 89,
      ingredients: ["Beef patty", "Lettuce", "Tomato", "Onion", "Special sauce", "Sesame bun"],
      allergens: ["Gluten", "Eggs"],
      calories: 450,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false
    },
    {
      id: 4,
      name: "Veggie Burger",
      description: "Plant-based patty with fresh vegetables and avocado",
      price: 13.99,
      category: "burgers",
      image: "/api/placeholder/80/80",
      restaurant: "Burger Barn",
      restaurantLogo: "/api/placeholder/32/32",
      status: "available",
      preparationTime: 10,
      rating: 4.3,
      orders: 67,
      ingredients: ["Plant-based patty", "Lettuce", "Tomato", "Avocado", "Vegan mayo", "Whole wheat bun"],
      allergens: ["Gluten"],
      calories: 380,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: false
    },
    {
      id: 5,
      name: "Salmon Roll",
      description: "Fresh salmon with cucumber and avocado, served with wasabi",
      price: 12.99,
      category: "sushi",
      image: "/api/placeholder/80/80",
      restaurant: "Sushi Spot",
      restaurantLogo: "/api/placeholder/32/32",
      status: "out_of_stock",
      preparationTime: 8,
      rating: 4.9,
      orders: 134,
      ingredients: ["Fresh salmon", "Cucumber", "Avocado", "Sushi rice", "Nori"],
      allergens: ["Fish"],
      calories: 220,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true
    },
    {
      id: 6,
      name: "Caesar Salad",
      description: "Crisp romaine lettuce with parmesan, croutons, and Caesar dressing",
      price: 12.50,
      category: "salads",
      image: "/api/placeholder/80/80",
      restaurant: "Pizza Palace",
      restaurantLogo: "/api/placeholder/32/32",
      status: "available",
      preparationTime: 5,
      rating: 4.4,
      orders: 78,
      ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing"],
      allergens: ["Dairy", "Gluten", "Eggs"],
      calories: 180,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false
    }
  ]);

  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    preparationTime: "",
    calories: "",
    ingredients: "",
    allergens: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    restaurant: "Pizza Palace" // Default restaurant
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.category) {
      alert("Please fill in all required fields");
      return;
    }

    const item = {
      id: menuItems.length + 1,
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category: newItem.category,
      image: "/api/placeholder/80/80",
      restaurant: newItem.restaurant,
      restaurantLogo: "/api/placeholder/32/32",
      status: "available",
      preparationTime: parseInt(newItem.preparationTime) || 10,
      rating: 0,
      orders: 0,
      ingredients: newItem.ingredients.split(",").map(i => i.trim()).filter(i => i),
      allergens: newItem.allergens.split(",").map(a => a.trim()).filter(a => a),
      calories: parseInt(newItem.calories) || 0,
      isVegetarian: newItem.isVegetarian,
      isVegan: newItem.isVegan,
      isGlutenFree: newItem.isGlutenFree
    };

    setMenuItems([...menuItems, item]);
    setNewItem({
      name: "",
      description: "",
      price: "",
      category: "",
      preparationTime: "",
      calories: "",
      ingredients: "",
      allergens: "",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      restaurant: "Pizza Palace"
    });
    setShowAddDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "out_of_stock": return "bg-red-100 text-red-800";
      case "discontinued": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pizza": return <Utensils className="w-4 h-4" />;
      case "burgers": return <ChefHat className="w-4 h-4" />;
      case "sushi": return <Utensils className="w-4 h-4" />;
      case "salads": return <Utensils className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(menuItems.map(item => item.category)))];
  
  const menuStats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.status === "available").length,
    outOfStock: menuItems.filter(item => item.status === "out_of_stock").length,
    avgRating: (menuItems.reduce((sum, item) => sum + item.rating, 0) / menuItems.length).toFixed(1),
    totalOrders: menuItems.reduce((sum, item) => sum + item.orders, 0),
    avgPrice: (menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(2)
  };

  return (
    <DashboardLayout title="Menu Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{menuStats.total}</p>
              </div>
              <Utensils className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{menuStats.available}</p>
              </div>
              <ChefHat className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{menuStats.outOfStock}</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{menuStats.avgRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{menuStats.totalOrders}</p>
              </div>
              <div className="text-blue-600 text-2xl font-bold">₹</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold text-purple-600">₹{menuStats.avgPrice}</p>
              </div>
              <div className="text-purple-600 text-2xl font-bold">₹</div>
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
              placeholder="Search menu items, restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full sm:w-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs capitalize">
                  {category === "all" ? "All" : category}
                </TabsTrigger>
              ))}
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
          <Button className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({filteredItems.length})</CardTitle>
          <CardDescription>
            Manage menu items across all your restaurants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-60">Item</TableHead>
                  <TableHead className="hidden sm:table-cell">Restaurant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="hidden lg:table-cell">Orders</TableHead>
                  <TableHead className="w-17.5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                            <AvatarFallback className="rounded-lg">
                              <ImageIcon className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            {getCategoryIcon(item.category)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                            {item.isVegetarian && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Vegetarian
                              </Badge>
                            )}
                            {item.isVegan && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Vegan
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.restaurantLogo} alt={item.restaurant} />
                          <AvatarFallback className="text-xs">{item.restaurant.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{item.restaurant}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{item.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {item.orders}
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
                                setSelectedItem(item);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-lg">
                  <AvatarImage src={selectedItem.image} alt={selectedItem.name} className="object-cover" />
                  <AvatarFallback className="rounded-lg">
                    <ImageIcon className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                {selectedItem.name}
              </DialogTitle>
              <DialogDescription>
                Complete menu item information and details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Item Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Item Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                      <p className="text-sm mt-1">{selectedItem.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                      <Badge variant="outline" className="capitalize">
                        {selectedItem.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge className={getStatusColor(selectedItem.status)}>
                        {selectedItem.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Price</Label>
                      <span className="text-lg font-semibold">₹{selectedItem.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Preparation Time</Label>
                      <span className="text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedItem.preparationTime} min
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Restaurant</Label>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedItem.restaurantLogo} alt={selectedItem.restaurant} />
                          <AvatarFallback className="text-xs">{selectedItem.restaurant.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{selectedItem.restaurant}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dietary Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Dietary Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Calories</Label>
                      <span className="text-sm">{selectedItem.calories} cal</span>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Dietary Options</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.isVegetarian && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Vegetarian
                          </Badge>
                        )}
                        {selectedItem.isVegan && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Vegan
                          </Badge>
                        )}
                        {selectedItem.isGlutenFree && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Gluten Free
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Allergens</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedItem.allergens.map((allergen: string) => (
                          <Badge key={allergen} variant="outline" className="bg-red-50 text-red-700">
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ingredients and Performance */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Ingredients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedItem.ingredients.map((ingredient: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 py-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                          <span className="text-sm">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-2xl font-bold">{selectedItem.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Customer Rating</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedItem.orders}</p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                <Edit className="w-4 h-4 mr-2" />
                Edit Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Create a new menu item for your restaurant
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Item Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Margherita Pizza"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your menu item..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-sm font-medium">
                    Price (₹) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="prepTime" className="text-sm font-medium">
                    Prep Time (min)
                  </Label>
                  <Input
                    id="prepTime"
                    type="number"
                    placeholder="15"
                    value={newItem.preparationTime}
                    onChange={(e) => setNewItem({...newItem, preparationTime: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <Select value={newItem.category} onValueChange={(value: string) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pizza">Pizza</SelectItem>
                    <SelectItem value="burgers">Burgers</SelectItem>
                    <SelectItem value="sushi">Sushi</SelectItem>
                    <SelectItem value="salads">Salads</SelectItem>
                    <SelectItem value="appetizers">Appetizers</SelectItem>
                    <SelectItem value="desserts">Desserts</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="restaurant" className="text-sm font-medium">
                  Restaurant
                </Label>
                <Select value={newItem.restaurant} onValueChange={(value: string) => setNewItem({...newItem, restaurant: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza Palace">Pizza Palace</SelectItem>
                    <SelectItem value="Burger Barn">Burger Barn</SelectItem>
                    <SelectItem value="Sushi Spot">Sushi Spot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="calories" className="text-sm font-medium">
                  Calories
                </Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="250"
                  value={newItem.calories}
                  onChange={(e) => setNewItem({...newItem, calories: e.target.value})}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="ingredients" className="text-sm font-medium">
                  Ingredients
                </Label>
                <Textarea
                  id="ingredients"
                  placeholder="Tomato sauce, Mozzarella cheese, Fresh basil..."
                  value={newItem.ingredients}
                  onChange={(e) => setNewItem({...newItem, ingredients: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">Separate ingredients with commas</p>
              </div>
              
              <div>
                <Label htmlFor="allergens" className="text-sm font-medium">
                  Allergens
                </Label>
                <Input
                  id="allergens"
                  placeholder="Gluten, Dairy, Nuts..."
                  value={newItem.allergens}
                  onChange={(e) => setNewItem({...newItem, allergens: e.target.value})}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate allergens with commas</p>
              </div>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Dietary Options</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vegetarian"
                    checked={newItem.isVegetarian}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isVegetarian: !!checked})}
                  />
                  <Label htmlFor="vegetarian" className="text-sm">Vegetarian</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vegan"
                    checked={newItem.isVegan}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isVegan: !!checked})}
                  />
                  <Label htmlFor="vegan" className="text-sm">Vegan</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="glutenFree"
                    checked={newItem.isGlutenFree}
                    onCheckedChange={(checked: boolean) => setNewItem({...newItem, isGlutenFree: !!checked})}
                  />
                  <Label htmlFor="glutenFree" className="text-sm">Gluten Free</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} className="bg-slate-900 hover:bg-slate-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}