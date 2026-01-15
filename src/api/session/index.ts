import { useQuery } from '@tanstack/react-query';
import { User } from './types';

// Get current session
export const useCurrentSession = () => {
  return useQuery({
    queryKey: ['session', 'current'],
    queryFn: async () => {
      const response = await fetch('/api/session');
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
  });
};

// Check authentication status
export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: async (): Promise<boolean> => {
      const response = await fetch('/api/session');
      if (!response.ok) {
        return false;
      }
      const session = await response.json();
      return !!session;
    },
  });
};

// Get current user information
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: async (): Promise<User | null> => {
      const response = await fetch('/api/user');
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
  });
};
