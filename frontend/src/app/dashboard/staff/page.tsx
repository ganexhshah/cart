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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Users,
  UserCheck,
  ChefHat,
  UserCog,
  Sparkles,
  CalendarCheck,
  CalendarX,
  LogIn,
  LogOut,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StaffPage() {
  const { restaurants } = useRestaurants();
  const currentRestaurant = restaurants?.[0]; // Get first restaurant for now
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    email: "",
    phone: "",
    role: "waiter",
    shift: "morning",
    salary: 2500
  });

  // Use staff hook
  const { 
    staff, 
    loading, 
    error, 
    addStaff: addStaffMember, 
    updateStaff: updateStaffMember, 
    deleteStaff: deleteStaffMember,
    clockInOut 
  } = useStaff(currentRestaurant?.id || '');

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    const matchesStatus = filterStatus === "all" || member.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleIcon = (role: Staff['role']) => {
    switch (role) {
      case 'waiter': return <UserCheck className="w-4 h-4" />;
      case 'chef': return <ChefHat className="w-4 h-4" />;
      case 'manager': return <UserCog className="w-4 h-4" />;
      case 'cleaner': return <Sparkles className="w-4 h-4" />;
      case 'cashier': return <DollarSign className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: Staff['role']) => {
    switch (role) {
      case 'waiter': return 'bg-blue-100 text-blue-800';
      case 'chef': return 'bg-orange-100 text-orange-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'cleaner': return 'bg-green-100 text-green-800';
      case 'cashier': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Staff['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddStaff = async () => {
    try {
      await addStaffMember(formData);
      setShowAddDialog(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "waiter",
        shift: "morning",
        salary: 2500
      });
      toast.success("Staff member added successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add staff member");
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      try {
        await deleteStaffMember(staffId);
        toast.success("Staff member removed successfully");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove staff member");
      }
    }
  };

  const handleStatusChange = async (staffId: string, newStatus: Staff['status']) => {
    try {
      await updateStaffMember(staffId, { status: newStatus });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleClockIn = async (staffId: string) => {
    try {
      await clockInOut(staffId, 'clock-in');
      toast.success("Clocked in successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clock in");
    }
  };

  const stats = {
    total: staff.length,
    present: staff.filter(s => s.status === 'active').length,
    absent: staff.filter(s => s.status === 'inactive').length,
    onLeave: staff.filter(s => s.status === 'on-leave').length,
  };

  if (loading) {
    return (
      <DashboardLayout title="Staff Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Staff Management">
        <div className="text-center text-red-600 p-8">
          Error: {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Staff Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-1">Manage your restaurant staff, attendance, and payroll</p>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Add a new staff member to your team
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
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: Staff['role']) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waiter">Waiter</SelectItem>
                      <SelectItem value="chef">Chef</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onClick={handleAddStaff}
                  disabled={!formData.name || !formData.email || !formData.phone}
                >
                  Add Staff
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Present Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.onLeave}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
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
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="waiter">Waiter</SelectItem>
                  <SelectItem value="chef">Chef</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cleaner">Cleaner</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
              
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

        {/* Tabs for different views */}
        <Tabs defaultValue="directory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="directory">Staff Directory</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          {/* Staff Directory Tab */}
          <TabsContent value="directory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Directory</CardTitle>
                <CardDescription>
                  Manage your staff members and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-50">Staff Member</TableHead>
                        <TableHead className="hidden md:table-cell">Contact</TableHead>
                        <TableHead className="hidden lg:table-cell">Role</TableHead>
                        <TableHead className="hidden sm:table-cell">Shift</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Performance</TableHead>
                        <TableHead className="w-17.5">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.avatar_url} alt={member.full_name} />
                                <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.full_name}</div>
                                <div className="text-sm text-muted-foreground">{member.staff_number}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {member.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {member.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge className={`${getRoleColor(member.role)} flex items-center gap-1 w-fit capitalize`}>
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="capitalize">
                              {member.shift}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={member.status}
                              onValueChange={(value: Staff['status']) => handleStatusChange(member.id, value)}
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
                            <div className="space-y-1">
                              <div className="text-sm">
                                ⭐ {Number(member.avg_rating || 0).toFixed(1)} rating
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.orders_served || 0} orders
                              </div>
                            </div>
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
                                <DropdownMenuItem onClick={() => {
                                  setSelectedStaff(member);
                                  setShowAttendanceDialog(true);
                                }}>
                                  <CalendarCheck className="w-4 h-4 mr-2" />
                                  View Attendance
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeleteStaff(member.id)}
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
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Tracking</CardTitle>
                <CardDescription>
                  Track daily attendance and manage clock in/out
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredStaff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar_url} alt={member.full_name} />
                          <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.full_name}</div>
                          <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-green-600">{member.present_days}</div>
                            <div className="text-muted-foreground">Present</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-red-600">{member.absent_days}</div>
                            <div className="text-muted-foreground">Absent</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-yellow-600">{member.leave_days}</div>
                            <div className="text-muted-foreground">Leaves</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClockIn(member.id)}
                            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            Clock In
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Clock Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Management</CardTitle>
                <CardDescription>
                  Manage staff salaries and payment records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Shift</TableHead>
                        <TableHead>Days Present</TableHead>
                        <TableHead>Monthly Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => {
                        const totalDays = member.present_days + member.absent_days + member.leave_days;
                        const calculatedSalary = totalDays > 0 
                          ? Math.round((member.salary / 25) * member.present_days)
                          : member.salary;
                        
                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatar_url} alt={member.full_name} />
                                  <AvatarFallback>{member.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{member.full_name}</div>
                                  <div className="text-sm text-muted-foreground">{member.staff_number}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getRoleColor(member.role)} capitalize`}>
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{member.shift}</TableCell>
                            <TableCell>
                              <div className="font-medium">{member.present_days} / 25</div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">₹{calculatedSalary}</div>
                                <div className="text-xs text-muted-foreground">Base: ₹{member.salary}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(member.status)} variant="outline">
                                {member.status === 'active' ? 'Paid' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Process
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Total Payroll</h3>
                      <p className="text-sm text-muted-foreground">For current month</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ₹{staff.reduce((sum, member) => {
                          const totalDays = member.present_days + member.absent_days + member.leave_days;
                          const calculatedSalary = totalDays > 0 
                            ? Math.round((member.salary / 25) * member.present_days)
                            : member.salary;
                          return sum + calculatedSalary;
                        }, 0).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {staff.length} staff members
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Attendance Details Dialog */}
        <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Attendance Details</DialogTitle>
              <DialogDescription>
                {selectedStaff?.full_name} - {selectedStaff?.role}
              </DialogDescription>
            </DialogHeader>
            
            {selectedStaff && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarCheck className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="font-medium">Present Days</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedStaff.present_days}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarX className="w-8 h-8 text-red-600" />
                    <div>
                      <div className="font-medium">Absent Days</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {selectedStaff.absent_days}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-yellow-600" />
                    <div>
                      <div className="font-medium">Leave Days</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedStaff.leave_days}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-lg font-bold">
                      {Math.round((selectedStaff.present_days / 25) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
