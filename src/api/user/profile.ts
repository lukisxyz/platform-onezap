import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface UserProfile {
  id: string
  name: string
  email: string
  fullname: string
  username: string
  bio: string
}

export interface UpdateProfileData {
  fullname: string
  username: string
  bio: string
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    window.location.href = '/sign-in'
    throw new Error('Unauthorized - redirecting to sign in')
  }
  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json()
      throw new Error(error.error || error.message || 'Request failed')
    } else {
      throw new Error('Request failed')
    }
  }
  return response.json()
}

// Get user profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await fetch('/api/user/profile')
      return handleResponse(response)
    },
  })
}

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<UserProfile> => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return handleResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}
