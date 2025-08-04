<div align="center">
<img width="1529" height="688" alt="imagess" src="https://github.com/user-attachments/assets/f3cae2c5-a70d-4a67-8359-a418a50058bf" />

# **Aelys Copilot | Powered by bitsCrunch APIs**

*Revolutionizing NFT analytics with AI-driven intelligence and real-time Web3 insights*

</div>

---

## 📖 Project Overview

**Aelys Copilot** is a next-generation NFT and crypto analytics platform, designed as an AI-powered conversational assistant that delivers personalized portfolio and market intelligence. Leveraging **OpenAI’s large language models** and **bitsCrunch UnleashNFTs APIs (30 total endpoints)**, Aelys empowers NFT collectors, traders, and enthusiasts with seamless, real-time insights via an intuitive chat interface.

Built for clarity, speed, and depth, Aelys allows users to connect wallets securely and query a rich set of analytics—from wallet-level risk to macro NFT market trends—all powered by advanced AI reasoning and comprehensive blockchain data.

---

## 🏗️ Project Details

**Created for:** bitsCrunch x AI Builders Hack 2025  
**Developer:** Nikhil Raikwar  
**GitHub / Source:** [Nikhil Raikwar](https://github.com/NikhilRaikwar/)

---

## ✨ Features

### 🚀 **Aelys Copilot – NFT Portfolio Intelligence**

- **Personal NFT & Crypto Portfolio Assistant:**
  Understand, track, and analyze your Web3 portfolio, DeFi holdings, and NFT assets.

- **Wallet & Risk Analysis:**
  Instant breakdowns of token balances, NFT value, wallet reputation, and activity trends.

- **Risk and Fraud Detection**  
  Detects suspicious wallet behavior, wash trading, and signals potential threats through detailed analytics.

- **Conversational Analytics**  
  Simply ask any question about your portfolio to get live data, natural explanations, and even risk warnings—all in a private, chat-based flow.

**Key UnleashNFTs APIs Used:**

- `/wallet/balance/defi` — DeFi portfolio breakdown
- `/wallet/balance/nft` — NFT portfolio overview
- `/wallet/balance/token` — ERC20/token holdings
- `/wallet/label` — Wallet label & status
- `/wallet/score` — Wallet risk/reputation scoring
- `/wallet/metrics` — Metrics, activity, and P&L
- `/nft/wallet/analytics` — NFT-specific wallet analytics
- `/nft/wallet/washtrade` — Wallet-level fraud detection
- `/nft/wallet/profile` — Detailed wallet profile
- `/nft/wallet/scores` — NFT wallet scoring metrics
- `/nft/wallet/traders` — Wallet trading analytics
- `/nfts`: Fetch NFT data for a specific wallet.
- `/wallet/analytics`: Fetch wallet analytics including portfolio value and collection breakdown.
- `/collections/stats`: Fetch market data for specific NFT collections.
- `/nft/collection/whales`: Get insights into whale metrics for NFT collections.
- `/nft/floor-price`: Get floor price data for NFT collections.
- `/nft/analytics`: Get detailed analytics for NFT collections.
- `/nft/listings`: Get current listings for NFT collections.
- `/wallet/token-balance`: Get token balance for a wallet address.
- `/marketplace/metadata`: Get metadata for marketplaces.
- `/marketplace/analytics`: Get analytics data for marketplaces.

---

### 📊 **Market Alpha Copilot – NFT Market Insight**

- **Market Trend Explorer:**
  Get comprehensive trend charts, volume metrics, and aggregated market health.

- **Traders, Holders, Washtrading Reports:**
  Analyze live metrics for active traders, whales, holders, and market manipulation/wash trading.

- **Easy, Visual Answers:**
  When you ask about trends, see Area Charts and time-series analytics rendered instantly in the chat.

**Key UnleashNFTs APIs Used:**

- `/nft/market-insights/analytics` — Market-wide NFT analytics (volume, sales, transactions)
- `/nft/market-insights/holders` — NFT holders’ aggregation and trends
- `/nft/market-insights/scores` — Market-level score trends
- `/nft/market-insights/traders` — Trader activity analytics
- `/nft/market-insights/washtrade` — Wash trade metrics over time

---

### 🤖 **Unified AI Agents**

- Both copilots are powered by OpenAI LLMs for smart query understanding, answer generation, and education/explanation of NFT and crypto concepts.
- Intelligent routing dynamically queries bitsCrunch APIs based on user intent and parameters.
- Handles missing information gracefully, prompting users for clarifications when needed.
- Supports multilingual and context-aware dialogue to serve a diverse user base.

---

## 🛠️ Technology Stack

- **Landing Page:** Built with [Framer](https://www.framer.com) — sleek, interactive front door to the platform.
- **Frontend:** Next.js, React, and Tailwind CSS, creating a fast, responsive UI.
- **Backend & AI:** Next.js API routes integrating OpenAI’s GPT-4 for AI processing.
- **Blockchain Data:** Comprehensive NFT and wallet data from bitsCrunch’s UnleashNFTs APIs.
- **UI Components:** shadcn/ui & Magic UI for polished, accessible components.
- **Visuals:** Spline 3D animation adds engaging branding flair.

---

## 💬 Example Queries to Try

### 📚 **Educational Queries**
- 🎓 "What is an NFT and how does it work?"
- 🔒 "How do I secure my crypto wallet?"
- 💡 "Explain what DeFi means in simple terms"
- 🌊 "What is wash trading and how is it detected?"

### 🚀 **Aelys Copilot (Wallet & Portfolio)**
- 💼 "Show me my complete portfolio breakdown"
- ⚠️ "What's my wallet risk score and any suspicious activity?"
- 📈 "Get wallet metrics for 0x742d3..."
- 🏷️ "What labels and tags are associated with this wallet?"
- 🎯 "Show me NFT wallet scores and trading patterns"
- 🔍 "Analyze wallet for wash trading behavior"

### 📊 **Market Alpha Copilot (Market Analytics)**
- 📈 "Show NFT market volume trends for Ethereum"
- 🔍 "What's the current wash trading activity on Polygon?"
- 👥 "Display recent trader analytics and buyer/seller ratios"
- 💰 "What's the floor price of Pudgy Penguins?"
- 🐋 "Show me the top whale holders for BAYC collection"
- 🏪 "Compare marketplace performance: OpenSea vs Blur"
- 📋 "Get collection metadata for trending NFTs"

### 💎 **NFT Collection Queries**
- 💸 "Floor price trends for top 10 NFT collections"
- 📊 "Show analytics for CryptoPunks collection"
- 🏷️ "Get current NFT listings on Ethereum"
- 🔥 "Which collections have the most trading activity today?"

### 🛡️ **Risk & Fraud Detection**
- 🚨 "Detect wash trading across top marketplaces"
- ⚠️ "Risk assessment for wallet 0x..."
- 🕵️ "Show suspicious trading patterns in the market"
- 🔍 "Analyze wallet for potential fraud indicators"

---

## 🔌 Complete API Endpoints Reference

Aelys Copilot integrates with **26 bitsCrunch UnleashNFTs API endpoints** to provide comprehensive Web3 analytics. Here's the complete list organized by functionality:

### 💰 **Wallet Balance & Holdings**
- `/wallet/balance/defi` — DeFi portfolio breakdown and protocol positions
- `/wallet/balance/nft` — NFT portfolio overview with collection details
- `/wallet/balance/token` — ERC20/token holdings and balances
- `/token/balance` — Token balance aggregation across chains

### 🏷️ **Wallet Identity & Reputation**
- `/wallet/label` — Wallet labels, tags, and classification
- `/wallet/score` — Wallet risk and reputation scoring
- `/wallet/metrics` — Comprehensive wallet metrics, activity, and P&L

### 👤 **NFT Wallet Analytics**
- `/nft/wallet/profile` — Detailed NFT wallet profile and history
- `/nft/wallet/analytics` — NFT-specific wallet analytics and trends
- `/nft/wallet/scores` — NFT wallet scoring and ranking metrics
- `/nft/wallet/traders` — Wallet trading patterns and behaviors
- `/nft/wallet/washtrade` — Wallet-level fraud and wash trading detection

### 📊 **Market Intelligence & Insights**
- `/nft/market-insights/analytics` — Market-wide NFT analytics (volume, sales, transactions)
- `/nft/market-insights/holders` — NFT holders aggregation and distribution trends
- `/nft/market-insights/scores` — Market-level scoring trends and metrics
- `/nft/market-insights/traders` — Active trader analytics and market participation
- `/nft/market-insights/washtrade` — Market-wide wash trading detection and metrics

### 💎 **NFT Collection & Floor Prices**
- `/nft/floor_price` — Real-time NFT floor prices across collections
- `/nft/analytics` — Comprehensive NFT collection analytics
- `/nft/listing` — NFT listing data and marketplace activity
- `/nft/collection/whales` — Collection whale holders and major stakeholders
- `/nft/collection/metadata` — Collection metadata, stats, and information

### 🏪 **Marketplace Analytics**
- `/nft/marketplace/metadata` — Marketplace information and details
- `/nft/marketplace/analytics` — Marketplace performance metrics and trends
- `/nft/marketplace/washtrade` — Marketplace-specific wash trading analysis

### 📈 **API Health Status**

**Current API Status: 96% Success Rate (25/26 endpoints operational)**

✅ **Working Endpoints:** All critical endpoints including floor prices, market analytics, and wallet data  
⚠️ **Known Issues:** NFT Listings endpoint experiencing timeout issues  
🔄 **Last Tested:** August 2025

### 🎯 **Priority Endpoints for Core Features**

- ✅ **NFT Floor Price** — Core pricing data (Working)
- ✅ **Market Analytics** — Market trend analysis (Working)
- ✅ **Wallet Balances** — Portfolio tracking (Working)
- ✅ **Fraud Detection** — Risk assessment (Working)

---

## 🌟 Why Aelys Copilot Stands Out

- 🤝 **Unified General + Data Intelligence:**
  Handles both real-time live analytics and all your NFT/crypto general questions in one chat.

- 🔮 **Instant Visuals:**
  See your data as trendlines, risk cards, or summary charts—no dashboards required.

- 🛡️ **Security by Design:**
  All portfolio analysis is private; only you see your wallet data and risk scores.

- 🧠 **OpenAI × bitsCrunch:**
  The best of generative AI and market analytics, merged for next-gen user experience.

---

## 👨‍💻 Project Credits

Built for **bitsCrunch x AI Builders Hack 2025**  
**Developer:** Nikhil Raikwar  

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE).

Thank you for exploring Aelys Copilot—your next-gen AI partner for NFTs and Web3 analytics.

---

*Feel free to reach out for collaboration, feature requests, or feedback!*

