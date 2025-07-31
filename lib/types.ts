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
