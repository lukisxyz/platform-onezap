import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Zap, ArrowLeft, Save } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useCreateContent } from '@/api/content'
import { toast } from 'sonner'
import { createContentSchema } from '@/api/content/types'
import { ProtectedRoute } from '@/components/protected-route'

export const Route = createFileRoute('/content/create')({
  component: () => (
    <ProtectedRoute>
      <CreateContent />
    </ProtectedRoute>
  ),
})

function CreateContent() {
  const navigate = useNavigate()
  const createContent = useCreateContent()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof createContentSchema>>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  // Redirect to sign-in if not connected
  if (!isConnected) {
    navigate({ to: '/sign-in' })
    return null
  }

  const onSubmit = async (data: z.infer<typeof createContentSchema>) => {
    try {
      await createContent.mutateAsync(data)
      toast.success('Content created successfully!')
      reset()
      navigate({ to: '/dashboard' })
    } catch (error) {
      toast.error('Failed to create content. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">OneZap</span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/dashboard' })}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Content</CardTitle>
            <CardDescription>
              Add a new content item to your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter content title"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Enter content description"
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isSubmitting || createContent.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting || createContent.isPending ? 'Creating...' : 'Create Content'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard' })}
                  disabled={isSubmitting || createContent.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
