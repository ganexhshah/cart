import { useState, useEffect } from 'react';
import { reviewApi, Review, ReviewStats, ReviewFilters, CreateReviewData, CreateResponseData } from '@/lib/reviews';

export function useReviews(filters?: ReviewFilters) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewApi.getReviews(filters);
      
      if (response.success) {
        setReviews(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [JSON.stringify(filters)]);

  const createReview = async (data: CreateReviewData) => {
    try {
      const response = await reviewApi.createReview(data);
      if (response.success) {
        await fetchReviews(); // Refresh the list
        return response;
      }
      throw new Error(response.message || 'Failed to create review');
    } catch (err) {
      throw err;
    }
  };

  const updateReviewStatus = async (id: string, status: string) => {
    try {
      const response = await reviewApi.updateReviewStatus(id, status);
      if (response.success) {
        await fetchReviews(); // Refresh the list
        return response;
      }
      throw new Error(response.message || 'Failed to update review status');
    } catch (err) {
      throw err;
    }
  };

  const addResponse = async (reviewId: string, data: CreateResponseData) => {
    try {
      const response = await reviewApi.addResponse(reviewId, data);
      if (response.success) {
        await fetchReviews(); // Refresh the list
        return response;
      }
      throw new Error(response.message || 'Failed to add response');
    } catch (err) {
      throw err;
    }
  };

  const voteHelpful = async (reviewId: string, isHelpful: boolean) => {
    try {
      const response = await reviewApi.voteHelpful(reviewId, isHelpful);
      if (response.success) {
        await fetchReviews(); // Refresh the list
        return response;
      }
      throw new Error(response.message || 'Failed to vote on review');
    } catch (err) {
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    try {
      const response = await reviewApi.deleteReview(id);
      if (response.success) {
        await fetchReviews(); // Refresh the list
        return response;
      }
      throw new Error(response.message || 'Failed to delete review');
    } catch (err) {
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    pagination,
    refetch: fetchReviews,
    createReview,
    updateReviewStatus,
    addResponse,
    voteHelpful,
    deleteReview
  };
}

export function useRestaurantReviews(restaurantId: string, filters?: Omit<ReviewFilters, 'restaurantId'>) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewApi.getRestaurantReviews(restaurantId, filters);
      
      if (response.success) {
        setReviews(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch restaurant reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchReviews();
    }
  }, [restaurantId, JSON.stringify(filters)]);

  return {
    reviews,
    loading,
    error,
    pagination,
    refetch: fetchReviews
  };
}

export function useRestaurantReviewStats(restaurantId: string) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewApi.getRestaurantStats(restaurantId);
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to fetch review statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchStats();
    }
  }, [restaurantId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}

export function useMyRestaurantReviews(filters?: Omit<ReviewFilters, 'restaurantId'>) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewApi.getMyRestaurantReviews(filters);
      
      if (response.success) {
        setReviews(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [JSON.stringify(filters)]);

  const addResponse = async (reviewId: string, data: CreateResponseData) => {
    try {
      const response = await reviewApi.addResponse(reviewId, data);
      if (response.success) {
        await fetchReviews(); // Refresh the list
        return response;
      }
      throw new Error(response.message || 'Failed to add response');
    } catch (err) {
      throw err;
    }
  };

  const updateReviewStatus = async (id: string, status: string) => {
    try {
      const response = await reviewApi.updateReviewStatus(id, status);
      if (response.success) {
        await fetchReviews(); // Refresh the list
        return response;
      }
      throw new Error(response.message || 'Failed to update review status');
    } catch (err) {
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    pagination,
    refetch: fetchReviews,
    addResponse,
    updateReviewStatus
  };
}

export function useMyRestaurantReviewStats() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reviewApi.getMyRestaurantStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to fetch review statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
}