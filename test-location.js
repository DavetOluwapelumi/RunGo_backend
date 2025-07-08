const axios = require('axios');

async function testLocationEndpoints() {
    try {
        console.log('Testing location endpoints...');

        // Test seeding locations and pricing
        console.log('1. Seeding locations and pricing...');
        const seedResponse = await axios.post('http://localhost:5000/v1/location/seed');
        console.log('Seed response:', seedResponse.data);

        // Test getting all locations
        console.log('\n2. Getting all locations...');
        const locationsResponse = await axios.get('http://localhost:5000/v1/location');
        console.log('Locations count:', locationsResponse.data.length);
        console.log('First few locations:', locationsResponse.data.slice(0, 3));

        // Test getting pricing
        console.log('\n3. Getting all pricing...');
        const pricingResponse = await axios.get('http://localhost:5000/v1/location/pricing');
        console.log('Pricing count:', pricingResponse.data.length);
        console.log('First few pricing entries:', pricingResponse.data.slice(0, 3));

        // Test getting price between two specific locations
        console.log('\n4. Testing price between locations...');
        const priceResponse = await axios.get('http://localhost:5000/v1/location/price/ACEGID%20(Along%20Engr%20Faculty)/BMS');
        console.log('Price response:', priceResponse.data);

        console.log('\n✅ All location tests passed!');

    } catch (error) {
        console.error('❌ Error testing locations:', error.response?.data || error.message);
    }
}

testLocationEndpoints(); 