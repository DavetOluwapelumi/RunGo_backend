import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });
export default registerAs('paystack', () => ({
    paystackSecret: `${process.env.PAYSTACK_SECRET_KEY}`,
    paystackUrl: `${process.env.PAYSTACK_BASE_URL}`,
}));