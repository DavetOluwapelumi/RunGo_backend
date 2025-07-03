const io = require('socket.io-client');

// Connect to the WebSocket server
const socket = io('http://localhost:5000', {
    query: {
        driverId: 'test-driver-123'
    }
});

// Connection event
socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server!');
    console.log('Socket ID:', socket.id);

    // Send a test message
    socket.emit('message', {
        type: 'test',
        content: 'Hello from test driver!'
    });
});

// Listen for messages
socket.on('message', (data) => {
    console.log('📨 Received message:', data);
});

// Disconnect event
socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket server');
});

// Error handling
socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
});

// Disconnect after 5 seconds
setTimeout(() => {
    console.log('🔄 Disconnecting...');
    socket.disconnect();
    process.exit(0);
}, 5000); 