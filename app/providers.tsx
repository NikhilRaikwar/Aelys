"use client"

import type React from "react"
import { PrivyProvider } from "@privy-io/react-auth"

// Optimize config object outside component to prevent re-creation
const privyConfig = {
  // Customize Privy's appearance in your app
  appearance: {
    theme: "light" as const,
    accentColor: "#5046e6" as `#${string}`, // Match brand color
    logo: "/logo.png",
    showWalletLoginFirst: true, // Show wallet option first
    walletChainType: "ethereum-only" as const,
  },
  appName: "Aelys",
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: "users-without-wallets" as const,
    requireUserPasswordOnCreate: false, // Faster onboarding
  },
  loginMethods: ["wallet" as const],
  // Optimize loading performance
  defaultChain: {
    id: 1, // Ethereum mainnet
    name: "Ethereum",
    network: "homestead",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { 
      default: { 
        http: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth"] 
      } 
    },
  },
  // Additional performance optimizations
  legal: {
    termsAndConditionsUrl: undefined,
    privacyPolicyUrl: undefined,
  },
  // Faster modal appearance
  modal: {
    size: "compact" as const,
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""
  
  return (
    <PrivyProvider
      appId={appId}
      config={privyConfig}
    >
      {children}
    </PrivyProvider>
  )
}
