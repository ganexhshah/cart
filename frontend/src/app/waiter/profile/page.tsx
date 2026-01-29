"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WaiterLayout } from "@/components/waiter/layout";
import { 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  Star,
  Building2,
  IdCard
} from "lucide-react";

interface WaiterUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatarUrl?: string;
  staffId: string;
  staffNumber: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  slug: string;
}

export default function WaiterProfile() {
  const [user, setUser] = useState<WaiterUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("waiter_token");
    const userData = localStorage.getItem("waiter_user");
    const restaurantData = localStorage.getItem("waiter_restaurant");

    if (!token || !userData || !restaurantData) {
      router.push("/waiter/login");
      return;
    }

    try {
      setUser(JSON.parse(userData));
      setRestaurant(JSON.parse(restaurantData));
    } catch (error) {
      console.error("Error parsing stored data:", error);
      router.push("/waiter/login");
      return;
    }

    setLoading(false);
  }, [router]);

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <WaiterLayout title="My Profile">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </WaiterLayout>
    );
  }

  if (!user || !restaurant) {
    return null;
  }

  // Mock performance data - in real app, this would come from API
  const performanceData = {
    ordersServed: 156,
    averageRating: 4.7,
    totalTips: 2450,
    workingDays: 22,
    punctualityScore: 95
  };

  return (
    <WaiterLayout title="My Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your profile information and performance</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                <CardDescription className="text-lg">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.staffNumber}
                </CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {restaurant.name}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <IdCard className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Staff ID</p>
                  <p className="font-medium">{user.staffNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Restaurant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Restaurant Name</p>
                  <p className="font-medium">{restaurant.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{restaurant.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Restaurant Phone</p>
                  <p className="font-medium">{restaurant.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>
              Your performance metrics for this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{performanceData.ordersServed}</div>
                <div className="text-sm text-muted-foreground">Orders Served</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
                  <Star className="w-5 h-5" />
                  {performanceData.averageRating}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">₹{performanceData.totalTips}</div>
                <div className="text-sm text-muted-foreground">Total Tips</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{performanceData.workingDays}</div>
                <div className="text-sm text-muted-foreground">Working Days</div>
              </div>
              
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{performanceData.punctualityScore}%</div>
                <div className="text-sm text-muted-foreground">Punctuality</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">View Shift History</p>
                    <p className="text-sm text-muted-foreground">Check your past shifts and attendance</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Performance Reports</p>
                    <p className="text-sm text-muted-foreground">Detailed performance analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WaiterLayout>
  );
}