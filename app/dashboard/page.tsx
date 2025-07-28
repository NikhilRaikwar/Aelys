"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ChatDashboard } from "@/components/chat-dashboard"
import ErrorBoundary from "@/components/error-boundary"

export default function Dashboard() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/")
    }
  }, [ready, authenticated, router])

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // Will redirect to login
  }

  return (
    <ErrorBoundary>
      <ChatDashboard />
    </ErrorBoundary>
  )
}
