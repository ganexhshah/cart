import { api } from './api';

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  table_number: string;
  name: string;
  capacity: number;
  location: string;
  table_type: 'indoor' | 'outdoor' | 'private';
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  qr_code_url?: string;
  position_x: number;
  position_y: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  restaurant_name?: string;
  current_session_id?: string;
  current_party_size?: number;
  current_session_start?: string;
  current_waiter_id?: string;
}

export interface TableStats {
  total_tables: number;
  available_tables: number;
  occupied_tables: number;
  reserved_tables: number;
  maintenance_tables: number;
  total_capacity: number;
  indoor_tables: number;
  outdoor_tables: number;
  private_tables: number;
}

export interface TableSession {
  id: string;
  table_id: string;
  order_id?: string;
  session_start: string;
  session_end?: string;
  party_size: number;
  waiter_id?: string;
  status: 'active' | 'completed' | 'abandoned';
  notes?: string;
  table_name?: string;
  table_number?: string;
  restaurant_name?: string;
}

export interface CreateTableData {
  restaurantId: string;
  tableNumber: string;
  name: string;
  capacity: number;
  location?: string;
  tableType?: 'indoor' | 'outdoor' | 'private';
  status?: 'available' | 'occupied' | 'reserved' | 'maintenance';
  positionX?: number;
  positionY?: number;
  notes?: string;
}

export interface TableFilters {
  restaurantId?: string;
  status?: string;
  tableType?: string;
  search?: string;
}

export interface QRCodeData {
  url: string;
  tableId: string;
  tableName: string;
  tableNumber: string;
  restaurantId: string;
  restaurantName: string;
}

export const tableApi = {
  // Get all tables with filters
  async getTables(filters?: TableFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/tables?${queryString}` : '/tables';
    
    return api.get<{ success: boolean; data: RestaurantTable[] }>(url);
  },

  // Get single table
  async getTable(id: string) {
    return api.get<{ success: boolean; data: RestaurantTable }>(`/tables/${id}`);
  },

  // Create new table
  async createTable(data: CreateTableData) {
    return api.post<{ success: boolean; data: RestaurantTable; message: string }>('/tables', data);
  },

  // Update table
  async updateTable(id: string, data: Partial<CreateTableData>) {
    return api.put<{ success: boolean; data: RestaurantTable; message: string }>(`/tables/${id}`, data);
  },

  // Delete table
  async deleteTable(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/tables/${id}`);
  },

  // Update table status
  async updateTableStatus(id: string, status: string) {
    return api.patch<{ success: boolean; data: RestaurantTable; message: string }>(`/tables/${id}/status`, { status });
  },

  // Get table statistics
  async getTableStats(restaurantId?: string) {
    const url = restaurantId ? `/tables/stats?restaurantId=${restaurantId}` : '/tables/stats';
    return api.get<{ success: boolean; data: TableStats }>(url);
  },

  // Generate QR code data
  async generateTableQR(id: string) {
    return api.get<{ success: boolean; data: QRCodeData }>(`/tables/${id}/qr`);
  },

  // Table sessions
  async getTableSessions(filters?: {
    tableId?: string;
    status?: string;
    date?: string;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/tables/sessions/list?${queryString}` : '/tables/sessions/list';
    
    return api.get<{ success: boolean; data: TableSession[] }>(url);
  },

  // Start table session
  async startTableSession(tableId: string, data: {
    partySize: number;
    waiterId?: string;
    notes?: string;
  }) {
    return api.post<{ success: boolean; data: TableSession; message: string }>(`/tables/${tableId}/sessions`, data);
  },

  // End table session
  async endTableSession(sessionId: string) {
    return api.patch<{ success: boolean; data: TableSession; message: string }>(`/tables/sessions/${sessionId}/end`);
  }
};