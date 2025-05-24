import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  GOOGLE_CREDENTIALS_PATH: string;
  GOOGLE_DRIVE_FOLDER_ID: string;
  GROQ_API_KEY: string;
  LOG_LEVEL: string;
  CACHE_TTL: number;
  MAX_FILE_SIZE: string;
  ALLOWED_FILE_TYPES: string[];
}

const config: EnvironmentConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  GOOGLE_CREDENTIALS_PATH: process.env.GOOGLE_CREDENTIALS_PATH || 
    path.join(__dirname, '../config/credentials/service-account-key.json'),
  GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600', 10),
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '50mb',
  ALLOWED_FILE_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(','),
};

// Validate required environment variables
const requiredEnvVars: (keyof EnvironmentConfig)[] = [
  'DATABASE_URL',
  'GOOGLE_CREDENTIALS_PATH',
  'GOOGLE_DRIVE_FOLDER_ID',
  'GROQ_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !config[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please check your .env file and ensure all required variables are set.'
  );
}

// Validate PORT range
if (config.PORT < 1 || config.PORT > 65535) {
  throw new Error('PORT must be between 1 and 65535');
}

// Validate NODE_ENV
const validEnvironments = ['development', 'test', 'production'];
if (!validEnvironments.includes(config.NODE_ENV)) {
  throw new Error(`NODE_ENV must be one of: ${validEnvironments.join(', ')}`);
}

export { config };
export default config;