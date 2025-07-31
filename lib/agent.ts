import OpenAI from 'openai';
import * as api from './api';
import {
  AgentResponse,
  ChatMessage,
  ChartData,
  TableData,
  FetchNFTDataParams,
  FetchWalletAnalyticsParams,
  FetchMarketDataParams
} from './types';

// Debug: Log API key info (first 10 and last 4 chars for security)
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set in environment variables');
} else {
  console.log(`API Key loaded: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`API Key length: ${apiKey.length}`);
}

const openai = new OpenAI({
  apiKey: apiKey,
});

const SYSTEM_PROMPT = `You are Aelys, an expert NFT and Web3 analytics agent. You have access to UnleashNFTs API endpoints to answer questions about NFT data, market analytics, and Web3 metrics.

Available API functions:
1. fetchNFTData(params): Fetches NFT data for a specific wallet address
   - Parameters: { address: string, chain: string, limit?: number, offset?: number }
   - Returns: Array of NFT data with token info, attributes, and ownership

2. fetchWalletAnalytics(params): Fetches comprehensive wallet analytics
   - Parameters: { address: string, chain: string, includeActivity?: boolean, activityLimit?: number }
   - Returns: Portfolio summary, collection breakdown, total value, recent activity

3. fetchMarketData(params): Fetches market data for NFT collections
   - Parameters: { contractAddress: string, chain: string, timeframe?: string }
   - Returns: Floor price, volume, market cap, owners count, total supply

Supported chains: ethereum, polygon, arbitrum, optimism, base

When answering questions:
1. For general questions about NFTs, Web3, or market trends, provide direct conversational responses
2. For specific data requests involving wallet addresses or contract addresses, determine if API calls are needed
3. If you need to make API calls, respond with a JSON object in this format:
   {
     "action": "api_calls",
     "calls": [
       {
         "function": "functionName",
         "params": { "param1": "value1", "param2": "value2" }
       }
     ],
     "explanation": "Brief explanation of what data you're fetching"
   }
4. Always be helpful and provide insights about NFT trends, market analysis, and Web3 metrics
5. Keep responses conversational and informative

Remember: Wallet addresses start with 0x and are 42 characters long. Contract addresses follow the same format.`;

export async function askAelysAgent(
  userQuery: string,
  chatHistory: ChatMessage[] = []
): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...chatHistory,
      { role: 'user', content: userQuery }
    ];

    // First, ask GPT-4 to analyze the query and determine actions
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3, // Lower temperature for more consistent API call detection
      max_tokens: 1500,
    });

    const gptResponse = response.choices[0]?.message?.content;
    
    if (!gptResponse) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse API calls from the response
    let apiCallInstructions;
    try {
      apiCallInstructions = JSON.parse(gptResponse);
    } catch {
      // If parsing fails, treat as direct response
      apiCallInstructions = null;
    }

    // If GPT wants to make API calls, execute them
    if (apiCallInstructions?.action === 'api_calls' && apiCallInstructions.calls) {
      const apiResults = await executeApiCalls(apiCallInstructions.calls);
      
      // Now ask GPT to analyze the results and provide a final response
      const analysisMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...chatHistory,
        { role: 'user', content: userQuery },
        {
          role: 'assistant',
          content: `I've fetched the following data: ${JSON.stringify(apiResults, null, 2)}. Let me analyze this and provide insights.`
        },
        {
          role: 'user',
          content: 'Please analyze this data and provide a comprehensive response with insights, trends, and any relevant visualizations.'
        }
      ];

      const analysisResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: analysisMessages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const finalAnswer = analysisResponse.choices[0]?.message?.content || 'Unable to analyze the data.';
      
      return {
        answer: finalAnswer,
        endpoints: apiCallInstructions.calls.map((call: any) => call.function),
        metadata: {
          tokensUsed: (response.usage?.total_tokens || 0) + (analysisResponse.usage?.total_tokens || 0),
          executionTime: Date.now() - startTime
        }
      };
    }

    // Direct response without API calls
    return {
      answer: gptResponse,
      metadata: {
        tokensUsed: response.usage?.total_tokens || 0,
        executionTime: Date.now() - startTime
      }
    };

  } catch (error) {
    console.error('Agent error:', error);
    return {
      answer: 'I apologize, but I encountered an error processing your request. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: {
        executionTime: Date.now() - startTime
      }
    };
  }
}

// Helper function to parse GPT response and extract API calls
function parseApiCalls(gptResponse: string): Array<{
  function: string;
  params: Record<string, any>;
}> {
  // TODO: Implement logic to parse GPT response and extract API calls
  // This could look for patterns like "call fetchNFTData with address=0x... chain=ethereum"
  return [];
}

// Helper function to execute API calls
async function executeApiCalls(apiCalls: Array<{
  function: string;
  params: Record<string, any>;
}>): Promise<any[]> {
  const results = [];
  
  for (const call of apiCalls) {
    try {
      let result;
      switch (call.function) {
        case 'fetchNFTData':
          result = await api.fetchNFTData(call.params as FetchNFTDataParams);
          break;
        case 'fetchWalletAnalytics':
          result = await api.fetchWalletAnalytics(call.params as FetchWalletAnalyticsParams);
          break;
        case 'fetchMarketData':
          result = await api.fetchMarketData(call.params as FetchMarketDataParams);
          break;
        default:
          console.warn(`Unknown API function: ${call.function}`);
          results.push({ error: `Unknown API function: ${call.function}` });
          continue;
      }
      results.push({ function: call.function, data: result });
    } catch (error) {
      console.error(`Error executing ${call.function}:`, error);
      results.push({ 
        function: call.function, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
}
