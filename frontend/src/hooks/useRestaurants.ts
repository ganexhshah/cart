// Restaurants Hook

'use client';

import { useState, useEffect } from 'react';
import { restaurantApi, Restaurant } from '@/lib/restaurants';

export function useRestaurants(params?: { city?: string; isActive?: boolean }) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantApi.getAll(params);
        if (response.success) {
          setRestaurants(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [params?.city, params?.isActive]);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await restaurantApi.getAll(params);
      if (response.success) {
        setRestaurants(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  return { restaurants, loading, error, refetch };
}

export function useRestaurant(id: string) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await restaurantApi.getById(id);
        if (response.success) {
          setRestaurant(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch restaurant');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  return { restaurant, loading, error };
}
