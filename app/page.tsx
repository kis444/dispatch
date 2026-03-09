'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Truck, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/auth-context'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { user, isLoading, login, signUp } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    const result = isLogin ? await login(email, password) : await signUp(email, password)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'An error occurred')
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#97D3CB] border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <main className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-[#103754] p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#97D3CB]">
            <Truck className="h-6 w-6 text-[#103754]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Dispatcher</h1>
            <p className="text-sm text-white/60">Performance Tracker</p>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight text-white">
            Track your loads.
            <br />
            Grow your earnings.
          </h2>
          <p className="mt-6 max-w-md text-lg text-white/70">
            The professional tool for truck dispatchers to manage loads, track
            commissions, and hit monthly income goals.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-[#97D3CB]">100%</p>
              <p className="mt-1 text-sm text-white/60">Visibility</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-[#F17961]">Real-time</p>
              <p className="mt-1 text-sm text-white/60">Tracking</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-6">
              <p className="text-3xl font-bold text-[#FECE8C]">Smart</p>
              <p className="mt-1 text-sm text-white/60">Goals</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-white/40">
          Built for dispatchers who mean business
        </p>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex w-full flex-col items-center justify-center px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#103754]">
              <Truck className="h-6 w-6 text-[#97D3CB]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dispatcher</h1>
              <p className="text-sm text-muted-foreground">Performance Tracker</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isLogin
              ? 'Enter your credentials to access your dashboard'
              : 'Start tracking your dispatch performance today'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-[#F17961]/10 px-4 py-3 text-sm text-[#F17961]">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background pl-12 text-foreground placeholder:text-muted-foreground focus:border-[#97D3CB] focus:ring-[#97D3CB]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border bg-background pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:border-[#97D3CB] focus:ring-[#97D3CB]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-[#103754] text-white hover:bg-[#103754]/90"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="font-medium text-[#103754] hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
