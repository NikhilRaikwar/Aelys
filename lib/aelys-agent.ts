import OpenAI from 'openai';
import {
  getWalletDefiBalance,
  getWalletNftBalance,
  getWalletTokenBalance,
  getWalletLabel,
  getNftWalletProfile,
  getWalletScore,
  getWalletMetrics,
  getNftWalletAnalytics,
  getNftWalletScores,
  getNftWalletTraders,
  getNftWalletWashtrade
} from './aelys-agent-api';
import {
  AgentResponse,
  ChatMessage,
} from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to call portfolio endpoints
async function callPortfolioEndpoint(endpointName: string, walletAddress: string) {
  switch (endpointName) {
    case 'defi_balance':
      return getWalletDefiBalance(walletAddress);
    case 'nft_balance':
      return getWalletNftBalance(walletAddress);
    case 'token_balance':
      return getWalletTokenBalance(walletAddress);
    case 'wallet_label':
      return getWalletLabel(walletAddress);
    case 'wallet_profile':
      return getNftWalletProfile(walletAddress);
    case 'wallet_score':
      return getWalletScore(walletAddress);
    case 'wallet_metrics':
      return getWalletMetrics(walletAddress);
    case 'nft_analytics':
      return getNftWalletAnalytics(walletAddress);
    case 'nft_scores':
      return getNftWalletScores(walletAddress);
    case 'nft_traders':
      return getNftWalletTraders(walletAddress);
    case 'nft_washtrade':
      return getNftWalletWashtrade(walletAddress);
    default:
      throw new Error(`Unknown portfolio endpoint: ${endpointName}`);
  }
}

const AELYS_COPILOT_SYSTEM_PROMPT = `You are Aelys Copilot, an expert NFT Portfolio & Wallet Intelligence AI assistant. You specialize in analyzing connected wallets and providing personalized portfolio insights.

Available Portfolio Analysis Functions:
1. defi_balance: Get DeFi portfolio breakdown (token holdings, values, compositions)
2. nft_balance: Get NFT portfolio (collections, tokens, attributes, values)
3. token_balance: Get ERC20 token portfolio (balances, historical trends)
4. wallet_label: Get wallet labels (risk/whale/suspicious classifications)
5. wallet_profile: Get wallet behavioral profile (activity types, patterns)
6. wallet_score: Get wallet trust/risk scores (numerical assessment with factors)
7. wallet_metrics: Get activity metrics (P&L, volume, velocity, transaction data)
8. nft_analytics: Get NFT trading analytics (buy/sell patterns, performance)
9. nft_scores: Get additional NFT-related scores and rankings
10. nft_traders: Get trading behavior analysis (trader patterns, comparisons)
11. nft_washtrade: Get wash trading detection (suspicious activity analysis)

CRITICAL: When a user asks about wallet-specific data (portfolio, balance, score, NFTs, DeFi, metrics, etc.), you MUST respond with JSON to trigger API calls. Never provide generic advice without fetching real data first.

For wallet-specific queries, ALWAYS respond with JSON in this exact format:
{
  "action": "api_calls",
  "calls": [
    {
      "function": "wallet_score",
      "params": {}
    }
  ],
  "explanation": "Fetching wallet score data"
}

Example mappings:
- "wallet score" or "risk score" → use "wallet_score" function
- "DeFi portfolio" or "DeFi holdings" → use "defi_balance" function
- "NFT portfolio" or "NFTs" → use "nft_balance" function
- "token balance" or "tokens" → use "token_balance" function
- "wallet profile" → use "wallet_profile" function
- "trading performance" → use "nft_analytics" function
- "wash trades" → use "nft_washtrade" function

Only provide conversational responses for general educational questions that don't require wallet data.`;

