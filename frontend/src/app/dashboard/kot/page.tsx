"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useState, useEffect, useCallback } from "react";
import { 
  Search,
  Eye,
  Download,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Package,
  Edit,
  Trash2,
  BellRing,
  FileText,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Loader2,
  Plus,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// KOT Types
interface KOTOrder {
  id: string;
  restaurant_id: string;
  order_id?: string;
  table_id?: string;
  kot_number: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  total_items: number;
  estimated_time?: number;
  actual_time?: number;
  notes?: string;
  created_by?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  table_number?: string;
  table_name?: string;
  created_by_name?: string;
  assigned_to_name?: string;
  items?: KOTOrderItem[];
}

interface KOTOrderItem {
  id: string;
  kot_order_id: string;
  kot_item_id: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  special_requests?: string;
  preparation_notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  item_name?: string;
  preparation_time?: number;
  difficulty_level?: string;
}

interface KOTStats {
  total_kots: number;
  pending_kots: number;
  preparing_kots: number;
  ready_kots: number;
  served_kots: number;
  avg_preparation_time?: number;
  avg_estimated_time?: number;
}

export default function KOTPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedKOTs, setSelectedKOTs] = useState<string[]>([]);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newStatus, setNewStatus] = useState<KOTOrder['status']>("pending");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedKOTDetail, setSelectedKOTDetail] = useState<KOTOrder | null>(null);
  
  // State for KOT data
  const [kots, setKOTs] = useState<KOTOrder[]>([]);
  const [kotStats, setKOTStats] = useState<KOTStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's restaurant
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!user) return;
      
      if (user.primaryRestaurantId) {
        setRestaurantId(user.primaryRestaurantId);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/restaurants', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setRestaurantId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      }
    };

    fetchRestaurant();
  }, [user]);

  // Fetch KOTs from backend
  const fetchKOTs = useCallback(async () => {
    if (!restaurantId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('restaurantId', restaurantId);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const response = await fetch(`http://localhost:3001/api/kot?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setKOTs(data.data);
        } else {
          setError(data.error || 'Failed to fetch KOTs');
        }
      } else {
        setError('Failed to fetch KOTs');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KOTs');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, statusFilter, priorityFilter]);

  // Fetch KOT stats
  const fetchKOTStats = useCallback(async () => {
    if (!restaurantId) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/kot/stats?restaurantId=${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setKOTStats(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching KOT stats:', err);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchKOTs();
    fetchKOTStats();
  }, [fetchKOTs, fetchKOTStats]);

  const addNotification = useCallback((message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 10));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "preparing": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "served": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "preparing": return <ChefHat className="w-4 h-4" />;
      case "ready": return <CheckCircle className="w-4 h-4" />;
      case "served": return <Package className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredKOTs = kots.filter(kot => {
    const matchesSearch = kot.kot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kot.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kot.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStatusUpdate = async (kotId: string, status: KOTOrder['status']) => {
    try {
      const response = await fetch(`http://localhost:3001/api/kot/${kotId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, restaurantId })
      });
      
      if (response.ok) {
        addNotification(`KOT ${kotId} status updated to ${status}`);
        fetchKOTs();
      } else {
        const data = await response.json();
        addNotification(`Failed to update KOT: ${data.error}`);
      }
    } catch (err: any) {
      addNotification(`Failed to update KOT: ${err.message}`);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedKOTs.length === 0 || !newStatus) return;
    
    try {
      await Promise.all(
        selectedKOTs.map(kotId => handleStatusUpdate(kotId, newStatus))
      );
      addNotification(`${selectedKOTs.length} KOTs updated to ${newStatus}`);
      setSelectedKOTs([]);
      setShowStatusDialog(false);
    } catch (err: any) {
      addNotification(`Failed to update KOTs: ${err.message}`);
    }
  };

  const handleSelectAll = () => {
    if (selectedKOTs.length === filteredKOTs.length) {
      setSelectedKOTs([]);
    } else {
      setSelectedKOTs(filteredKOTs.map(k => k.id));
    }
  };

  const handleDeleteKOTs = async () => {
    if (selectedKOTs.length === 0) return;
    if (confirm(`Are you sure you want to cancel ${selectedKOTs.length} KOTs?`)) {
      try {
        await Promise.all(
          selectedKOTs.map(kotId => handleStatusUpdate(kotId, 'cancelled'))
        );
        addNotification(`${selectedKOTs.length} KOTs cancelled`);
        setSelectedKOTs([]);
      } catch (err: any) {
        addNotification(`Failed to cancel KOTs: ${err.message}`);
      }
    }
  };

  // Check permissions
  if (!user || !['waiter', 'admin', 'owner'].includes(user.role)) {
    return (
      <DashboardLayout title="KOT Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You need to be a waiter, admin, or owner to access KOT management.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!restaurantId) {
    return (
      <DashboardLayout title="KOT Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Restaurant Found</h3>
            <p className="text-gray-600 mb-4">
              You need to be associated with a restaurant to view KOTs.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="KOT Management">
      {/* Notifications Alert */}
      {notifications.length > 0 && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <BellRing className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span>Recent Notifications ({notifications.length})</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {showNotifications ? 'Hide' : 'Show'}
            </Button>
          </AlertTitle>
          {showNotifications && (
            <AlertDescription>
              <div className="mt-2 space-y-1">
                {notifications.slice(0, 3).map((notif, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" />
                    {notif}
                  </div>
                ))}
              </div>
            </AlertDescription>
          )}
        </Alert>
      )}

      {/* Stats Cards */}
      {kotStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Total KOTs</p>
                  <p className="text-xl font-bold">{kotStats.total_kots}</p>
                </div>
                <ClipboardList className="h-6 w-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">{kotStats.pending_kots}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Preparing</p>
                  <p className="text-xl font-bold text-blue-600">{kotStats.preparing_kots}</p>
                </div>
                <ChefHat className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ready</p>
                  <p className="text-xl font-bold text-green-600">{kotStats.ready_kots}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Served</p>
                  <p className="text-xl font-bold text-gray-600">{kotStats.served_kots}</p>
                </div>
                <Package className="h-6 w-6 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search KOTs, tables, staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                <TabsTrigger value="preparing" className="text-xs">Preparing</TabsTrigger>
                <TabsTrigger value="ready" className="text-xs">Ready</TabsTrigger>
                <TabsTrigger value="served" className="text-xs">Served</TabsTrigger>
                <TabsTrigger value="cancelled" className="text-xs">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={fetchKOTs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowAnalytics(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedKOTs.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedKOTs.length === filteredKOTs.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-medium">{selectedKOTs.length} KOTs selected</span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="outline" onClick={() => setShowStatusDialog(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDeleteKOTs}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel KOTs
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedKOTs([])}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* KOTs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kitchen Order Tickets ({filteredKOTs.length})</CardTitle>
          <CardDescription>
            Manage and track all kitchen order tickets for food preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading KOTs</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={fetchKOTs}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedKOTs.length === filteredKOTs.length && filteredKOTs.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="min-w-30">KOT #</TableHead>
                    <TableHead className="hidden md:table-cell">Table</TableHead>
                    <TableHead className="hidden sm:table-cell">Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Priority</TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="w-17.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKOTs.map((kot) => (
                    <TableRow key={kot.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedKOTs.includes(kot.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedKOTs([...selectedKOTs, kot.id]);
                            } else {
                              setSelectedKOTs(selectedKOTs.filter(id => id !== kot.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{kot.kot_number}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {kot.table_name || kot.table_number || 'No table'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{kot.total_items}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(kot.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(kot.status)}
                            {kot.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className={getPriorityColor(kot.priority)}>
                          {kot.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {new Date(kot.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedKOTDetail(kot)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>KOT Details - {kot.kot_number}</DialogTitle>
                              <DialogDescription>Complete kitchen order ticket information and management</DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Status and Actions */}
                              <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                  <Badge className={getStatusColor(kot.status)}>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(kot.status)}
                                      {kot.status}
                                    </span>
                                  </Badge>
                                  <Badge className={getPriorityColor(kot.priority)}>
                                    {kot.priority}
                                  </Badge>
                                </div>
                                <Select 
                                  value={kot.status} 
                                  onValueChange={(value) => handleStatusUpdate(kot.id, value as KOTOrder['status'])}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="preparing">Preparing</SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="served">Served</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Table Info */}
                              {(kot.table_name || kot.table_number) && (
                                <div>
                                  <h3 className="font-semibold mb-2">Table Information</h3>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Package className="w-4 h-4 text-muted-foreground" />
                                      <span>{kot.table_name || `Table ${kot.table_number}`}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* KOT Items */}
                              <div>
                                <h3 className="font-semibold mb-2">Items to Prepare ({kot.total_items})</h3>
                                <div className="space-y-2">
                                  {kot.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                                      <div>
                                        <span className="font-medium">{item.quantity}x {item.item_name}</span>
                                        {item.special_requests && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Special: {item.special_requests}
                                          </p>
                                        )}
                                      </div>
                                      <Badge variant={item.status === 'ready' ? 'default' : 'secondary'}>
                                        {item.status}
                                      </Badge>
                                    </div>
                                  )) || (
                                    <p className="text-sm text-muted-foreground">No items found</p>
                                  )}
                                </div>
                              </div>

                              {/* Timing Information */}
                              <div>
                                <h3 className="font-semibold mb-2">Timing Information</h3>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Created</span>
                                    <span>{new Date(kot.created_at).toLocaleString()}</span>
                                  </div>
                                  {kot.estimated_time && (
                                    <div className="flex justify-between">
                                      <span>Estimated Time</span>
                                      <span>{kot.estimated_time} minutes</span>
                                    </div>
                                  )}
                                  {kot.actual_time && (
                                    <div className="flex justify-between">
                                      <span>Actual Time</span>
                                      <span>{kot.actual_time} minutes</span>
                                    </div>
                                  )}
                                  {kot.completed_at && (
                                    <div className="flex justify-between">
                                      <span>Completed</span>
                                      <span>{new Date(kot.completed_at).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Staff Information */}
                              {(kot.created_by_name || kot.assigned_to_name) && (
                                <div>
                                  <h3 className="font-semibold mb-2">Staff Information</h3>
                                  <div className="space-y-2 text-sm">
                                    {kot.created_by_name && (
                                      <div className="flex justify-between">
                                        <span>Created By</span>
                                        <span>{kot.created_by_name}</span>
                                      </div>
                                    )}
                                    {kot.assigned_to_name && (
                                      <div className="flex justify-between">
                                        <span>Assigned To</span>
                                        <span>{kot.assigned_to_name}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {kot.notes && (
                                <div>
                                  <h3 className="font-semibold mb-2">Special Instructions</h3>
                                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                    {kot.notes}
                                  </p>
                                </div>
                              )}
                            </div>

                            <DialogFooter>
                              <Button variant="outline">Print KOT</Button>
                              <Button>Update Status</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredKOTs.length === 0 && (
                <div className="text-center py-8">
                  <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No KOTs found</h3>
                  <p className="text-gray-600">
                    No kitchen order tickets match your current filters.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update KOT Status</DialogTitle>
            <DialogDescription>
              Update status for {selectedKOTs.length} selected KOTs
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as KOTOrder['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleBulkStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>KOT Analytics</DialogTitle>
            <DialogDescription>Detailed insights and kitchen performance statistics</DialogDescription>
          </DialogHeader>
          {kotStats && (
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total KOTs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{kotStats.total_kots}</p>
                  <p className="text-xs text-muted-foreground">All time kitchen orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Prep Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {kotStats.avg_preparation_time ? `${Number(kotStats.avg_preparation_time).toFixed(1)}m` : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Actual preparation time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active KOTs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {kotStats.pending_kots + kotStats.preparing_kots + kotStats.ready_kots}
                  </p>
                  <p className="text-xs text-muted-foreground">Currently in kitchen</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {kotStats.total_kots > 0 
                      ? ((kotStats.served_kots / kotStats.total_kots) * 100).toFixed(1) 
                      : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Successfully served</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}