"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const { ready, authenticated } = usePrivy()
  const router = useRouter()

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard")
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

  if (authenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a 
            href="https://aelys.framer.ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-medium hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Image src="/logo.png" alt="Aelys Logo" width={16} height={16} className="size-4" />
            </div>
            Aelys Copilot
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <GalleryVerticalEnd className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">NFT & Web3 Insights</h2>
            <p className="text-muted-foreground max-w-sm">
              Advanced analytics and AI-powered insights for the decentralized world.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
