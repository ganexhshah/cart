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
import { DashboardLayout } from "@/components/dashboard/layout";
import Link from "next/link";
import { useState } from "react";
import { 
  Plus, 
  Search,
  MoreHorizontal, 
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  Crop
} from "lucide-react";

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  // Mock data
  const restaurants = [
    {
      id: 1,
      name: "Pizza Palace",
      logo: "/api/placeholder/40/40",
      status: "active",
      orders: 156,
      revenue: 12450,
      rating: 4.8,
      location: "123 Downtown St, City Center",
      phone: "+1 (555) 123-4567",
      email: "contact@pizzapalace.com",
      description: "Authentic Italian pizzas with fresh ingredients",
      openHours: "10:00 AM - 11:00 PM",
      cuisine: "Italian"
    },
    {
      id: 2,
      name: "Burger Barn",
      logo: "/api/placeholder/40/40",
      status: "active",
      orders: 89,
      revenue: 8900,
      rating: 4.5,
      location: "456 Mall Avenue, Shopping District",
      phone: "+1 (555) 987-6543",
      email: "info@burgerbarn.com",
      description: "Gourmet burgers and craft beers",
      openHours: "11:00 AM - 10:00 PM",
      cuisine: "American"
    },
    {
      id: 3,
      name: "Sushi Spot",
      logo: "/api/placeholder/40/40",
      status: "inactive",
      orders: 45,
      revenue: 6750,
      rating: 4.9,
      location: "789 City Center Blvd, Downtown",
      phone: "+1 (555) 456-7890",
      email: "hello@sushispot.com",
      description: "Fresh sushi and Japanese cuisine",
      openHours: "5:00 PM - 12:00 AM",
      cuisine: "Japanese"
    }
  ];

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout title="Restaurant Management">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        <Link href="/onboarding/create-shop" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Restaurant
          </Button>
        </Link>
      </div>

        {/* Restaurants Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Restaurants ({filteredRestaurants.length})</CardTitle>
            <CardDescription>
              Manage and monitor all your restaurant locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Cuisine</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={restaurant.logo} alt={restaurant.name} />
                          <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {restaurant.location.split(',')[0]}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{restaurant.cuisine}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(restaurant.status)}>
                        {restaurant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{restaurant.orders}</TableCell>
                    <TableCell>₹{restaurant.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {restaurant.rating}
                      </div>
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
                                setSelectedRestaurant(restaurant);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DialogTrigger>
                          </Dialog>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
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

            {filteredRestaurants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No restaurants found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurant Details Dialog */}
        {selectedRestaurant && (
          <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedRestaurant.logo} alt={selectedRestaurant.name} />
                    <AvatarFallback>{selectedRestaurant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {selectedRestaurant.name}
                </DialogTitle>
                <DialogDescription>
                  Restaurant details and information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedRestaurant.description}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cuisine Type</Label>
                    <p className="text-sm">{selectedRestaurant.cuisine}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Operating Hours</Label>
                    <p className="text-sm">{selectedRestaurant.openHours}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedRestaurant.status)}>
                        {selectedRestaurant.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Information</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {selectedRestaurant.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {selectedRestaurant.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {selectedRestaurant.email}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Performance</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-2xl font-bold">{selectedRestaurant.orders}</p>
                        <p className="text-xs text-muted-foreground">Total Orders</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">₹{selectedRestaurant.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-semibold">{selectedRestaurant.rating}</span>
                          <span className="text-sm text-muted-foreground">Customer Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedRestaurant(null)}>
                  Close
                </Button>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Restaurant
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
    </DashboardLayout>
  );
}