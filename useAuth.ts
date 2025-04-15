import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { AuthState } from '@/lib/types';

export function useAuth() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Check for existing session
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/session'],
    refetchOnWindowFocus: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      setAuthState({
        user: data.user,
        isLoading: false,
        error: null,
      });
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.username}!`,
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return await res.json();
    },
    onSuccess: () => {
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update auth state when session data changes
  useEffect(() => {
    if (isLoading) {
      return;
    }

    setAuthState({
      user: data?.user || null,
      isLoading: false,
      error: error ? String(error) : null,
    });
  }, [data, isLoading, error]);

  return {
    user: authState.user,
    isAdmin: authState.user?.isAdmin || false,
    isAuthenticated: !!authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}
