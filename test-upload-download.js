const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUploadDownload() {
    try {
        console.log('🔍 Downloading a real test image...');

        // Download a real test image (1x1 pixel PNG)
        const imageUrl = 'https://via.placeholder.com/100x100.png';
        const testImagePath = './test-downloaded-image.png';

        const imageResponse = await axios.get(imageUrl, {
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(testImagePath);
        imageResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        console.log('✅ Test image downloaded!');

        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testImagePath));
        formData.append('userId', '01JZ5GVW5TPQ3188X44FGR85QF');

        console.log('📤 Sending upload request...');

        const response = await axios.post('http://localhost:5000/v1/user/profile/upload-image', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        console.log('✅ Upload successful!');
        console.log('Response:', response.data);
        console.log('Image URL:', `http://localhost:5000${response.data.imageUrl}`);

        // Clean up test file
        fs.unlinkSync(testImagePath);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
        }
    }
}

// Run the test
testUploadDownload(); 