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
  getNftWalletWashtrade,
  getNFTWashtrade,
  getCollectionMetadata,
  getNftFloorPrice,
  getNftAnalytics,
  getNftListing,
  getTokenBalance,
  getNftMarketplaceMetadata,
  getNftMarketplaceAnalytics,
  getNftMarketplaceWashtrade
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

// Helper function to detect NFT-specific washtrade queries (for specific contract/token analysis)
function isNFTWashtradeQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const hasWashtradeTerms = lowerQuery.includes('wash') || lowerQuery.includes('washtrade') || 
                           lowerQuery.includes('fraud') || lowerQuery.includes('suspicious');
  const hasNFTSpecificTerms = lowerQuery.includes('token') || lowerQuery.includes('contract') ||
                             lowerQuery.includes('nft') || /0x[a-fA-F0-9]{40}/.test(query);
  
  return hasWashtradeTerms && hasNFTSpecificTerms;
}

// Helper function to extract contract address from query
function extractContractAddress(query: string): string[] | null {
  const addresses = query.match(/0x[a-fA-F0-9]{40}/g);
  return addresses ? addresses : null;
}

// Helper function to extract token ID from query
function extractTokenId(query: string): string[] | null {
  // Look for token ID patterns like "token 123", "#123", "token id 456"
  const tokenIdMatches = query.match(/(?:token\s*(?:id\s*)?|#)(\d+)/gi);
  if (tokenIdMatches) {
    return tokenIdMatches.map(match => match.replace(/(?:token\s*(?:id\s*)?|#)/i, '').trim());
  }
  return null;
}

// Helper function to detect collection metadata queries
function isCollectionMetadataQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Priority check: Look for "tell me about" + "collection" + quoted name pattern
  if ((lowerQuery.includes('tell me about') || lowerQuery.includes('about')) && 
      lowerQuery.includes('collection') && 
      (lowerQuery.includes("'") || lowerQuery.includes('"'))) {
    console.log('Collection metadata query detected: tell me about collection pattern with quotes');
    return true;
  }
  
  // Check for any quoted NFT collection name patterns
  if ((lowerQuery.includes("'") || lowerQuery.includes('"')) && 
      (lowerQuery.includes('collection') || lowerQuery.includes('nft') || 
       lowerQuery.includes('tell me about') || lowerQuery.includes('about'))) {
    console.log('Collection metadata query detected: quoted collection name pattern');
    return true;
  }
  
  const metadataKeywords = [
    'collection info', 'collection details', 'collection metadata', 'about collection',
    'collection description', 'collection information', 'what is this collection',
    'tell me about collection', 'collection data', 'collection properties',
    'collection attributes', 'collection characteristics', 'nft collection info'
  ];
  
  // Check for explicit metadata keywords
  if (metadataKeywords.some(keyword => lowerQuery.includes(keyword))) {
    console.log('Collection metadata query detected: metadata keywords');
    return true;
  }
  
  // Check for collection + descriptive words
  if (lowerQuery.includes('collection') && (
    lowerQuery.includes('info') || lowerQuery.includes('details') ||
    lowerQuery.includes('metadata') || lowerQuery.includes('description') ||
    lowerQuery.includes('about') || lowerQuery.includes('what is') ||
    lowerQuery.includes('tell me')
  )) {
    console.log('Collection metadata query detected: collection + descriptive words');
    return true;
  }
  
  // Check for contract address with collection context
  if (/0x[a-fA-F0-9]{40}/.test(query) && 
      (lowerQuery.includes('collection') || lowerQuery.includes('metadata') || 
       lowerQuery.includes('info') || lowerQuery.includes('about'))) {
    console.log('Collection metadata query detected: contract address with collection context');
    return true;
  }
  
  // Check for slug patterns like "collection:name" or contract addresses with collection context
  if ((lowerQuery.includes('collection:') || lowerQuery.includes('slug:')) && 
      lowerQuery.includes('details')) {
    console.log('Collection metadata query detected: slug patterns');
    return true;
  }
  
  console.log('Collection metadata query NOT detected for:', lowerQuery);
  return false;
}

// Helper function to extract slug name from query
function extractSlugName(query: string): string[] | null {
  // Look for slug patterns like "collection:slug-name" or "slug:name"
  const slugMatches = query.match(/(?:collection:|slug:)([a-zA-Z0-9-_]+)/gi);
  if (slugMatches) {
    return slugMatches.map(match => match.replace(/(?:collection:|slug:)/i, '').trim());
  }
  
  // Look for quoted collection names with single quotes
  const singleQuotedMatches = query.match(/'([^']+)'/g);
  if (singleQuotedMatches) {
    return singleQuotedMatches.map(match => match.replace(/'/g, '').toLowerCase().replace(/\s+/g, '-'));
  }
  
  // Look for quoted collection names with double quotes
  const doubleQuotedMatches = query.match(/"([^"]+)"/g);
  if (doubleQuotedMatches) {
    return doubleQuotedMatches.map(match => match.replace(/"/g, '').toLowerCase().replace(/\s+/g, '-'));
  }
  
  // Look for collection names after "collection" keyword (without quotes)
  const collectionNameMatch = query.match(/(?:collection\s+|about\s+(?:the\s+)?collection\s+)([a-zA-Z0-9-_]+)/i);
  if (collectionNameMatch) {
    return [collectionNameMatch[1].toLowerCase()];
  }
  
  return null;
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

// Helper function to detect whale queries (for routing to market-alpha-copilot)
function isWhaleQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const whaleKeywords = [
    'collection whales', 'whale activity', 'whale metrics', 'whale holders',
    'whale trading', 'whale volume', 'whale analysis', 'collections with whales',
    'which collections have whales', 'whale buyers', 'whale sellers',
    'collections ranked by whale', 'collections sorted by whale',
    'mint whales', 'trading whales', 'collections with most whales'
  ];
  
  // Check for whale-specific patterns
  const hasWhaleKeyword = whaleKeywords.some(keyword => lowerQuery.includes(keyword));
  const hasWhaleAndCollection = lowerQuery.includes('whale') && 
    (lowerQuery.includes('collection') || lowerQuery.includes('collections'));
  const hasWhaleMarketQuery = lowerQuery.includes('whale') && 
    (lowerQuery.includes('ethereum') || lowerQuery.includes('polygon') || 
     lowerQuery.includes('solana') || lowerQuery.includes('binance') ||
     lowerQuery.includes('avalanche') || lowerQuery.includes('show me') ||
     lowerQuery.includes('which') || lowerQuery.includes('display'));
  
  return hasWhaleKeyword || hasWhaleAndCollection || hasWhaleMarketQuery;
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
  
  // Include whale queries in market insights
  if (isWhaleQuery(query)) {
    return true;
  }
  
  return marketInsightKeywords.some(keyword => lowerQuery.includes(keyword)) ||
         (isMarketLevelQuery(query) && (
           lowerQuery.includes('analytics') || lowerQuery.includes('insights') ||
           lowerQuery.includes('trends') || lowerQuery.includes('volume') ||
           lowerQuery.includes('trading') || lowerQuery.includes('holders') ||
           lowerQuery.includes('traders') || lowerQuery.includes('scores')
         ));
}

// Helper function to detect sort_by preference from user query
function detectSortByPreference(query: string, endpointType: string): string {
  const lowerQuery = query.toLowerCase();
  
  // NFT Analytics sort preferences
  if (endpointType === 'nft_analytics') {
    if (lowerQuery.includes('sales') || lowerQuery.includes('sold')) return 'sales';
    if (lowerQuery.includes('mint') || lowerQuery.includes('minted')) return 'nft_mint';
    if (lowerQuery.includes('bought') || lowerQuery.includes('purchase')) return 'nft_bought';
    if (lowerQuery.includes('burn') || lowerQuery.includes('burned')) return 'nft_burn';
    if (lowerQuery.includes('transfer')) return 'nft_transfer';
    if (lowerQuery.includes('transactions')) return 'transactions';
    if (lowerQuery.includes('change') || lowerQuery.includes('trend')) return 'volume_change';
    return 'volume'; // default
  }
  
  // NFT Scores sort preferences
  if (endpointType === 'nft_scores') {
    if (lowerQuery.includes('profit') && lowerQuery.includes('unrealized')) return 'unrealized_profit';
    if (lowerQuery.includes('profit') && lowerQuery.includes('realized')) return 'realized_profit';
    if (lowerQuery.includes('collection') || lowerQuery.includes('collections')) return 'collection_count';
    if (lowerQuery.includes('nft count') || lowerQuery.includes('number of nft')) return 'nft_count';
    if (lowerQuery.includes('washtrade') || lowerQuery.includes('wash trade')) return 'washtrade_nft_count';
    if (lowerQuery.includes('estimated')) return 'estimated_portfolio_value';
    return 'portfolio_value'; // default
  }
  
  // NFT Traders sort preferences
  if (endpointType === 'nft_traders') {
    if (lowerQuery.includes('buyer') || lowerQuery.includes('buyers')) return 'traders_buyers';
    if (lowerQuery.includes('seller') || lowerQuery.includes('sellers')) return 'traders_sellers';
    if (lowerQuery.includes('change') || lowerQuery.includes('trend')) return 'traders_change';
    return 'traders'; // default
  }
  
  // NFT Washtrade sort preferences
  if (endpointType === 'nft_washtrade') {
    if (lowerQuery.includes('suspect') || lowerQuery.includes('suspicious')) return 'washtrade_suspect_sales';
    if (lowerQuery.includes('change') || lowerQuery.includes('trend')) return 'washtrade_volume_change';
    return 'washtrade_volume'; // default
  }
  
  // NFT-specific Washtrade sort preferences (for specific NFT analysis)
  if (endpointType === 'nft_specific_washtrade') {
    if (lowerQuery.includes('assets')) return 'washtrade_assets';
    if (lowerQuery.includes('wallets')) return 'washtrade_wallets';
    if (lowerQuery.includes('transactions')) return 'washtrade_suspect_transactions';
    if (lowerQuery.includes('suspect') || lowerQuery.includes('suspicious')) return 'washtrade_suspect_sales';
    if (lowerQuery.includes('change') || lowerQuery.includes('trend')) return 'washtrade_volume_change';
    return 'washtrade_volume'; // default
  }
  
  return 'default';
}

// Helper function to call portfolio endpoints with smart sort_by detection
async function callPortfolioEndpoint(endpointName: string, walletAddress: string, blockchain?: string, userQuery?: string) {
  const targetBlockchain = blockchain || 'ethereum';
  
  switch (endpointName) {
    case 'defi_balance':
      return getWalletDefiBalance(walletAddress, targetBlockchain);
    case 'nft_balance':
      return getWalletNftBalance(walletAddress, targetBlockchain);
    case 'token_balance':
      return getWalletTokenBalance(walletAddress, targetBlockchain);
    case 'wallet_label':
      return getWalletLabel(walletAddress, targetBlockchain);
    case 'wallet_profile':
      return getNftWalletProfile(walletAddress);
    case 'wallet_score':
      return getWalletScore(walletAddress);
    case 'wallet_metrics':
      return getWalletMetrics(walletAddress, targetBlockchain);
    case 'nft_analytics': {
      const sortBy = userQuery ? detectSortByPreference(userQuery, 'nft_analytics') : 'volume';
      return getNftWalletAnalytics(walletAddress, targetBlockchain, 'all', sortBy as any);
    }
    case 'nft_scores': {
      const sortBy = userQuery ? detectSortByPreference(userQuery, 'nft_scores') : 'portfolio_value';
      return getNftWalletScores(walletAddress, targetBlockchain, '24h', sortBy as any);
    }
    case 'nft_traders': {
      const sortBy = userQuery ? detectSortByPreference(userQuery, 'nft_traders') : 'traders';
      return getNftWalletTraders(walletAddress, targetBlockchain, '24h', sortBy as any);
    }
    case 'nft_washtrade': {
      const sortBy = userQuery ? detectSortByPreference(userQuery, 'nft_washtrade') : 'washtrade_volume';
      return getNftWalletWashtrade(walletAddress, targetBlockchain, '24h', sortBy as any);
    }
    default:
      throw new Error(`Unknown portfolio endpoint: ${endpointName}`);
  }
}

// Helper function to call multiple endpoints for comprehensive analysis
async function callMultipleEndpoints(walletAddress: string, blockchain: string, userQuery: string) {
  const endpoints = ['nft_analytics', 'nft_scores', 'nft_traders', 'nft_washtrade'];
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await callPortfolioEndpoint(endpoint, walletAddress, blockchain, userQuery);
      results.push({ endpoint, data: result, success: true });
    } catch (error) {
      console.error(`Failed to call ${endpoint}:`, error.message);
      results.push({ endpoint, error: error.message, success: false });
    }
  }
  
  return results;
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

// Helper function to detect floor price queries
function isFloorPriceQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('floor price') || lowerQuery.includes('floor') ||
    lowerQuery.includes('minimum price') || lowerQuery.includes('cheapest') ||
    lowerQuery.includes('lowest price')
  );
}

// Helper function to detect NFT analytics queries (specific NFT analysis)
function isNftAnalyticsQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const hasNftTerms = lowerQuery.includes('nft') || /0x[a-fA-F0-9]{40}/.test(query);
  const hasAnalyticsTerms = lowerQuery.includes('analytics') || lowerQuery.includes('performance') ||
                           lowerQuery.includes('sales') || lowerQuery.includes('volume') ||
                           lowerQuery.includes('transactions');
  
  return hasNftTerms && hasAnalyticsTerms;
}

// Helper function to detect NFT listing queries
function isNftListingQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('listing') || lowerQuery.includes('listed') ||
    lowerQuery.includes('for sale') || lowerQuery.includes('on sale') ||
    lowerQuery.includes('marketplace listing')
  );
}

