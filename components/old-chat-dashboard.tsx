"use client"

import { useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CopilotChatInterface } from "@/components/copilot-chat-interface"
import { MarketInsightsChatInterface } from "@/components/market-insights-chat-interface"

// Agent-specific configurations with Spline scenes
const agentConfigs = {
  "copilot": {
    name: "Aelys Copilot",
    description: "Ask anything about NFTs, wallets, or the market…",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    icon: Brain,
    suggestions: [
      { title: "Analyze my NFT portfolio", subtitle: "Get insights on your collection performance" },
      { title: "What's trending in NFTs?", subtitle: "Discover the hottest collections and trends" },
      { title: "Check wallet health", subtitle: "Analyze wallet activity and holdings" },
      { title: "Compare NFT projects", subtitle: "Side-by-side analysis of different collections" },
    ],
  },
  "market-insights": {
    name: "Market Insights",
    description: "Get real-time market trends, top movers, and analytics in chat.",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    icon: BarChart3,
    suggestions: [
      { title: "Show top movers today", subtitle: "Collections with biggest price changes" },
      { title: "Market sentiment analysis", subtitle: "Current market mood and trends" },
      { title: "Volume analysis", subtitle: "Trading activity across marketplaces" },
      { title: "Price predictions", subtitle: "AI-powered forecasts for collections" },
    ],
  },
}

export function ChatDashboard() {
  const [activeAgent, setActiveAgent] = useState("copilot")
  const { user, logout } = usePrivy()
  const router = useRouter()

  const handleWalletDisconnect = async () => {
    await logout()
    // Redirect to Aelys main website
    window.location.href = "https://aelys.framer.ai/"
  }

  const handleAgentChange = (agentId: string) => {
    setActiveAgent(agentId)
  }

  // Get wallet address and format it
  const walletAddress = user?.wallet?.address || ""
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Get user initials for avatar
  const getUserInitials = (address: string) => {
    return address.slice(2, 4).toUpperCase()
  }

  const currentAgent = agentConfigs[activeAgent as keyof typeof agentConfigs]

  return (
    <SidebarProvider>
      <AppSidebar
        activeAgent={activeAgent}
        onAgentChange={handleAgentChange}
        walletAddress={walletAddress}
        formatAddress={formatAddress}
        getUserInitials={getUserInitials}
        onWalletDisconnect={handleWalletDisconnect}
      />
      <SidebarInset>
        {/* Clean minimal header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>

        {/* Main Chat Content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">
              {/* Welcome message with Spline Animation */}
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="w-full max-w-md h-64 flex items-center justify-center">
                    <div className="w-full h-full relative spline-container">
                      <Spline
                        scene={splineScene}
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "transparent",
                        }}
                        onLoad={handleSplineLoad}
                        onError={handleSplineError}
                        fallback={splineFallback}
                      />
                    </div>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold">{currentAgent.name}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">{currentAgent.description}</p>
              </div>

              {/* Suggestion cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentAgent.suggestions.map((card, index) => (
                  <Card
                    key={`${activeAgent}-${index}`}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-border/50 hover:border-border group relative overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{card.title}</p>
                        <p className="text-muted-foreground text-sm">{card.subtitle}</p>
                      </div>
                    </CardContent>
                    {/* Custom gradient border effect */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Ask ${currentAgent.name} anything...`}
                  className="pr-12 py-3 text-base resize-none min-h-[48px] focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button size="sm" className="h-8 w-8 p-0" disabled={!message.trim()}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {currentAgent.name} is ready to assist with specialized tasks and insights.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
