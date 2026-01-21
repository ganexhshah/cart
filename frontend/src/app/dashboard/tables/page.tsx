"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DashboardLayout } from "@/components/dashboard/layout";
import { tableApi, RestaurantTable, TableStats } from "@/lib/tables";
import { restaurantApi } from "@/lib/restaurants";
import { 
  Plus,
  QrCode,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Search,
  Grid3x3,
  List,
  Loader2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import QRCodeLib from 'qrcode';

export default function TablesPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [tableStats, setTableStats] = useState<TableStats>({
    total_tables: 0,
    available_tables: 0,
    occupied_tables: 0,
    reserved_tables: 0,
    maintenance_tables: 0,
    total_capacity: 0,
    indoor_tables: 0,
    outdoor_tables: 0,
    private_tables: 0
  });
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Form state for adding/editing tables
  const [formData, setFormData] = useState({
    name: "",
    tableNumber: "",
    capacity: 2,
    location: "",
    tableType: "indoor" as 'indoor' | 'outdoor' | 'private',
    status: "available" as RestaurantTable['status'],
    restaurantId: ""
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load restaurants
      const restaurantsResponse = await restaurantApi.getAll();
      if (restaurantsResponse.success) {
        setRestaurants(restaurantsResponse.data);
        // Set default restaurant for new tables
        if (restaurantsResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, restaurantId: restaurantsResponse.data[0].id }));
        }
      }

      // Load tables
      await loadTables();

      // Load stats
      const statsResponse = await tableApi.getTableStats();
      if (statsResponse.success) {
        setTableStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        tableType: filterType !== 'all' ? filterType : undefined
      };

      const response = await tableApi.getTables(filters);
      if (response.success) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  // Reload tables when filters change
  useEffect(() => {
    if (!isLoading) {
      loadTables();
    }
  }, [searchTerm, filterStatus, filterType]);

  const filteredTables = tables.filter(table => {
    const matchesSearch = searchTerm === "" ||
                         table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.table_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || table.status === filterStatus;
    const matchesType = filterType === "all" || table.table_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-3 h-3" />;
      case 'occupied': return <XCircle className="w-3 h-3" />;
      case 'reserved': return <Users className="w-3 h-3" />;
      default: return null;
    }
  };

  const showQRCode = async (table: RestaurantTable) => {
    try {
      // Get QR code data from backend
      const qrResponse = await tableApi.generateTableQR(table.id);
      if (!qrResponse.success) {
        console.error('Failed to get QR data');
        return;
      }

      const qrData = qrResponse.data;
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCodeLib.toDataURL(qrData.url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      setQrCodeUrl(qrCodeDataURL);
      setSelectedTable(table);
      setShowQRDialog(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    }
  };

  const generateQRCode = async (table: RestaurantTable) => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;

    try {
      // Get QR code data from backend
      const qrResponse = await tableApi.generateTableQR(table.id);
      if (!qrResponse.success) return;

      const qrData = qrResponse.data;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 300;
      canvas.height = 400;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Generate actual QR code
      const qrCodeDataURL = await QRCodeLib.toDataURL(qrData.url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Load and draw QR code image
      const qrImage = new Image();
      qrImage.onload = () => {
        // Draw QR code
        ctx.drawImage(qrImage, 50, 50, 200, 200);

        // Draw table info below QR code
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Table ${table.table_number}`, 150, 280);
        
        ctx.font = '16px Arial';
        ctx.fillText(table.name, 150, 305);
        
        ctx.font = '14px Arial';
        ctx.fillText(`Capacity: ${table.capacity} people`, 150, 325);
        
        if (table.location) {
          ctx.fillText(`Location: ${table.location}`, 150, 345);
        }

        // Add instructions
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('Scan this QR code to access the menu', 150, 375);
      };
      qrImage.src = qrCodeDataURL;

    } catch (error) {
      console.error('Error generating QR code:', error);
      
      // Fallback to text-based QR code placeholder
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 300;
      canvas.height = 400;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(50, 50, 200, 200);
      
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR CODE', 150, 140);
      ctx.fillText('UNAVAILABLE', 150, 160);
      
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`Table ${table.table_number}`, 150, 280);
      ctx.font = '16px Arial';
      ctx.fillText(table.name, 150, 305);
      ctx.font = '14px Arial';
      ctx.fillText(`Capacity: ${table.capacity} people`, 150, 325);
      if (table.location) {
        ctx.fillText(`Location: ${table.location}`, 150, 345);
      }
    }
  };

  const downloadQRCode = async (table: RestaurantTable) => {
    try {
      // Get QR code data from backend
      const qrResponse = await tableApi.generateTableQR(table.id);
      if (!qrResponse.success) {
        console.error('Failed to get QR data');
        return;
      }

      const qrData = qrResponse.data;
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCodeLib.toDataURL(qrData.url, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Create safe filename - handle undefined/null name
      const tableName = table.name || 'table';
      const safeTableName = tableName.replace(/\s+/g, '-');
      const filename = `table-${table.table_number}-${safeTableName}-qr.png`;

      // Create download link
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Failed to download QR code. Please try again.');
    }
  };

  const downloadAllQRCodes = async () => {
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      try {
        await downloadQRCode(table);
        // Add delay between downloads to avoid browser blocking
        if (i < tables.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error downloading QR for table ${table.name}:`, error);
      }
    }
  };

  const handleAddTable = async () => {
    if (!formData.name || !formData.tableNumber || !formData.restaurantId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const tableData = {
        restaurantId: formData.restaurantId,
        tableNumber: formData.tableNumber,
        name: formData.name,
        capacity: formData.capacity,
        location: formData.location,
        tableType: formData.tableType,
        status: formData.status
      };

      const response = await tableApi.createTable(tableData);
      if (response.success) {
        // Reset form
        setFormData({
          name: "",
          tableNumber: "",
          capacity: 2,
          location: "",
          tableType: "indoor",
          status: "available",
          restaurantId: restaurants.length > 0 ? restaurants[0].id : ""
        });
        setShowAddDialog(false);
        
        // Reload data
        await loadTables();
        const statsResponse = await tableApi.getTableStats();
        if (statsResponse.success) {
          setTableStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Failed to create table. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      const response = await tableApi.deleteTable(tableId);
      if (response.success) {
        await loadTables();
        const statsResponse = await tableApi.getTableStats();
        if (statsResponse.success) {
          setTableStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Failed to delete table. Please try again.');
    }
  };

  const handleStatusChange = async (tableId: string, newStatus: RestaurantTable['status']) => {
    try {
      const response = await tableApi.updateTableStatus(tableId, newStatus);
      if (response.success) {
        await loadTables();
        const statsResponse = await tableApi.getTableStats();
        if (statsResponse.success) {
          setTableStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      alert('Failed to update table status. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Table Management">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
              <p className="text-gray-600 mt-1">Manage your restaurant tables and generate QR codes</p>
            </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={downloadAllQRCodes}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All QR
            </Button>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Table
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Table</DialogTitle>
                  <DialogDescription>
                    Create a new table for your restaurant
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant">Restaurant</Label>
                    <Select
                      value={formData.restaurantId}
                      onValueChange={(value) => setFormData({ ...formData, restaurantId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      placeholder="e.g., T1, A1, 101"
                      value={formData.tableNumber}
                      onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Table Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Table 9"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Select
                      value={formData.capacity.toString()}
                      onValueChange={(value) => setFormData({ ...formData, capacity: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2, 4, 6, 8, 10, 12].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} people
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Main Hall"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.tableType}
                      onValueChange={(value: any) => setFormData({ ...formData, tableType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTable} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Table'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tableStats.total_tables}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{tableStats.available_tables}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Occupied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{tableStats.occupied_tables}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Reserved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{tableStats.reserved_tables}</div>
            </CardContent>
          </Card>
        </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{table.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {table.location || 'No location'}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => showQRCode(table)}>
                        <QrCode className="w-4 h-4 mr-2" />
                        View QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadQRCode(table)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download QR
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Table
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{table.capacity} seats</span>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {table.table_type}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(table.status)} flex items-center gap-1 capitalize`}>
                    {getStatusIcon(table.status)}
                    {table.status}
                  </Badge>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Select
                    value={table.status}
                    onValueChange={(value: any) => handleStatusChange(table.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(table)}
                    className="h-8"
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTables.map((table) => (
                <div key={table.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <h3 className="font-semibold">{table.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {table.location || 'No location'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{table.capacity} seats</span>
                      </div>
                      
                      <Badge variant="outline" className="capitalize">
                        {table.table_type}
                      </Badge>
                      
                      <Badge className={`${getStatusColor(table.status)} flex items-center gap-1 capitalize`}>
                        {getStatusIcon(table.status)}
                        {table.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQRCode(table)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        QR Code
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => showQRCode(table)}>
                            <QrCode className="w-4 h-4 mr-2" />
                            View QR Code
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTable(table.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
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
      )}

        {/* QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code - {selectedTable?.name}</DialogTitle>
              <DialogDescription>
                Scan this QR code to access the menu for this table
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center gap-4 py-4">
              {qrCodeUrl ? (
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="border rounded-lg shadow-sm"
                    width={256}
                    height={256}
                  />
                  
                  {selectedTable && (
                    <div className="text-center space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Table:</strong> {selectedTable.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Number:</strong> {selectedTable.table_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Location:</strong> {selectedTable.location || 'No location'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Capacity:</strong> {selectedTable.capacity} people
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-64 h-64 border rounded-lg shadow-sm flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <QrCode className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Loading QR Code...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => selectedTable && downloadQRCode(selectedTable)}
                className="w-full"
                disabled={!qrCodeUrl}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Hidden canvas for QR generation */}
        <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </DashboardLayout>
  );
}
