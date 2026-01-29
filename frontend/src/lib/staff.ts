import { api } from './api';

export interface Staff {
  id: string;
  staff_number: string;
  role: 'waiter' | 'chef' | 'manager' | 'cleaner' | 'cashier';
  shift: 'morning' | 'evening' | 'night' | 'full-time';
  status: 'active' | 'inactive' | 'on-leave';
  salary: number;
  join_date: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  present_days: number;
  absent_days: number;
  leave_days: number;
  orders_served: number;
  avg_rating: number;
}

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: Staff['role'];
  shift: Staff['shift'];
  salary: number;
  status?: Staff['status'];
}

export interface AttendanceRecord {
  id: string;
  staff_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: 'present' | 'absent' | 'leave' | 'half-day';
  leave_type?: 'sick' | 'casual' | 'paid' | 'unpaid';
  notes?: string;
}

export interface StaffStats {
  total_staff: number;
  active_staff: number;
  on_leave_staff: number;
  inactive_staff: number;
  avg_salary: number;
  waiters: number;
  chefs: number;
  managers: number;
  cleaners: number;
  cashiers: number;
}

export interface PayrollData {
  id: string;
  staff_number: string;
  role: string;
  salary: number;
  full_name: string;
  present_days: number;
  absent_days: number;
  leave_days: number;
  total_hours: number;
}

// Get all staff for a restaurant
export const getStaff = async (restaurantId: string, filters?: {
  role?: string;
  status?: string;
  shift?: string;
}): Promise<Staff[]> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.shift) params.append('shift', filters.shift);
  
  const queryString = params.toString();
  const url = `/staff/restaurant/${restaurantId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};

// Get staff member by ID
export const getStaffById = async (staffId: string): Promise<Staff> => {
  const response = await api.get(`/staff/${staffId}`);
  return response.data;
};

// Add new staff member
export const addStaff = async (restaurantId: string, staffData: StaffFormData): Promise<Staff> => {
  const response = await api.post(`/staff/restaurant/${restaurantId}`, staffData);
  return response.data;
};

// Update staff member
export const updateStaff = async (staffId: string, updateData: Partial<StaffFormData>): Promise<Staff> => {
  const response = await api.put(`/staff/${staffId}`, updateData);
  return response.data;
};

// Delete staff member
export const deleteStaff = async (staffId: string): Promise<void> => {
  await api.delete(`/staff/${staffId}`);
};

// Get staff attendance
export const getAttendance = async (staffId: string, startDate?: string, endDate?: string): Promise<AttendanceRecord[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const queryString = params.toString();
  const url = `/staff/${staffId}/attendance${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};

// Mark attendance
export const markAttendance = async (staffId: string, attendanceData: {
  status: AttendanceRecord['status'];
  clockIn?: string;
  clockOut?: string;
  leaveType?: AttendanceRecord['leave_type'];
  notes?: string;
}): Promise<AttendanceRecord> => {
  const response = await api.post(`/staff/${staffId}/attendance`, attendanceData);
  return response.data;
};

// Clock in/out
export const clockInOut = async (staffId: string, action: 'clock-in' | 'clock-out'): Promise<AttendanceRecord> => {
  const response = await api.post(`/staff/${staffId}/clock`, { action });
  return response.data;
};

// Get staff performance
export const getPerformance = async (staffId: string, period?: 'week' | 'month' | 'year'): Promise<{
  total_orders: number;
  avg_rating: number;
  total_sales: number;
  completed_orders: number;
  cancelled_orders: number;
}> => {
  const params = new URLSearchParams();
  if (period) params.append('period', period);
  
  const queryString = params.toString();
  const url = `/staff/${staffId}/performance${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};

// Get staff statistics
export const getStaffStats = async (restaurantId: string): Promise<StaffStats> => {
  const response = await api.get(`/staff/restaurant/${restaurantId}/stats`);
  return response.data;
};

// Get payroll data
export const getPayroll = async (restaurantId: string, month?: number, year?: number): Promise<PayrollData[]> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());
  
  const queryString = params.toString();
  const url = `/staff/restaurant/${restaurantId}/payroll${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};