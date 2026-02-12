// Quick test script to create sample data
import axios from 'axios';

const API_BASE = 'http://localhost:3001';

async function testPlatform() {
  try {
    console.log('🚀 Testing Wellness Intelligence Platform...\n');

    // 1. Register a test user
    console.log('1. Creating test user...');
    const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Alex',
      lastName: 'Johnson',
      goals: ['stress_reduction', 'better_sleep', 'improve_energy']
    });
    console.log('✅ User registered:', registerResponse.data.data.user.email);

    const token = registerResponse.data.data.token;

    // 2. Add some wearable data
    console.log('\n2. Adding sample wearable data...');
    const wearableData = [
      {
        provider: 'fitbit',
        dataType: 'heart_rate',
        rawData: { bpm: 72 },
        timestamp: new Date().toISOString(),
        value: 72,
        unit: 'bpm'
      },
      {
        provider: 'oura',
        dataType: 'hrv',
        rawData: { rmssd: 45 },
        timestamp: new Date().toISOString(),
        value: 45,
        unit: 'ms'
      },
      {
        provider: 'fitbit',
        dataType: 'sleep',
        rawData: { duration: 7.5, efficiency: 85 },
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        value: 7.5,
        unit: 'hours'
      }
    ];

    for (const data of wearableData) {
      await axios.post(`${API_BASE}/api/wearables/data`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    console.log('✅ Wearable data added');

    // 3. Process wellness data
    console.log('\n3. Processing wellness data with AI...');
    const processResponse = await axios.post(`${API_BASE}/api/wellness/scores/process`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ AI processing complete');
    console.log('Generated scores:', processResponse.data.data.scores.length);

    // 4. Get dashboard data
    console.log('\n4. Fetching dashboard data...');
    const dashboardResponse = await axios.get(`${API_BASE}/api/wellness/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const dashboard = dashboardResponse.data.data;
    console.log('✅ Dashboard loaded');
    console.log(`   - Wellness scores: ${dashboard.scores.length}`);
    console.log(`   - AI insights: ${dashboard.insights.length}`);
    console.log(`   - Data points: ${dashboard.dataSummary.reduce((sum, item) => sum + item._count.id, 0)}`);

    // 5. Display results
    console.log('\n🎯 TEST RESULTS:');
    console.log('================');

    console.log('\n🏆 WELLNESS SCORES:');
    dashboard.scores.forEach(score => {
      console.log(`   ${score.scoreType.charAt(0).toUpperCase() + score.scoreType.slice(1)}: ${score.score}/100 (Confidence: ${(score.confidence * 100).toFixed(0)}%)`);
    });

    console.log('\n💡 AI INSIGHTS:');
    dashboard.insights.forEach((insight, i) => {
      console.log(`   ${i + 1}. ${insight.title}`);
      console.log(`      Category: ${insight.category} | Severity: ${insight.severity}`);
      console.log(`      ${insight.description}`);
      if (insight.recommendations) {
        const recommendations = typeof insight.recommendations === 'string'
          ? insight.recommendations.split(',')
          : insight.recommendations;
        console.log(`      Recommendations: ${recommendations.join(', ')}`);
      }
      console.log('');
    });

    console.log('🎉 Platform test completed successfully!');
    console.log('\n📱 Frontend available at: http://localhost:3000');
    console.log('🔗 Backend API at: http://localhost:3001');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPlatform();