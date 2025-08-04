// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// NFT Data Types
export interface NFTData {
  tokenId: string;
  contractAddress: string;
  name?: string;
  description?: string;
  image?: string;
  attributes?: NFTAttribute[];
  owner?: string;
  chain: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

// Wallet Analytics Types
export interface WalletAnalytics {
  address: string;
  chain: string;
  totalNFTs: number;
  totalValue?: number;
  collections: CollectionSummary[];
  recentActivity?: NFTActivity[];
}

export interface CollectionSummary {
  contractAddress: string;
  name: string;
  count: number;
  floorPrice?: number;
  totalValue?: number;
}

export interface NFTActivity {
  type: 'mint' | 'transfer' | 'sale' | 'listing';
  tokenId: string;
  contractAddress: string;
  price?: number;
  currency?: string;
  timestamp: string;
  from?: string;
  to?: string;
}

// Market Data Types
export interface MarketData {
  contractAddress: string;
  name: string;
  totalVolume: number;
  floorPrice: number;
  marketCap?: number;
  owners: number;
  totalSupply: number;
  chain: string;
}

// Agent Types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AgentResponse {
  answer: string;
  visualData?: ChartData | TableData;
  endpoints?: string[];
  error?: string;
  metadata?: {
    tokensUsed?: number;
    executionTime?: number;
  };
}

// Visualization Types
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  xAxis?: string;
  yAxis?: string;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

// API Function Parameters
export interface FetchNFTDataParams {
  address: string;
  chain: string;
  limit?: number;
  offset?: number;
}

export interface FetchMarketDataParams {
  contractAddress: string;
  chain: string;
  timeframe?: '1h' | '24h' | '7d' | '30d' | '1y';
}

export interface FetchWalletAnalyticsParams {
  address: string;
  chain: string;
  includeActivity?: boolean;
  activityLimit?: number;
}

// Market Insight API Parameters
export interface MarketInsightParams {
  blockchain?: string;
  time_range?: string;
}

// Market Insight Response Types
export interface MarketAnalyticsData {
  block_dates: string[];
  blockchain: string;
  chain_id: number;
  price_ceiling_trend: number[];
  sales: number;
  sales_change: number;
  sales_trend: number[];
  transactions: number;
  transactions_change: number;
  transactions_trend: number[];
  transfers: number;
  transfers_change: number;
  transfers_trend: number[];
  updated_at: string;
  volume: number;
  volume_change: number;
  volume_trend: number[];
}

export interface HoldersInsightData {
  block_dates: string[];
  blockchain: string;
  chain_id: number;
  price_ceiling_trend: number[];
  sales: number;
  sales_change: number;
  sales_trend: number[];
  transactions: number;
  transactions_change: number;
  transactions_trend: number[];
  transfers: number;
  transfers_change: number;
  transfers_trend: number[];
  updated_at: string;
  volume: number;
  volume_change: number;
  volume_trend: number[];
}

export interface ScoresInsightData {
  block_dates: string[];
  blockchain: string;
  chain_id: number;
  market_cap: string;
  market_cap_change: string;
  market_cap_trend: number[];
  marketstate: number;
  marketstate_trend: number[];
  nft_market_fear_and_greed_index: number;
  nft_market_fear_and_greed_index_trend: number[];
}

export interface TradersInsightData {
  block_dates: string[];
  blockchain: string;
  chain_id: number;
  traders: number;
  traders_buyers: number;
  traders_buyers_change: number;
  traders_buyers_trend: number[];
  traders_change: number;
  traders_sellers: number;
  traders_sellers_change: number;
  traders_sellers_trend: number[];
  traders_trend: number[];
  updated_at: string;
}

export interface WashtradeInsightData {
  block_dates: string[];
  blockchain: string;
  chain_id: number;
  washtrade_assets: string;
  washtrade_assets_change: number;
  washtrade_assets_trend: number[];
  washtrade_level: number;
  washtrade_suspect_sales: string;
  washtrade_suspect_sales_change: number;
  washtrade_suspect_sales_ratio: string;
  washtrade_suspect_sales_ratio_change: string;
  washtrade_suspect_sales_ratio_trend: number[];
  washtrade_suspect_sales_trend: number[];
  washtrade_suspect_transactions: string;
  washtrade_suspect_transactions_change: number;
  washtrade_suspect_transactions_trend: number[];
  washtrade_volume: number;
  washtrade_volume_change: number;
  washtrade_volume_trend: number[];
  washtrade_wallets: string;
  washtrade_wallets_change: number;
  washtrade_wallets_trend: number[];
}

