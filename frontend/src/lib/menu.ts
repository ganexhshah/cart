import { api } from './api';

export interface MenuCategory {
  id: string; // Changed from number to string (UUID)
  restaurant_id?: string;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: string; // Already UUID
  restaurant_id: string;
  category_id: string | null; // Changed from number to string (UUID)
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  status: 'available' | 'out_of_stock' | 'discontinued';
  preparation_time: number;
  calories: number | null;
  ingredients: string[];
  allergens: string[];
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
  restaurant_name?: string;
  total_orders?: number;
  total_revenue?: number;
  average_rating?: number;
  total_reviews?: number;
  last_ordered_at?: string;
}

export interface MenuStats {
  total_items: number;
  available_items: number;
  out_of_stock_items: number;
  discontinued_items: number;
  avg_rating: number;
  total_orders: number;
  avg_price: number;
  featured_items: number;
}

export interface CreateMenuItemData {
  restaurantId: string;
  categoryId?: string; // Changed from number to string (UUID)
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  status?: string;
  preparationTime?: number;
  calories?: number;
  ingredients?: string[];
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSpicy?: boolean;
  displayOrder?: number;
  isFeatured?: boolean;
}

export interface MenuFilters {
  restaurantId?: string;
  categoryId?: string; // Changed from number to string (UUID)
  status?: string;
  search?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  limit?: number;
  offset?: number;
}

export const menuApi = {
  // Get all menu categories
  async getCategories(restaurantId?: string) {
    const url = restaurantId ? `/menu/categories?restaurantId=${restaurantId}` : '/menu/categories';
    return api.get<{ success: boolean; data: MenuCategory[] }>(url);
  },

  // Get menu items with filters
  async getMenuItems(filters?: MenuFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/menu/items?${queryString}` : '/menu/items';
    
    return api.get<{ success: boolean; data: MenuItem[] }>(url);
  },

  // Get user's menu items (authenticated)
  async getUserMenuItems(filters?: MenuFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/menu/my-items?${queryString}` : '/menu/my-items';
    
    return api.get<{ success: boolean; data: MenuItem[] }>(url);
  },

  // Get single menu item
  async getMenuItem(id: string) {
    return api.get<{ success: boolean; data: MenuItem }>(`/menu/items/${id}`);
  },

  // Create new menu item
  async createMenuItem(data: CreateMenuItemData) {
    return api.post<{ success: boolean; data: MenuItem; message: string }>('/menu/items', data);
  },

  // Update menu item
  async updateMenuItem(id: string, data: Partial<CreateMenuItemData>) {
    return api.put<{ success: boolean; data: MenuItem; message: string }>(`/menu/items/${id}`, data);
  },

  // Delete menu item
  async deleteMenuItem(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/menu/items/${id}`);
  },

  // Update menu item status
  async updateItemStatus(id: string, status: string) {
    return api.patch<{ success: boolean; data: MenuItem; message: string }>(`/menu/items/${id}/status`, { status });
  },

  // Get menu statistics
  async getMenuStats(restaurantId?: string) {
    const url = restaurantId ? `/menu/stats?restaurantId=${restaurantId}` : '/menu/stats';
    return api.get<{ success: boolean; data: MenuStats }>(url);
  },

  // Get popular menu items
  async getPopularItems(limit: number = 10) {
    return api.get<{ success: boolean; data: MenuItem[] }>(`/menu/popular?limit=${limit}`);
  }
};