export async function askAelysCopilot(
  userQuery: string,
  walletAddress: string = '',
  chatHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  const startTime = Date.now();

  try {
    if (
      !walletAddress &&
      (userQuery.toLowerCase().includes('my wallet') ||
        userQuery.toLowerCase().includes('my portfolio') ||
        userQuery.toLowerCase().includes('my holdings'))
    ) {
      return {
        answer: "Please connect your wallet to analyze your portfolio. I can assist with portfolio breakdowns, risk analysis, and more.",
        metadata: {
          executionTime: Date.now() - startTime,
        },
      };
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: AELYS_COPILOT_SYSTEM_PROMPT },
      ...chatHistory,
      { role: 'user', content: `Wallet Address: ${walletAddress}\nQuery: ${userQuery}` },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.3,
      max_tokens: 1500,
    });

    const gptResponse = response.choices[0]?.message?.content;

    if (!gptResponse) {
      throw new Error('No response from OpenAI');
    }

    let apiCallInstructions;
    try {
      apiCallInstructions = JSON.parse(gptResponse);
    } catch {
      apiCallInstructions = null;
    }

    // Fallback: If GPT didn't return JSON but the query is wallet-specific, force API calls
    if (!apiCallInstructions && walletAddress) {
      const lowerQuery = userQuery.toLowerCase();
      
      if (lowerQuery.includes('score') || lowerQuery.includes('risk')) {
        apiCallInstructions = {
          action: 'api_calls',
          calls: [{ function: 'wallet_score', params: {} }],
          explanation: 'Fetching wallet score data'
        };
      } else if (lowerQuery.includes('defi') || lowerQuery.includes('protocol')) {
        apiCallInstructions = {
          action: 'api_calls',
          calls: [{ function: 'defi_balance', params: {} }],
          explanation: 'Fetching DeFi portfolio data'
        };
      } else if (lowerQuery.includes('nft') || lowerQuery.includes('collection')) {
        apiCallInstructions = {
          action: 'api_calls',
          calls: [{ function: 'nft_balance', params: {} }],
          explanation: 'Fetching NFT portfolio data'
        };
      } else if (lowerQuery.includes('token') || lowerQuery.includes('balance')) {
        apiCallInstructions = {
          action: 'api_calls',
          calls: [{ function: 'token_balance', params: {} }],
          explanation: 'Fetching token balance data'
        };
      } else if (lowerQuery.includes('portfolio') || lowerQuery.includes('holding')) {
        apiCallInstructions = {
          action: 'api_calls',
          calls: [
            { function: 'defi_balance', params: {} },
            { function: 'nft_balance', params: {} },
            { function: 'token_balance', params: {} },
            { function: 'wallet_score', params: {} }
          ],
          explanation: 'Fetching comprehensive portfolio data'
        };
      } else if (lowerQuery.includes('trading') || lowerQuery.includes('performance')) {
        apiCallInstructions = {
          action: 'api_calls',
          calls: [{ function: 'nft_analytics', params: {} }],
          explanation: 'Fetching trading performance data'
        };
      } else if (lowerQuery.includes('wash') || lowerQuery.includes('fraud')) {
        apiCallInstructions = {
          action: 'api_calls',
          calls: [{ function: 'nft_washtrade', params: {} }],
          explanation: 'Fetching wash trading analysis'
        };
      }
    }

    if (apiCallInstructions?.action === 'api_calls' && apiCallInstructions.calls) {
      const results = [];
      let hasSuccessfulCall = false;

      for (const call of apiCallInstructions.calls) {
        try {
          const apiResult = await callPortfolioEndpoint(call.function, walletAddress);
          results.push({ function: call.function, data: apiResult, success: true });
          hasSuccessfulCall = true;
        } catch (error) {
          console.error(`API call failed for ${call.function}:`, error.message);
          results.push({ function: call.function, error: error.message, success: false });
        }
      }

      // If no API calls were successful, provide a helpful fallback response
      if (!hasSuccessfulCall) {
        const failedEndpoints = results.map(r => r.function).join(', ');
        return {
          answer: `I apologize, but I'm currently unable to fetch your portfolio data from our analytics service. This might be due to:\n\n• **Temporary service issues** - The data provider might be experiencing downtime\n• **API rate limits** - Too many requests in a short time\n• **Wallet data unavailability** - Your wallet might not have sufficient transaction history\n\n**What you can try:**\n✅ Wait a few minutes and ask again\n✅ Try a different question about general NFT or crypto topics\n✅ Check if your wallet address is correct (${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)})\n\nI'm still here to help with general questions about NFTs, DeFi, trading strategies, and market insights!`,
          metadata: {
            tokensUsed: response.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime,
            failedEndpoints: failedEndpoints
          },
        };
      }

      // Process successful results for analysis
      const successfulResults = results.filter(r => r.success);
      const failedResults = results.filter(r => !r.success);

      // Create a comprehensive data summary for analysis
      const dataContext = successfulResults.map(result => {
        const dataStr = JSON.stringify(result.data, null, 2);
        return `**${result.function}**: ${dataStr.length > 500 ? dataStr.substring(0, 500) + '...' : dataStr}`;
      }).join('\n\n');

      const analysisPrompt = `Analyze this wallet data for address ${walletAddress}:

${dataContext}

User query: "${userQuery}"

${failedResults.length > 0 ? `Note: Some data sources were unavailable: ${failedResults.map(r => r.function).join(', ')}` : ''}

Provide a conversational, human-friendly analysis that addresses the user's query. Focus on actionable insights, key findings, and recommendations. Use emojis and formatting to make it engaging. Never show raw JSON data.`;

      const analysisResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful crypto portfolio analyst. Analyze the provided wallet data and respond in a conversational, user-friendly manner. Focus on insights, not raw data.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch some of your portfolio data, but encountered issues analyzing it. Please try asking a more specific question.';

      return {
        answer: finalAnswer,
        metadata: {
          tokensUsed: (response.usage?.total_tokens || 0) + (analysisResponse.usage?.total_tokens || 0),
          executionTime: Date.now() - startTime,
          successfulEndpoints: successfulResults.length,
          failedEndpoints: failedResults.length
        },
      };
    }

    return {
      answer: gptResponse,
      metadata: {
        tokensUsed: response.usage?.total_tokens || 0,
        executionTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    console.error('Aelys Copilot error:', error);
    return {
      answer: 'I encountered an error. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        executionTime: Date.now() - startTime,
      },
    };
  }
}

