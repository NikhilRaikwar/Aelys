import OpenAI from 'openai';
import * as api from './api';
import {
  AgentResponse,
  ChatMessage,
  MarketInsightParams,
  MarketChartData
} from './types';

// Debug: Log API key info (first 10 and last 4 chars for security)
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in environment variables');
} else {
  console.log(`Market Insight Agent - API Key loaded: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
}

const openai = new OpenAI({
  apiKey: apiKey,
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

// Helper function to detect if a query explicitly asks for charts
function isChartQuery(query: string): boolean {
  const chartKeywords = [
    'chart', 'graph', 'visualization', 'plot', 'trend', 'visualize',
    'show me', 'display', 'trends', 'over time', 'time series'
  ];
  const lowerQuery = query.toLowerCase();
  return chartKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Helper function to call market insight endpoints
async function callMarketInsightEndpoint(endpointName: string, params: any) {
  switch (endpointName) {
    case 'analytics':
      return api.getMarketAnalytics(params);
    case 'holders':
      return api.getHolderInsights(params);
    case 'scores':
      return api.getScoresInsights(params);
    case 'traders':
      return api.getTradersInsights(params);
    case 'washtrade':
      return api.getMarketWashtrade(params);
    case 'collection_whales':
      return api.getCollectionWhales(params);
    case 'floor_price':
      return api.getNFTFloorPrice(params);
    case 'nft_analytics':
      return api.getNFTAnalytics(params);
    case 'nft_listings':
      return api.getNFTListings(params);
    case 'token_balance':
      return api.getTokenBalance(params);
    case 'marketplace_metadata':
      return api.getMarketplaceMetadata(params);
    case 'marketplace_analytics':
      return api.getMarketplaceAnalytics(params);
    default:
      throw new Error(`Unknown market insight endpoint: ${endpointName}`);
  }
}

// Helper function to parse string array from API response
function parseStringArray(str: string | string[], forceString = false): string[] | number[] {
  if (Array.isArray(str)) return str;
  if (typeof str !== 'string') return [];
  
  try {
    // Handle PostgreSQL array format like "{value1,value2,value3}"
    if (str.startsWith('{') && str.endsWith('}')) {
      const cleaned = str.slice(1, -1); // Remove { and }
      return cleaned.split(',').map(item => {
        const trimmed = item.trim().replace(/"/g, ''); // Remove quotes
        
        // If forceString is true (for dates), always return as string
        if (forceString) {
          return trimmed;
        }
        
        // Try to parse as number, if it fails return as string
        const num = parseFloat(trimmed);
        return !isNaN(num) ? num : trimmed;
      });
    }
    
    // Try to parse as JSON array
    return JSON.parse(str);
  } catch (error) {
    console.error('Failed to parse string array:', str, error);
    return [];
  }
}

// Helper function to extract chart data from API response
function extractChartData(apiData: any, endpointType: string): MarketChartData | null {
  if (!apiData?.data?.[0]?.block_dates) return null;

  const data = apiData.data[0];
  const block_dates = parseStringArray(data.block_dates, true) as string[];
  
  // If block_dates is empty or not valid, return null
  if (!Array.isArray(block_dates) || block_dates.length === 0) {
    console.error('Invalid block_dates:', data.block_dates);
    return null;
  }
  
  const datasets = [];

  switch (endpointType) {
    case 'analytics':
      if (data.volume_trend) {
        const volumeData = parseStringArray(data.volume_trend) as number[];
        if (volumeData.length > 0) {
          datasets.push({
            label: 'Volume',
            data: volumeData,
            color: 'var(--chart-1)'
          });
        }
      }
      if (data.sales_trend) {
        const salesData = parseStringArray(data.sales_trend) as number[];
        if (salesData.length > 0) {
          datasets.push({
            label: 'Sales',
            data: salesData,
            color: 'var(--chart-2)'
          });
        }
      }
      if (data.transactions_trend) {
        const transactionsData = parseStringArray(data.transactions_trend) as number[];
        if (transactionsData.length > 0) {
          datasets.push({
            label: 'Transactions',
            data: transactionsData,
            color: 'var(--chart-3)'
          });
        }
      }
      if (data.transfers_trend) {
        const transfersData = parseStringArray(data.transfers_trend) as number[];
        if (transfersData.length > 0) {
          datasets.push({
            label: 'Transfers',
            data: transfersData,
            color: 'var(--chart-4)'
          });
        }
      }
      break;
    
    case 'holders':
      if (data.volume_trend) {
        const volumeData = parseStringArray(data.volume_trend) as number[];
        if (volumeData.length > 0) {
          datasets.push({
            label: 'Volume',
            data: volumeData,
            color: 'var(--chart-1)'
          });
        }
      }
      if (data.sales_trend) {
        const salesData = parseStringArray(data.sales_trend) as number[];
        if (salesData.length > 0) {
          datasets.push({
            label: 'Sales',
            data: salesData,
            color: 'var(--chart-2)'
          });
        }
      }
      if (data.transactions_trend) {
        const transactionsData = parseStringArray(data.transactions_trend) as number[];
        if (transactionsData.length > 0) {
          datasets.push({
            label: 'Transactions',
            data: transactionsData,
            color: 'var(--chart-3)'
          });
        }
      }
      break;
    
    case 'traders':
      if (data.traders_trend) {
        const tradersData = parseStringArray(data.traders_trend) as number[];
        if (tradersData.length > 0) {
          datasets.push({
            label: 'Total Traders',
            data: tradersData,
            color: 'var(--chart-1)'
          });
        }
      }
      if (data.traders_buyers_trend) {
        const buyersData = parseStringArray(data.traders_buyers_trend) as number[];
        if (buyersData.length > 0) {
          datasets.push({
            label: 'Buyers',
            data: buyersData,
            color: 'var(--chart-2)'
          });
        }
      }
      if (data.traders_sellers_trend) {
        const sellersData = parseStringArray(data.traders_sellers_trend) as number[];
        if (sellersData.length > 0) {
          datasets.push({
            label: 'Sellers',
            data: sellersData,
            color: 'var(--chart-3)'
          });
        }
      }
      break;

    case 'scores':
      if (data.market_cap_trend) {
        const marketCapData = parseStringArray(data.market_cap_trend) as number[];
        if (marketCapData.length > 0) {
          datasets.push({
            label: 'Market Cap',
            data: marketCapData,
            color: 'var(--chart-1)'
          });
        }
      }
      if (data.marketstate_trend) {
        const marketStateData = parseStringArray(data.marketstate_trend) as number[];
        if (marketStateData.length > 0) {
          datasets.push({
            label: 'Market State',
            data: marketStateData,
            color: 'var(--chart-2)'
          });
        }
      }
      break;

    case 'washtrade':
      if (data.washtrade_volume_trend) {
        const washVolumeData = parseStringArray(data.washtrade_volume_trend) as number[];
        if (washVolumeData.length > 0) {
          datasets.push({
            label: 'Washtrade Volume',
            data: washVolumeData,
            color: 'var(--chart-1)'
          });
        }
      }
      if (data.washtrade_suspect_sales_trend) {
        const suspectSalesData = parseStringArray(data.washtrade_suspect_sales_trend) as number[];
        if (suspectSalesData.length > 0) {
          datasets.push({
            label: 'Suspect Sales',
            data: suspectSalesData,
            color: 'var(--chart-2)'
          });
        }
      }
      if (data.washtrade_assets_trend) {
        const assetsData = parseStringArray(data.washtrade_assets_trend) as number[];
        if (assetsData.length > 0) {
          datasets.push({
            label: 'Washtrade Assets',
            data: assetsData,
            color: 'var(--chart-3)'
          });
        }
      }
      if (data.washtrade_suspect_transactions_trend) {
        const suspectTxData = parseStringArray(data.washtrade_suspect_transactions_trend) as number[];
        if (suspectTxData.length > 0) {
          datasets.push({
            label: 'Suspect Transactions',
            data: suspectTxData,
            color: 'var(--chart-4)'
          });
        }
      }
      if (data.washtrade_wallets_trend) {
        const walletsData = parseStringArray(data.washtrade_wallets_trend) as number[];
        if (walletsData.length > 0) {
          datasets.push({
            label: 'Washtrade Wallets',
            data: walletsData,
            color: 'var(--chart-5)'
          });
        }
      }
      break;
  }

  return datasets.length > 0 ? { block_dates, datasets } : null;
}

const MARKET_ALPHA_COPILOT_SYSTEM_PROMPT = `You are Market Alpha Copilot, specialized in NFT market analytics and general market education. You can answer both general questions about NFT markets, trading concepts, and blockchain technology, as well as provide specific market insights using UnleashNFTs market insight endpoints.

Available Market Insight API functions:
1. analytics: NFT market analytics (volume, sales, transactions, transfers trends) - HAS CHART DATA
   - Parameters: { blockchain?: string, time_range?: string }
   - Default: blockchain="ethereum", time_range="24h"
   - Returns: Volume trends, sales data, transaction counts, transfer metrics with trend arrays for charting

2. holders: NFT holders insights (may return no_data_found or similar data to analytics) - MAY HAVE CHART DATA
   - Parameters: { blockchain?: string, time_range?: string }
   - Default: blockchain="ethereum", time_range="24h"
   - Returns: Volume, sales, transactions, transfers trends (when data is available)

3. scores: Market scores and sentiment - HAS CHART DATA
   - Parameters: { blockchain?: string, time_range?: string }
   - Default: blockchain="ethereum", time_range="24h"
   - Returns: Market cap, market state, NFT fear & greed index with trend arrays for charting

4. traders: NFT traders activity - HAS CHART DATA
   - Parameters: { blockchain?: string, time_range?: string }
   - Default: blockchain="ethereum", time_range="24h"
   - Returns: Total traders, buyers count, sellers count with trend arrays for charting

5. washtrade: Wash trading detection - HAS CHART DATA
   - Parameters: { blockchain?: string, time_range?: string }
   - Default: blockchain="ethereum", time_range="24h"
   - Returns: Wash trade metrics, suspect sales/transactions, washtrade volume with trend arrays for charting

6. collection_whales: Collection whale metrics - PROVIDES TABLE DATA
   - Parameters: { blockchain?: string, time_range?: string, contract_address?: string[], sort_by?: string }
   - Default: blockchain="ethereum", time_range="24h", sort_by="nft_count"
   - Returns: Whale activity metrics for NFT collections including whale count, whale activities, and activity trends
   - Sort options: nft_count, mint_count, mint_volume, mint_whales, unique_wallets, unique_mint_wallets, unique_buy_wallets, unique_sell_wallets, total_mint_volume, total_sale_volume, buy_count, buy_volume, buy_whales, sell_count, sell_volume, sell_whales, whale_holders

7. floor_price: NFT collection floor prices - PROVIDES TABLE DATA
   - Parameters: { blockchain?: string, collection_name?: string[], contract_address?: string[], marketplace_name?: string[] }
   - Default: blockchain="ethereum", time_range="all"
   - Returns: Floor price data for NFT collections across different marketplaces
   - Use this for queries about "floor price", "cheapest", "lowest price" of NFT collections

Supported blockchains: atleta_olympia, avalanche, base, berachain, binance, bitcoin, ethereum, full, linea, monad_testnet, polygon, polyhedra_testnet, root, solana, somnia_testnet, soneium, unichain, unichain_sepolia
Supported time ranges: 15m, 30m, 24h, 7d, 30d, 90d, all

CRITICAL RESPONSE RULES:
1. You MUST respond with ONLY raw JSON when API calls are needed - NO other text or formatting
2. For ANY market insight query, you MUST make API calls - DO NOT provide generic responses
3. ALWAYS determine which endpoint to call based on the user's query
4. For analytics queries, use the 'analytics' endpoint
5. For trader queries, use the 'traders' endpoint
6. For scores/sentiment queries, use the 'scores' endpoint
7. For washtrade queries, use the 'washtrade' endpoint
8. For holder queries, use the 'holders' endpoint
9. For whale/collection whale queries, use the 'collection_whales' endpoint
10. For floor price queries, use the 'floor_price' endpoint

When you need to make API calls, you MUST respond with this EXACT JSON format (NO markdown, NO explanatory text):
{
  "action": "api_calls",
  "calls": [
    {
      "function": "floor_price",
      "params": { "blockchain": "ethereum", "collection_name": ["Pudgy Penguins"] }
    }
  ],
  "explanation": "Brief explanation of what data you're fetching"
}

FOR FLOOR PRICE QUERIES:
- ALWAYS use the 'floor_price' endpoint for queries about floor price, cheapest price, lowest price
- Include collection_name parameter with the NFT collection name mentioned in the query
- Example: "What's the floor price of Pudgy Penguins?" should call floor_price with collection_name: ["Pudgy Penguins"]

ABSOLUTE REQUIREMENTS:
- Return ONLY the JSON object above - nothing else
- NO markdown formatting or code blocks
- NO conversational text before or after the JSON
- NO explanatory messages about what you will do
- Just the pure JSON object starting with { and ending with }`;

export async function askMarketAlphaCopilotAgent(
  userQuery: string,
  chatHistory: ChatMessage[] = []
): Promise<AgentResponse & { chartData?: MarketChartData }> {
  const startTime = Date.now();
  
  try {
    // Check if this is a general/educational query
    if (isGeneralQuery(userQuery)) {
      const generalSystemPrompt = `You are Market Alpha Copilot, an expert in NFT markets, crypto trading, and blockchain technology. Provide clear, educational, and conversational answers to general questions about NFTs, cryptocurrency, Web3, trading concepts, and market analysis. Focus on being helpful and informative for users learning about these topics.`;
      
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
    const messages: ChatMessage[] = [
      { role: 'system', content: MARKET_ALPHA_COPILOT_SYSTEM_PROMPT },
      ...chatHistory,
      { role: 'user', content: userQuery }
    ];

    // First, ask GPT-4 to analyze the query and determine actions
    const openaiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const gptResponse = openaiResponse.choices[0]?.message?.content;
    
    if (!gptResponse) {
      throw new Error('No response from OpenAI');
    }

    console.log('Raw GPT response:', gptResponse);
    
    // Try to parse API calls from the response
    let apiCallInstructions;
    try {
      // First try to parse as-is
      apiCallInstructions = JSON.parse(gptResponse);
      console.log('Successfully parsed raw JSON:', apiCallInstructions);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Raw response that failed to parse:', gptResponse);
      apiCallInstructions = null;
    }

    console.log('Checking if apiCallInstructions has api_calls action:', {
      hasApiCallInstructions: !!apiCallInstructions,
      action: apiCallInstructions?.action,
      hasCalls: !!apiCallInstructions?.calls,
      callsLength: apiCallInstructions?.calls?.length
    });

    // If GPT wants to make API calls, execute them
    if (apiCallInstructions?.action === 'api_calls' && apiCallInstructions.calls) {
      // Handle case where calls array is empty (GPT determined no API call needed)
      if (apiCallInstructions.calls.length === 0) {
        console.log('GPT determined no API calls needed, providing explanation:', apiCallInstructions.explanation);
        return {
          answer: apiCallInstructions.explanation || 'No specific market data is available for this query through our endpoints.',
          metadata: {
            tokensUsed: openaiResponse.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime
          }
        };
      }
      console.log('Executing API calls:', apiCallInstructions.calls);
      const results = [];
      let chartData: MarketChartData | null = null;
      let hasValidData = false;

      for (const call of apiCallInstructions.calls) {
        try {
          console.log(`Calling ${call.function} with params:`, call.params);
          const apiResult = await callMarketInsightEndpoint(call.function, call.params);
          console.log(`API result for ${call.function}:`, JSON.stringify(apiResult, null, 2));
          
          // Check if API returned valid data
          if (apiResult?.data?.data && Array.isArray(apiResult.data.data) && apiResult.data.data.length > 0) {
            results.push({ function: call.function, data: apiResult.data });
            hasValidData = true;
            
            // Extract chart data from the first successful API call
            if (!chartData) {
              chartData = extractChartData(apiResult.data, call.function);
            }
          } else {
            console.log(`No data returned from ${call.function} endpoint`);
            results.push({ 
              function: call.function, 
              error: 'No data available for the specified parameters' 
            });
          }
        } catch (error) {
          console.error(`Error calling ${call.function}:`, error);
          results.push({ 
            function: call.function, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
      
      // If no valid data was returned from any API call, provide a conversational response
      if (!hasValidData) {
        const endpointName = apiCallInstructions.calls[0]?.function || 'market insight';
        const blockchain = apiCallInstructions.calls[0]?.params?.blockchain || 'Ethereum';
        const timeRange = apiCallInstructions.calls[0]?.params?.time_range || '24h';
        
        let responseMessage = '';
        switch (endpointName) {
          case 'washtrade':
            responseMessage = `I attempted to fetch wash trade detection data for ${blockchain} NFTs over the last ${timeRange}, but no data is currently available from the API endpoint. This could be due to:\n\n• No wash trading activity detected in the specified time period\n• Temporary data availability issues\n• The blockchain or time range parameters may not have sufficient data\n\nWash trade detection typically monitors:\n- Suspect sales and transactions\n- Unusual trading patterns\n- Volume anomalies\n- Wallet behavior analysis\n\nYou might want to try a different time range (like 7d or 30d) or check back later when more data becomes available.`;
            break;
          case 'scores':
            responseMessage = `I attempted to fetch market scores and sentiment data for ${blockchain} NFTs over the last ${timeRange}, but no data is currently available from the API endpoint. This could be due to:\n\n• Temporary data processing delays\n• Insufficient market activity for score calculation\n• The specified parameters may not have available data\n\nMarket scores typically include:\n- Market cap trends\n- Market state indicators\n- NFT fear & greed index\n- Overall market sentiment\n\nPlease try again with a different time range or check back later.`;
            break;
          case 'holders':
            responseMessage = `I attempted to fetch holder insights for ${blockchain} NFTs over the last ${timeRange}, but no data is currently available from the API endpoint. This could be due to:\n\n• Limited holder activity in the specified period\n• Data processing delays\n• The blockchain or time range may not have sufficient holder data\n\nHolder insights typically track:\n- Volume and sales trends\n- Transaction patterns\n- Transfer activities\n- Holder behavior changes\n\nConsider trying a longer time range like 7d or 30d for more comprehensive data.`;
            break;
          default:
            responseMessage = `I attempted to fetch ${endpointName} data for ${blockchain} over the last ${timeRange}, but no data is currently available from the API endpoint. This might be temporary - please try again later or with different parameters.`;
        }
        
        return {
          answer: responseMessage,
          metadata: {
            tokensUsed: openaiResponse.usage?.total_tokens || 0,
            executionTime: Date.now() - startTime,
            noDataAvailable: true
          }
        };
      }

      // Now ask GPT to analyze the results and provide a final response
      const analysisPrompt = `You are a market analyst. Analyze the following NFT market data and provide BRIEF insights in simple, conversational language.

User Query: ${userQuery}

Market Data: ${JSON.stringify(results, null, 2)}

Provide a concise analysis under 120 words that includes:
1. Key trends and patterns in the data
2. Notable changes or movements
3. Brief chart conclusion if visualization data is available

Write in a friendly, direct tone. Be factual and concise.`;

      const analysisResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful NFT market analyst. Provide VERY BRIEF, conversational insights about market data. Keep responses under 120 words. Focus on key trends only. Include brief chart conclusion when chart data is available.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const finalAnswer = analysisResponse.choices[0]?.message?.content || 'Unable to analyze the market data.';
      
      const response: AgentResponse & { chartData?: MarketChartData } = {
        answer: finalAnswer,
        endpoints: apiCallInstructions.calls.map((call: any) => call.function),
        metadata: {
          tokensUsed: (openaiResponse.usage?.total_tokens || 0) + (analysisResponse.usage?.total_tokens || 0),
          executionTime: Date.now() - startTime
        }
      };

      if (chartData) {
        console.log('Chart data extracted:', JSON.stringify(chartData, null, 2));
        response.chartData = chartData;
      } else {
        console.log('No chart data extracted from API response');
      }

      console.log('Final response structure:', {
        hasAnswer: !!response.answer,
        hasChartData: !!response.chartData,
        endpoints: response.endpoints
      });

      return response;
    }

    // Direct response without API calls - this should NOT happen for market insight queries
    console.error('UNEXPECTED: Falling back to direct response without API calls!');
    console.error('This means the JSON parsing or condition check failed.');
    console.error('apiCallInstructions:', apiCallInstructions);
    
    return {
      answer: gptResponse,
      metadata: {
        tokensUsed: openaiResponse.usage?.total_tokens || 0,
        executionTime: Date.now() - startTime
      }
    };

  } catch (error) {
    console.error('Market Alpha Copilot Agent error:', error);
    return {
      answer: 'I apologize, but I encountered an error processing your market analytics request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  }
}
