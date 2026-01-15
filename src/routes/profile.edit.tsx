import React from 'react'
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
import { Zap, ArrowLeft, Save, User, CheckCircle, AlertTriangle } from 'lucide-react'
import { useUserProfile, useUpdateProfile } from '@/api/user/profile'
import { useAccount, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { mantleSepoliaTestnet } from 'wagmi/chains'
import { isCreatorOnChain, registerCreatorOnChain } from '@/lib/contracts'
import { toast } from 'sonner'

const profileSchema = z.object({
  fullname: z.string().min(1, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
  registerOnChain: z.boolean().default(false),
})

type ProfileForm = z.infer<typeof profileSchema>

export const Route = createFileRoute('/profile/edit')({
  component: () => (
    <ProfileEdit />
  ),
})

function ProfileEdit() {
  const navigate = useNavigate()
  const { data: profile, isLoading, error } = useUserProfile()
  const updateProfile = useUpdateProfile()
  const { address, isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()

  const [registerOnChain, setRegisterOnChain] = React.useState(false)
  const [isAlreadyRegistered, setIsAlreadyRegistered] = React.useState(false)
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null)
  const [isRegistering, setIsRegistering] = React.useState(false)

  const isCorrectNetwork = chainId === mantleSepoliaTestnet.id

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: '',
      username: '',
      bio: '',
      registerOnChain: false,
    },
  })

  // Watch registerOnChain field
  const watchRegisterOnChain = watch('registerOnChain')

  // Auto-switch to Mantle Sepolia when on wrong network
  React.useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      switchChain({ chainId: mantleSepoliaTestnet.id })
      toast.error(`Wrong network. Please switch to ${mantleSepoliaTestnet.name}`)
    }
  }, [isConnected, isCorrectNetwork, switchChain])

  // Check if user is already registered on-chain
  React.useEffect(() => {
    async function checkRegistration() {
      if (address && isConnected && isCorrectNetwork) {
        try {
          const result = await isCreatorOnChain(address)
          setIsAlreadyRegistered(result)
        } catch (err) {
          console.error('Error checking on-chain registration:', err)
        }
      }
    }
    checkRegistration()
  }, [address, isConnected, isCorrectNetwork])

  // Reset form when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      reset({
        fullname: profile.fullname || '',
        username: profile.username || '',
        bio: profile.bio || '',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileForm) => {
    try {
      // First update the profile in the database
      await updateProfile.mutateAsync({
        fullname: data.fullname,
        username: data.username,
        bio: data.bio,
      })

      // Then register on-chain if requested
      if (data.registerOnChain && isConnected && address && !isAlreadyRegistered) {
        setIsRegistering(true)
        try {
          const hash = await registerCreatorOnChain(data.username, address)
          setTxHash(hash)
          toast.success('Profile updated and transaction submitted! Check your wallet for confirmation.')
        } catch (error: any) {
          console.error('Blockchain registration error:', error)
          toast.error(error.message || 'Profile updated but blockchain registration failed. Please try again.')
          setIsRegistering(false)
          return
        }
      } else if (data.registerOnChain && isAlreadyRegistered) {
        toast.info('You are already registered on-chain!')
      } else {
        toast.success('Profile updated successfully!')
      }

      navigate({ to: '/dashboard' })
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile. Please try again.')
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

  if (error) {
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
                Error loading profile. Please try again.
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Edit Profile
            </CardTitle>
            <CardDescription>
              Complete your profile information to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullname">Full Name *</Label>
                <Input
                  id="fullname"
                  placeholder="Enter your full name"
                  {...register('fullname')}
                />
                {errors.fullname && (
                  <p className="text-sm text-red-600">{errors.fullname.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="Choose a unique username"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  This will be your unique identifier on the platform
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself (optional)"
                  rows={4}
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio.message}</p>
                )}
                <p className="text-sm text-gray-500">
                  Maximum 500 characters
                </p>
              </div>

              {/* Blockchain Registration Section */}
              {isConnected && address && isCorrectNetwork && (
                <div className="border-t pt-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-semibold">
                          Blockchain Registration
                        </Label>
                        <p className="text-sm text-gray-500">
                          Register as a content creator on the blockchain
                        </p>
                      </div>
                      {isAlreadyRegistered && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Registered</span>
                        </div>
                      )}
                    </div>

                    {!isAlreadyRegistered ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="registerOnChain"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          {...register('registerOnChain')}
                        />
                        <Label htmlFor="registerOnChain" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Register on blockchain (requires gas fee on Mantle Sepolia)
                        </Label>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-900">
                              Already registered on blockchain
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              Your wallet address is already registered as a content creator.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isConnected && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                          Please connect your wallet to enable blockchain registration.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || updateProfile.isPending || isRegistering}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting || updateProfile.isPending || isRegistering
                    ? (isRegistering ? 'Registering on Blockchain...' : 'Saving...')
                    : 'Save Profile'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/dashboard' })}
                  disabled={isSubmitting || updateProfile.isPending || isRegistering}
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
