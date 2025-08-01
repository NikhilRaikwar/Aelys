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

// Helper function to call market insight endpoints
async function callMarketInsightEndpoint(endpointName: string, params: MarketInsightParams) {
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
    default:
      throw new Error(`Unknown market insight endpoint: ${endpointName}`);
  }
}

// Helper function to extract chart data from API response
function extractChartData(apiData: any, endpointType: string): MarketChartData | null {
  if (!apiData?.data?.[0]?.block_dates) return null;

  const data = apiData.data[0];
  const block_dates = data.block_dates;
  const datasets = [];

  switch (endpointType) {
    case 'analytics':
      if (data.volume_trend) {
        datasets.push({
          label: 'Volume',
          data: data.volume_trend,
          color: 'var(--chart-1)'
        });
      }
      if (data.sales_trend) {
        datasets.push({
          label: 'Sales',
          data: data.sales_trend,
          color: 'var(--chart-2)'
        });
      }
      if (data.transactions_trend) {
        datasets.push({
          label: 'Transactions',
          data: data.transactions_trend,
          color: 'var(--chart-3)'
        });
      }
      if (data.transfers_trend) {
        datasets.push({
          label: 'Transfers',
          data: data.transfers_trend,
          color: 'var(--chart-4)'
        });
      }
      break;
    
    case 'holders':
      if (data.volume_trend) {
        datasets.push({
          label: 'Volume',
          data: data.volume_trend,
          color: 'var(--chart-1)'
        });
      }
      if (data.sales_trend) {
        datasets.push({
          label: 'Sales',
          data: data.sales_trend,
          color: 'var(--chart-2)'
        });
      }
      if (data.transactions_trend) {
        datasets.push({
          label: 'Transactions',
          data: data.transactions_trend,
          color: 'var(--chart-3)'
        });
      }
      break;
    
    case 'traders':
      if (data.traders_trend) {
        datasets.push({
          label: 'Total Traders',
          data: data.traders_trend,
          color: 'var(--chart-1)'
        });
      }
      if (data.traders_buyers_trend) {
        datasets.push({
          label: 'Buyers',
          data: data.traders_buyers_trend,
          color: 'var(--chart-2)'
        });
      }
      if (data.traders_sellers_trend) {
        datasets.push({
          label: 'Sellers',
          data: data.traders_sellers_trend,
          color: 'var(--chart-3)'
        });
      }
      break;

    case 'scores':
      if (data.market_cap_trend) {
        datasets.push({
          label: 'Market Cap',
          data: data.market_cap_trend,
          color: 'var(--chart-1)'
        });
      }
      if (data.marketstate_trend) {
        datasets.push({
          label: 'Market State',
          data: data.marketstate_trend,
          color: 'var(--chart-2)'
        });
      }
      break;

    case 'washtrade':
      if (data.washtrade_volume_trend) {
        datasets.push({
          label: 'Washtrade Volume',
          data: data.washtrade_volume_trend,
          color: 'var(--chart-1)'
        });
      }
      if (data.washtrade_suspect_sales_trend) {
        datasets.push({
          label: 'Suspect Sales',
          data: data.washtrade_suspect_sales_trend,
          color: 'var(--chart-2)'
        });
      }
      if (data.washtrade_assets_trend) {
        datasets.push({
          label: 'Washtrade Assets',
          data: data.washtrade_assets_trend,
          color: 'var(--chart-3)'
        });
      }
      if (data.washtrade_suspect_transactions_trend) {
        datasets.push({
          label: 'Suspect Transactions',
          data: data.washtrade_suspect_transactions_trend,
          color: 'var(--chart-4)'
        });
      }
      if (data.washtrade_wallets_trend) {
        datasets.push({
          label: 'Washtrade Wallets',
          data: data.washtrade_wallets_trend,
          color: 'var(--chart-5)'
        });
      }
      break;
  }

  return datasets.length > 0 ? { block_dates, datasets } : null;
}

const MARKET_INSIGHT_SYSTEM_PROMPT = `You are Aelys Market Insight Agent, specialized in NFT market analytics. You ONLY answer queries related to market insights and trends using UnleashNFTs market insight endpoints.

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

When you need to make API calls, you MUST respond with this EXACT JSON format (NO markdown, NO explanatory text):
{
  "action": "api_calls",
  "calls": [
    {
      "function": "scores",
      "params": { "blockchain": "ethereum", "time_range": "24h" }
    }
  ],
  "explanation": "Brief explanation of what data you're fetching"
}

ABSOLUTE REQUIREMENTS:
- Return ONLY the JSON object above - nothing else
- NO markdown formatting or code blocks
- NO conversational text before or after the JSON
- NO explanatory messages about what you will do
- Just the pure JSON object starting with { and ending with }`;

export async function askMarketInsightAgent(
  userQuery: string,
  chatHistory: ChatMessage[] = []
): Promise<AgentResponse & { chartData?: MarketChartData }> {
  const startTime = Date.now();
  
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: MARKET_INSIGHT_SYSTEM_PROMPT },
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
    if (apiCallInstructions?.action === 'api_calls' && apiCallInstructions.calls && apiCallInstructions.calls.length > 0) {
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
      const analysisPrompt = `You are a market analyst. Analyze the following NFT market data and provide insights in simple, conversational language.

User Query: ${userQuery}

Market Data: ${JSON.stringify(results, null, 2)}

Provide a comprehensive analysis that includes:
1. Key trends and patterns in the data
2. Notable changes or movements
3. What this means for the NFT market
4. Mention that a visualization is provided below

Write in a friendly, conversational tone as if explaining to someone interested in NFT markets.`;

      const analysisResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful NFT market analyst. Provide clear, conversational insights about market data.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    console.error('Market Insight Agent error:', error);
    return {
      answer: 'I apologize, but I encountered an error processing your market insight request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  }
}
