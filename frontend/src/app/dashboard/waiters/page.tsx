"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useStaff } from "@/hooks/useStaff";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Staff, StaffFormData } from "@/lib/staff";
import { 
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function WaitersPage() {
  const { restaurants } = useRestaurants();
  const currentRestaurant = restaurants?.[0]; // Get first restaurant for now
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    email: "",
    phone: "",
    role: "waiter",
    shift: "morning",
    salary: 2500
  });

  // Use staff hook with waiter filter
  const { 
    staff: waiters, 
    loading, 
    error, 
    addStaff, 
    updateStaff, 
    deleteStaff,
    clockInOut 
  } = useStaff(currentRestaurant?.id || '', { role: 'waiter' });

  const filteredWaiters = waiters.filter(waiter => {
    const matchesSearch = waiter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         waiter.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || waiter.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Staff['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Staff['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'inactive': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const handleAddWaiter = async () => {
    try {
      await addStaff(formData);
      setShowAddDialog(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "waiter",
        shift: "morning",
        salary: 2500
      });
      toast.success("Waiter added successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add waiter");
    }
  };

  const handleDeleteWaiter = async (waiterId: string) => {
    if (confirm('Are you sure you want to remove this waiter?')) {
      try {
        await deleteStaff(waiterId);
        toast.success("Waiter removed successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove waiter");
      }
    }
  };

  const handleStatusChange = async (waiterId: string, newStatus: Staff['status']) => {
    try {
      await updateStaff(waiterId, { status: newStatus });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleClockIn = async (waiterId: string) => {
    try {
      await clockInOut(waiterId, 'clock-in');
      toast.success("Clocked in successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clock in");
    }
  };

  const stats = {
    total: waiters.length,
    active: waiters.filter(w => w.status === 'active').length,
    onBreak: waiters.filter(w => w.status === 'on-leave').length,
    avgRating: waiters.length > 0 ? waiters.reduce((sum, w) => sum + (w.avg_rating || 0), 0) / waiters.length : 0
  };

  if (loading) {
    return (
      <DashboardLayout title="Waiter Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Waiter Management">
        <div className="text-center text-red-600 p-8">
          Error: {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Waiter Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Waiter Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant staff and track performance</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Waiter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125">
              <DialogHeader>
                <DialogTitle>Add New Waiter</DialogTitle>
                <DialogDescription>
                  Add a new waiter to your staff
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@restaurant.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift</Label>
                  <Select
                    value={formData.shift}
                    onValueChange={(value: Staff['shift']) => setFormData({ ...formData, shift: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6 AM - 2 PM)</SelectItem>
                      <SelectItem value="evening">Evening (2 PM - 10 PM)</SelectItem>
                      <SelectItem value="night">Night (10 PM - 6 AM)</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="2500"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddWaiter}
                  disabled={!formData.name || !formData.email || !formData.phone}
                >
                  Add Waiter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Waiters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">On Break</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.onBreak}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(stats.avgRating || 0).toFixed(1)} ⭐</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search waiters..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Waiters Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>
              Manage your waiters and track their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-50">Waiter</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Shift</TableHead>
                    <TableHead className="hidden sm:table-cell">Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Salary</TableHead>
                    <TableHead className="w-17.5">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWaiters.map((waiter) => (
                    <TableRow key={waiter.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={waiter.avatar_url} alt={waiter.full_name} />
                            <AvatarFallback>{waiter.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{waiter.full_name}</div>
                            <div className="text-sm text-muted-foreground">{waiter.staff_number}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {waiter.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {waiter.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="capitalize">
                          {waiter.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{waiter.orders_served || 0}</span> orders
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ⭐ {Number(waiter.avg_rating || 0).toFixed(1)} rating
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={waiter.status}
                          onValueChange={(value: Staff['status']) => handleStatusChange(waiter.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-leave">On Leave</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="font-medium">₹{waiter.salary}</div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              View Performance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteWaiter(waiter.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
