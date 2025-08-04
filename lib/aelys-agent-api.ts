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

// Available sort_by options for NFT Wallet Analytics endpoint
type NftWalletAnalyticsSortBy = 
  | 'volume' | 'sales' | 'transactions' | 'transfers' 
  | 'nft_burn' | 'nft_transfer' | 'nft_mint' | 'nft_bought' | 'nft_sold' | 'minted_value'
  | 'volume_change' | 'sales_change' | 'transactions_change' | 'transfers_change'
  | 'nft_burn_change' | 'nft_transfer_change' | 'nft_mint_change' | 'nft_bought_change' | 'nft_sold_change' | 'minted_value_change'
  | 'buy_volume' | 'sell_volume';

export async function getNftWalletAnalytics(
  wallet: string, 
  blockchain: string = 'ethereum', 
  time_range: string = 'all',
  sort_by: NftWalletAnalyticsSortBy = 'volume'
): Promise<any> {
  return fetchFromEndpoint('/nft/wallet/analytics', {
    wallet,
    blockchain,
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  });
}

// Available sort_by options for NFT Wallet Scores endpoint
type NftWalletScoresSortBy = 
  | 'portfolio_value' | 'unrealized_profit' | 'estimated_portfolio_value'
  | 'collection_count' | 'nft_count' | 'washtrade_nft_count' | 'realized_profit';

export async function getNftWalletScores(
  wallet: string, 
  blockchain: string = 'ethereum', 
  time_range: string = '24h',
  sort_by: NftWalletScoresSortBy = 'portfolio_value'
): Promise<any> {
  return fetchFromEndpoint('/nft/wallet/scores', {
    wallet,
    blockchain,
    sort_by,
    sort_order: 'desc',
    time_range,
    offset: 0,
    limit: 30
  });
}

// Available sort_by options for NFT Wallet Traders endpoint
type NftWalletTradersSortBy = 
  | 'traders' | 'traders_change' | 'traders_buyers'
  | 'traders_buyers_change' | 'traders_sellers' | 'traders_sellers_change';

export async function getNftWalletTraders(
  wallet: string, 
  blockchain: string = 'ethereum', 
  time_range: string = '24h',
  sort_by: NftWalletTradersSortBy = 'traders'
): Promise<any> {
  return fetchFromEndpoint('/nft/wallet/traders', {
    wallet,
    blockchain,
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  });
}

// Available sort_by options for NFT Wallet Washtrade endpoint
type NftWalletWashtradeSortBy = 
  | 'washtrade_volume' | 'washtrade_suspect_sales' | 'washtrade_suspect_sales_change' | 'washtrade_volume_change';

export async function getNftWalletWashtrade(
  wallet?: string, 
  blockchain: string = 'ethereum', 
  time_range: string = '24h',
  sort_by: NftWalletWashtradeSortBy = 'washtrade_volume'
): Promise<any> {
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
    sort_by,
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

// Available sort_by options for NFT Washtrade endpoint (specific NFT analysis)
type NFTWashtradeSortBy = 
  | 'washtrade_volume' | 'washtrade_suspect_sales' | 'washtrade_assets' | 'washtrade_wallets'
  | 'washtrade_volume_change' | 'washtrade_suspect_sales_change' | 'washtrade_assets_change' 
  | 'washtrade_wallets_change' | 'washtrade_suspect_transactions' | 'washtrade_suspect_transactions_change';

export async function getNFTWashtrade(
  contract_address?: string[],
  token_id?: string[],
  blockchain: string = 'ethereum',
  time_range: string = '24h',
  sort_by: NFTWashtradeSortBy = 'washtrade_volume'
): Promise<any> {
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
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  // Add contract addresses if provided
  if (contract_address && contract_address.length > 0) {
    params.contract_address = contract_address;
  }
  
  // Add token IDs if provided
  if (token_id && token_id.length > 0) {
    params.token_id = token_id;
  }
  
  return fetchFromEndpoint('/nft/washtrade', params);
}

// Available sort_by options for Collection Whales endpoint
type CollectionWhalesSortBy = 
  | 'nft_count' | 'mint_count' | 'mint_volume' | 'mint_whales'
  | 'unique_wallets' | 'unique_mint_wallets' | 'unique_buy_wallets' | 'unique_sell_wallets'
  | 'total_mint_volume' | 'total_sale_volume' | 'buy_count' | 'buy_volume' | 'buy_whales'
  | 'sell_count' | 'sell_volume' | 'sell_whales' | 'whale_holders';

export async function getCollectionWhales(
  blockchain: string = 'ethereum',
  time_range: string = '24h',
  contract_address?: string[],
  sort_by: CollectionWhalesSortBy = 'nft_count'
): Promise<any> {
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
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  // Add contract addresses if provided
  if (contract_address && contract_address.length > 0) {
    params.contract_address = contract_address;
  }
  
  return fetchFromEndpoint('/nft/collection/whales', params);
}

// Collection Metadata endpoint
export async function getCollectionMetadata(
  blockchain: string = 'ethereum',
  contract_address?: string[],
  slug_name?: string[],
  time_range: string = 'all'
): Promise<any> {
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
    time_range,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  // Add contract addresses if provided
  if (contract_address && contract_address.length > 0) {
    params.contract_address = contract_address;
  }
  
  // Add slug names if provided
  if (slug_name && slug_name.length > 0) {
    params.slug_name = slug_name;
  }
  
  return fetchFromEndpoint('/nft/collection/metadata', params);
}

// NFT Floor Price endpoint
export async function getNftFloorPrice(
  blockchain: string = 'ethereum',
  time_range: string = 'all',
  contract_address?: string[],
  marketplace_name?: string[],
  collection_name?: string[],
  sort_by: string = 'floor_price_usd'
): Promise<any> {
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Please specify a valid blockchain from: ${supportedBlockchains.join(', ')}.`);
  }
  
  const params: Record<string, any> = {
    blockchain: blockchain.toLowerCase(),
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  if (contract_address && contract_address.length > 0) {
    params.contract_address = contract_address;
  }
  
  if (marketplace_name && marketplace_name.length > 0) {
    params.marketplace_name = marketplace_name;
  }
  
  if (collection_name && collection_name.length > 0) {
    params.collection_name = collection_name;
  }
  
  return fetchFromEndpoint('/nft/floor_price', params);
}

// NFT Analytics endpoint (specific NFT analysis)
export async function getNftAnalytics(
  contract_address: string[],
  blockchain: string = 'ethereum',
  time_range: string = '24h',
  token_id?: string[],
  sort_by: string = 'sales'
): Promise<any> {
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Please specify a valid blockchain from: ${supportedBlockchains.join(', ')}.`);
  }
  
  const params: Record<string, any> = {
    contract_address,
    blockchain: blockchain.toLowerCase(),
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  if (token_id && token_id.length > 0) {
    params.token_id = token_id;
  }
  
  return fetchFromEndpoint('/nft/analytics', params);
}

