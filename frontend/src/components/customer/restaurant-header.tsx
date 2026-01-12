"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  MapPin,
  Wifi,
  Phone,
  Copy,
  Bell,
  Clock,
  Star,
  Users,
  Utensils
} from "lucide-react";

interface RestaurantInfo {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  totalReviews: number;
  wifi: {
    network: string;
    password: string;
  };
}

interface RestaurantHeaderProps {
  restaurant?: RestaurantInfo;
  onCallWaiter?: () => void;
}

export function RestaurantHeader({ 
  restaurant = {
    name: "Bella Vista Restaurant",
    address: "123 Main Street, Downtown City, 12345",
    phone: "+1 (555) 123-4567",
    hours: "11:00 AM - 10:00 PM",
    rating: 4.8,
    totalReviews: 1247,
    wifi: {
      network: "BellaVista_Guest",
      password: "welcome2024"
    }
  },
  onCallWaiter
}: RestaurantHeaderProps) {

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCall = () => {
    window.open(`tel:${restaurant.phone.replace(/\D/g, '')}`);
  };

  const handleCallWaiter = () => {
    if (onCallWaiter) {
      onCallWaiter();
    } else {
      alert('Waiter has been called!');
    }
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Restaurant Main Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-gray-200">
                <AvatarImage src={restaurant.logo} alt={restaurant.name} />
                <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white text-lg sm:text-xl font-bold">
                  <Utensils className="w-6 h-6 sm:w-8 sm:h-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {restaurant.name}
                  </h1>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Open Now
                  </Badge>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 lg:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  
                  <Separator orientation="vertical" className="hidden sm:block h-4" />
                  
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurant.rating}</span>
                    <span>({restaurant.totalReviews.toLocaleString()} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Action Button */}
            <Button 
              onClick={handleCallWaiter}
              className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg"
              size="sm"
            >
              <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Call Waiter</span>
            </Button>
          </div>
          
          {/* Info Icons with Popovers */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* WiFi Popover */}
            <TooltipProvider>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-600 p-0"
                  >
                    <Wifi className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Free WiFi</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Network:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-700">
                            {restaurant.wifi.network}
                          </code>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  onClick={() => copyToClipboard(restaurant.wifi.network)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy network name</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Password:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-700">
                            {restaurant.wifi.password}
                          </code>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-blue-100"
                                  onClick={() => copyToClipboard(restaurant.wifi.password)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy password</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipProvider>
            
            {/* Contact Popover */}
            <TooltipProvider>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-50 border-green-200 hover:bg-green-100 text-green-600 p-0"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      <h3 className="font-semibold text-green-900">Contact Info</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-green-700">
                            {restaurant.phone}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-green-100"
                                  onClick={handleCall}
                                >
                                  <Phone className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Call restaurant</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>Hours: {restaurant.hours}</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipProvider>
            
            {/* Service Popover */}
            <TooltipProvider>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-600 p-0"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="center">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <h3 className="font-semibold text-orange-900">Customer Service</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800"
                        onClick={handleCallWaiter}
                      >
                        <Bell className="w-3 h-3 mr-2" />
                        Request Service
                      </Button>
                      
                      <p className="text-xs text-gray-600 text-center leading-relaxed">
                        Need assistance? Our staff is ready to help you with your dining experience!
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}