import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import "../styles/chat-ui.css"
import { Providers } from "./providers"
import { ThemeProvider } from "../contexts/theme-context"
import ThemeScript from "../components/theme-script"

export const metadata: Metadata = {
  title: "Aelys Copilot",
  description: "Instant. Intelligent. Insightful NFT and Web3 insights.",
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
      </body>
    </html>
  )
}
