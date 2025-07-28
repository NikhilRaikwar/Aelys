"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect, useCallback } from "react"
import { ChatDashboard } from "@/components/chat-dashboard"
import ErrorBoundary from "@/components/error-boundary"

export default function Dashboard() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()

  // Optimized redirect function
  const redirectToLogin = useCallback(() => {
    router.replace("/") // Use replace instead of push
  }, [router])

  // Fast redirect if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      redirectToLogin()
    }
  }, [ready, authenticated, redirectToLogin])

  // Enhanced loading state
  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5046e6] mx-auto"></div>
          <p className="mt-4 text-lg text-white font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  // Immediate redirect if not authenticated
  if (!authenticated) {
    redirectToLogin()
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4"></div>
            <p className="text-xl text-white font-medium">Access Required</p>
            <p className="text-sm text-white/70 mt-2">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ChatDashboard />
    </ErrorBoundary>
  )
}
