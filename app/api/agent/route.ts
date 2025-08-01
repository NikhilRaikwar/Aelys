import { NextRequest, NextResponse } from 'next/server';
import { askAelysAgent } from '@/lib/agent';
import { askMarketInsightAgent } from '@/lib/market-insight-agent';
import { askAelysCopilot } from '@/lib/aelys-agent';

// Helper function to extract wallet address from query
function extractWalletFromQuery(query: string): string | null {
  const walletRegex = /0x[a-fA-F0-9]{40}/;
  const match = query.match(walletRegex);
  return match ? match[0] : null;
}

// Helper function to check if query is wallet-related
function isWalletRelatedQuery(query: string): boolean {
  const walletKeywords = [
    'my wallet', 'my portfolio', 'my holdings', 'my balance', 'my tokens', 'my nfts',
    'my defi', 'my score', 'my risk', 'my trading', 'my activity', 'what do i own',
    'show me my', 'analyze my', 'check my', 'my exposure'
  ];
  const lowerQuery = query.toLowerCase();
  return walletKeywords.some(keyword => lowerQuery.includes(keyword));
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
      response = await askMarketInsightAgent(query, history);
      console.log('Market Insight Agent response generated');
    } else if (agentType === 'copilot') {
      // Determine which wallet address to use for Aelys Copilot
      let targetWallet = '';
      
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
      
      // Check if query is wallet-related but no wallet is available
      if (!targetWallet && isWalletRelatedQuery(query)) {
        return NextResponse.json({
          answer: "I'd love to help analyze your portfolio! However, I need access to your wallet address to provide personalized insights. Please connect your wallet or specify a wallet address in your query.\n\nOnce connected, I can help you with:\n\n• **Portfolio Analysis** - DeFi, NFT, and token breakdowns\n• **Risk Assessment** - Wallet scoring and reputation analysis\n• **Trading Insights** - Performance metrics and behavior analysis\n• **Fraud Detection** - Wash trading and suspicious activity alerts\n• **Market Intelligence** - Personalized recommendations based on your holdings\n\nConnect your wallet to get started!",
          metadata: {
            executionTime: 0,
            requiresWallet: true
          }
        });
      }
      
      response = await askAelysCopilot(query, targetWallet, history);
      console.log('Aelys Copilot response generated');
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
