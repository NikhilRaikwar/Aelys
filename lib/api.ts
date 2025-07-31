import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  NFTData,
  WalletAnalytics,
  MarketData,
  FetchNFTDataParams,
  FetchMarketDataParams,
  FetchWalletAnalyticsParams
} from './types';

const apiClient = axios.create({
  baseURL: process.env.UNLEASH_BASE_URL,
  headers: {
    'Authorization': `Bearer ${process.env.UNLEASH_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 second timeout
});

// Generic API call function with error handling
export async function fetchData<T = any>(
  endpoint: string, 
  params: Record<string, any> = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await apiClient.get(endpoint, { params });
    return {
      data: response.data,
      success: true
    };
  } catch (error) {
    console.error('API call error:', error);
    
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      switch (statusCode) {
        case 401:
          throw new Error('Unauthorized: Check your API key');
        case 403:
          throw new Error('Forbidden: Insufficient permissions');
        case 404:
          throw new Error('Not found: Endpoint or resource not found');
        case 429:
          throw new Error('Rate limited: Too many requests');
        case 500:
          throw new Error('Server error: UnleashNFTs API is experiencing issues');
        default:
          throw new Error(`API Error: ${errorMessage}`);
      }
    }
    
    throw new Error('Failed to fetch data from UnleashNFTs API');
  }
}

/**
 * Fetch NFT data for a specific wallet address
 * @param address The wallet address
 * @param chain The blockchain (e.g., ethereum, polygon, etc.)
 * @param limit Optional limit for number of NFTs to fetch
 * @param offset Optional offset for pagination
 */
export async function fetchNFTData(params: FetchNFTDataParams): Promise<ApiResponse<NFTData[]>> {
  return fetchData<NFTData[]>('/nfts', {
    address: params.address,
    chain: params.chain,
    limit: params.limit || 50,
    offset: params.offset || 0
  });
}

/**
 * Fetch wallet analytics including portfolio value and collection breakdown
 * @param params Wallet analytics parameters
 */
export async function fetchWalletAnalytics(params: FetchWalletAnalyticsParams): Promise<ApiResponse<WalletAnalytics>> {
  return fetchData<WalletAnalytics>('/wallet/analytics', {
    address: params.address,
    chain: params.chain,
    include_activity: params.includeActivity || false,
    activity_limit: params.activityLimit || 10
  });
}

/**
 * Fetch market data for a specific NFT collection
 * @param params Market data parameters
 */
export async function fetchMarketData(params: FetchMarketDataParams): Promise<ApiResponse<MarketData>> {
  return fetchData<MarketData>('/collections/stats', {
    contract_address: params.contractAddress,
    chain: params.chain,
    timeframe: params.timeframe || '24h'
  });
}

