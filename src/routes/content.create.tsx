import React from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Zap, ArrowLeft, Save, AlertCircle, AlertTriangle } from 'lucide-react'
import { useCreateContent } from '@/api/content'
import { useAccount, useSwitchChain } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { isCreatorOnChain } from '@/lib/contracts'
import { toast } from 'sonner'
import { createContentSchema, type CreateContent } from '@/api/content/types'

export const Route = createFileRoute('/content/create')({
  component: () => (
    <CreateContent />
  ),
})

function CreateContent() {
  const navigate = useNavigate()
  const createContent = useCreateContent()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [isRegisteredOnChain, setIsRegisteredOnChain] = React.useState(false)
  const [isCheckingRegistration, setIsCheckingRegistration] = React.useState(true)

  const isCorrectNetwork = chainId === mantleSepoliaTestnet.id

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateContent>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      isPremium: false,
    },
  })

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
        setIsCheckingRegistration(false)
      }
    }
    checkRegistration()
  }, [address, isConnected, isCorrectNetwork])

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

  const onSubmit = async (data: CreateContent) => {
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

        {/* On-chain registration warning */}
        {isCorrectNetwork && !isCheckingRegistration && !isRegisteredOnChain && (
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Blockchain Registration Required
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    You need to register as a content creator on the blockchain before creating content.
                    {' '}
                    <button
                      onClick={() => navigate({ to: '/profile/edit' })}
                      className="underline hover:no-underline font-medium"
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                  disabled={isSubmitting || createContent.isPending || (!isRegisteredOnChain && !isCheckingRegistration)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting || createContent.isPending
                    ? 'Saving...'
                    : !isRegisteredOnChain && !isCheckingRegistration
                      ? 'Register on Blockchain First'
                      : 'Save'}
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
