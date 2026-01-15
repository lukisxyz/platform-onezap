import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Zap, Plus, LogOut } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { useContentList } from '@/api/content'
import { useCreateContent, useDeleteContent } from '@/api/content'
import { toast } from 'sonner'
import { ProtectedRoute } from '@/components/protected-route'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
})

function Dashboard() {
  const navigate = useNavigate()
  const { address } = useAccount()
  const { data: content, isLoading, error } = useContentList()
  const createContent = useCreateContent()
  const deleteContent = useDeleteContent()

  const handleCreateContent = async () => {
    try {
      await createContent.mutateAsync({
        title: 'New Content Item',
        description: 'Created from dashboard',
      })
      toast.success('Content created successfully')
    } catch (error) {
      toast.error('Failed to create content')
    }
  }

  const handleDeleteContent = async (id: string) => {
    try {
      await deleteContent.mutateAsync(id)
      toast.success('Content deleted successfully')
    } catch (error) {
      toast.error('Failed to delete content')
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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/' })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your content with lossless subscription</p>
        </div>

        {/* Content Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>All your content items in one place</CardDescription>
              </div>
              <Button
                onClick={handleCreateContent}
                disabled={createContent.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Error loading content. Please try again.
              </div>
            ) : !content || content.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No content yet. Create your first item!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.description || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContent(item.id)}
                          disabled={deleteContent.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
