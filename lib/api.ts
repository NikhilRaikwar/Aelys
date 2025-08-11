import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  NFTData,
  WalletAnalytics,
  MarketData,
  FetchNFTDataParams,
  FetchMarketDataParams,
  FetchWalletAnalyticsParams,
  MarketInsightParams,
  MarketAnalyticsData,
  HoldersInsightData,
  ScoresInsightData,
  TradersInsightData,
  WashtradeInsightData,
  CollectionWhalesParams,
  CollectionWhalesData
} from './types';

const apiClient = axios.create({
  baseURL: process.env.UNLEASH_BASE_URL,
  headers: {
    'x-api-key': process.env.UNLEASH_API_KEY,
    'accept': 'application/json',
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

// ===== MARKET INSIGHT API FUNCTIONS =====

/**
 * Get NFT Market Analytics Report
 * Returns aggregated values and trend data for various NFT market metrics
 * @param params Market insight parameters
 */
export async function getMarketAnalytics(params: MarketInsightParams = {}): Promise<ApiResponse<{ data: MarketAnalyticsData[] }>> {
  try {
    const response = await fetchData<{ data: MarketAnalyticsData[] }>('/nft/market-insights/analytics', {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h'
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch market analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get NFT Holders Insights
 * Returns aggregated values and trends for holders' metrics in the NFT market
 * @param params Market insight parameters
 */
export async function getHolderInsights(params: MarketInsightParams = {}): Promise<ApiResponse<{ data: HoldersInsightData[] }>> {
  try {
    const response = await fetchData<{ data: HoldersInsightData[] }>('/nft/market-insights/holders', {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h'
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch holder insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get NFT Scores Insights
 * Returns aggregated values and trends for scores in the NFT market
 * @param params Market insight parameters
 */
export async function getScoresInsights(params: MarketInsightParams = {}): Promise<ApiResponse<{ data: ScoresInsightData[] }>> {
  try {
    const response = await fetchData<{ data: ScoresInsightData[] }>('/nft/market-insights/scores', {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h'
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch scores insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get NFT Traders Insights
 * Returns aggregated values and trends for trader metrics in the NFT market
 * @param params Market insight parameters
 */
export async function getTradersInsights(params: MarketInsightParams = {}): Promise<ApiResponse<{ data: TradersInsightData[] }>> {
  try {
    const response = await fetchData<{ data: TradersInsightData[] }>('/nft/market-insights/traders', {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h'
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch traders insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get NFT Market Washtrade Insights
 * Returns aggregated values and trends for washtrade metrics in the NFT market
 * @param params Market insight parameters
 */
export async function getMarketWashtrade(params: MarketInsightParams = {}): Promise<ApiResponse<{ data: WashtradeInsightData[] }>> {
  try {
    const response = await fetchData<{ data: WashtradeInsightData[] }>('/nft/market-insights/washtrade', {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h'
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch washtrade insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Collection Whales
 * Returns detailed insights into the whale metrics for NFT collections
 * @param params Collection whales parameters
 */
export async function getCollectionWhales(params: CollectionWhalesParams = {}): Promise<ApiResponse<CollectionWhalesData[]>> {
  try {
    const queryParams: Record<string, any> = {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h',
      offset: params.offset || 0,
      limit: params.limit || 30,
      sort_by: params.sort_by || 'nft_count',
      sort_order: params.sort_order || 'desc'
    };

    // Add contract addresses if provided
    if (params.contract_address && params.contract_address.length > 0) {
      queryParams.contract_address = params.contract_address;
    }

    const response = await fetchData<CollectionWhalesData[]>('/nft/collection/whales', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch collection whales: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ===== NEW NFT API ENDPOINTS =====

/**
 * Get NFT Floor Price
 * Returns floor price data for NFT collections across marketplaces
 * @param params Floor price parameters
 */
export async function getNFTFloorPrice(params: { 
  contract_address?: string[]; 
  blockchain?: string; 
  collection_name?: string[];
  marketplace_name?: string[];
  time_range?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<ApiResponse<any>> {
  try {
    const queryParams: Record<string, any> = {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || 'all',
      sort_by: params.sort_by || 'floor_price_usd',
      sort_order: params.sort_order || 'desc',
      limit: params.limit || 30,
      offset: params.offset || 0
    };
    
    if (params.contract_address && params.contract_address.length > 0) {
      queryParams.contract_address = params.contract_address;
    }
    
    if (params.collection_name && params.collection_name.length > 0) {
      queryParams.collection_name = params.collection_name;
    }
    
    if (params.marketplace_name && params.marketplace_name.length > 0) {
      queryParams.marketplace_name = params.marketplace_name;
    }
    
    const response = await fetchData('/nft/floor_price', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch NFT floor price: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get NFT Analytics
 * Returns detailed analytics for NFT collections
 * @param params NFT analytics parameters
 */
export async function getNFTAnalytics(params: { contract_address?: string; blockchain?: string; time_range?: string } = {}): Promise<ApiResponse<any>> {
  try {
    const queryParams: Record<string, any> = {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h'
    };
    
    if (params.contract_address) {
      queryParams.contract_address = params.contract_address;
    }
    
    const response = await fetchData('/nft/analytics', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch NFT analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get NFT Listings
 * Returns current listings for NFT collections
 * @param params NFT listings parameters
 */
export async function getNFTListings(params: { contract_address?: string; blockchain?: string; limit?: number; offset?: number } = {}): Promise<ApiResponse<any>> {
  try {
    const queryParams: Record<string, any> = {
      blockchain: params.blockchain || 'ethereum',
      limit: params.limit || 50,
      offset: params.offset || 0
    };
    
    if (params.contract_address) {
      queryParams.contract_address = params.contract_address;
    }
    
    const response = await fetchData('/nft/listings', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch NFT listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Token Balance
 * Returns token balance for a wallet address
 * @param params Token balance parameters
 */
export async function getTokenBalance(params: { wallet_address: string; blockchain?: string; token_type?: string } = { wallet_address: '' }): Promise<ApiResponse<any>> {
  try {
    const queryParams: Record<string, any> = {
      wallet_address: params.wallet_address,
      blockchain: params.blockchain || 'ethereum',
      token_type: params.token_type || 'ERC721'
    };
    
    const response = await fetchData('/wallet/token-balance', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Marketplace Metadata
 * Returns metadata for marketplace analytics
 * @param params Marketplace metadata parameters
 */
export async function getMarketplaceMetadata(params: { marketplace?: string; blockchain?: string } = {}): Promise<ApiResponse<any>> {
  try {
    const queryParams: Record<string, any> = {
      blockchain: params.blockchain || 'ethereum'
    };
    
    if (params.marketplace) {
      queryParams.marketplace = params.marketplace;
    }
    
    const response = await fetchData('/marketplace/metadata', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch marketplace metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get Marketplace Analytics
 * Returns analytics data for marketplaces
 * @param params Marketplace analytics parameters
 */
export async function getMarketplaceAnalytics(params: { marketplace?: string; blockchain?: string; time_range?: string } = {}): Promise<ApiResponse<any>> {
  try {
    const queryParams: Record<string, any> = {
      blockchain: params.blockchain || 'ethereum',
      time_range: params.time_range || '24h'
    };
    
    if (params.marketplace) {
      queryParams.marketplace = params.marketplace;
    }
    
    const response = await fetchData('/marketplace/analytics', queryParams);
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch marketplace analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
