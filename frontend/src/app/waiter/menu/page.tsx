"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WaiterLayout } from "@/components/waiter/layout";
import { useState } from "react";
import Link from "next/link";
import { 
  Search,
  Star,
  Clock,
  DollarSign,
  Utensils,
  Coffee,
  Wine,
  IceCream,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Timer
} from "lucide-react";

export default function WaiterMenuPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock menu data
  const menuItems = [
    {
      id: 1,
      name: "Margherita Pizza",
      category: "mains",
      price: 18.99,
      description: "Fresh tomato sauce, mozzarella cheese, fresh basil, olive oil",
      image: "/api/placeholder/300/200",
      preparationTime: "15-20 min",
      availability: "available",
      allergens: ["gluten", "dairy"],
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: false,
      rating: 4.8,
      ingredients: ["Tomato sauce", "Mozzarella", "Fresh basil", "Olive oil", "Pizza dough"],
      nutritionalInfo: {
        calories: 280,
        protein: "12g",
        carbs: "35g",
        fat: "10g"
      }
    },
    {
      id: 2,
      name: "Grilled Salmon",
      category: "mains",
      price: 24.99,
      description: "Atlantic salmon fillet with lemon herb butter, served with seasonal vegetables",
      image: "/api/placeholder/300/200",
      preparationTime: "20-25 min",
      availability: "available",
      allergens: ["fish"],
      spiceLevel: 0,
      isVegetarian: false,
      isVegan: false,
      rating: 4.9,
      ingredients: ["Atlantic salmon", "Lemon", "Herbs", "Butter", "Seasonal vegetables"],
      nutritionalInfo: {
        calories: 350,
        protein: "28g",
        carbs: "8g",
        fat: "22g"
      }
    },
    {
      id: 3,
      name: "Caesar Salad",
      category: "starters",
      price: 12.50,
      description: "Crisp romaine lettuce, parmesan cheese, croutons, classic Caesar dressing",
      image: "/api/placeholder/300/200",
      preparationTime: "5-10 min",
      availability: "available",
      allergens: ["dairy", "eggs"],
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: false,
      rating: 4.6,
      ingredients: ["Romaine lettuce", "Parmesan cheese", "Croutons", "Caesar dressing"],
      nutritionalInfo: {
        calories: 180,
        protein: "8g",
        carbs: "12g",
        fat: "12g"
      }
    },
    {
      id: 4,
      name: "Spicy Chicken Wings",
      category: "starters",
      price: 14.99,
      description: "Buffalo-style chicken wings with blue cheese dip and celery sticks",
      image: "/api/placeholder/300/200",
      preparationTime: "15-18 min",
      availability: "limited",
      allergens: ["dairy"],
      spiceLevel: 3,
      isVegetarian: false,
      isVegan: false,
      rating: 4.7,
      ingredients: ["Chicken wings", "Buffalo sauce", "Blue cheese", "Celery"],
      nutritionalInfo: {
        calories: 320,
        protein: "24g",
        carbs: "4g",
        fat: "22g"
      }
    },
    {
      id: 5,
      name: "Chocolate Lava Cake",
      category: "desserts",
      price: 8.99,
      description: "Warm chocolate cake with molten center, served with vanilla ice cream",
      image: "/api/placeholder/300/200",
      preparationTime: "12-15 min",
      availability: "available",
      allergens: ["gluten", "dairy", "eggs"],
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: false,
      rating: 4.9,
      ingredients: ["Dark chocolate", "Butter", "Eggs", "Flour", "Vanilla ice cream"],
      nutritionalInfo: {
        calories: 420,
        protein: "6g",
        carbs: "45g",
        fat: "24g"
      }
    },
    {
      id: 6,
      name: "Fresh Orange Juice",
      category: "beverages",
      price: 4.99,
      description: "Freshly squeezed orange juice, no added sugar",
      image: "/api/placeholder/300/200",
      preparationTime: "2-3 min",
      availability: "available",
      allergens: [],
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
      rating: 4.5,
      ingredients: ["Fresh oranges"],
      nutritionalInfo: {
        calories: 110,
        protein: "2g",
        carbs: "26g",
        fat: "0g"
      }
    },
    {
      id: 7,
      name: "Craft Beer",
      category: "beverages",
      price: 6.99,
      description: "Local craft beer selection - ask your server for today's options",
      image: "/api/placeholder/300/200",
      preparationTime: "1-2 min",
      availability: "available",
      allergens: ["gluten"],
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: true,
      rating: 4.4,
      ingredients: ["Hops", "Malt", "Yeast", "Water"],
      nutritionalInfo: {
        calories: 150,
        protein: "1g",
        carbs: "13g",
        fat: "0g"
      }
    },
    {
      id: 8,
      name: "Truffle Pasta",
      category: "mains",
      price: 22.99,
      description: "Handmade pasta with truffle cream sauce and parmesan",
      image: "/api/placeholder/300/200",
      preparationTime: "18-22 min",
      availability: "out_of_stock",
      allergens: ["gluten", "dairy"],
      spiceLevel: 0,
      isVegetarian: true,
      isVegan: false,
      rating: 4.8,
      ingredients: ["Fresh pasta", "Truffle oil", "Cream", "Parmesan", "Black pepper"],
      nutritionalInfo: {
        calories: 380,
        protein: "14g",
        carbs: "42g",
        fat: "18g"
      }
    }
  ];

  const categories = [
    { id: "all", name: "All Items", icon: Utensils },
    { id: "starters", name: "Starters", icon: Utensils },
    { id: "mains", name: "Main Courses", icon: Utensils },
    { id: "desserts", name: "Desserts", icon: IceCream },
    { id: "beverages", name: "Beverages", icon: Coffee }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available": return "bg-green-100 text-green-800";
      case "limited": return "bg-yellow-100 text-yellow-800";
      case "out_of_stock": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case "available": return <CheckCircle className="w-4 h-4" />;
      case "limited": return <AlertTriangle className="w-4 h-4" />;
      case "out_of_stock": return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSpiceLevel = (level: number) => {
    return "🌶️".repeat(level) || "Mild";
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const itemStats = {
    total: menuItems.length,
    available: menuItems.filter(i => i.availability === "available").length,
    limited: menuItems.filter(i => i.availability === "limited").length,
    outOfStock: menuItems.filter(i => i.availability === "out_of_stock").length
  };

  return (
    <WaiterLayout title="Menu Items">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-lg lg:text-2xl font-bold">{itemStats.total}</p>
            </div>
            <Utensils className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-lg lg:text-2xl font-bold text-green-600">{itemStats.available}</p>
            </div>
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Limited</p>
              <p className="text-lg lg:text-2xl font-bold text-yellow-600">{itemStats.limited}</p>
            </div>
            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Out of Stock</p>
              <p className="text-lg lg:text-2xl font-bold text-red-600">{itemStats.outOfStock}</p>
            </div>
            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Link href="/waiter/orders/new" className="w-full sm:w-auto">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Take Order
          </Button>
        </Link>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs sm:text-sm">
              <category.icon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{category.name}</span>
              <span className="sm:hidden">{category.name.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredItems.map((item) => (
          <Dialog key={item.id}>
            <DialogTrigger asChild>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-200"
                onClick={() => setSelectedItem(item)}
              >
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getAvailabilityColor(item.availability)}`}>
                      {getAvailabilityIcon(item.availability)}
                      <span className="ml-1 capitalize">{item.availability.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  {item.spiceLevel > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        {getSpiceLevel(item.spiceLevel)}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Item Name and Rating */}
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                      <div className="flex items-center gap-1 ml-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                    
                    {/* Dietary Info */}
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {item.allergens.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                          Contains: {item.allergens.join(', ')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Price and Prep Time */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-lg">₹{item.price}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Timer className="w-3 h-3" />
                        {item.preparationTime}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      className="w-full mt-3" 
                      variant={item.availability === "out_of_stock" ? "secondary" : "default"}
                      disabled={item.availability === "out_of_stock"}
                    >
                      {item.availability === "out_of_stock" ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No menu items found matching your search.</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Item Details Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedItem.name}
                <Badge className={`${getAvailabilityColor(selectedItem.availability)}`}>
                  {getAvailabilityIcon(selectedItem.availability)}
                  <span className="ml-1 capitalize">{selectedItem.availability.replace('_', ' ')}</span>
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedItem.category.charAt(0).toUpperCase() + selectedItem.category.slice(1)} • ₹{selectedItem.price}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Item Image */}
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description and Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedItem.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Price</h4>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-semibold">₹{selectedItem.price}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Preparation Time</h4>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedItem.preparationTime}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Rating</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedItem.rating}/5.0</span>
                    </div>
                  </div>
                  {selectedItem.spiceLevel > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Spice Level</h4>
                      <span>{getSpiceLevel(selectedItem.spiceLevel)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.ingredients.map((ingredient: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dietary Information */}
              <div>
                <h3 className="font-semibold mb-2">Dietary Information</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.isVegetarian && (
                    <Badge className="bg-green-100 text-green-800">Vegetarian</Badge>
                  )}
                  {selectedItem.isVegan && (
                    <Badge className="bg-green-100 text-green-800">Vegan</Badge>
                  )}
                  {selectedItem.allergens.length > 0 && (
                    <Badge className="bg-red-100 text-red-800">
                      Contains: {selectedItem.allergens.join(', ')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Nutritional Information */}
              <div>
                <h3 className="font-semibold mb-2">Nutritional Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="font-semibold">{selectedItem.nutritionalInfo.calories}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="font-semibold">{selectedItem.nutritionalInfo.protein}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Carbs</p>
                    <p className="font-semibold">{selectedItem.nutritionalInfo.carbs}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Fat</p>
                    <p className="font-semibold">{selectedItem.nutritionalInfo.fat}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
              <Link href="/waiter/orders/new">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={selectedItem.availability === "out_of_stock"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Order
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </WaiterLayout>
  );
}