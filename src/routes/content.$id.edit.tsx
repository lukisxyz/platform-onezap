import React from 'react'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Zap, ArrowLeft, Save } from 'lucide-react'
import { useContent } from '@/api/content'
import { useUpdateContent } from '@/api/content'
import { updateContentSchema, type UpdateContent } from '@/api/content/types'
import { toast } from 'sonner'

export const Route = createFileRoute('/content/$id/edit')({
  component: () => (
    <EditContent />
  ),
})

function EditContent() {
  const navigate = useNavigate()
  const params = useParams({ from: '/content/$id/edit' })
  const id = params.id

  const { data: content, isLoading, error } = useContent(id!)
  const updateContent = useUpdateContent()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateContent>({
    resolver: zodResolver(updateContentSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      isPremium: false,
    },
  })

  const contentValue = useWatch({
    control,
    name: 'content',
  })

  // Auto-generate excerpt from content (first 100 words)
  const generateExcerpt = (text: string) => {
    if (!text) return ''
    const words = text.trim().split(/\s+/)
    const first100Words = words.slice(0, 100).join(' ')
    return first100Words
  }

  // Update excerpt when content changes using useWatch
  React.useEffect(() => {
    if (contentValue) {
      const excerpt = generateExcerpt(contentValue)
      setValue('excerpt', excerpt)
    }
  }, [contentValue, setValue])

  // Reset form when content is loaded
  React.useEffect(() => {
    if (content) {
      reset({
        title: content.title,
        excerpt: content.excerpt || '',
        content: content.content || '',
        isPremium: content.isPremium || false,
      })
    }
  }, [content, reset])

  const onSubmit = async (data: UpdateContent) => {
    try {
      await updateContent.mutateAsync({ id: id!, data })
      toast.success('Content updated successfully!')
      navigate({ to: '/dashboard' })
    } catch (error) {
      toast.error('Failed to update content. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">OneZap</span>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-blue-600" />
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
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-red-600">
                Error loading content. Please try again.
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
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
            <CardTitle>Edit Content</CardTitle>
            <CardDescription>
              Update your content item
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
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Excerpt will be auto-generated from content"
                  rows={3}
                  disabled
                  {...register('excerpt')}
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">
                  Excerpt will be auto-filled from the first 100 words of the content
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter content here"
                  rows={100}
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPremium"
                  checked={watch('isPremium')}
                  onCheckedChange={(checked) => setValue('isPremium', checked === true)}
                />
                <Label htmlFor="isPremium" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Premium Content
                </Label>
              </div>
              {errors.isPremium && (
                <p className="text-sm text-red-600">{errors.isPremium.message}</p>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || updateContent.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting || updateContent.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard' })}
                  disabled={isSubmitting || updateContent.isPending}
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