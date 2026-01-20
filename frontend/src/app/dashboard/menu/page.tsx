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
import { menuApi, MenuItem, MenuCategory, MenuStats } from "@/lib/menu";
import { restaurantApi } from "@/lib/restaurants";
import { useState, useEffect } from "react";
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
  ImageIcon,
  Loader2
} from "lucide-react";

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [menuStats, setMenuStats] = useState<MenuStats>({
    total_items: 0,
    available_items: 0,
    out_of_stock_items: 0,
    discontinued_items: 0,
    avg_rating: 0,
    total_orders: 0,
    avg_price: 0,
    featured_items: 0
  });

  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    preparationTime: "",
    calories: "",
    ingredients: "",
    allergens: "",
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    restaurantId: "" // Will be set from user's restaurants
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories
      const categoriesResponse = await menuApi.getCategories();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }

      // Load user's restaurants
      const restaurantsResponse = await restaurantApi.getAll();
      if (restaurantsResponse.success) {
        setRestaurants(restaurantsResponse.data);
        // Set default restaurant for new items
        if (restaurantsResponse.data.length > 0) {
          setNewItem(prev => ({ ...prev, restaurantId: restaurantsResponse.data[0].id }));
        }
      }

      // Load menu items
      await loadMenuItems();

      // Load stats
      const statsResponse = await menuApi.getMenuStats();
      if (statsResponse.success) {
        setMenuStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        categoryId: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined
      };

      const response = await menuApi.getUserMenuItems(filters);
      if (response.success) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  // Reload items when filters change
  useEffect(() => {
    if (!isLoading) {
      loadMenuItems();
    }
  }, [searchTerm, categoryFilter]);

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.categoryId || !newItem.restaurantId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const itemData = {
        restaurantId: newItem.restaurantId,
        categoryId: parseInt(newItem.categoryId),
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        preparationTime: newItem.preparationTime ? parseInt(newItem.preparationTime) : undefined,
        calories: newItem.calories ? parseInt(newItem.calories) : undefined,
        ingredients: newItem.ingredients.split(",").map(i => i.trim()).filter(i => i),
        allergens: newItem.allergens.split(",").map(a => a.trim()).filter(a => a),
        isVegetarian: newItem.isVegetarian,
        isVegan: newItem.isVegan,
        isGlutenFree: newItem.isGlutenFree
      };

      const response = await menuApi.createMenuItem(itemData);
      if (response.success) {
        // Reset form
        setNewItem({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          preparationTime: "",
          calories: "",
          ingredients: "",
          allergens: "",
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          restaurantId: restaurants.length > 0 ? restaurants[0].id : ""
        });
        setShowAddDialog(false);
        
        // Reload data
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      alert('Failed to create menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const response = await menuApi.deleteMenuItem(itemId);
      if (response.success) {
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    try {
      const response = await menuApi.updateItemStatus(itemId, newStatus);
      if (response.success) {
        await loadMenuItems();
        const statsResponse = await menuApi.getMenuStats();
        if (statsResponse.success) {
          setMenuStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800";
      case "out_of_stock": return "bg-red-100 text-red-800";
      case "discontinued": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categoryName?.toLowerCase();
    switch (category) {
      case "pizza": return <Utensils className="w-4 h-4" />;
      case "burgers": return <ChefHat className="w-4 h-4" />;
      case "sushi": return <Utensils className="w-4 h-4" />;
      case "salads": return <Utensils className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
                         item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category_id?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    { value: "all", label: "All" },
    ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
  ];

  return (
    <DashboardLayout title="Menu Management">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{menuStats.total_items}</p>
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
                    <p className="text-2xl font-bold text-green-600">{menuStats.available_items}</p>
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
                    <p className="text-2xl font-bold text-red-600">{menuStats.out_of_stock_items}</p>
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
                    <p className="text-2xl font-bold text-yellow-600">{Number(menuStats.avg_rating || 0).toFixed(1)}</p>
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
                    <p className="text-2xl font-bold text-blue-600">{menuStats.total_orders}</p>
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
                    <p className="text-2xl font-bold text-purple-600">₹{Number(menuStats.avg_price || 0).toFixed(2)}</p>
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
              {categoryOptions.slice(0, 5).map((category) => (
                <TabsTrigger key={category.value} value={category.value} className="text-xs capitalize">
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none" onClick={loadData}>
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
                            <AvatarImage src={item.image_url || "/api/placeholder/80/80"} alt={item.name} className="object-cover" />
                            <AvatarFallback className="rounded-lg">
                              <ImageIcon className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            {getCategoryIcon(item.category_name || "")}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.category_name}
                            </Badge>
                            {item.is_vegetarian && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Vegetarian
                              </Badge>
                            )}
                            {item.is_vegan && (
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
                          <AvatarImage src="/api/placeholder/32/32" alt={item.restaurant_name} />
                          <AvatarFallback className="text-xs">{item.restaurant_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{item.restaurant_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">₹{Number(item.price || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{Number(item.average_rating || 0).toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                      {item.total_orders || 0}
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
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteItem(item.id)}
                          >
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
                      <span className="text-lg font-semibold">₹{Number(selectedItem.price || 0).toFixed(2)}</span>
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
                <Select value={newItem.categoryId} onValueChange={(value: string) => setNewItem({...newItem, categoryId: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="restaurant" className="text-sm font-medium">
                  Restaurant
                </Label>
                <Select value={newItem.restaurantId} onValueChange={(value: string) => setNewItem({...newItem, restaurantId: value})}>
                  <SelectTrigger className="mt-1">
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
            <Button 
              onClick={handleAddItem} 
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
        </>
      )}
    </DashboardLayout>
  );
}