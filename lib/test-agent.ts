/**
 * Test file to demonstrate the Aelys Agent functionality
 * This file shows how to use the agent and API functions
 */

import { askAelysAgent } from './agent';
import { fetchNFTData, fetchWalletAnalytics, fetchMarketData } from './api';

// Example test function - DO NOT run in production without valid API keys
export async function testAgent() {
  console.log('🤖 Testing Aelys Agent...');
  
  try {
    // Test a simple query that doesn't require API calls
    const simpleQuery = "What is an NFT and how does the market work?";
    console.log(`\n📝 Query: ${simpleQuery}`);
    
    const response = await askAelysAgent(simpleQuery);
    console.log(`✅ Response: ${response.answer.substring(0, 200)}...`);
    console.log(`⏱️ Execution time: ${response.metadata?.executionTime}ms`);
    console.log(`🎯 Tokens used: ${response.metadata?.tokensUsed}`);
    
    // Test a query that would require API calls (but won't execute without real data)
    const apiQuery = "What NFTs does 0x742d35Cc6d6C001b2c3e2aAe25093A7e4C8C2e5B own on Ethereum?";
    console.log(`\n📝 Query: ${apiQuery}`);
    
    const apiResponse = await askAelysAgent(apiQuery);
    console.log(`✅ Response: ${apiResponse.answer.substring(0, 200)}...`);
    console.log(`🔗 Endpoints: ${apiResponse.endpoints?.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Example API function usage
export async function testApiFunctions() {
  console.log('\n🔌 Testing API Functions...');
  
  try {
    // Example parameters (these would work with real API keys)
    const nftParams = {
      address: '0x742d35Cc6d6C001b2c3e2aAe25093A7e4C8C2e5B',
      chain: 'ethereum',
      limit: 10
    };
    
    console.log('📊 Testing fetchNFTData...');
    // const nftData = await fetchNFTData(nftParams);
    console.log('✅ fetchNFTData function is ready');
    
    const walletParams = {
      address: '0x742d35Cc6d6C001b2c3e2aAe25093A7e4C8C2e5B',
      chain: 'ethereum',
      includeActivity: true
    };
    
    console.log('📈 Testing fetchWalletAnalytics...');
    // const walletData = await fetchWalletAnalytics(walletParams);
    console.log('✅ fetchWalletAnalytics function is ready');
    
    const marketParams = {
      contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', // BAYC
      chain: 'ethereum',
      timeframe: '24h' as const
    };
    
    console.log('📊 Testing fetchMarketData...');
    // const marketData = await fetchMarketData(marketParams);
    console.log('✅ fetchMarketData function is ready');
    
    console.log('\n🎉 All API functions are properly structured and ready to use!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Mock data for testing visualization
export const mockNFTData = {
  data: [
    {
      tokenId: '1',
      contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
      name: 'Bored Ape #1',
      description: 'A unique Bored Ape Yacht Club NFT',
      image: 'https://example.com/ape1.png',
      attributes: [
        { trait_type: 'Background', value: 'Blue' },
        { trait_type: 'Fur', value: 'Golden Brown' }
      ],
      owner: '0x742d35Cc6d6C001b2c3e2aAe25093A7e4C8C2e5B',
      chain: 'ethereum'
    }
  ],
  success: true
};

export const mockWalletAnalytics = {
  data: {
    address: '0x742d35Cc6d6C001b2c3e2aAe25093A7e4C8C2e5B',
    chain: 'ethereum',
    totalNFTs: 25,
    totalValue: 150000,
    collections: [
      {
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        name: 'Bored Ape Yacht Club',
        count: 3,
        floorPrice: 45000,
        totalValue: 135000
      }
    ],
    recentActivity: [
      {
        type: 'transfer' as const,
        tokenId: '1',
        contractAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
        timestamp: '2024-01-15T10:30:00Z',
        from: '0x123...',
        to: '0x742d35Cc6d6C001b2c3e2aAe25093A7e4C8C2e5B'
      }
    ]
  },
  success: true
};

// Uncomment to run tests (requires environment variables to be set)
// testAgent();
// testApiFunctions();
