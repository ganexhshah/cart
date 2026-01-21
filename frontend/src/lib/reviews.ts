import { api } from './api';

export interface Review {
  id: string;
  customer_id: string;
  restaurant_id: string;
  order_id?: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'published' | 'flagged' | 'hidden';
  helpful_count: number;
  order_value?: number;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  customer_name?: string;
  customer_email?: string;
  customer_avatar?: string;
  customer_verified?: boolean;
  restaurant_name?: string;
  restaurant_slug?: string;
  response_count?: number;
  responses?: ReviewResponse[];
  helpful_votes?: {
    helpful_count: number;
    not_helpful_count: number;
  };
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  restaurant_id: string;
  user_id: string;
  content: string;
  status: 'draft' | 'published' | 'hidden';
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_role?: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  pending_reviews: number;
  published_reviews: number;
  response_rate: number;
  rating_distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
}

export interface ReviewInsights {
  trends: {
    date: string;
    review_count: number;
    avg_rating: number;
  }[];
  keywords: {
    word: string;
    frequency: number;
  }[];
}

export interface ReviewFilters {
  restaurantId?: string;
  customerId?: string;
  status?: string;
  rating?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface CreateReviewData {
  customerId: string;
  restaurantId: string;
  orderId?: string;
  rating: number;
  title: string;
  content: string;
  orderValue?: number;
}

export interface CreateResponseData {
  content: string;
  status?: 'draft' | 'published';
}

export const reviewApi = {
  // Get all reviews with filters
  async getReviews(filters?: ReviewFilters) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/reviews?${queryString}` : '/reviews';
    
    return api.get<{
      success: boolean;
      data: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(url);
  },

  // Get single review by ID
  async getReviewById(id: string) {
    return api.get<{ success: boolean; data: Review }>(`/reviews/${id}`);
  },

  // Create new review
  async createReview(data: CreateReviewData) {
    return api.post<{ success: boolean; data: Review; message: string }>('/reviews', data);
  },

  // Update review status
  async updateReviewStatus(id: string, status: string) {
    return api.patch<{ success: boolean; data: Review; message: string }>(`/reviews/${id}/status`, { status });
  },

  // Add response to review
  async addResponse(reviewId: string, data: CreateResponseData) {
    return api.post<{ success: boolean; data: ReviewResponse; message: string }>(`/reviews/${reviewId}/response`, data);
  },

  // Vote helpful/not helpful on review
  async voteHelpful(reviewId: string, isHelpful: boolean) {
    return api.post<{ success: boolean; data: any; message: string }>(`/reviews/${reviewId}/vote`, { isHelpful });
  },

  // Delete review (soft delete)
  async deleteReview(id: string) {
    return api.delete<{ success: boolean; message: string }>(`/reviews/${id}`);
  },

  // Get reviews for a specific restaurant
  async getRestaurantReviews(restaurantId: string, filters?: Omit<ReviewFilters, 'restaurantId'>) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString 
      ? `/reviews/restaurant/${restaurantId}?${queryString}` 
      : `/reviews/restaurant/${restaurantId}`;
    
    return api.get<{
      success: boolean;
      data: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(url);
  },

  // Get review statistics for a restaurant
  async getRestaurantStats(restaurantId: string) {
    return api.get<{ success: boolean; data: ReviewStats }>(`/reviews/restaurant/${restaurantId}/stats`);
  },

  // Get review insights for a restaurant
  async getRestaurantInsights(restaurantId: string, timeframe?: string) {
    const params = new URLSearchParams();
    if (timeframe) {
      params.append('timeframe', timeframe);
    }
    
    const queryString = params.toString();
    const url = queryString 
      ? `/reviews/restaurant/${restaurantId}/insights?${queryString}`
      : `/reviews/restaurant/${restaurantId}/insights`;
    
    return api.get<{ success: boolean; data: ReviewInsights }>(url);
  },

  // Get reviews for current user's restaurant
  async getMyRestaurantReviews(filters?: Omit<ReviewFilters, 'restaurantId'>) {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const url = queryString 
      ? `/reviews/my-restaurant/reviews?${queryString}` 
      : '/reviews/my-restaurant/reviews';
    
    return api.get<{
      success: boolean;
      data: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(url);
  },

  // Get review stats for current user's restaurant
  async getMyRestaurantStats() {
    return api.get<{ success: boolean; data: ReviewStats }>('/reviews/my-restaurant/stats');
  }
};