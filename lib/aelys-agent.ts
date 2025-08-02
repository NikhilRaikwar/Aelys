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

// Helper function to detect if a query is general/educational
function isGeneralQuery(query: string): boolean {
  const generalKeywords = [
    'what is', 'explain', 'how do', 'tell me about', 'define', 'difference between',
    'what are', 'how to', 'basics', 'educational', 'onboarding', 'learn about',
    'understand', 'concept of', 'meaning of', 'introduction to'
  ];
  const lowerQuery = query.toLowerCase();
  return generalKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Helper function to extract wallet address from query
function extractWalletAddress(query: string): string | null {
  // Look for Ethereum-style addresses (0x followed by 40 hex characters)
  const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
  return addressMatch ? addressMatch[0] : null;
}

// Helper function to extract blockchain from query
function extractBlockchain(query: string): string {
  const lowerQuery = query.toLowerCase();
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  for (const blockchain of supportedBlockchains) {
    if (lowerQuery.includes(blockchain)) {
      return blockchain;
    }
  }
  
  return 'ethereum'; // default
}

// Helper function to detect washtrade queries
function isWashtradeQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('wash') || lowerQuery.includes('washtrade') || 
    lowerQuery.includes('fraud') || lowerQuery.includes('suspicious') ||
    lowerQuery.includes('suspect') || lowerQuery.includes('manipulation')
  );
}

// Helper function to detect if a query is asking for market-level data (not wallet-specific)
function isMarketLevelQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Keywords that indicate market-level intent
  const marketKeywords = [
    'market', 'ethereum', 'polygon', 'solana', 'binance', 'avalanche', 'linea',
    'blockchain', 'network', 'overall', 'general', 'activity on', 'trading on',
    'volume on', 'trends', 'what\'s the', 'show me', 'any suspicious',
    'wash trading volume', 'nft market', 'defi market', 'trading volume',
    'market analytics', 'market insights', 'market data', 'chain activity',
    'network activity', 'protocol activity'
  ];
  
  // Keywords that indicate wallet-specific intent
  const walletKeywords = [
    'my wallet', 'my portfolio', 'my holdings', 'my balance', 'my nfts',
    'my tokens', 'my defi', 'my score', 'wallet address', 'this wallet',
    'connected wallet', 'my nft holdings', 'my token balance', 'my defi holdings'
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
  
  // Default: check for general blockchain/market context without personal pronouns
  return !lowerQuery.includes('my ') && !lowerQuery.includes('wallet');
}

// Helper function to detect market insight queries (for routing to market-alpha-copilot)
function isMarketInsightQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const marketInsightKeywords = [
    'market analytics', 'market insights', 'market data', 'market trends',
    'trading analytics', 'trading insights', 'volume analytics', 'sales analytics',
    'nft market', 'defi market', 'market overview', 'market summary',
    'holder analytics', 'trader analytics', 'market scores', 'market sentiment'
  ];
  
  return marketInsightKeywords.some(keyword => lowerQuery.includes(keyword)) ||
         (isMarketLevelQuery(query) && (
           lowerQuery.includes('analytics') || lowerQuery.includes('insights') ||
           lowerQuery.includes('trends') || lowerQuery.includes('volume') ||
           lowerQuery.includes('trading') || lowerQuery.includes('holders') ||
           lowerQuery.includes('traders') || lowerQuery.includes('scores')
         ));
}

// Helper function to call portfolio endpoints
async function callPortfolioEndpoint(endpointName: string, walletAddress: string, blockchain?: string) {
  switch (endpointName) {
    case 'defi_balance':
      return getWalletDefiBalance(walletAddress, blockchain || 'ethereum');
    case 'nft_balance':
      return getWalletNftBalance(walletAddress, blockchain || 'ethereum');
    case 'token_balance':
      return getWalletTokenBalance(walletAddress, blockchain || 'ethereum');
    case 'wallet_label':
      return getWalletLabel(walletAddress, blockchain || 'ethereum');
    case 'wallet_profile':
      return getNftWalletProfile(walletAddress);
    case 'wallet_score':
      return getWalletScore(walletAddress);
    case 'wallet_metrics':
      return getWalletMetrics(walletAddress, blockchain || 'ethereum');
    case 'nft_analytics':
      return getNftWalletAnalytics(walletAddress, blockchain || 'ethereum');
    case 'nft_scores':
      return getNftWalletScores(walletAddress, blockchain || 'ethereum');
    case 'nft_traders':
      return getNftWalletTraders(walletAddress, blockchain || 'ethereum');
    case 'nft_washtrade':
      return getNftWalletWashtrade(walletAddress, blockchain || 'ethereum');
    default:
      throw new Error(`Unknown portfolio endpoint: ${endpointName}`);
  }
}

