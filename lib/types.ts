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
