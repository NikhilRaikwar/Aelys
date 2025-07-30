"use client"

import type * as React from "react"
import { Wallet, LogOut, BarChart3, Chrome, Brain, Database, Sun, Moon } from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/contexts/theme-context"

// Agent data
const agents = [
  {
    id: "chatbots-stats",
    name: "Chatbots for Stats",
    icon: BarChart3,
    description: "Statistical analysis and data insights",
  },
  {
    id: "chrome-copilot",
    name: "Chrome Copilot",
    icon: Chrome,
    description: "Browser automation and web assistance",
  },
  {
    id: "autogpt-insights",
    name: "AutoGPT for Insights",
    icon: Brain,
    description: "Autonomous AI for deep insights",
  },
  {
    id: "rag-llm-agents",
    name: "RAG/LLM Agents",
    icon: Database,
    description: "Retrieval-augmented generation agents",
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeAgent: string
  onAgentChange: (agentId: string) => void
  walletAddress: string
  formatAddress: (address: string) => string
  getUserInitials: (address: string) => string
  onWalletDisconnect: () => void
}

export function AppSidebar({
  activeAgent,
  onAgentChange,
  walletAddress,
  formatAddress,
  getUserInitials,
  onWalletDisconnect,
  ...props
}: AppSidebarProps) {
  const { actualTheme } = useTheme()
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a 
                href="https://aelys.framer.ai/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-900">
                  <Image src="/logo.png" alt="Aelys Logo" width={20} height={20} className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Aelys Copilot</span>
                  <span className="truncate text-xs text-muted-foreground">AI Agent Platform</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Agents</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agents.map((agent) => (
                <SidebarMenuItem key={agent.id}>
                  <SidebarMenuButton
                    tooltip={agent.description}
                    onClick={() => onAgentChange(agent.id)}
                    isActive={activeAgent === agent.id}
                  >
                    <agent.icon className="size-4" />
                    <span>{agent.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs flex items-center justify-center">
                      {walletAddress ? (
                        <Wallet className="w-4 h-4" />
                      ) : (
                        getUserInitials(walletAddress || "0x00")
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {walletAddress ? formatAddress(walletAddress) : "Guest User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {walletAddress ? "Wallet Connected" : "No Wallet"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {walletAddress ? formatAddress(walletAddress) : "Guest User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {walletAddress ? "Wallet Connected" : "No Wallet Connected"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle variant="compact" size="sm" />
                </div>
                <DropdownMenuSeparator />
                
                {/* Disconnect Wallet */}
                <DropdownMenuItem 
                  onClick={onWalletDisconnect}
                  className="flex items-center gap-2 px-2 py-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