const AELYS_COPILOT_SYSTEM_PROMPT = `You are Aelys Copilot, an expert NFT Portfolio & Wallet Intelligence AI assistant. You specialize in analyzing connected wallets and providing personalized portfolio insights, as well as answering general questions about NFTs, crypto, Web3, and blockchain concepts.

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

REQUIRED RESPONSE LOGIC:
1. For GENERAL/EDUCATIONAL queries ("What is an NFT?", "How do I secure my wallet?", "What is DeFi?"), provide conversational responses directly without API calls.
2. For WALLET-SPECIFIC queries (portfolio, balance, score, risk analysis), you MUST respond with JSON to trigger API calls.
3. For HYBRID queries ("What is a risk score and what's mine?"), first explain the concept, then mention you'll fetch their specific data.

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

For general questions, be conversational, educational, and helpful. For wallet queries, use the API to get real data.`;

// Helper function to detect wallet metrics queries
function isWalletMetricsQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    (lowerQuery.includes('metric') || lowerQuery.includes('analytics') || 
     lowerQuery.includes('show') || lowerQuery.includes('get')) &&
    (lowerQuery.includes('wallet') || lowerQuery.includes('address') || 
     lowerQuery.match(/0x[a-fA-F0-9]{40}/))
  );
}

// Helper function to detect if user wants detailed response
function isDetailedQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('detailed') || lowerQuery.includes('full') ||
    lowerQuery.includes('complete') || lowerQuery.includes('breakdown') ||
    lowerQuery.includes('analysis') || lowerQuery.includes('deep') ||
    lowerQuery.includes('comprehensive') || lowerQuery.includes('all')
  );
}

