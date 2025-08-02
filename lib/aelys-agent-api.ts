import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.UNLEASH_BASE_URL,
  headers: {
    'x-api-key': process.env.UNLEASH_API_KEY,
    'accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 second timeout
});

async function fetchFromEndpoint<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const response = await apiClient.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error('API call error:', error);

    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Status Code:', statusCode, 'Error Message:', errorMessage);
      
      switch (statusCode) {
        case 400:
          throw new Error('Bad Request: Please check the API request parameters.');
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

// Portfolio Analysis Endpoints
export async function getWalletDefiBalance(address: string, blockchain: string = 'ethereum'): Promise<any> {
  return fetchFromEndpoint('/wallet/balance/defi', {
    address,
    blockchain,
    time_range: 'all',
    offset: 0,
    limit: 30
  });
}

export async function getWalletNftBalance(address: string, blockchain: string = 'ethereum'): Promise<any> {
  return fetchFromEndpoint('/wallet/balance/nft', {
    wallet: address,
    blockchain,
    time_range: 'all',
    offset: 0,
    limit: 30
  });
}

export async function getWalletTokenBalance(address: string, blockchain: string = 'ethereum'): Promise<any> {
  return fetchFromEndpoint('/wallet/balance/token', {
    address,
    blockchain,
    time_range: 'all',
    offset: 0,
    limit: 30
  });
}

// Labels & Profile Endpoints
export async function getWalletLabel(address: string, blockchain: string = 'ethereum'): Promise<any> {
  return fetchFromEndpoint('/wallet/label', {
    address,
    blockchain,
    offset: 0,
    limit: 30
  });
}

export async function getNftWalletProfile(wallet: string): Promise<any> {
  return fetchFromEndpoint('/nft/wallet/profile', {
    wallet,
    offset: 0,
    limit: 30
  });
}

// Scoring, Metrics & Analysis Endpoints
export async function getWalletScore(wallet_address: string, time_range: string = 'all'): Promise<any> {
  return fetchFromEndpoint('/wallet/score', {
    wallet_address,
    time_range,
    offset: 0,
    limit: 30
  });
}

export async function getWalletMetrics(wallet: string, blockchain: string = 'ethereum', time_range: string = 'all'): Promise<any> {
  // Restrict to supported blockchains only
  const supportedBlockchains = ['linea', 'polygon', 'ethereum', 'avalanche'];
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Unsupported blockchain: ${blockchain}. Supported blockchains are: ${supportedBlockchains.join(', ')}`);
  }
  
  return fetchFromEndpoint('/wallet/metrics', {
    blockchain: blockchain.toLowerCase(),
    wallet,
    time_range,
    offset: 0,
    limit: 30
  });
}

export async function getNftWalletAnalytics(wallet: string, blockchain: string = 'ethereum', time_range: string = 'all'): Promise<any> {
  return fetchFromEndpoint('/nft/wallet/analytics', {
    wallet,
    blockchain,
    time_range,
    sort_by: 'volume',
    sort_order: 'desc',
    offset: 0,
    limit: 30
  });
}

export async function getNftWalletScores(wallet: string, blockchain: string = 'ethereum', time_range: string = '24h'): Promise<any> {
  return fetchFromEndpoint('/nft/wallet/scores', {
    wallet,
    blockchain,
    sort_by: 'portfolio_value',
    sort_order: 'desc',
    time_range,
    offset: 0,
    limit: 30
  });
}

export async function getNftWalletTraders(wallet: string, blockchain: string = 'ethereum', time_range: string = '24h'): Promise<any> {
  return fetchFromEndpoint('/nft/wallet/traders', {
    wallet,
    blockchain,
    time_range,
    sort_by: 'traders',
    sort_order: 'desc',
    offset: 0,
    limit: 30
  });
}

// Fraud Detection Endpoints
export async function getNftWalletWashtrade(wallet?: string, blockchain: string = 'ethereum', time_range: string = '24h'): Promise<any> {
  // Validate blockchain parameter
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Please specify a valid blockchain from: ${supportedBlockchains.join(', ')}.`);
  }
  
  const params: Record<string, any> = {
    blockchain: blockchain.toLowerCase(),
    sort_by: 'washtrade_volume',
    sort_order: 'desc',
    time_range,
    offset: 0,
    limit: 30
  };
  
  // If wallet address is provided, add it to params for wallet-specific query
  if (wallet) {
    params.wallet = wallet;
  }
  
  return fetchFromEndpoint('/nft/wallet/washtrade', params);
}

// Market-level washtrade endpoint for when no wallet is specified
export async function getMarketWashtrade(blockchain: string = 'ethereum', time_range: string = '24h'): Promise<any> {
  // Validate blockchain parameter
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Please specify a valid blockchain from: ${supportedBlockchains.join(', ')}.`);
  }
  
  return fetchFromEndpoint('/nft/wallet/washtrade', {
    blockchain: blockchain.toLowerCase(),
    sort_by: 'washtrade_volume',
    sort_order: 'desc',
    time_range,
    offset: 0,
    limit: 30
  });
}

