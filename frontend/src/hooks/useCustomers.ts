import { useState, useEffect } from 'react';
import { 
  getCustomers, 
  getCustomerById, 
  addCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerOrders,
  getCustomerStats,
  updateCustomerStatus,
  addLoyaltyPoints,
  getRestaurantCustomerStats,
  sendCustomerEmail,
  Customer,
  CustomerFormData,
  CustomerOrder,
  CustomerStats,
  RestaurantCustomerStats
} from '@/lib/customers';

export const useCustomers = (restaurantId: string, filters?: {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomers(restaurantId, filters);
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchCustomers();
    }
  }, [restaurantId, filters?.status, filters?.search, filters?.sortBy, filters?.sortOrder]);

  const addNewCustomer = async (customerData: CustomerFormData) => {
    try {
      const newCustomer = await addCustomer(restaurantId, customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add customer');
    }
  };

  const updateExistingCustomer = async (customerId: string, updateData: Partial<CustomerFormData>) => {
    try {
      const updatedCustomer = await updateCustomer(customerId, updateData);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update customer');
    }
  };

  const deleteExistingCustomer = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  const changeCustomerStatus = async (customerId: string, status: 'active' | 'vip' | 'inactive') => {
    try {
      const updatedCustomer = await updateCustomerStatus(customerId, status);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update customer status');
    }
  };

  const addPoints = async (customerId: string, points: number, reason: string) => {
    try {
      const updatedCustomer = await addLoyaltyPoints(customerId, points, reason);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCustomer : c));
      return updatedCustomer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add loyalty points');
    }
  };

  const sendEmail = async (customerId: string, emailData: {
    subject: string;
    message: string;
    type?: string;
  }) => {
    try {
      const result = await sendCustomerEmail(customerId, emailData);
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to send email');
    }
  };

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    addCustomer: addNewCustomer,
    updateCustomer: updateExistingCustomer,
    deleteCustomer: deleteExistingCustomer,
    updateStatus: changeCustomerStatus,
    addLoyaltyPoints: addPoints,
    sendEmail
  };
};

export const useCustomer = (customerId: string) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerById(customerId);
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  return { customer, loading, error };
};

export const useCustomerOrders = (customerId: string, options?: {
  limit?: number;
  offset?: number;
  status?: string;
}) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerOrders(customerId, options);
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerId, options?.limit, options?.offset, options?.status]);

  return { orders, loading, error };
};

export const useCustomerStats = (customerId: string) => {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!customerId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerStats(customerId);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customer statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [customerId]);

  return { stats, loading, error };
};

export const useRestaurantCustomerStats = (restaurantId: string) => {
  const [stats, setStats] = useState<RestaurantCustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurantCustomerStats(restaurantId);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch restaurant customer statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [restaurantId]);

  return { stats, loading, error };
};