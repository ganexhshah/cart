"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useState } from "react";
import { useRawMaterials, useStockTransactions, useStockAlerts, useInventorySummary } from "@/hooks/useInventory";
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
  Edit,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

export default function InventoryPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [stockAction, setStockAction] = useState<'in' | 'out'>('in');

  // Use hooks for data fetching
  const { materials, loading: materialsLoading, error: materialsError, refetch: refetchMaterials } = useRawMaterials();
  const { transactions, loading: transactionsLoading, error: transactionsError } = useStockTransactions();
  const { alerts, loading: alertsLoading, error: alertsError, resolveAlert } = useStockAlerts({ isResolved: false });
  const { summary, loading: summaryLoading, error: summaryError } = useInventorySummary();

  const categories = [
    "dairy", "beverages", "sweeteners", "grains", "meat", "vegetables", "spices", "oils"
  ];

  const getStockStatus = (material: any) => {
    const currentStock = material.current_stock || material.currentStock || 0;
    const minimumStock = material.minimum_stock || material.minimumStock || 0;
    
    if (currentStock <= 0) {
      return { status: "out_of_stock", color: "bg-red-100 text-red-800", icon: XCircle };
    } else if (currentStock <= minimumStock) {
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

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
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
            <div className="text-2xl font-bold">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                (summary as any)?.total_materials || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Active items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                (summary as any)?.low_stock_count || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                (summary as any)?.out_of_stock_count || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Urgent reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                `₹${((summary as any)?.total_inventory_value || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">Inventory worth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summaryLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                (summary as any)?.pending_alerts || 0
              )}
            </div>
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
                {materialsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading materials...
                  </div>
                ) : materialsError ? (
                  <div className="text-center py-8 text-red-600">
                    Error: {materialsError}
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No materials found
                  </div>
                ) : (
                  materials.map((material: any) => {
                    const stockStatus = getStockStatus(material);
                    const StatusIcon = stockStatus.icon;
                    const currentStock = material.current_stock || material.currentStock || 0;
                    const minimumStock = material.minimum_stock || material.minimumStock || 0;
                    const maximumStock = material.maximum_stock || material.maximumStock || 0;
                    const costPerUnit = material.cost_per_unit || material.costPerUnit || 0;
                    const lastUpdated = material.created_at || material.createdAt || new Date().toISOString();
                    
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
                            <p className="font-medium">{currentStock} {material.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Min Stock</p>
                            <p className="font-medium">{minimumStock} {material.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Max Stock</p>
                            <p className="font-medium">{maximumStock} {material.unit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cost/Unit</p>
                            <p className="font-medium">₹{costPerUnit}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Value</p>
                            <p className="font-medium">₹{(currentStock * costPerUnit).toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <p className="text-sm text-muted-foreground">
                            Last updated: {new Date(lastUpdated).toLocaleString()}
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
                  })
                )}
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
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading transactions...
                  </div>
                ) : transactionsError ? (
                  <div className="text-center py-8 text-red-600">
                    Error: {transactionsError}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  transactions.map((transaction: any) => {
                    const transactionType = transaction.transaction_type || transaction.transactionType;
                    const materialName = transaction.material_name || transaction.materialName;
                    const createdBy = transaction.created_by_name || transaction.createdByName || 'System';
                    const stockBefore = transaction.stock_before || transaction.stockBefore || 0;
                    const stockAfter = transaction.stock_after || transaction.stockAfter || 0;
                    const totalCost = transaction.total_cost || transaction.totalCost || 0;
                    const createdAt = transaction.created_at || transaction.createdAt || new Date().toISOString();
                    
                    return (
                      <div key={transaction.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              transactionType === 'in' 
                                ? 'bg-green-100' 
                                : 'bg-red-100'
                            }`}>
                              {transactionType === 'in' ? (
                                <TrendingUp className="w-5 h-5 text-green-600" />
                              ) : (
                                <TrendingDown className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium">{materialName}</h3>
                              <p className="text-sm text-muted-foreground">
                                {transactionType === 'in' ? 'Stock In' : 'Stock Out'} • {createdBy}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transactionType === 'in' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {transactionType === 'in' ? '+' : '-'}{transaction.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{totalCost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Stock Before</p>
                            <p className="font-medium">{stockBefore}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stock After</p>
                            <p className="font-medium">{stockAfter}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p className="font-medium">{new Date(createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        {transaction.notes && (
                          <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
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
                {alertsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Loading alerts...
                  </div>
                ) : alertsError ? (
                  <div className="text-center py-8 text-red-600">
                    Error: {alertsError}
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No alerts found
                  </div>
                ) : (
                  alerts.map((alert: any) => {
                    const materialName = alert.material_name || alert.materialName;
                    const alertType = alert.alert_type || alert.alertType;
                    const currentStock = alert.current_stock || alert.currentStock || 0;
                    const minimumStock = alert.minimum_stock || alert.minimumStock || 0;
                    const createdAt = alert.created_at || alert.createdAt || new Date().toISOString();
                    
                    return (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{materialName}</h3>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getAlertColor(alertType)}>
                              {alertType.replace('_', ' ')}
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
                            <p className="font-medium">{currentStock}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Minimum Stock</p>
                            <p className="font-medium">{minimumStock}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Alert Time</p>
                            <p className="font-medium">{new Date(createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
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
                  {categories.slice(0, 4).map((category) => {
                    const categoryMaterials = materials.filter((m: any) => m.category === category);
                    const categoryValue = categoryMaterials.reduce((sum: number, m: any) => {
                      const currentStock = m.current_stock || m.currentStock || 0;
                      const costPerUnit = m.cost_per_unit || m.costPerUnit || 0;
                      return sum + (currentStock * costPerUnit);
                    }, 0);
                    
                    return (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{category}</p>
                          <p className="text-sm text-muted-foreground">
                            {categoryMaterials.length} items
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹{categoryValue.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
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
              Current stock: {selectedMaterial?.current_stock || selectedMaterial?.currentStock || 0} {selectedMaterial?.unit}
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
                  defaultValue={selectedMaterial?.cost_per_unit || selectedMaterial?.costPerUnit || 0}
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