// NFT Listing endpoint
export async function getNftListing(
  blockchain: string = 'ethereum',
  time_range: string = '24h',
  contract_address?: string[],
  token_id?: string[],
  wallet?: string[],
  marketplace?: string[],
  sort_by: string = 'listing_timestamp'
): Promise<any> {
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Please specify a valid blockchain from: ${supportedBlockchains.join(', ')}.`);
  }
  
  const params: Record<string, any> = {
    blockchain: blockchain.toLowerCase(),
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  if (contract_address && contract_address.length > 0) {
    params.contract_address = contract_address;
  }
  
  if (token_id && token_id.length > 0) {
    params.token_id = token_id;
  }
  
  if (wallet && wallet.length > 0) {
    params.wallet = wallet;
  }
  
  if (marketplace && marketplace.length > 0) {
    params.marketplace = marketplace;
  }
  
  return fetchFromEndpoint('/nft/listing', params);
}

// Token Balance endpoint
export async function getTokenBalance(
  blockchain?: string[],
  token_address?: string[],
  address?: string[]
): Promise<any> {
  const params: Record<string, any> = {
    offset: 0,
    limit: 30
  };
  
  if (blockchain && blockchain.length > 0) {
    params.blockchain = blockchain;
  }
  
  if (token_address && token_address.length > 0) {
    params.token_address = token_address;
  }
  
  if (address && address.length > 0) {
    params.address = address;
  }
  
  return fetchFromEndpoint('/token/balance', params);
}

// NFT Marketplace Metadata endpoint
export async function getNftMarketplaceMetadata(
  sort_order: string = 'desc'
): Promise<any> {
  const params: Record<string, any> = {
    sort_order,
    offset: 0,
    limit: 30
  };
  
  return fetchFromEndpoint('/nft/marketplace/metadata', params);
}

// NFT Marketplace Analytics endpoint
export async function getNftMarketplaceAnalytics(
  blockchain: string = 'ethereum',
  time_range: string = '24h',
  sort_by: string = 'volume',
  name?: string[]
): Promise<any> {
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Please specify a valid blockchain from: ${supportedBlockchains.join(', ')}.`);
  }
  
  const params: Record<string, any> = {
    blockchain: blockchain.toLowerCase(),
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  if (name && name.length > 0) {
    params.name = name;
  }
  
  return fetchFromEndpoint('/nft/marketplace/analytics', params);
}

// NFT Marketplace Washtrade endpoint
export async function getNftMarketplaceWashtrade(
  blockchain: string = 'ethereum',
  time_range: string = '24h',
  sort_by: string = 'washtrade_volume',
  name?: string[]
): Promise<any> {
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  if (!supportedBlockchains.includes(blockchain.toLowerCase())) {
    throw new Error(`Please specify a valid blockchain from: ${supportedBlockchains.join(', ')}.`);
  }
  
  const params: Record<string, any> = {
    blockchain: blockchain.toLowerCase(),
    time_range,
    sort_by,
    sort_order: 'desc',
    offset: 0,
    limit: 30
  };
  
  if (name && name.length > 0) {
    params.name = name;
  }
  
  return fetchFromEndpoint('/nft/marketplace/washtrade', params);
}

