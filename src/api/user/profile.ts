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

// Get user by username with their content
export interface UserWithContent {
  id: string
  name: string
  email: string
  fullname: string
  username: string
  bio: string
  image?: string | null
  walletAddress?: string | null
}

export interface UserContentItem {
  id: string
  title: string
  excerpt?: string | null
  isPremium: boolean
  createdAt: string
  updatedAt: string
}

export interface UserWithContentResponse {
  user: UserWithContent
  content: UserContentItem[]
  pagination: {
    cursor: string | null
    hasMore: boolean
    limit: number
  }
}

export const useUserWithContent = (username: string, cursor?: string) => {
  return useQuery<UserWithContentResponse>({
    queryKey: ['user', 'with-content', username, cursor],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (cursor) params.set('cursor', cursor)
      params.set('limit', '12')

      const response = await fetch(`/api/user/${username}?${params.toString()}`)
      return handleResponse(response)
    },
    enabled: !!username,
  })
}
