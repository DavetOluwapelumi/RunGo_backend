const axios = require('axios');

const BASE_URL = 'http://localhost:5000/v1';

async function testLoginFlow() {
    try {
        console.log('🔍 Testing Backend Connectivity...');

        // Test health endpoint
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data);

        // Test API info
        const apiInfoResponse = await axios.get(`${BASE_URL}/api-info`);
        console.log('✅ API info retrieved:', apiInfoResponse.data);

        // Test login response format
        const testLoginResponse = await axios.post(`${BASE_URL}/user/auth/test-login-response`);
        console.log('✅ Test login response format:');
        console.log(JSON.stringify(testLoginResponse.data, null, 2));

        // Test debug users endpoint
        const debugUsersResponse = await axios.post(`${BASE_URL}/user/auth/debug-users`);
        console.log('✅ Debug users response:');
        console.log(JSON.stringify(debugUsersResponse.data, null, 2));

        console.log('\n🎉 All backend tests passed!');
        console.log('\n📋 Next steps:');
        console.log('1. Check your frontend code matches the response format above');
        console.log('2. Ensure you\'re accessing response.data.jwtToken (not response.jwtToken)');
        console.log('3. Check browser console for any errors');
        console.log('4. Verify token is being stored in localStorage');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

// Run the test
testLoginFlow(); 