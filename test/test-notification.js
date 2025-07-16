const axios = require('axios');

const BASE_URL = 'http://localhost:5000/v1/notifications';
const userIdentifier = 'PUT_A_VALID_USER_IDENTIFIER_HERE'; // Replace with a real user identifier

async function testNotification() {
    try {
        // 1. Create a test notification
        const createRes = await axios.post(`${BASE_URL}/test`, {
            userIdentifier,
            message: 'This is a test notification',
            type: 'test',
        });
        console.log('Created notification:', createRes.data);

        // 2. Fetch notifications for the user
        const fetchRes = await axios.get(`${BASE_URL}/${userIdentifier}`);
        console.log('Fetched notifications:', fetchRes.data);

        // 3. Optionally, delete the test notification (if you want to clean up)
        // const notifId = createRes.data.id;
        // await axios.delete(`${BASE_URL}/${notifId}`);
        // console.log('Deleted test notification');
    } catch (err) {
        console.error('Error during notification test:', err.response ? err.response.data : err.message);
    }
}

testNotification(); 