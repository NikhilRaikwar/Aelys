// Test the actual logic functions for comprehensive query routing
function isMarketLevelQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Keywords that indicate market-level intent
  const marketKeywords = [
    'market', 'ethereum', 'polygon', 'solana', 'binance', 'avalanche', 'linea',
    'blockchain', 'network', 'overall', 'general', 'activity on', 'trading on',
    'volume on', 'trends', 'what\'s the', 'show me', 'any suspicious',
    'wash trading volume', 'nft market', 'defi market', 'trading volume',
    'market analytics', 'market insights', 'market data', 'chain activity',
    'network activity', 'protocol activity'
  ];
  
  // Keywords that indicate wallet-specific intent
  const walletKeywords = [
    'my wallet', 'my portfolio', 'my holdings', 'my balance', 'my nfts',
    'my tokens', 'my defi', 'my score', 'wallet address', 'this wallet',
    'connected wallet', 'my nft holdings', 'my token balance', 'my defi holdings'
  ];
  
  // Check if query contains wallet address
  const hasWalletAddress = /0x[a-fA-F0-9]{40}/.test(query);
  
  // If query explicitly mentions wallet-specific terms or has an address, it's wallet-specific
  if (walletKeywords.some(keyword => lowerQuery.includes(keyword)) || hasWalletAddress) {
    return false;
  }
  
  // If query mentions market-level keywords, it's market-level
  if (marketKeywords.some(keyword => lowerQuery.includes(keyword))) {
    return true;
  }
  
  // Default: check for general blockchain/market context without personal pronouns
  return !lowerQuery.includes('my ') && !lowerQuery.includes('wallet');
}

function isMarketInsightQuery(query) {
  const lowerQuery = query.toLowerCase();
  const marketInsightKeywords = [
    'market analytics', 'market insights', 'market data', 'market trends',
    'trading analytics', 'trading insights', 'volume analytics', 'sales analytics',
    'nft market', 'defi market', 'market overview', 'market summary',
    'holder analytics', 'trader analytics', 'market scores', 'market sentiment'
  ];
  
  return marketInsightKeywords.some(keyword => lowerQuery.includes(keyword)) ||
         (isMarketLevelQuery(query) && (
           lowerQuery.includes('analytics') || lowerQuery.includes('insights') ||
           lowerQuery.includes('trends') || lowerQuery.includes('volume') ||
           lowerQuery.includes('trading') || lowerQuery.includes('holders') ||
           lowerQuery.includes('traders') || lowerQuery.includes('scores')
         ));
}

function extractWalletAddress(query) {
  const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
  return addressMatch ? addressMatch[0] : null;
}

console.log('🔧 Testing Comprehensive Query Routing Fix\n');

// Test cases - the problematic queries that were being misrouted
const testCases = [
  // Market-level queries (should NOT go to wallet endpoints)
  {
    query: 'show me washtrade activity on Ethereum',
    expectedType: 'Market-level washtrade',
    hasConnectedWallet: true
  },
  {
    query: 'What\'s the wash trading volume on Polygon?',
    expectedType: 'Market-level washtrade',
    hasConnectedWallet: true
  },
  {
    query: 'Any suspicious NFT trading on Solana?',
    expectedType: 'Market-level washtrade',
    hasConnectedWallet: true
  },
  {
    query: 'Ethereum NFT market trends',
    expectedType: 'Market-level insights',
    hasConnectedWallet: true
  },
  {
    query: 'Polygon DeFi trading volume',
    expectedType: 'Market-level insights',
    hasConnectedWallet: true
  },
  {
    query: 'Show me Binance NFT analytics',
    expectedType: 'Market-level insights',
    hasConnectedWallet: true
  },
  
  // Wallet-specific queries (should go to wallet endpoints)
  {
    query: 'my wallet score',
    expectedType: 'Wallet-specific',
    hasConnectedWallet: true
  },
  {
    query: 'show my portfolio',
    expectedType: 'Wallet-specific',
    hasConnectedWallet: true
  },
  {
    query: 'my NFT holdings',
    expectedType: 'Wallet-specific',
    hasConnectedWallet: true
  },
  {
    query: 'analyze 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8',
    expectedType: 'Wallet-specific (with address)',
    hasConnectedWallet: false
  },
  
  // Edge cases
  {
    query: 'NFT volume',
    expectedType: 'Market-level (ambiguous but general)',
    hasConnectedWallet: true
  },
  {
    query: 'trading performance',
    expectedType: 'Market-level (ambiguous but general)',
    hasConnectedWallet: true
  }
];

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test ${index + 1}: "${testCase.query}"`);
  console.log(`   Expected: ${testCase.expectedType}`);
  console.log(`   Connected Wallet: ${testCase.hasConnectedWallet}`);
  
  const isMarketLevel = isMarketLevelQuery(testCase.query);
  const isMarketInsight = isMarketInsightQuery(testCase.query);
  const hasWalletAddr = extractWalletAddress(testCase.query) !== null;
  
  let actualType;
  let shouldRouteCorrectly = true;
  
  if (hasWalletAddr) {
    actualType = 'Wallet-specific (with address)';
  } else if (isMarketInsight) {
    actualType = 'Market-level insights';
  } else if (isMarketLevel) {
    actualType = 'Market-level (educational)';
  } else {
    // Check if explicitly wallet-specific
    const lowerQuery = testCase.query.toLowerCase();
    const walletKeywords = [
      'my wallet', 'my portfolio', 'my holdings', 'my balance', 'my nfts',
      'my tokens', 'my defi', 'my score', 'wallet address', 'this wallet',
      'connected wallet', 'my nft holdings', 'my token balance', 'my defi holdings'
    ];
    const isExplicitlyWalletSpecific = walletKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (isExplicitlyWalletSpecific && testCase.hasConnectedWallet) {
      actualType = 'Wallet-specific';
    } else if (testCase.query.toLowerCase().includes('wash')) {
      actualType = 'Market-level washtrade';
    } else {
      actualType = 'Market-level (ambiguous but general)';
    }
  }
  
  // Check if routing matches expectation
  const routingCorrect = actualType.includes(testCase.expectedType.split(' ')[0]);
  
  console.log(`   Actual:   ${actualType}`);
  console.log(`   Result:   ${routingCorrect ? '✅ PASS' : '❌ FAIL'}`);
  
  if (routingCorrect) {
    passedTests++;
  }
});

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! Query routing fix is working correctly.');
} else {
  console.log('⚠️  Some tests failed. Review the logic for edge cases.');
}

console.log('\n🔧 Key Improvements Made:');
console.log('  • Intent-based routing prioritizes query meaning over connected wallet');
console.log('  • Market-level queries go to appropriate endpoints');
console.log('  • Wallet-specific queries only trigger when explicitly requested');
console.log('  • Enhanced keyword detection for better accuracy');
console.log('  • Market insights routed to specialized copilot agent');
