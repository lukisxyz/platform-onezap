import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Zap, Plus, LogOut, Edit, Trash2, UserCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useAccount, useSwitchChain } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { useContentList } from '@/api/content'
import { useDeleteContent } from '@/api/content'
import { useSiweLogout } from '@/api/siwe'
import { useUserProfile } from '@/api/user/profile'
import { isCreatorOnChain } from '@/lib/contracts'
import { toast } from 'sonner'
import React from 'react'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <Dashboard />
  ),
})

function Dashboard() {
  const navigate = useNavigate()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const { data: content, isLoading, error } = useContentList()
  const { data: profile, isLoading: isProfileLoading } = useUserProfile()
  const deleteContent = useDeleteContent()
  const logoutMutation = useSiweLogout()

  const [isRegisteredOnChain, setIsRegisteredOnChain] = React.useState(false)
  const [isCheckingRegistration, setIsCheckingRegistration] = React.useState(false)

  const isCorrectNetwork = chainId === mantleSepoliaTestnet.id

  // Auto-switch to Mantle Sepolia when on wrong network
  React.useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      switchChain({ chainId: mantleSepoliaTestnet.id })
      toast.error(`Wrong network. Please switch to ${mantleSepoliaTestnet.name}`)
    }
  }, [isConnected, isCorrectNetwork, switchChain])

  // Check if user is registered on-chain
  React.useEffect(() => {
    async function checkRegistration() {
      if (address && isConnected && isCorrectNetwork) {
        setIsCheckingRegistration(true)
        try {
          const result = await isCreatorOnChain(address)
          setIsRegisteredOnChain(result)
        } catch (err) {
          // Silently fail - don't log to console
          setIsRegisteredOnChain(false)
        } finally {
          setIsCheckingRegistration(false)
        }
      } else {
        setIsRegisteredOnChain(false)
      }
    }
    checkRegistration()
  }, [address, isConnected, isCorrectNetwork])

  const handleDeleteContent = async (id: string) => {
    try {
      await deleteContent.mutateAsync(id)
      toast.success('Content deleted successfully')
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      toast.success('Logged out successfully')
      navigate({ to: '/' })
    } catch (error) {
      toast.error('Failed to logout')
    }
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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
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

        {/* Network Warning */}
        {!isCorrectNetwork && (
          <div className="mb-6">
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-900">
                    Wrong Network Detected
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    You are currently on Chain ID: {chainId}. Please switch to <strong>{mantleSepoliaTestnet.name}</strong> (Chain ID: {mantleSepoliaTestnet.id}) to continue.
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => switchChain({ chainId: mantleSepoliaTestnet.id })}
                    className="mt-3"
                  >
                    Switch to {mantleSepoliaTestnet.name}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        {isProfileLoading ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-blue-600" />
                <CardTitle>Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        ) : profile ? (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-blue-600" />
                  <CardTitle>Profile</CardTitle>
                  {isConnected && address && !isCheckingRegistration && (
                    <Badge
                      variant={isRegisteredOnChain ? 'default' : 'secondary'}
                      className={isRegisteredOnChain ? 'bg-green-600' : ''}
                    >
                      {isRegisteredOnChain ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Blockchain Registered
                        </span>
                      ) : (
                        'Not on Blockchain'
                      )}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate({ to: '/profile/edit' })}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-lg font-semibold">{profile.fullname || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-lg font-semibold">@{profile.username || 'Not set'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p className="text-gray-700">
                    {profile.bio || 'No bio provided'}
                  </p>
                </div>
              </div>
              {(!profile.fullname || !profile.username || !profile.bio) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your profile is incomplete. Please complete it to get the most out of your experience.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Content Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>All your content items in one place</CardDescription>
              </div>
              <Button
                onClick={() => navigate({ to: '/content/create' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {content.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="text-wrap">{item.title}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isPremium ? 'default' : 'secondary'}>
                          {item.isPremium ? 'Premium' : 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate({ to: `/content/${item.id}/edit` })}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContent(item.id)}
                            disabled={deleteContent.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