// Helper function to detect token balance queries
function isTokenBalanceQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('token balance') || lowerQuery.includes('token holdings') ||
    lowerQuery.includes('erc20') || lowerQuery.includes('token portfolio') ||
    (lowerQuery.includes('token') && (lowerQuery.includes('balance') || lowerQuery.includes('hold')))
  );
}

// Helper function to detect marketplace queries
function isMarketplaceQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('marketplace') || lowerQuery.includes('opensea') ||
    lowerQuery.includes('blur') || lowerQuery.includes('magiceden') ||
    lowerQuery.includes('rarible') || lowerQuery.includes('marketplace analytics') ||
    lowerQuery.includes('marketplace data') || lowerQuery.includes('marketplace metadata')
  );
}

export async function askAelysCopilot(
  userQuery: string,
  walletAddress: string = '',
  chatHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  const startTime = Date.now();

  try {
    console.log('=== QUERY PROCESSING DEBUG ===');
    console.log('User Query:', userQuery);
    console.log('Is Collection Metadata Query:', isCollectionMetadataQuery(userQuery));
    console.log('Is General Query:', isGeneralQuery(userQuery));
    console.log('Is Washtrade Query:', isWashtradeQuery(userQuery));
    console.log('Is Wallet Metrics Query:', isWalletMetricsQuery(userQuery));
    console.log('Is Floor Price Query:', isFloorPriceQuery(userQuery));
    console.log('Is NFT Analytics Query:', isNftAnalyticsQuery(userQuery));
    console.log('Is NFT Listing Query:', isNftListingQuery(userQuery));
    console.log('Is Token Balance Query:', isTokenBalanceQuery(userQuery));
    console.log('Is Marketplace Query:', isMarketplaceQuery(userQuery));
    console.log('==============================');
    
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
    
    // Check if this is a collection metadata query
    if (isCollectionMetadataQuery(userQuery)) {
      console.log('Collection metadata query detected:', userQuery);
      const contractAddress = extractContractAddress(userQuery);
      const slugName = extractSlugName(userQuery);
      const blockchain = extractBlockchain(userQuery);
      
      console.log('Extracted parameters:', {
        contractAddress,
        slugName,
        blockchain
      });

      // Check if any identifying parameters were found
      if (!contractAddress && !slugName) {
        console.log('No contract address or slug name found');
        return {
          answer: "I need a contract address or slug name to fetch the collection metadata. Please provide one in your query.",
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
      
      try {
        console.log('Calling getCollectionMetadata with:', { blockchain, contractAddress, slugName });
        const apiResult = await getCollectionMetadata(blockchain, contractAddress, slugName);
        console.log('API result:', apiResult);

        // Generate a conversational response about the collection
        const analysisPrompt = `Analyze the following NFT collection metadata and provide a brief, conversational summary:

User Query: "${userQuery}"
Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}

Collection Metadata: ${JSON.stringify(apiResult, null, 2)}

Provide a natural language summary about the collection including:
- Collection name and description
- Key characteristics
- Blockchain information
- Contract addresses (if available)
- Any notable features

Keep the response conversational and informative, like explaining to someone who asked about this specific collection.`;
        
        const analysisResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an NFT expert. Provide clear, conversational explanations about NFT collections. Keep responses informative but concise, around 100-150 words. Be friendly and helpful.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 400,
        });
        
        const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch the collection metadata but encountered issues analyzing it.';
        
        return {
          answer: finalAnswer,
          metadata: {
            tokensUsed: analysisResponse.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime,
          },
        };
      } catch (error) {
        console.error('Collection metadata API error:', error);
        if (error.response) {
          return {
            answer: error.response.data?.message || 'An API error occurred while fetching the collection metadata.',
            metadata: {
              executionTime: Date.now() - startTime,
            },
          };
        }
        return {
          answer: 'I encountered an error fetching the collection metadata. Please try again later.',
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
    }

    // Check if this is a floor price query
    if (isFloorPriceQuery(userQuery)) {
      const contractAddress = extractContractAddress(userQuery);
      const blockchain = extractBlockchain(userQuery);
      
      try {
        const apiResult = await getNftFloorPrice(blockchain, 'all', contractAddress);
        
        const analysisPrompt = `Analyze the following floor price data and provide a brief summary:

User Query: "${userQuery}"
Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}

Floor Price Data: ${JSON.stringify(apiResult, null, 2)}

Provide a conversational summary of the floor prices, including collection names, prices in USD and native currency, and marketplaces. Keep it brief and informative.`;
        
        const analysisResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an NFT market analyst. Provide brief, clear summaries of floor price data. Keep responses under 100 words. Focus on key price insights.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 300,
        });
        
        const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch floor price data but encountered issues analyzing it.';
        
        return {
          answer: finalAnswer,
          metadata: {
            tokensUsed: analysisResponse.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime,
          },
        };
      } catch (error) {
        console.error('Floor price API error:', error);
        return {
          answer: `I encountered an error fetching floor price data for ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}. Please try again later.`,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
    }
    
    // Check if this is an NFT analytics query
    if (isNftAnalyticsQuery(userQuery)) {
      const contractAddress = extractContractAddress(userQuery);
      const tokenId = extractTokenId(userQuery);
      const blockchain = extractBlockchain(userQuery);
      
      if (!contractAddress) {
        return {
          answer: "I need a contract address to fetch NFT analytics. Please provide one in your query.",
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
      
      try {
        const apiResult = await getNftAnalytics(contractAddress, blockchain, '24h', tokenId);
        
        const analysisPrompt = `Analyze the following NFT analytics data and provide a brief summary:

User Query: "${userQuery}"
Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}

NFT Analytics Data: ${JSON.stringify(apiResult, null, 2)}

Provide a conversational summary focusing on key performance metrics like sales, volume, transactions, and trends. Keep it brief and informative.`;
        
        const analysisResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an NFT analyst. Provide brief, clear summaries of NFT performance data. Keep responses under 100 words. Focus on key metrics and trends.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 300,
        });
        
        const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch NFT analytics data but encountered issues analyzing it.';
        
        return {
          answer: finalAnswer,
          metadata: {
            tokensUsed: analysisResponse.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime,
          },
        };
      } catch (error) {
        console.error('NFT analytics API error:', error);
        return {
          answer: `I encountered an error fetching NFT analytics data for ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}. Please try again later.`,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      }
    }
    
    // Check if this is a marketplace query
    if (isMarketplaceQuery(userQuery)) {
      const blockchain = extractBlockchain(userQuery);
      
      try {
        let apiResult;
        if (userQuery.toLowerCase().includes('washtrade') || userQuery.toLowerCase().includes('wash')) {
          apiResult = await getNftMarketplaceWashtrade(blockchain, '24h');
        } else if (userQuery.toLowerCase().includes('metadata')) {
          apiResult = await getNftMarketplaceMetadata();
        } else {
          apiResult = await getNftMarketplaceAnalytics(blockchain, '24h');
        }
        
        const analysisPrompt = `Analyze the following marketplace data and provide a brief summary:

User Query: "${userQuery}"
Blockchain: ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}

Marketplace Data: ${JSON.stringify(apiResult, null, 2)}

Provide a conversational summary of the marketplace insights, focusing on key metrics like volume, sales, and marketplace performance. Keep it brief and informative.`;
        
        const analysisResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a marketplace analyst. Provide brief, clear summaries of marketplace data. Keep responses under 100 words. Focus on key marketplace insights.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.3,
          max_tokens: 300,
        });
        
        const finalAnswer = analysisResponse.choices[0]?.message?.content || 'I was able to fetch marketplace data but encountered issues analyzing it.';
        
        return {
          answer: finalAnswer,
          metadata: {
            tokensUsed: analysisResponse.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime,
          },
        };
      } catch (error) {
        console.error('Marketplace API error:', error);
        return {
          answer: `I encountered an error fetching marketplace data for ${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)}. Please try again later.`,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
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

