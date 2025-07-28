"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"
import { Wallet } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { login } = usePrivy()

  const handleConnectWallet = () => {
    login()
  }

  return (
    <div className={cn("flex flex-col gap-8 items-center text-center", className)} {...props}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Aelys Copilot</h1>
        <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
          Aelys Copilot unlocks NFT and Web3 insights just for you. Connect your wallet to begin.
        </p>
      </div>
      
      <Button 
        onClick={handleConnectWallet}
        size="lg"
        className="w-full max-w-sm h-12 text-base font-medium"
      >
        <Wallet className="w-5 h-5 mr-2" />
        Connect your wallet to get started
      </Button>
      
      <p className="text-sm text-muted-foreground">
        Secure wallet authentication powered by Privy
      </p>
    </div>
  )
}
