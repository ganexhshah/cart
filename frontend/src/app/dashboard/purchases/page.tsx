"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useState } from "react";
import { 
  Truck, 
  Users, 
  ShoppingCart,
  FileText,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Star
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  businessType: string;
  paymentTerms: string;
  rating: number;
  isActive: boolean;
  totalOrders: number;
  avgOrderValue: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
  createdBy: string;
}

export default function PurchasesPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showPODialog, setShowPODialog] = useState(false);

  // Mock data
  const suppliers = [
    {
      id: "1",
      name: "Fresh Dairy Co.",
      contactPerson: "Ram Sharma",
      phone: "9841234567",
      email: "ram@freshdairy.com",
      address: "Kathmandu, Nepal",
      businessType: "distributor",
      paymentTerms: "credit_30",
      rating: 4.5,
      isActive: true,
      totalOrders: 24,
      avgOrderValue: 15000
    },
    {
      id: "2",
      name: "Mountain Coffee Suppliers",
      contactPerson: "Sita Gurung",
      phone: "9851234567",
      email: "sita@mountaincoffee.com",
      address: "Pokhara, Nepal",
      businessType: "wholesaler",
      paymentTerms: "cash",
      rating: 4.8,
      isActive: true,
      totalOrders: 18,
      avgOrderValue: 25000
    },
    {
      id: "3",
      name: "Valley Vegetables",
      contactPerson: "Hari Thapa",
      phone: "9861234567",
      email: "hari@valleyveggies.com",
      address: "Lalitpur, Nepal",
      businessType: "farmer",
      paymentTerms: "cash",
      rating: 4.2,
      isActive: true,
      totalOrders: 32,
      avgOrderValue: 8000
    }
  ];

  const purchaseOrders = [
    {
      id: "1",
      poNumber: "PO-202501-0001",
      supplierName: "Fresh Dairy Co.",
      orderDate: "2025-01-21",
      expectedDeliveryDate: "2025-01-23",
      status: "confirmed",
      paymentStatus: "pending",
      subtotal: 15000,
      taxAmount: 1950,
      totalAmount: 16950,
      itemCount: 3,
      createdBy: "John Doe"
    },
    {
      id: "2",
      poNumber: "PO-202501-0002",
      supplierName: "Mountain Coffee Suppliers",
      orderDate: "2025-01-20",
      expectedDeliveryDate: "2025-01-22",
      status: "received",
      paymentStatus: "paid",
      subtotal: 25000,
      taxAmount: 3250,
      totalAmount: 28250,
      itemCount: 2,
      createdBy: "Jane Smith"
    }
  ];

  const purchaseHistory = [
    {
      id: "1",
      poNumber: "PO-202501-0001",
      supplierName: "Fresh Dairy Co.",
      materialName: "Milk",
      quantityOrdered: 50,
      quantityReceived: 50,
      unitPrice: 50.00,
      totalPrice: 2500.00,
      orderDate: "2025-01-21",
      status: "received"
    },
    {
      id: "2",
      poNumber: "PO-202501-0001",
      supplierName: "Fresh Dairy Co.",
      materialName: "Cheese",
      quantityOrdered: 10,
      quantityReceived: 10,
      unitPrice: 800.00,
      totalPrice: 8000.00,
      orderDate: "2025-01-21",
      status: "received"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "sent": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "received": return "bg-purple-100 text-purple-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed": return CheckCircle;
      case "received": return CheckCircle;
      case "cancelled": return AlertCircle;
      default: return Clock;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "partial": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddSupplier = (supplierData: any) => {
    console.log("Adding supplier:", supplierData);
    setShowSupplierDialog(false);
  };

  const handleCreatePO = (poData: any) => {
    console.log("Creating PO:", poData);
    setShowPODialog(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <DashboardLayout title="Purchase Management">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowPODialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Purchase Order
          </Button>
          <Button variant="outline" onClick={() => setShowSupplierDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="history">Purchase History</TabsTrigger>
          <TabsTrigger value="reports">Cost Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>Manage your purchase orders and deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseOrders.map((po) => {
                  const StatusIcon = getStatusIcon(po.status);
                  return (
                    <div key={po.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{po.poNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              {po.supplierName} • {po.itemCount} items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(po.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {po.status}
                          </Badge>
                          <Badge className={getPaymentStatusColor(po.paymentStatus)}>
                            {po.paymentStatus}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order Date</p>
                          <p className="font-medium">{new Date(po.orderDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Delivery</p>
                          <p className="font-medium">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Subtotal</p>
                          <p className="font-medium">₹{po.subtotal.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="font-semibold text-lg">₹{po.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          Created by {po.createdBy}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {po.status === "draft" && (
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          )}
                          {po.status === "confirmed" && (
                            <Button size="sm">
                              <Truck className="w-4 h-4 mr-2" />
                              Mark Received
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
              <CardDescription>Manage your supplier relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{supplier.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {supplier.contactPerson} • {supplier.businessType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(Math.round(supplier.rating))}
                          <span className="ml-1 text-sm text-muted-foreground">
                            {supplier.rating}
                          </span>
                        </div>
                        <Badge className={supplier.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {supplier.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{supplier.address}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="font-medium">{supplier.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Order Value</p>
                        <p className="font-medium">₹{supplier.avgOrderValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Terms</p>
                        <p className="font-medium capitalize">{supplier.paymentTerms.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create PO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
              <CardDescription>Track all your purchase transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseHistory.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.materialName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.poNumber} • {item.supplierName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.totalPrice.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ordered</p>
                        <p className="font-medium">{item.quantityOrdered}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Received</p>
                        <p className="font-medium">{item.quantityReceived}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Unit Price</p>
                        <p className="font-medium">₹{item.unitPrice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Trends</CardTitle>
                <CardDescription>Track material cost changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Select defaultValue="milk">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milk">Milk</SelectItem>
                        <SelectItem value="coffee">Coffee Beans</SelectItem>
                        <SelectItem value="sugar">Sugar</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Last 30 Days
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Current Price</span>
                      </div>
                      <span className="font-medium">₹50.00/liter</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-sm">Last Month</span>
                      </div>
                      <span className="font-medium">₹48.00/liter</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">Average (3 months)</span>
                      </div>
                      <span className="font-medium">₹49.50/liter</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>Compare supplier metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.slice(0, 3).map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <div className="flex items-center gap-1">
                          {renderStars(Math.round(supplier.rating))}
                          <span className="text-sm text-muted-foreground ml-1">
                            ({supplier.rating})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{supplier.totalOrders} orders</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{supplier.avgOrderValue.toLocaleString()} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Supplier Dialog */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>Enter supplier details and contact information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier-name">Supplier Name</Label>
                <Input id="supplier-name" placeholder="e.g., Fresh Dairy Co." />
              </div>
              <div>
                <Label htmlFor="contact-person">Contact Person</Label>
                <Input id="contact-person" placeholder="e.g., Ram Sharma" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="e.g., 9841234567" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="e.g., contact@supplier.com" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Full address" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business-type">Business Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment-terms">Payment Terms</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_15">Credit 15 days</SelectItem>
                    <SelectItem value="credit_30">Credit 30 days</SelectItem>
                    <SelectItem value="credit_60">Credit 60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleAddSupplier({})} className="flex-1">
                Add Supplier
              </Button>
              <Button variant="outline" onClick={() => setShowSupplierDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create PO Dialog */}
      <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>Create a new purchase order for materials</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="delivery-date">Expected Delivery Date</Label>
                <Input id="delivery-date" type="date" />
              </div>
            </div>
            
            <div>
              <Label>Order Items</Label>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2 text-sm font-medium">
                  <span>Material</span>
                  <span>Quantity</span>
                  <span>Unit Price</span>
                  <span>Total</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milk">Milk</SelectItem>
                      <SelectItem value="coffee">Coffee Beans</SelectItem>
                      <SelectItem value="sugar">Sugar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="0" />
                  <Input type="number" placeholder="0.00" step="0.01" />
                  <Input type="number" placeholder="0.00" step="0.01" disabled />
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" placeholder="Additional notes or instructions" />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleCreatePO({})} className="flex-1">
                Create Purchase Order
              </Button>
              <Button variant="outline" onClick={() => setShowPODialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}