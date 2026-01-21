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
  Loader2,
  Menu
} from "lucide-react";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Restaurant } from "@/lib/restaurants";

export default function RestaurantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  // Use the real API hook
  const { restaurants, loading, error, refetch } = useRestaurants();

  // Filter restaurants based on search term
  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (restaurant.address && restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? "Active" : "Inactive";
  };

  if (loading) {
    return (
      <DashboardLayout title="Restaurant Management">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading restaurants...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Restaurant Management">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

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

      {/* Empty State */}
      {restaurants.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Restaurants Found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any restaurants yet. Get started by adding your first restaurant.
              </p>
              <Link href="/onboarding/create-shop">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Restaurant
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Restaurants Table */}
      {restaurants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Restaurants ({filteredRestaurants.length})</CardTitle>
            <CardDescription>
              Manage and monitor your restaurant locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
                          <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          {restaurant.address && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {restaurant.address.length > 50 
                                ? `${restaurant.address.substring(0, 50)}...` 
                                : restaurant.address
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(restaurant.is_active)}>
                        {getStatusText(restaurant.is_active)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {restaurant.rating || '0.0'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {restaurant.phone || 'Not provided'}
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
                          <Link href={`/menu/${restaurant.slug}/demo-table`}>
                            <DropdownMenuItem>
                              <Menu className="mr-2 h-4 w-4" />
                              View Menu
                            </DropdownMenuItem>
                          </Link>
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

            {filteredRestaurants.length === 0 && restaurants.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No restaurants found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Restaurant Details Dialog */}
      {selectedRestaurant && (
        <Dialog open={!!selectedRestaurant} onOpenChange={() => setSelectedRestaurant(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedRestaurant.logo_url} alt={selectedRestaurant.name} />
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
                {selectedRestaurant.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm">{selectedRestaurant.description}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Operating Hours</Label>
                  <p className="text-sm">
                    {selectedRestaurant.opening_time && selectedRestaurant.closing_time
                      ? `${selectedRestaurant.opening_time} - ${selectedRestaurant.closing_time}`
                      : 'Not specified'
                    }
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedRestaurant.is_active)}>
                      {getStatusText(selectedRestaurant.is_active)}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Contact Information</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRestaurant.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>{selectedRestaurant.address}</span>
                      </div>
                    )}
                    {selectedRestaurant.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {selectedRestaurant.phone}
                      </div>
                    )}
                    {selectedRestaurant.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {selectedRestaurant.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Performance</Label>
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-lg font-semibold">{selectedRestaurant.rating || '0.0'}</span>
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