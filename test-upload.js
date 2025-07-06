const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUpload() {
    try {
        console.log('🔍 Testing Profile Image Upload...');

        // Create a simple test image (1x1 pixel PNG)
        const testImagePath = './test-image.png';
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(testImagePath, testImageBuffer);

        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testImagePath));
        formData.append('userId', '01JZ5GVW5TPQ3188X44FGR85QF');

        console.log('📤 Sending upload request...');
        console.log('Form data fields:', formData.getHeaders());

        const response = await axios.post('http://localhost:5000/v1/user/profile/upload-image', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        console.log('✅ Upload successful!');
        console.log('Response:', response.data);

        // Clean up test file
        fs.unlinkSync(testImagePath);

    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
    }
}

// Run the test
testUpload(); 