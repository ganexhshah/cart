import { api } from './api';

export interface SubscriptionPlan {
  plan_id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  max_restaurants: number | null;
  is_active: boolean;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: string;
  plan_name: string;
  price: number;
  interval: string;
  features: string[];
  max_restaurants: number | null;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
}

export interface BillingRecord {
  id: number;
  invoice_number: string;
  description: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  payment_date: string | null;
  due_date: string | null;
  created_at: string;
}

export interface PaymentMethod {
  id: number;
  type: string;
  last_four: string;
  brand: string;
  is_default: boolean;
  created_at: string;
}

export const subscriptionApi = {
  // Get all subscription plans
  async getPlans() {
    return api.get<{ success: boolean; data: SubscriptionPlan[] }>('/subscriptions/plans');
  },

  // Get current user subscription
  async getCurrentSubscription() {
    return api.get<{ success: boolean; data: UserSubscription | null }>('/subscriptions/current');
  },

  // Update subscription
  async updateSubscription(planId: string) {
    return api.post<{ success: boolean; data: UserSubscription; message: string }>('/subscriptions/subscribe', { planId });
  },

  // Cancel subscription
  async cancelSubscription(immediate: boolean = false) {
    return api.post<{ success: boolean; data: UserSubscription; message: string }>('/subscriptions/cancel', { immediate });
  },

  // Get billing history
  async getBillingHistory(limit: number = 20) {
    return api.get<{ success: boolean; data: BillingRecord[] }>(`/subscriptions/billing-history?limit=${limit}`);
  },

  // Get payment methods
  async getPaymentMethods() {
    return api.get<{ success: boolean; data: PaymentMethod[] }>('/subscriptions/payment-methods');
  },

  // Add payment method
  async addPaymentMethod(data: {
    type: string;
    lastFour: string;
    brand?: string;
    isDefault?: boolean;
  }) {
    return api.post<{ success: boolean; data: PaymentMethod; message: string }>('/subscriptions/payment-methods', data);
  },

  // Delete payment method
  async deletePaymentMethod(id: number) {
    return api.delete<{ success: boolean; message: string }>(`/subscriptions/payment-methods/${id}`);
  },

  // Check subscription limits
  async checkLimit(resourceType: string) {
    return api.get<{
      success: boolean;
      data: {
        allowed: boolean;
        message?: string;
        current?: number;
        limit?: number;
      }
    }>(`/subscriptions/check-limit/${resourceType}`);
  }
};
