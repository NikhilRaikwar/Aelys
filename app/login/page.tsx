"use client"

import Image from "next/image"
import { LoginForm } from "@/components/login-form"
import Spline from '@splinetool/react-spline'
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect, useCallback } from "react"

export default function LoginPage() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()

  // Optimized redirect function
  const redirectToDashboard = useCallback(() => {
    router.replace("/dashboard")
  }, [router])

  // Set document title
  useEffect(() => {
    document.title = "Connect Wallet - Aelys Copilot | Powered by bitsCrunch APIs"
  }, [])

  // Fast redirect on authentication
  useEffect(() => {
    if (ready && authenticated) {
      redirectToDashboard()
    }
  }, [ready, authenticated, redirectToDashboard])

  // Show loading state when not ready
  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046e6] mx-auto"></div>
          <p className="mt-4 text-lg text-white font-medium">Connecting to Aelys...</p>
        </div>
      </div>
    )
  }

  // Immediate redirect if authenticated
  if (authenticated) {
    redirectToDashboard()
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-[#5046e6] rounded-full mx-auto mb-4"></div>
            <p className="text-xl text-white font-medium">Welcome to Aelys!</p>
            <p className="text-sm text-white/70 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image 
            src="/bgg.jpeg" 
            alt="Background" 
            fill 
            className="object-cover" 
            style={{ objectPosition: 'center' }}
            quality={100}
            priority
          />
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col gap-4 h-full">
        <div className="flex justify-center mb-8">
          <a href="#" className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
            <Image src="/logo.png" alt="Aelys Logo" width={64} height={64} className="size-16" />
            <h2 className="text-3xl font-bold text-white">
              Aelys
            </h2>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <Spline
          scene="https://prod.spline.design/xQReneb2fRHkE4fN/scene.splinecode" 
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
