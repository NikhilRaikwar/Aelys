"use client"

import { useState, useMemo, useCallback } from "react"
import { ArrowUp, BarChart3, Chrome, Brain, Database } from "lucide-react"
import Spline from "@splinetool/react-spline"
import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"

// Agent-specific configurations with Spline scenes
const agentConfigs = {
  "chatbots-stats": {
    name: "Chatbots for Stats",
    description: "Statistical analysis and data insights for your NFT portfolio",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    icon: BarChart3,
    suggestions: [
      { title: "Generate portfolio statistics", subtitle: "for your NFT collection" },
      { title: "Analyze trading volume trends", subtitle: "across different marketplaces" },
      { title: "Calculate ROI metrics", subtitle: "for specific NFT investments" },
      { title: "Compare collection performance", subtitle: "against market benchmarks" },
    ],
  },
  "chrome-copilot": {
    name: "Chrome Copilot",
    description: "Browser automation and web assistance for NFT research",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    icon: Chrome,
    suggestions: [
      { title: "Scrape marketplace data", subtitle: "from OpenSea and other platforms" },
      { title: "Monitor price changes", subtitle: "for specific NFT collections" },
      { title: "Automate bidding strategies", subtitle: "based on market conditions" },
      { title: "Extract wallet analytics", subtitle: "from blockchain explorers" },
    ],
  },
  "autogpt-insights": {
    name: "AutoGPT for Insights",
    description: "Autonomous AI for deep market insights and analysis",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    icon: Brain,
    suggestions: [
      { title: "Generate market research reports", subtitle: "with autonomous data gathering" },
      { title: "Predict collection trends", subtitle: "using advanced AI models" },
      { title: "Analyze social sentiment", subtitle: "across Twitter and Discord" },
      { title: "Identify emerging opportunities", subtitle: "in the NFT ecosystem" },
    ],
  },
  "rag-llm-agents": {
    name: "RAG/LLM Agents",
    description: "Retrieval-augmented generation for comprehensive NFT knowledge",
    splineScene: "https://prod.spline.design/OCHi5lTP-1SjSufh/scene.splinecode",
    icon: Database,
    suggestions: [
      { title: "Query NFT knowledge base", subtitle: "for detailed project information" },
      { title: "Analyze whitepaper content", subtitle: "and roadmap comparisons" },
      { title: "Research team backgrounds", subtitle: "and project credibility" },
      { title: "Compare utility features", subtitle: "across similar projects" },
    ],
  },
}

export function ChatDashboard() {
  const [message, setMessage] = useState("")
  const [activeAgent, setActiveAgent] = useState("chatbots-stats")
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

  // Memoized Spline scene based on active agent
  const splineScene = useMemo(() => currentAgent.splineScene, [currentAgent])

  // Memoized callbacks for Spline events
  const handleSplineLoad = useCallback(() => {
    console.log(`Spline scene loaded for ${currentAgent.name}`)
  }, [currentAgent.name])

  const handleSplineError = useCallback(
    (error: any) => {
      console.error(`Spline error for ${currentAgent.name}:`, error)
    },
    [currentAgent.name],
  )

  // Memoized fallback component
  const splineFallback = useMemo(
    () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <currentAgent.icon className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading {currentAgent.name}...</p>
        </div>
      </div>
    ),
    [currentAgent],
  )

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
        {/* Header with Breadcrumbs */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-lg font-semibold">{currentAgent.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
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
