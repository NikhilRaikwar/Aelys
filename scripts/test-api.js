const axios = require('axios');
const fs = require('fs');

// Read .env.local file manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const apiClient = axios.create({
  baseURL: envVars.UNLEASH_BASE_URL,
  headers: {
    'x-api-key': envVars.UNLEASH_API_KEY,
    'accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000,
});

async function testEndpoint(endpoint, params) {
  try {
    console.log(`\n🔍 Testing ${endpoint} with params:`, params);
    const response = await apiClient.get(endpoint, { params });
    console.log(`✅ Success! Status: ${response.status}`);
    console.log(`📊 Data preview:`, JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    return response.data;
  } catch (error) {
    console.log(`❌ Failed! Status: ${error.response?.status}`);
    console.log(`📝 Error message:`, error.response?.data?.message || error.message);
    console.log(`🔧 Full error:`, error.response?.data || 'No response data');
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting UnleashNFTs API Tests...');
  console.log('📋 Base URL:', envVars.UNLEASH_BASE_URL);
  console.log('🔑 API Key:', envVars.UNLEASH_API_KEY ? 'Set' : 'Not set');
  
  const testWallet = '0xa1196778c1ADF48689D72E4B370518dbb2E9c01F';
  
  // Test different endpoints
  const tests = [
    {
      name: 'DeFi Balance',
      endpoint: '/wallet/balance/defi',
      params: {
        address: testWallet,
        blockchain: 'ethereum',
        time_range: 'all',
        offset: 0,
        limit: 30
      }
    },
    {
      name: 'NFT Balance',
      endpoint: '/wallet/balance/nft',
      params: {
        wallet: testWallet,
        blockchain: 'ethereum',
        time_range: 'all',
        offset: 0,
        limit: 30
      }
    },
    {
      name: 'Token Balance',
      endpoint: '/wallet/balance/token',
      params: {
        address: testWallet,
        blockchain: 'ethereum',
        time_range: 'all',
        offset: 0,
        limit: 30
      }
    },
    {
      name: 'Wallet Label',
      endpoint: '/wallet/label',
      params: {
        address: testWallet,
        blockchain: 'ethereum',
        offset: 0,
        limit: 30
      }
    },
    {
      name: 'Wallet Score',
      endpoint: '/wallet/score',
      params: {
        wallet_address: testWallet,
        time_range: 'all',
        offset: 0,
        limit: 30
      }
    }
  ];

  for (const test of tests) {
    await testEndpoint(test.endpoint, test.params);
  }
  
  console.log('\n🎉 Test run completed!');
}

runTests().catch(console.error);
