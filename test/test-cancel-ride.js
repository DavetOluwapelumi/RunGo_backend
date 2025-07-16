const http = require('http');

const data = JSON.stringify({ role: 'user', userIdentifier: '01K04JFGETBYAEAPS6T9EH8QD0' });

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/v1/booking/cancel-ride/01K06FB669TYM9BJPQ2MYHFCM6',
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
    },
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.write(data);
req.end(); 