export async function askAelysCopilot(
  userQuery: string,
  walletAddress: string = '',
  chatHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  const startTime = Date.now();

  try {
    // Check if this is a wallet metrics query that might have an address in the query
    if (isWalletMetricsQuery(userQuery)) {
      const queryWalletAddress = extractWalletAddress(userQuery);
      const blockchain = extractBlockchain(userQuery);
      const supportedBlockchains = ['linea', 'polygon', 'ethereum', 'avalanche'];
      
      // Check if blockchain is supported
      if (!supportedBlockchains.includes(blockchain)) {
        return {
          answer: `Sorry, I can only fetch wallet metrics for Ethereum, Polygon, Linea, or Avalanche. You requested ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}.`,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
      
      // Use wallet address from query if found, otherwise use connected wallet
      const targetWallet = queryWalletAddress || walletAddress;
      
      if (!targetWallet) {
        return {
          answer: "I need a wallet address to fetch metrics. Please provide a wallet address in your query or connect your wallet.",
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
      
      // Make the API call directly for wallet metrics
      try {
        const apiResult = await getWalletMetrics(targetWallet, blockchain);
        
        // Determine if a detailed query
        const isDetailed = isDetailedQuery(userQuery);

        // Generate simple or detailed response based on necessity
        const analysisPrompt = isDetailed
          ? `Provide a detailed analysis of the following wallet metrics data, including comprehensive insights.

Wallet: ${targetWallet}
Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}
User Query: "${userQuery}"

Wallet Metrics Data: ${JSON.stringify(apiResult, null, 2)}

Include deep analysis, all metrics, trends, and recommendations. Use # headings and provide comprehensive breakdowns.`
          : `Generate a VERY CONCISE wallet metrics summary. NO verbose explanations, NO recommendations, NO filler text.

Wallet: ${targetWallet}
Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}
User Query: "${userQuery}"

Wallet Metrics Data: ${JSON.stringify(apiResult, null, 2)}

Format EXACTLY like this (use actual data from JSON):

Here's a brief summary of the wallet metrics for ${targetWallet.slice(0, 6)}...${targetWallet.slice(-4)} on ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}. The total value of your wallet is $X.XX USD, with an ETH balance of X.XXXXX ETH ($XX.XX). You have X tokens in your account.

This wallet first became active on Month Day, Year and was last active on Month Day, Year. In total, there have been X transactions with X incoming and X outgoing. The inflow was X.XX ETH from X addresses totaling $X,XXX.XX, while the outflow accounted for X.XX ETH to X addresses totaling $X,XXX.XX.

Your wallet has been active for X days and has an age of X days. Fortunately, there is no illicit volume detected, showcasing that your wallet activities are legitimate and secure. This concise summary provides the essential insights about your wallet's current status.

Keep it factual, brief, and do NOT use # tags anywhere. NO extra commentary or explanations.`;
        
        const analysisResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a crypto wallet analyst. Provide VERY BRIEF, concise responses in paragraph format. Keep responses under 100 words. Never use # tags or bullet points anywhere. Never show raw JSON. Write in flowing, natural paragraphs. Use **bold text** for key metrics only.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 400,
        });
        
        const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch the wallet metrics but encountered issues analyzing the data.';
        
        return {
          answer: finalAnswer,
          metadata: {
            tokensUsed: analysisResponse.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime,
          },
        };
        
      } catch (error) {
        console.error('Wallet metrics API error:', error);
        if (error.message.includes('Unsupported blockchain')) {
          return {
            answer: error.message,
            metadata: {
              executionTime: Date.now() - startTime,
            },
          };
        }
        return {
          answer: `I encountered an error fetching wallet metrics for ${targetWallet} on ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}. This could be due to API issues or the wallet might not have sufficient data. Please try again later.`,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
    }
    
    // Check if this is a washtrade query that might not have a wallet address
    if (isWashtradeQuery(userQuery)) {
      const queryWalletAddress = extractWalletAddress(userQuery);
      const blockchain = extractBlockchain(userQuery);
      
      // Helper function to detect if user is asking for market-level data
      function isMarketLevelQuery(query: string): boolean {
        const lowerQuery = query.toLowerCase();
        const marketKeywords = [
          'market', 'ethereum', 'polygon', 'solana', 'binance', 'avalanche', 
          'blockchain', 'network', 'overall', 'general', 'activity on',
          'trading on', 'volume on', 'trends', 'what\'s the', 'show me',
          'any suspicious', 'wash trading volume'
        ];
        
        return marketKeywords.some(keyword => lowerQuery.includes(keyword)) &&
               !lowerQuery.includes('wallet') &&
               !lowerQuery.includes('my ') &&
               !queryWalletAddress;
      }
      
      // If no wallet address found in query OR user is asking for market-level data, run market-level query
      if (!queryWalletAddress || isMarketLevelQuery(userQuery)) {
        try {
          const apiResult = await getNftWalletWashtrade(undefined, blockchain, '24h');
          
          const analysisPrompt = `Analyze the following NFT washtrade market data and provide a brief paragraph summary focusing on key washtrade metrics:

Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}
User Query: "${userQuery}"

Washtrade Market Data: ${JSON.stringify(apiResult, null, 2)}

Provide a natural language summary focusing on:
- washtrade_volume
- washtrade_suspect_sales  
- washtrade_suspect_sales_change
- washtrade_volume_change

Format as a conversational paragraph explaining recent washtrade trends in the ${blockchain} NFT market. Use bullet points only if essential for clarity.`;
          
          const analysisResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a crypto market analyst specializing in fraud detection. Provide BRIEF, concise explanations about washtrade patterns. Keep responses under 80 words. Be direct and factual.' },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.3,
            max_tokens: 300,
          });
          
          const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch washtrade market data but encountered issues analyzing it.';
          
          return {
            answer: finalAnswer,
            metadata: {
              tokensUsed: analysisResponse.usage?.total_tokens || 0,
              executionTime: Date.now() - startTime,
            },
          };
          
        } catch (error) {
          console.error('Market washtrade API error:', error);
          if (error.message.includes('Please specify a valid blockchain')) {
            return {
              answer: error.message,
              metadata: {
                executionTime: Date.now() - startTime,
              },
            };
          }
          return {
            answer: `I encountered an error fetching washtrade data for ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}. This could be due to API issues or insufficient data for the specified blockchain. Please try again later or try a different blockchain.`,
            metadata: {
              executionTime: Date.now() - startTime,
            },
          };
        }
      }
      
      // If wallet address is found or connected, proceed with wallet-specific washtrade query
      const targetWallet = queryWalletAddress || walletAddress;
      if (targetWallet) {
        try {
          const apiResult = await getNftWalletWashtrade(targetWallet, blockchain, '24h');
          
          const analysisPrompt = `Analyze the following wallet-specific NFT washtrade data and provide a brief paragraph summary:

Wallet: ${targetWallet}
Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}
User Query: "${userQuery}"

Wallet Washtrade Data: ${JSON.stringify(apiResult, null, 2)}

Provide a natural language summary focusing on key washtrade metrics for this specific wallet. Use bullet points only if essential for clarity.`;
          
          const analysisResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a crypto wallet analyst specializing in fraud detection. Provide clear, conversational explanations about wallet-specific washtrade patterns.' },
              { role: 'user', content: analysisPrompt }
            ],
            temperature: 0.3,
            max_tokens: 600,
          });
          
          const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch wallet washtrade data but encountered issues analyzing it.';
          
          return {
            answer: finalAnswer,
            metadata: {
              tokensUsed: analysisResponse.usage?.total_tokens || 0,
              executionTime: Date.now() - startTime,
            },
          };
          
        } catch (error) {
          console.error('Wallet washtrade API error:', error);
          if (error.message.includes('Please specify a valid blockchain')) {
            return {
              answer: error.message,
              metadata: {
                executionTime: Date.now() - startTime,
              },
            };
          }
          return {
            answer: `I encountered an error fetching washtrade data for wallet ${targetWallet} on ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}. This could be due to API issues or the wallet might not have sufficient data. Please try again later.`,
            metadata: {
              executionTime: Date.now() - startTime,
            },
          };
        }
      }
    }
    
    // Check if this is a general/educational query
    if (isGeneralQuery(userQuery)) {
      const generalSystemPrompt = `You are Aelys Copilot, an expert in NFTs, cryptocurrency, DeFi, Web3, and blockchain technology. Provide clear, educational, and conversational answers to general questions about crypto onboarding, wallet security, NFT concepts, DeFi protocols, and Web3 fundamentals. Focus on being helpful and informative for users learning about these topics.`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: generalSystemPrompt },
          ...chatHistory,
          { role: 'user', content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      
      return {
        answer: response.choices[0]?.message?.content || "I'm sorry, I couldn't provide an answer to your question.",
        metadata: {
          tokensUsed: response.usage?.total_tokens || 0,
          executionTime: Date.now() - startTime,
        }
      };
    }

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

    // Check if this should be routed to Market Alpha Copilot for market-level insights
    if (!apiCallInstructions && isMarketInsightQuery(userQuery)) {
      // Import and call Market Alpha Copilot
      const { askMarketAlphaCopilotAgent } = await import('./market-alpha-copilot-agent');
      return await askMarketAlphaCopilotAgent(userQuery, chatHistory);
    }
    
    // For market-level queries that don't need market insights, provide direct educational response
    if (!apiCallInstructions && isMarketLevelQuery(userQuery)) {
      const marketSystemPrompt = `You are Aelys Copilot, an expert in NFT and crypto markets. The user is asking about general market activity or trends, not about their personal wallet. Provide informative, educational responses about market conditions, trends, and general blockchain activity. Focus on explaining market concepts and general insights without making API calls.`;
      
      const marketResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: marketSystemPrompt },
          ...chatHistory,
          { role: 'user', content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });
      
      return {
        answer: marketResponse.choices[0]?.message?.content || "I'm sorry, I couldn't provide market information for your query.",
        metadata: {
          tokensUsed: marketResponse.usage?.total_tokens || 0,
          executionTime: Date.now() - startTime,
        }
      };
    }
    
    // Fallback: If GPT didn't return JSON but the query is EXPLICITLY wallet-specific, force API calls
    if (!apiCallInstructions && walletAddress && !isMarketLevelQuery(userQuery)) {
      const lowerQuery = userQuery.toLowerCase();
      
      // Only force wallet API calls if the query explicitly mentions personal/wallet terms
      const isExplicitlyWalletSpecific = 
        lowerQuery.includes('my wallet') || lowerQuery.includes('my portfolio') ||
        lowerQuery.includes('my holdings') || lowerQuery.includes('my balance') ||
        lowerQuery.includes('my nfts') || lowerQuery.includes('my tokens') ||
        lowerQuery.includes('my defi') || lowerQuery.includes('my score') ||
        extractWalletAddress(userQuery) !== null;
      
      if (isExplicitlyWalletSpecific) {
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
        }
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

      // Determine response complexity based on query
      const isDetailed = isDetailedQuery(userQuery);
      
      const analysisPrompt = isDetailed
        ? `Provide a comprehensive analysis of this wallet data for address ${walletAddress}:

${dataContext}

User query: "${userQuery}"

${failedResults.length > 0 ? `Note: Some data sources were unavailable: ${failedResults.map(r => r.function).join(', ')}` : ''}

Provide a detailed, thorough analysis with deep insights, trends, recommendations, and all relevant data points. Include comprehensive breakdowns and actionable advice.`
        : `Provide a concise analysis of this wallet data for address ${walletAddress}:

${dataContext}

User query: "${userQuery}"

${failedResults.length > 0 ? `Note: Some data sources were unavailable: ${failedResults.map(r => r.function).join(', ')}` : ''}

Focus on key metrics and essential insights only. Keep it brief and highlight the most important findings without unnecessary elaboration. Use bullet points when appropriate.`;

      const analysisResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful crypto portfolio analyst. Provide BRIEF, concise analysis in paragraph format. Keep responses under 120 words. Focus on key insights only, not raw data. Be direct and factual.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
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

