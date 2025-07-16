import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

// Debug: Log the BACKEND_URL to see if it's being read correctly
console.log('DEBUG - BACKEND_URL from env:', process.env.BACKEND_URL);

export default registerAs('paystack', () => ({
    paystackSecret: `${process.env.PAYSTACK_SECRET_KEY}`,
    paystackUrl: `${process.env.PAYSTACK_BASE_URL}`,
    callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/v1/wallet/payment/callback`,
}));