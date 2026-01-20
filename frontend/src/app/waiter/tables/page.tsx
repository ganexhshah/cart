"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WaiterLayout } from "@/components/waiter/layout";
import { useState } from "react";
import Link from "next/link";
import { 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  RefreshCw,
  MapPin,
  Timer,
  DollarSign,
  Utensils,
  Receipt,
  Phone,
  User
} from "lucide-react";

export default function WaiterTablesPage() {
  const [selectedTable, setSelectedTable] = useState<any>(null);

  // Mock data for table management
  const tables = [
    {
      number: 1,
      capacity: 2,
      status: "available",
      customer: null,
      orderValue: 0,
      timeOccupied: null,
      lastCleaned: "10:30 AM"
    },
    {
      number: 2,
      capacity: 4,
      status: "occupied",
      customer: {
        name: "Emma Davis",
        phone: "+1 (555) 789-0123",
        partySize: 3,
        arrivalTime: "2:00 PM"
      },
      orderValue: 29.13,
      timeOccupied: "45 min",
      currentOrder: {
        id: "#T006",
        status: "served",
        items: ["Chicken Tikka", "Naan Bread x2"]
      }
    },
    {
      number: 3,
      capacity: 4,
      status: "occupied",
      customer: {
        name: "Mike Davis",
        phone: "+1 (555) 456-7890",
        partySize: 2,
        arrivalTime: "3:00 PM"
      },
      orderValue: 26.98,
      timeOccupied: "15 min",
      currentOrder: {
        id: "#T003",
        status: "pending",
        items: ["Pasta Carbonara", "Garlic Bread"]
      }
    },
    {
      number: 4,
      capacity: 6,
      status: "reserved",
      customer: {
        name: "Johnson Family",
        phone: "+1 (555) 111-2222",
        partySize: 5,
        reservationTime: "6:00 PM"
      },
      orderValue: 0,
      timeOccupied: null
    },
    {
      number: 5,
      capacity: 2,
      status: "occupied",
      customer: {
        name: "John Smith",
        phone: "+1 (555) 123-4567",
        partySize: 2,
        arrivalTime: "2:30 PM"
      },
      orderValue: 40.47,
      timeOccupied: "30 min",
      currentOrder: {
        id: "#T001",
        status: "preparing",
        items: ["Margherita Pizza", "Caesar Salad", "Coke x2"]
      }
    },
    {
      number: 6,
      capacity: 4,
      status: "needs_cleaning",
      customer: null,
      orderValue: 0,
      timeOccupied: null,
      lastCustomer: "Left 5 min ago"
    },
    {
      number: 7,
      capacity: 2,
      status: "occupied",
      customer: {
        name: "Tom Brown",
        phone: "+1 (555) 654-3210",
        partySize: 1,
        arrivalTime: "3:15 PM"
      },
      orderValue: 26.97,
      timeOccupied: "5 min",
      currentOrder: {
        id: "#T005",
        status: "ready",
        items: ["Buffalo Wings x12", "Draft Beer x2"]
      }
    },
    {
      number: 8,
      capacity: 4,
      status: "occupied",
      customer: {
        name: "Sarah Johnson",
        phone: "+1 (555) 987-6543",
        partySize: 3,
        arrivalTime: "2:45 PM"
      },
      orderValue: 32.37,
      timeOccupied: "20 min",
      currentOrder: {
        id: "#T002",
        status: "ready",
        items: ["Burger Deluxe", "Sweet Potato Fries", "Chocolate Milkshake"]
      }
    },
    {
      number: 9,
      capacity: 6,
      status: "available",
      customer: null,
      orderValue: 0,
      timeOccupied: null,
      lastCleaned: "11:15 AM"
    },
    {
      number: 10,
      capacity: 8,
      status: "available",
      customer: null,
      orderValue: 0,
      timeOccupied: null,
      lastCleaned: "12:00 PM"
    },
    {
      number: 11,
      capacity: 2,
      status: "out_of_order",
      customer: null,
      orderValue: 0,
      timeOccupied: null,
      issue: "Broken chair"
    },
    {
      number: 12,
      capacity: 4,
      status: "occupied",
      customer: {
        name: "Lisa Wilson",
        phone: "+1 (555) 321-0987",
        partySize: 2,
        arrivalTime: "3:10 PM"
      },
      orderValue: 51.80,
      timeOccupied: "10 min",
      currentOrder: {
        id: "#T004",
        status: "preparing",
        items: ["Grilled Salmon", "Jasmine Rice", "Steamed Vegetables", "White Wine"]
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 border-green-200";
      case "occupied": return "bg-blue-100 text-blue-800 border-blue-200";
      case "reserved": return "bg-purple-100 text-purple-800 border-purple-200";
      case "needs_cleaning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "out_of_order": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available": return <CheckCircle className="w-4 h-4" />;
      case "occupied": return <Users className="w-4 h-4" />;
      case "reserved": return <Clock className="w-4 h-4" />;
      case "needs_cleaning": return <AlertCircle className="w-4 h-4" />;
      case "out_of_order": return <AlertCircle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-blue-100 text-blue-800";
      case "preparing": return "bg-yellow-100 text-yellow-800";
      case "ready": return "bg-green-100 text-green-800";
      case "served": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const tableStats = {
    total: tables.length,
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
    needsCleaning: tables.filter(t => t.status === "needs_cleaning").length,
    outOfOrder: tables.filter(t => t.status === "out_of_order").length
  };

  return (
    <WaiterLayout title="Table Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6">
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-lg lg:text-2xl font-bold">{tableStats.total}</p>
            </div>
            <MapPin className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Available</p>
              <p className="text-lg lg:text-2xl font-bold text-green-600">{tableStats.available}</p>
            </div>
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Occupied</p>
              <p className="text-lg lg:text-2xl font-bold text-blue-600">{tableStats.occupied}</p>
            </div>
            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Reserved</p>
              <p className="text-lg lg:text-2xl font-bold text-purple-600">{tableStats.reserved}</p>
            </div>
            <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Cleaning</p>
              <p className="text-lg lg:text-2xl font-bold text-yellow-600">{tableStats.needsCleaning}</p>
            </div>
            <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
          </div>
        </Card>
        
        <Card className="p-3 lg:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-muted-foreground">Out of Order</p>
              <p className="text-lg lg:text-2xl font-bold text-red-600">{tableStats.outOfOrder}</p>
            </div>
            <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">Restaurant Floor Plan</h2>
          <p className="text-sm text-muted-foreground">Click on any table to view details or take actions</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link href="/waiter/orders/new" className="flex-1 sm:flex-none">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <Dialog key={table.number}>
            <DialogTrigger asChild>
              <Card 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${getStatusColor(table.status)} border-2`}
                onClick={() => setSelectedTable(table)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    {/* Table Number */}
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                        <span className="text-lg font-bold">{table.number}</span>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <Badge className={`${getStatusColor(table.status)} text-xs`}>
                      {getStatusIcon(table.status)}
                      <span className="ml-1 capitalize">{table.status.replace('_', ' ')}</span>
                    </Badge>
                    
                    {/* Capacity */}
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity} seats</span>
                    </div>
                    
                    {/* Customer Info */}
                    {table.customer && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium truncate">{table.customer.name}</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Timer className="w-3 h-3" />
                          <span>{table.timeOccupied}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Order Value */}
                    {table.orderValue > 0 && (
                      <div className="flex items-center justify-center gap-1 text-xs font-medium">
                        <DollarSign className="w-3 h-3" />
                        <span>₹{table.orderValue.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Current Order Status */}
                    {table.currentOrder && (
                      <Badge className={`${getOrderStatusColor(table.currentOrder.status)} text-xs`}>
                        {table.currentOrder.status}
                      </Badge>
                    )}
                    
                    {/* Special Status Info */}
                    {table.status === "reserved" && table.customer && (
                      <p className="text-xs text-muted-foreground">
                        Reserved: {table.customer.reservationTime}
                      </p>
                    )}
                    
                    {table.status === "needs_cleaning" && table.lastCustomer && (
                      <p className="text-xs text-muted-foreground">
                        {table.lastCustomer}
                      </p>
                    )}
                    
                    {table.status === "out_of_order" && table.issue && (
                      <p className="text-xs text-red-600">
                        {table.issue}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>
        ))}
      </div>

      {/* Table Details Dialog */}
      {selectedTable && (
        <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                Table {selectedTable.number} Details
                <Badge className={`${getStatusColor(selectedTable.status)}`}>
                  {getStatusIcon(selectedTable.status)}
                  <span className="ml-1 capitalize">{selectedTable.status.replace('_', ' ')}</span>
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Capacity: {selectedTable.capacity} seats
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Table Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Table Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Table Number</p>
                      <p className="text-lg font-semibold">{selectedTable.number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                      <p className="text-lg font-semibold">{selectedTable.capacity} seats</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={`${getStatusColor(selectedTable.status)} w-fit`}>
                        {getStatusIcon(selectedTable.status)}
                        <span className="ml-1 capitalize">{selectedTable.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    {selectedTable.timeOccupied && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Time Occupied</p>
                        <p className="text-lg font-semibold">{selectedTable.timeOccupied}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedTable.lastCleaned && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Cleaned</p>
                      <p className="text-sm">{selectedTable.lastCleaned}</p>
                    </div>
                  )}
                  
                  {selectedTable.issue && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800 mb-1">Issue:</p>
                      <p className="text-sm text-red-700">{selectedTable.issue}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Information */}
              {selectedTable.customer && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedTable.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedTable.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Party of {selectedTable.customer.partySize}</span>
                    </div>
                    {selectedTable.customer.arrivalTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Arrived at {selectedTable.customer.arrivalTime}</span>
                      </div>
                    )}
                    {selectedTable.customer.reservationTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Reserved for {selectedTable.customer.reservationTime}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Current Order */}
              {selectedTable.currentOrder && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Current Order
                      <Badge className={`${getOrderStatusColor(selectedTable.currentOrder.status)}`}>
                        {selectedTable.currentOrder.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Order ID</p>
                      <p className="font-medium">{selectedTable.currentOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Items</p>
                      <ul className="space-y-1">
                        {selectedTable.currentOrder.items.map((item: string, index: number) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <Utensils className="w-3 h-3 text-muted-foreground" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {selectedTable.orderValue > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Order Value</p>
                        <p className="text-lg font-semibold">₹{selectedTable.orderValue.toFixed(2)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedTable(null)}>
                Close
              </Button>
              
              {selectedTable.status === "available" && (
                <Link href="/waiter/orders/new">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Seat Customer
                  </Button>
                </Link>
              )}
              
              {selectedTable.status === "occupied" && selectedTable.currentOrder && (
                <div className="flex gap-2">
                  <Link href={`/waiter/orders`}>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Order
                    </Button>
                  </Link>
                  {selectedTable.currentOrder.status === "served" && (
                    <Button>
                      <Receipt className="w-4 h-4 mr-2" />
                      Generate Bill
                    </Button>
                  )}
                </div>
              )}
              
              {selectedTable.status === "needs_cleaning" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Clean
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </WaiterLayout>
  );
}