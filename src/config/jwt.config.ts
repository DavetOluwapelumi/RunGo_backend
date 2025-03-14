import { config } from 'dotenv';

config();

export const JWT_SECRET = process.env.JWT_SIGNING_KEY;
