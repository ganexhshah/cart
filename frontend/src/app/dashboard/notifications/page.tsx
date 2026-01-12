"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/dashboard/layout";
import { 
  Bell, 
  BellRing,
  Check,
  X,
  MoreHorizontal,
  ShoppingCart,
  Star,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Settings,
  Mail,
  Smartphone,
  Volume2
} from "lucide-react";

export default function NotificationsPage() {
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "New Order Received",
      message: "Order #1234 from John Doe at Pizza Palace",
      time: "2 minutes ago",
      read: false,
      priority: "high",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      type: "review",
      title: "New 5-Star Review",
      message: "Sarah Wilson left a great review for Burger Barn",
      time: "15 minutes ago",
      read: false,
      priority: "medium",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      id: 3,
      type: "alert",
      title: "Low Stock Alert",
      message: "Margherita Pizza ingredients running low",
      time: "1 hour ago",
      read: true,
      priority: "high",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      id: 4,
      type: "info",
      title: "Daily Report Ready",
      message: "Your daily sales report is now available",
      time: "3 hours ago",
      read: true,
      priority: "low",
      icon: Info,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: 5,
      type: "order",
      title: "Order Completed",
      message: "Order #1230 has been delivered successfully",
      time: "5 hours ago",
      read: true,
      priority: "medium",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  const notificationSettings = [
    {
      category: "Orders",
      description: "Get notified about new orders and order updates",
      settings: [
        { name: "New Orders", email: true, push: true, sms: false },
        { name: "Order Cancellations", email: true, push: true, sms: true },
        { name: "Order Completions", email: false, push: true, sms: false }
      ]
    },
    {
      category: "Reviews",
      description: "Stay updated on customer feedback and ratings",
      settings: [
        { name: "New Reviews", email: true, push: true, sms: false },
        { name: "Review Responses", email: true, push: false, sms: false },
        { name: "Rating Changes", email: true, push: true, sms: false }
      ]
    },
    {
      category: "Inventory",
      description: "Monitor stock levels and inventory alerts",
      settings: [
        { name: "Low Stock Alerts", email: true, push: true, sms: true },
        { name: "Out of Stock", email: true, push: true, sms: true },
        { name: "Restock Reminders", email: true, push: false, sms: false }
      ]
    },
    {
      category: "Analytics",
      description: "Receive reports and performance insights",
      settings: [
        { name: "Daily Reports", email: true, push: false, sms: false },
        { name: "Weekly Summaries", email: true, push: false, sms: false },
        { name: "Performance Alerts", email: true, push: true, sms: false }
      ]
    }
  ];

  const stats = {
    unread: notifications.filter(n => !n.read).length,
    today: notifications.filter(n => n.time.includes("minutes") || n.time.includes("hour")).length,
    high: notifications.filter(n => n.priority === "high").length
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout title="Notifications">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">
              Notifications pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              Received today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.high}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </Button>
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>
                Stay updated with all your business activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${notification.bgColor}`}>
                      <notification.icon className={`w-4 h-4 ${notification.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Bell className="mr-2 h-4 w-4" />
                              Snooze
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <X className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>
                {stats.unread} notifications require your attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.filter(n => !n.read).map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border bg-blue-50 border-blue-200"
                  >
                    <div className={`p-2 rounded-full ${notification.bgColor}`}>
                      <notification.icon className={`w-4 h-4 ${notification.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-foreground">
                              {notification.title}
                            </h4>
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {notificationSettings.map((category) => (
                  <div key={category.category} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{category.category}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    
                    <div className="space-y-4">
                      {category.settings.map((setting) => (
                        <div key={setting.name} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{setting.name}</div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <Switch checked={setting.email} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-muted-foreground" />
                              <Switch checked={setting.push} />
                            </div>
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-muted-foreground" />
                              <Switch checked={setting.sms} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4 border-t">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View all past notifications and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50 opacity-75"
                  >
                    <div className={`p-2 rounded-full ${notification.bgColor}`}>
                      <notification.icon className={`w-4 h-4 ${notification.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            <Badge className={getPriorityColor(notification.priority)} variant="secondary">
                              {notification.priority}
                            </Badge>
                            {notification.read && (
                              <Badge variant="outline" className="text-green-600">
                                Read
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}