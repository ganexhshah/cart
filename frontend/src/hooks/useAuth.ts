// Authentication Hook

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User } from '@/lib/auth';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const storedUser = authApi.getStoredUser();
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  };

  const register = async (fullName: string, email: string, password: string) => {
    const response = await authApi.register({ fullName, email, password });
    return response;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/auth/login');
  };

  const requireAuth = () => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  };

  const requireRole = (allowedRoles: string[]) => {
    if (!loading && (!user || !allowedRoles.includes(user.role))) {
      router.push('/');
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    requireAuth,
    requireRole,
  };
}
