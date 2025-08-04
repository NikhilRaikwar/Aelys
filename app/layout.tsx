import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "../styles/chat-ui.css"
import { Providers } from "./providers"
import { ThemeProvider } from "../contexts/theme-context"
import ThemeScript from "../components/theme-script"

export const metadata: Metadata = {
  title: "Aelys Copilot | Powered by bitsCrunch APIs",
  description: "Unlock real-time NFT analytics, portfolio tracking, and market insights with Aelys Copilot. Powered by bitsCrunch APIs, our AI assistant delivers instant answers, visualizations, and multilingual support for your NFT and Web3 journey.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <ThemeScript />
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
