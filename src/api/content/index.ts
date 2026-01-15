import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Content, CreateContent, UpdateContent } from './types';

// List all content
export const useContentList = () => {
  return useQuery({
    queryKey: ['content', 'list'],
    queryFn: async (): Promise<Content[]> => {
      const response = await fetch('/api/content');
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      return response.json();
    },
  });
};

// Get content by ID
export const useContent = (id: string) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async (): Promise<Content> => {
      const response = await fetch(`/api/content/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      return response.json();
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
      if (!response.ok) {
        throw new Error('Failed to create content');
      }
      return response.json();
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
      if (!response.ok) {
        throw new Error('Failed to update content');
      }
      return response.json();
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
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content', 'list'] });
      queryClient.removeQueries({ queryKey: ['content', id] });
    },
  });
};
