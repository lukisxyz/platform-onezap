import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Content, CreateContent, UpdateContent } from './types';

// Helper function to handle API responses and check for unauthorized
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    window.location.href = '/sign-in';
    throw new Error('Unauthorized - redirecting to sign in');
  }
  if (!response.ok) {
    // Try to parse error response, but handle cases where there's no body (e.g., 204)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || error.error || 'Request failed');
    } else {
      throw new Error('Request failed');
    }
  }
  // Handle responses with no content (e.g., 204 status)
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || response.status === 204) {
    return null;
  }
  return response.json();
};

// List all content
export const useContentList = () => {
  return useQuery({
    queryKey: ['content', 'list'],
    queryFn: async (): Promise<Content[]> => {
      const response = await fetch('/api/content');
      return handleResponse(response);
    },
  });
};

// Get content by ID
export const useContent = (id: string) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async (): Promise<Content> => {
      const response = await fetch(`/api/content/${id}`);
      return handleResponse(response);
    },
    enabled: !!id,
  });
};

// Create new content
export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateContent): Promise<Content> => {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
    },
  });
};

// Update existing content
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContent }): Promise<Content> => {
      const response = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['content', variables.id] });
    },
  });
};

// Delete content
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
      queryClient.removeQueries({ queryKey: ['content', id] });
    },
  });
};
