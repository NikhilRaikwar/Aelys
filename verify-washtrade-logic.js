// Test the actual logic functions
function isWashtradeQuery(query) {
  const lowerQuery = query.toLowerCase();
  return (
    lowerQuery.includes('wash') || lowerQuery.includes('washtrade') || 
    lowerQuery.includes('fraud') || lowerQuery.includes('suspicious') ||
    lowerQuery.includes('suspect') || lowerQuery.includes('manipulation')
  );
}

function extractWalletAddress(query) {
  const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
  return addressMatch ? addressMatch[0] : null;
}

function extractBlockchain(query) {
  const lowerQuery = query.toLowerCase();
  const supportedBlockchains = [
    'avalanche', 'binance', 'bitcoin', 'ethereum', 'linea', 'polygon', 
    'root', 'solana', 'soneium', 'unichain', 'unichain_sepolia'
  ];
  
  for (const blockchain of supportedBlockchains) {
    if (lowerQuery.includes(blockchain)) {
      return blockchain;
    }
  }
  
  return 'ethereum'; // default
}

function isMarketLevelQuery(query, queryWalletAddress) {
  const lowerQuery = query.toLowerCase();
  const marketKeywords = [
    'market', 'ethereum', 'polygon', 'solana', 'binance', 'avalanche', 
    'blockchain', 'network', 'overall', 'general', 'activity on',
    'trading on', 'volume on', 'trends', 'what\'s the', 'show me',
    'any suspicious', 'wash trading volume'
  ];
  
  return marketKeywords.some(keyword => lowerQuery.includes(keyword)) &&
         !lowerQuery.includes('wallet') &&
         !lowerQuery.includes('my ') &&
         !queryWalletAddress;
}

console.log('🔍 Testing Query Detection Logic\n');

// Test queries from your examples
const testQueries = [
  'show me washtrade activity on Ethereum',
  'What\'s the wash trading volume on Polygon?',
  'Any suspicious NFT trading on Solana?'
];

testQueries.forEach((query, i) => {
  console.log(`Test ${i + 1}: "${query}"`);
  
  const isWashtrade = isWashtradeQuery(query);
  const walletAddress = extractWalletAddress(query);
  const blockchain = extractBlockchain(query);
  const isMarketLevel = isMarketLevelQuery(query, walletAddress);
  
  console.log(`  ✅ Washtrade query: ${isWashtrade}`);
  console.log(`  📍 Wallet address: ${walletAddress || 'None'}`);
  console.log(`  🔗 Blockchain: ${blockchain}`);
  console.log(`  🌍 Market-level query: ${isMarketLevel}`);
  console.log(`  ➡️  Should use: ${isMarketLevel ? 'Market-level API call' : 'Wallet-specific API call'}\n`);
});

console.log('🎯 All queries should trigger market-level API calls for general blockchain washtrade activity!');
