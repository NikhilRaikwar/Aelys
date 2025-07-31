// Simple test to verify the agent is working
// Run this with: node test-agent.js

async function testAgent() {
  try {
    console.log('🧪 Testing Aelys Agent...');
    
    const response = await fetch('http://localhost:3000/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'What is an NFT?',
        history: []
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Agent Response:');
    console.log('Answer:', data.answer);
    console.log('Metadata:', data.metadata);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// If running Node.js 18+ or with node --experimental-fetch
if (typeof fetch === 'undefined') {
  console.log('❌ This test requires Node.js 18+ or a fetch polyfill');
  console.log('Run the app with `npm run dev` and test in browser console instead:');
  console.log(`
    fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is an NFT?', history: [] })
    }).then(r => r.json()).then(console.log)
  `);
} else {
  testAgent();
}
