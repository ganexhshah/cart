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
  Package, 
  AlertTriangle, 
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  BarChart3,
  Calendar,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle
} from "lucide-react";

interface RawMaterial {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  costPerUnit: number;
  isLowStock: boolean;
  lastUpdated: string;
}

interface StockTransaction {
  id: string;
  materialName: string;
  transactionType: 'in' | 'out';
  quantity: number;
  unitCost: number;
  totalCost: number;
  stockBefore: number;
  stockAfter: number;
  createdAt: string;
  createdBy: string;
  notes: string;
}

interface StockAlert {
  id: string;
  materialName: string;
  alertType: string;
  currentStock: number;
  minimumStock: number;
  message: string;
  createdAt: string;
  isResolved: boolean;
}

export default function InventoryPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [stockAction, setStockAction] = useState<'in' | 'out'>('in');

  // Mock data
  const inventoryStats = {
    totalMaterials: 24,
    lowStockCount: 5,
    outOfStockCount: 2,
    totalValue: 45230.50,
    pendingAlerts: 7
  };

  const rawMaterials = [
    {
      id: "1",
      name: "Milk",
      category: "dairy",
      unit: "liter",
      currentStock: 15.5,
      minimumStock: 20,
      maximumStock: 100,
      reorderLevel: 25,
      costPerUnit: 50.00,
      isLowStock: true,
      lastUpdated: "2025-01-21T10:30:00Z"
    },
    {
      id: "2",
      name: "Coffee Beans",
      category: "beverages",
      unit: "kg",
      currentStock: 8.2,
      minimumStock: 5,
      maximumStock: 20,
      reorderLevel: 8,
      costPerUnit: 800.00,
      isLowStock: false,
      lastUpdated: "2025-01-21T09:15:00Z"
    },
    {
      id: "3",
      name: "Sugar",
      category: "sweeteners",
      unit: "kg",
      currentStock: 0,
      minimumStock: 10,
      maximumStock: 50,
      reorderLevel: 15,
      costPerUnit: 80.00,
      isLowStock: true,
      lastUpdated: "2025-01-20T16:45:00Z"
    },
    {
      id: "4",
      name: "Rice",
      category: "grains",
      unit: "kg",
      currentStock: 45.0,
      minimumStock: 20,
      maximumStock: 100,
      reorderLevel: 30,
      costPerUnit: 120.00,
      isLowStock: false,
      lastUpdated: "2025-01-21T08:20:00Z"
    }
  ];

  const stockAlerts = [
    {
      id: "1",
      materialName: "Sugar",
      alertType: "out_of_stock",
      currentStock: 0,
      minimumStock: 10,
      message: "Sugar is out of stock",
      createdAt: "2025-01-21T08:00:00Z",
      isResolved: false
    },
    {
      id: "2",
      materialName: "Milk",
      alertType: "low_stock",
      currentStock: 15.5,
      minimumStock: 20,
      message: "Milk is running low (15.5 liters remaining)",
      createdAt: "2025-01-21T07:30:00Z",
      isResolved: false
    }
  ];

  const recentTransactions = [
    {
      id: "1",
      materialName: "Coffee Beans",
      transactionType: "in",
      quantity: 5.0,
      unitCost: 800.00,
      totalCost: 4000.00,
      stockBefore: 3.2,
      stockAfter: 8.2,
      createdAt: "2025-01-21T09:15:00Z",
      createdBy: "John Doe",
      notes: "Weekly stock replenishment"
    },
    {
      id: "2",
      materialName: "Milk",
      transactionType: "out",
      quantity: 4.5,
      unitCost: 50.00,
      totalCost: 225.00,
      stockBefore: 20.0,
      stockAfter: 15.5,
      createdAt: "2025-01-21T10:30:00Z",
      createdBy: "Jane Smith",
      notes: "Used for morning coffee preparation"
    }
  ];

  const categories = [
    "dairy", "beverages", "sweeteners", "grains", "meat", "vegetables", "spices", "oils"
  ];

  const getStockStatus = (material: RawMaterial) => {
    if (material.currentStock <= 0) {
      return { status: "out_of_stock", color: "bg-red-100 text-red-800", icon: XCircle };
    } else if (material.currentStock <= material.minimumStock) {
      return { status: "low_stock", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle };
    } else {
      return { status: "in_stock", color: "bg-green-100 text-green-800", icon: CheckCircle };
    }
  };

  const getAlertColor = (alertType: string) => {
    switch (alertType) {
      case "out_of_stock": return "bg-red-100 text-red-800";
      case "low_stock": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddMaterial = (materialData: any) => {
    console.log("Adding material:", materialData);
    setShowAddDialog(false);
  };

  const handleStockTransaction = (materialId: string, transactionData: any) => {
    console.log("Stock transaction:", materialId, transactionData);
    setShowStockDialog(false);
  };

  const handleResolveAlert = (alertId: string) => {
    console.log("Resolving alert:", alertId);
  };

  return (
    <DashboardLayout title="Inventory & Stock Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.totalMaterials}</div>
            <p className="text-xs text-muted-foreground">Active items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inventoryStats.outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Urgent reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{inventoryStats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Inventory worth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{inventoryStats.pendingAlerts}</div>
            <p className="text-xs text-muted-foreground">Pending alerts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials">Raw Materials</TabsTrigger>
          <TabsTrigger value="transactions">Stock Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Raw Materials</CardTitle>
                  <CardDescription>Manage your inventory items and stock levels</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Material
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rawMaterials.map((material) => {
                  const stockStatus = getStockStatus(material);
                  const StatusIcon = stockStatus.icon;
                  
                  return (
                    <div key={material.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Package className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{material.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {material.category} • {material.unit}
                            </p>
                          </div>
                        </div>
                        <Badge className={stockStatus.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {stockStatus.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Stock</p>
                          <p className="font-medium">{material.currentStock} {material.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Min Stock</p>
                          <p className="font-medium">{material.minimumStock} {material.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Max Stock</p>
                          <p className="font-medium">{material.maximumStock} {material.unit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cost/Unit</p>
                          <p className="font-medium">₹{material.costPerUnit}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Value</p>
                          <p className="font-medium">₹{(material.currentStock * material.costPerUnit).toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date(material.lastUpdated).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaterial(material);
                              setStockAction('out');
                              setShowStockDialog(true);
                            }}
                          >
                            <Minus className="w-4 h-4 mr-2" />
                            Stock Out
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMaterial(material);
                              setStockAction('in');
                              setShowStockDialog(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Stock In
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Stock Transactions</CardTitle>
              <CardDescription>Track all stock movements and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.transactionType === 'in' 
                            ? 'bg-green-100' 
                            : 'bg-red-100'
                        }`}>
                          {transaction.transactionType === 'in' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{transaction.materialName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {transaction.transactionType === 'in' ? 'Stock In' : 'Stock Out'} • 
                            {transaction.createdBy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.transactionType === 'in' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.transactionType === 'in' ? '+' : '-'}{transaction.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{transaction.totalCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Stock Before</p>
                        <p className="font-medium">{transaction.stockBefore}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stock After</p>
                        <p className="font-medium">{transaction.stockAfter}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    {transaction.notes && (
                      <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Monitor low stock and out-of-stock items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{alert.materialName}</h3>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getAlertColor(alert.alertType)}>
                          {alert.alertType.replace('_', ' ')}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Stock</p>
                        <p className="font-medium">{alert.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Minimum Stock</p>
                        <p className="font-medium">{alert.minimumStock}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Alert Time</p>
                        <p className="font-medium">{new Date(alert.createdAt).toLocaleString()}</p>
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
                <CardTitle>Daily Usage Report</CardTitle>
                <CardDescription>Track daily consumption patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    <Button variant="outline">Generate</Button>
                  </div>
                  <div className="text-center py-8 text-muted-foreground">
                    Select a date to view usage report
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Valuation</CardTitle>
                <CardDescription>Current inventory value by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(0, 4).map((category) => (
                    <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{category}</p>
                        <p className="text-sm text-muted-foreground">
                          {rawMaterials.filter(m => m.category === category).length} items
                        </p>
                      </div>
                      <p className="font-medium">
                        ₹{rawMaterials
                          .filter(m => m.category === category)
                          .reduce((sum, m) => sum + (m.currentStock * m.costPerUnit), 0)
                          .toFixed(2)
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Material Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Raw Material</DialogTitle>
            <DialogDescription>Add a new material to your inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Material Name</Label>
                <Input id="name" placeholder="e.g., Milk" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="grams">Grams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cost">Cost per Unit</Label>
                <Input id="cost" type="number" step="0.01" placeholder="0.00" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="min-stock">Min Stock</Label>
                <Input id="min-stock" type="number" step="0.01" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="max-stock">Max Stock</Label>
                <Input id="max-stock" type="number" step="0.01" placeholder="0" />
              </div>
              <div>
                <Label htmlFor="reorder-level">Reorder Level</Label>
                <Input id="reorder-level" type="number" step="0.01" placeholder="0" />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => handleAddMaterial({})} className="flex-1">
                Add Material
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Transaction Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockAction === 'in' ? 'Stock In' : 'Stock Out'} - {selectedMaterial?.name}
            </DialogTitle>
            <DialogDescription>
              Current stock: {selectedMaterial?.currentStock} {selectedMaterial?.unit}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            
            {stockAction === 'in' && (
              <div>
                <Label htmlFor="unit-cost">Unit Cost</Label>
                <Input
                  id="unit-cost"
                  type="number"
                  step="0.01"
                  defaultValue={selectedMaterial?.costPerUnit}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" placeholder="Reason for stock movement" />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => handleStockTransaction(selectedMaterial?.id, {})}
                className="flex-1"
              >
                {stockAction === 'in' ? 'Add Stock' : 'Remove Stock'}
              </Button>
              <Button variant="outline" onClick={() => setShowStockDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}