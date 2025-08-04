import { NextRequest, NextResponse } from 'next/server';
import { askAelysAgent } from '@/lib/agent';
import { askMarketAlphaCopilotAgent } from '@/lib/market-alpha-copilot-agent';
import { askAelysCopilot } from '@/lib/aelys-agent';

// Helper function to extract wallet address from query
function extractWalletFromQuery(query: string): string | null {
  const walletRegex = /0x[a-fA-F0-9]{40}/;
  const match = query.match(walletRegex);
  return match ? match[0] : null;
}

// Helper function to check if query is wallet-related (personal analytics)
function isWalletRelatedQuery(query: string): boolean {
  const walletKeywords = [
    'my wallet', 'my portfolio', 'my holdings', 'my balance', 'my tokens', 'my nfts',
    'my defi', 'my score', 'my risk', 'my trading', 'my activity', 'what do i own',
    'show me my', 'analyze my', 'check my', 'my exposure', 'my nft holdings',
    'my token balance', 'my defi holdings', 'my collection', 'my assets'
  ];
  const lowerQuery = query.toLowerCase();
  return walletKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Helper function to detect market-level queries (should NOT use wallet data)
function isMarketLevelQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Keywords that indicate market-level intent
  const marketKeywords = [
    'market', 'ethereum', 'polygon', 'solana', 'binance', 'avalanche', 'linea',
    'blockchain', 'network', 'overall', 'general', 'activity on', 'trading on',
    'volume on', 'trends', 'what\'s the', 'show me', 'any suspicious',
    'wash trading volume', 'nft market', 'defi market', 'trading volume',
    'market analytics', 'market insights', 'market data', 'chain activity',
    'network activity', 'protocol activity', 'nft whales on', 'whales on',
    'collection whales', 'ethereum whales', 'polygon whales', 'solana whales',
    'top holders', 'whale activity', 'nft volume', 'market volume'
  ];
  
  // Keywords that indicate wallet-specific intent
  const walletKeywords = [
    'my wallet', 'my portfolio', 'my holdings', 'my balance', 'my nfts',
    'my tokens', 'my defi', 'my score', 'wallet address', 'this wallet',
    'connected wallet', 'my nft holdings', 'my token balance', 'my defi holdings',
    'my whales', 'my collection'
  ];
  
  // Check if query contains wallet address
  const hasWalletAddress = /0x[a-fA-F0-9]{40}/.test(query);
  
  // If query explicitly mentions wallet-specific terms or has an address, it's wallet-specific
  if (walletKeywords.some(keyword => lowerQuery.includes(keyword)) || hasWalletAddress) {
    return false;
  }
  
  // If query mentions market-level keywords, it's market-level
  if (marketKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return true;
  }
  
  // Default: prefer market-level for ambiguous queries unless explicitly personal
  return !lowerQuery.includes('my ') && !lowerQuery.includes('wallet');
}

// Helper function to detect collection whale queries specifically
function isCollectionWhaleQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const whaleKeywords = [
    'whales', 'whale', 'top holders', 'largest holders', 'big holders',
    'collection whales', 'nft whales', 'holders'
  ];
  
  return whaleKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Helper function to detect market insights queries
function isMarketInsightQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const marketInsightKeywords = [
    'market analytics', 'market insights', 'market data', 'market trends',
    'trading analytics', 'trading insights', 'volume analytics', 'sales analytics',
    'nft market', 'defi market', 'market overview', 'market summary',
    'holder analytics', 'trader analytics', 'market scores', 'market sentiment',
    'whale analytics', 'whale insights'
  ];
  
  return marketInsightKeywords.some(keyword => lowerQuery.includes(keyword)) ||
         (isMarketLevelQuery(query) && (
           lowerQuery.includes('analytics') || lowerQuery.includes('insights') ||
           lowerQuery.includes('trends') || lowerQuery.includes('volume') ||
           lowerQuery.includes('trading') || lowerQuery.includes('holders') ||
           lowerQuery.includes('traders') || lowerQuery.includes('scores') ||
           lowerQuery.includes('whales')
         ));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST request with body:', JSON.stringify({
      query: body.query,
      agentType: body.agentType,
      hasConnectedWallet: !!body.connectedWallet,
      hasWalletAddress: !!body.walletAddress
    }));
    
    const { query, history, agentType, walletAddress, connectedWallet } = body;

    if (!query) {
      return NextResponse.json({ 
        answer: 'Please provide a question or request for me to help you with.',
        error: 'Query is required' 
      }, { status: 400 });
    }

    let response;
    
    // Route to appropriate agent based on agentType
    if (agentType === 'market-insights') {
      response = await askMarketAlphaCopilotAgent(query, history);
      console.log('Market Alpha Copilot Agent response generated');
    } else if (agentType === 'copilot') {
      // Determine query intent
      const isWalletQuery = isWalletRelatedQuery(query);
      const isMarketQuery = isMarketLevelQuery(query) || isMarketInsightQuery(query);

      // Only use wallet address for personal analytics
      let targetWallet = '';
      if (isWalletQuery) {
        // Priority: 1. Wallet from query, 2. Explicitly provided wallet, 3. Connected wallet
        const walletFromQuery = extractWalletFromQuery(query);
        if (walletFromQuery) {
          targetWallet = walletFromQuery;
          console.log('Using wallet from query:', targetWallet);
        } else if (walletAddress) {
          targetWallet = walletAddress;
          console.log('Using provided wallet:', targetWallet);
        } else if (connectedWallet) {
          targetWallet = connectedWallet;
          console.log('Using connected wallet:', targetWallet);
        }
      }

      // Check if query is wallet-related but no wallet is available
      if (!targetWallet && isWalletQuery) {
        return NextResponse.json({
          answer: "I'd love to help analyze your portfolio! However, I need access to your wallet address to provide personalized insights. Please connect your wallet or specify a wallet address in your query.\n\nOnce connected, I can help you with:\n\n• **Portfolio Analysis** - DeFi, NFT, and token breakdowns\n• **Risk Assessment** - Wallet scoring and reputation analysis\n• **Trading Insights** - Performance metrics and behavior analysis\n• **Fraud Detection** - Wash trading and suspicious activity alerts\n• **Market Intelligence** - Personalized recommendations based on your holdings\n\nConnect your wallet to get started!",
          metadata: {
            executionTime: 0,
            requiresWallet: true
          }
        });
      }

      if (isMarketQuery) {
        response = await askMarketAlphaCopilotAgent(query, history);
        console.log('Market Alpha Copilot Agent response generated');
      } else {
        response = await askAelysCopilot(query, targetWallet, history);
        console.log('Aelys Copilot response generated');
      }
    } else {
      // Default to general Aelys agent
      response = await askAelysAgent(query, history);
      console.log('General Aelys Agent response generated');
    }

    // Ensure response always has an answer field and no raw JSON is exposed
    if (!response.answer) {
      response.answer = "I apologize, but I encountered an issue processing your request. Please try rephrasing your question or contact support if the problem persists.";
    }

    // Remove any potential raw JSON or debug information from the response
    const cleanResponse = {
      answer: response.answer,
      visualData: response.visualData,
      chartData: response.chartData,
      endpoints: response.endpoints,
      metadata: {
        tokensUsed: response.metadata?.tokensUsed || 0,
        executionTime: response.metadata?.executionTime || 0
      }
    };

    return NextResponse.json(cleanResponse);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ 
      answer: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or rephrase your question.",
      error: 'Internal server error',
      metadata: {
        executionTime: 0
      }
    }, { status: 500 });
  }
}
