import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  DEFAULT_SCHOOL_ID: process.env.DEFAULT_SCHOOL_ID || 'SCH-001',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-school-erp-key-2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
