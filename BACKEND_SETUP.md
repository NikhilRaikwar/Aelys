# Aelys Chatbot Backend Setup

This document describes the backend architecture for the Aelys NFT and Web3 analytics chatbot.

## Files Created

### 1. Environment Configuration
- `.env.local` - Contains API keys and configuration
  - `OPENAI_API_KEY` - OpenAI GPT-4 API key
  - `UNLEASH_API_KEY` - UnleashNFTs API key
  - `UNLEASH_BASE_URL` - UnleashNFTs base URL

### 2. Core Backend Files

#### `lib/types.ts`
TypeScript type definitions including:
- `ApiResponse<T>` - Generic API response wrapper
- `NFTData` - NFT metadata and ownership information
- `WalletAnalytics` - Comprehensive wallet portfolio data
- `MarketData` - Collection market statistics
- `AgentResponse` - AI agent response format
- `ChatMessage` - Chat conversation format
- Visualization types (`ChartData`, `TableData`)

#### `lib/api.ts`
UnleashNFTs API integration utilities:
- **`fetchNFTData(params)`** - Fetch NFT data for a wallet address
- **`fetchWalletAnalytics(params)`** - Get portfolio analytics and collection breakdown
- **`fetchMarketData(params)`** - Retrieve collection market statistics
- Comprehensive error handling with specific status code responses
- Axios client with authentication and timeout configuration

#### `lib/agent.ts`
GPT-4 agent orchestration:
- **`askAelysAgent(query, history)`** - Main agent function
- Analyzes user queries to determine required API calls
- Executes API calls based on GPT-4 reasoning
- Provides conversational responses with data insights
- Supports visualization suggestions
- Tracks token usage and execution time

#### `app/api/agent/route.ts`
Next.js API route for chat interface:
- Handles POST requests from frontend
- Validates request parameters
- Routes queries to the agent
- Returns structured JSON responses

## API Functions

### fetchNFTData
```typescript
fetchNFTData({
  address: string,
  chain: string,
  limit?: number,
  offset?: number
})
```
Fetches NFT holdings for a specific wallet address.

### fetchWalletAnalytics
```typescript
fetchWalletAnalytics({
  address: string,
  chain: string,
  includeActivity?: boolean,
  activityLimit?: number
})
```
Provides comprehensive wallet portfolio analysis including total value, collection breakdown, and recent activity.

### fetchMarketData
```typescript
fetchMarketData({
  contractAddress: string,
  chain: string,
  timeframe?: '1h' | '24h' | '7d' | '30d' | '1y'
})
```
Retrieves market statistics for NFT collections including floor price, volume, and ownership data.

## Supported Chains
- ethereum
- polygon
- arbitrum
- optimism
- base

## Agent Workflow

1. **Query Analysis**: GPT-4 analyzes the user's question to determine required data
2. **API Planning**: Determines which endpoints to call and with what parameters
3. **Data Fetching**: Executes API calls to UnleashNFTs endpoints
4. **Data Analysis**: GPT-4 analyzes the fetched data for insights
5. **Response Generation**: Creates conversational response with key findings
6. **Visualization**: Suggests charts or tables when appropriate

## Usage Example

### Frontend Integration
```typescript
const response = await fetch('/api/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What NFTs does 0x742d... own on Ethereum?",
    history: [...previousMessages]
  })
});

const data = await response.json();
console.log(data.answer); // AI-generated response
console.log(data.visualData); // Chart/table data if applicable
```

### Example Queries the Agent Can Handle
- "What NFTs does [wallet address] own?"
- "Show me the market stats for [collection contract]"
- "What's the portfolio value of [wallet address]?"
- "Compare the floor prices of [collection A] vs [collection B]"
- "What are the recent activities in [wallet address]?"

## Error Handling

The system includes comprehensive error handling:
- API authentication errors (401, 403)
- Rate limiting (429)
- Server errors (500)
- Network timeouts
- Invalid parameters
- Graceful fallbacks for OpenAI API issues

## Next Steps

As you provide additional UnleashNFTs endpoints, we can:
1. Add new functions to `lib/api.ts`
2. Update the agent's system prompt to include new capabilities
3. Add corresponding TypeScript types
4. Test with real endpoint samples

The architecture is designed to be modular and extensible, allowing for easy addition of new endpoints and capabilities.