// Chart Data for Market Insights
export interface MarketChartData {
  block_dates: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// Collection Whales API Parameters
export interface CollectionWhalesParams {
  blockchain?: string;
  contract_address?: string[];
  time_range?: string;
  offset?: number;
  limit?: number;
  sort_by?: CollectionWhalesSortBy;
  sort_order?: 'asc' | 'desc';
}

// Collection Whales Sort Options
export type CollectionWhalesSortBy = 
  | 'nft_count' | 'mint_count' | 'mint_volume' | 'mint_whales'
  | 'unique_wallets' | 'unique_mint_wallets' | 'unique_buy_wallets' | 'unique_sell_wallets'
  | 'total_mint_volume' | 'total_sale_volume' | 'buy_count' | 'buy_volume' | 'buy_whales'
  | 'sell_count' | 'sell_volume' | 'sell_whales' | 'whale_holders';

// Collection Whales Response Types
export interface CollectionWhalesData {
  blockchain: string;
  buy_count: string;
  buy_volume: number;
  buy_whales: string;
  chain_id: number;
  collection: string;
  contract_address: string;
  contract_type: string;
  mint_count: string;
  mint_volume: number;
  mint_whales: string;
  nft_count: string;
  sell_count: string;
  sell_volume: number;
  sell_whales: string;
  total_mint_volume: number;
  total_sale_volume: number;
  unique_buy_wallets: string;
  unique_mint_wallets: string;
  unique_sell_wallets: string;
  unique_wallets: string;
  whale_holders: string;
}

// NFT Washtrade API Parameters (for specific NFT analysis)
export interface NFTWashtradeParams {
  contract_address?: string[];
  token_id?: string[];
  blockchain?: string;
  time_range?: string;
  offset?: number;
  limit?: number;
  sort_by?: NFTWashtradeSortBy;
  sort_order?: 'asc' | 'desc';
}

// NFT Washtrade Sort Options
export type NFTWashtradeSortBy = 
  | 'washtrade_volume' | 'washtrade_suspect_sales' | 'washtrade_assets' | 'washtrade_wallets'
  | 'washtrade_volume_change' | 'washtrade_suspect_sales_change' | 'washtrade_assets_change' 
  | 'washtrade_wallets_change' | 'washtrade_suspect_transactions' | 'washtrade_suspect_transactions_change';

// NFT Washtrade Response Types
export interface NFTWashtradeData {
  blockchain: string;
  chain_id: number;
  contract_address: string;
  token_id: string;
  washtrade_assets: string;
  washtrade_assets_change: number;
  washtrade_suspect_sales: string;
  washtrade_suspect_sales_change: number;
  washtrade_suspect_transactions: string;
  washtrade_suspect_transactions_change: number;
  washtrade_volume: number;
  washtrade_volume_change: number;
  washtrade_wallets: string;
  washtrade_wallets_change: number;
}

// Collection Metadata API Parameters
export interface CollectionMetadataParams {
  blockchain?: string;
  contract_address?: string[];
  slug_name?: string[];
  time_range?: string;
  offset?: number;
  limit?: number;
  sort_order?: 'asc' | 'desc';
}

// Collection Metadata Response Types
export interface CollectionMetadataData {
  banner_image_url: string;
  blockchain: string;
  brand: string;
  category: string;
  chain_id: number;
  close_colours: string;
  collection: string;
  collection_id: number;
  contract_address: string;
  contract_created_date: string;
  contract_type: string;
  description: string;
  discord_url: string | null;
  distinct_nft_count: number;
  end_token_id: string;
  external_url: string;
  image_url: string;
  instagram_url: string | null;
  marketplaces: string;
  medium_url: string | null;
  slug_name: string;
  start_token_id: string;
  telegram_url: string | null;
  top_contracts: string[];
}
