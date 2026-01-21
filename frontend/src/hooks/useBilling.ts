import { useState, useEffect } from 'react';
import * as billingApi from '@/lib/billing';

export const useBills = (params?: {
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await billingApi.getBills(params);
      if (response.success) {
        setBills(response.data);
      } else {
        setError(response.message || 'Failed to fetch bills');
      }
    } catch (err) {
      setError('Failed to fetch bills');
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [JSON.stringify(params)]);

  const generateBill = async (orderId: string, billData?: any) => {
    try {
      const response = await billingApi.generateBillFromOrder(orderId, billData);
      if (response.success) {
        await fetchBills(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to generate bill');
      }
    } catch (err) {
      console.error('Error generating bill:', err);
      throw err;
    }
  };

  const createBill = async (billData: any) => {
    try {
      const response = await billingApi.createBill(billData);
      if (response.success) {
        await fetchBills(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create bill');
      }
    } catch (err) {
      console.error('Error creating bill:', err);
      throw err;
    }
  };

  const processPayment = async (paymentData: billingApi.PaymentRequest) => {
    try {
      const response = await billingApi.processPayment(paymentData);
      if (response.success) {
        await fetchBills(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      throw err;
    }
  };

  const splitBill = async (splitData: billingApi.SplitBillRequest) => {
    try {
      const response = await billingApi.splitBill(splitData);
      if (response.success) {
        await fetchBills(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to split bill');
      }
    } catch (err) {
      console.error('Error splitting bill:', err);
      throw err;
    }
  };

  const printBill = async (billId: string) => {
    try {
      const response = await billingApi.printBill(billId);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to print bill');
      }
    } catch (err) {
      console.error('Error printing bill:', err);
      throw err;
    }
  };

  const sendWhatsApp = async (billId: string, phoneNumber: string) => {
    try {
      const response = await billingApi.sendBillWhatsApp(billId, phoneNumber);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send WhatsApp');
      }
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
      throw err;
    }
  };

  return {
    bills,
    loading,
    error,
    refetch: fetchBills,
    generateBill,
    createBill,
    processPayment,
    splitBill,
    printBill,
    sendWhatsApp
  };
};

export const useBillSettings = () => {
  const [settings, setSettings] = useState<billingApi.BillSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await billingApi.getBillSettings();
      if (response.success) {
        setSettings(response.data);
      } else {
        setError(response.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Failed to fetch settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<billingApi.BillSettings>) => {
    try {
      const response = await billingApi.updateBillSettings(newSettings);
      if (response.success) {
        setSettings(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings
  };
};

export const usePaymentSummary = (params?: {
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await billingApi.getPaymentSummary(params);
      if (response.success) {
        setSummary(response.data);
      } else {
        setError(response.message || 'Failed to fetch payment summary');
      }
    } catch (err) {
      setError('Failed to fetch payment summary');
      console.error('Error fetching payment summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [JSON.stringify(params)]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary
  };
};