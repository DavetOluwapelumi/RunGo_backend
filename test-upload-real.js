const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function testUploadReal() {
    try {
        console.log('🔍 Testing Profile Image Upload with Real Image...');

        // Create a simple but valid PNG image (1x1 pixel)
        const testImagePath = './test-real-image.png';

        // This is a valid 1x1 PNG image
        const pngHeader = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
            0x49, 0x48, 0x44, 0x52, // IHDR
            0x00, 0x00, 0x00, 0x01, // width: 1
            0x00, 0x00, 0x00, 0x01, // height: 1
            0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
            0x90, 0x77, 0x53, 0xDE, // CRC
            0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
            0x49, 0x44, 0x41, 0x54, // IDAT
            0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
            0xE2, 0x21, 0xBC, 0x33, // CRC
            0x00, 0x00, 0x00, 0x00, // IEND chunk length
            0x49, 0x45, 0x4E, 0x44, // IEND
            0xAE, 0x42, 0x60, 0x82  // CRC
        ]);

        fs.writeFileSync(testImagePath, pngHeader);

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

        // Test the image URL
        console.log('🔍 Testing image URL...');
        const imageResponse = await axios.get(`http://localhost:5000${response.data.imageUrl}`, {
            responseType: 'arraybuffer'
        });

        console.log('✅ Image accessible!');
        console.log('Content-Type:', imageResponse.headers['content-type']);
        console.log('Content-Length:', imageResponse.headers['content-length']);

        // Clean up test file
        fs.unlinkSync(testImagePath);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
    }
}

// Run the test
testUploadReal(); 