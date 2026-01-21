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
import { useSuppliers, usePurchaseOrders, usePurchaseHistory, useCostTracking } from "@/hooks/usePurchases";
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
  Star,
  Loader2
} from "lucide-react";

export default function PurchasesPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showPODialog, setShowPODialog] = useState(false);

  // API hooks
  const { suppliers, loading: suppliersLoading, error: suppliersError, createSupplier } = useSuppliers();
  const { orders, loading: ordersLoading, error: ordersError, createOrder, updateOrderStatus, receiveItems } = usePurchaseOrders();
  const { history, loading: historyLoading, error: historyError } = usePurchaseHistory();
  const { costData, loading: costLoading, error: costError } = useCostTracking();

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

  const handleAddSupplier = async (supplierData: any) => {
    try {
      await createSupplier(supplierData);
      setShowSupplierDialog(false);
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
  };

  const handleCreatePO = async (poData: any) => {
    try {
      await createOrder(poData);
      setShowPODialog(false);
    } catch (error) {
      console.error("Error creating PO:", error);
    }
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
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading purchase orders...
                </div>
              ) : ordersError ? (
                <div className="text-center py-8 text-red-600">
                  Error: {ordersError}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No purchase orders found. Create your first purchase order to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((po: any) => {
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
                                {po.supplierName} • {po.itemCount || 0} items
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(po.status)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {po.status}
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
                            Created by {po.createdByName || po.createdBy}
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
                              <Button size="sm" onClick={() => updateOrderStatus(po.id, "received")}>
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
              )}
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
              {suppliersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading suppliers...
                </div>
              ) : suppliersError ? (
                <div className="text-center py-8 text-red-600">
                  Error: {suppliersError}
                </div>
              ) : suppliers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No suppliers found. Add your first supplier to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {suppliers.map((supplier: any) => (
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
                            {renderStars(Math.round(supplier.rating || 0))}
                            <span className="ml-1 text-sm text-muted-foreground">
                              {supplier.rating || 0}
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
                          <p className="font-medium">{supplier.totalOrders || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Avg Order Value</p>
                          <p className="font-medium">₹{(supplier.avgOrderValue || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Terms</p>
                          <p className="font-medium capitalize">{supplier.paymentTerms?.replace('_', ' ') || 'N/A'}</p>
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
              )}
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
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading purchase history...
                </div>
              ) : historyError ? (
                <div className="text-center py-8 text-red-600">
                  Error: {historyError}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No purchase history found.
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.materialName || item.itemName}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.poNumber} • {item.supplierName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{(item.totalPrice || item.totalAmount || 0).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(item.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Ordered</p>
                          <p className="font-medium">{item.quantityOrdered || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Received</p>
                          <p className="font-medium">{item.quantityReceived || 0}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Unit Price</p>
                          <p className="font-medium">₹{item.unitPrice || 0}</p>
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
              )}
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
                {costLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading cost data...
                  </div>
                ) : costError ? (
                  <div className="text-center py-8 text-red-600">
                    Error: {costError}
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supplier Performance</CardTitle>
                <CardDescription>Compare supplier metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {suppliersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading suppliers...
                  </div>
                ) : suppliers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No suppliers found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suppliers.slice(0, 3).map((supplier: any) => (
                      <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <div className="flex items-center gap-1">
                            {renderStars(Math.round(supplier.rating || 0))}
                            <span className="text-sm text-muted-foreground ml-1">
                              ({supplier.rating || 0})
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{supplier.totalOrders || 0} orders</p>
                          <p className="text-sm text-muted-foreground">
                            ₹{(supplier.avgOrderValue || 0).toLocaleString()} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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