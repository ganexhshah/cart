import { useState, useEffect } from 'react';
import { 
  getStaff, 
  getStaffById, 
  addStaff, 
  updateStaff, 
  deleteStaff,
  getAttendance,
  markAttendance,
  clockInOut,
  getPerformance,
  getStaffStats,
  getPayroll,
  Staff,
  StaffFormData,
  AttendanceRecord,
  StaffStats,
  PayrollData
} from '@/lib/staff';

export const useStaff = (restaurantId: string, filters?: {
  role?: string;
  status?: string;
  shift?: string;
}) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStaff(restaurantId, filters);
      setStaff(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchStaff();
    }
  }, [restaurantId, filters?.role, filters?.status, filters?.shift]);

  const addStaffMember = async (staffData: StaffFormData) => {
    try {
      const newStaff = await addStaff(restaurantId, staffData);
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add staff member');
    }
  };

  const updateStaffMember = async (staffId: string, updateData: Partial<StaffFormData>) => {
    try {
      const updatedStaff = await updateStaff(staffId, updateData);
      setStaff(prev => prev.map(s => s.id === staffId ? updatedStaff : s));
      return updatedStaff;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update staff member');
    }
  };

  const deleteStaffMember = async (staffId: string) => {
    try {
      await deleteStaff(staffId);
      setStaff(prev => prev.filter(s => s.id !== staffId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete staff member');
    }
  };

  const clockStaffInOut = async (staffId: string, action: 'clock-in' | 'clock-out') => {
    try {
      const result = await clockInOut(staffId, action);
      // Refresh staff data to get updated attendance
      await fetchStaff();
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : `Failed to ${action}`);
    }
  };

  return {
    staff,
    loading,
    error,
    refetch: fetchStaff,
    addStaff: addStaffMember,
    updateStaff: updateStaffMember,
    deleteStaff: deleteStaffMember,
    clockInOut: clockStaffInOut
  };
};

export const useStaffMember = (staffId: string) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStaffMember = async () => {
      if (!staffId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getStaffById(staffId);
        setStaff(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff member');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffMember();
  }, [staffId]);

  return { staff, loading, error };
};

export const useAttendance = (staffId: string, startDate?: string, endDate?: string) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    if (!staffId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getAttendance(staffId, startDate, endDate);
      setAttendance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [staffId, startDate, endDate]);

  const markStaffAttendance = async (attendanceData: {
    status: AttendanceRecord['status'];
    clockIn?: string;
    clockOut?: string;
    leaveType?: AttendanceRecord['leave_type'];
    notes?: string;
  }) => {
    try {
      const result = await markAttendance(staffId, attendanceData);
      await fetchAttendance(); // Refresh data
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to mark attendance');
    }
  };

  return {
    attendance,
    loading,
    error,
    refetch: fetchAttendance,
    markAttendance: markStaffAttendance
  };
};

export const useStaffStats = (restaurantId: string) => {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getStaffStats(restaurantId);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch staff statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [restaurantId]);

  return { stats, loading, error };
};

export const usePayroll = (restaurantId: string, month?: number, year?: number) => {
  const [payroll, setPayroll] = useState<PayrollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayroll = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getPayroll(restaurantId, month, year);
        setPayroll(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payroll data');
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [restaurantId, month, year]);

  return { payroll, loading, error };
};