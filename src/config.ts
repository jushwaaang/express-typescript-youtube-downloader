import dotenv from 'dotenv';

dotenv.config();

interface Config {
  redisHost: string;
  redisPort: number;
  redisUsername?: string;
  redisPassword?: string;
}

const config: Config = {
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: Number(process.env.REDIS_PORT) || 6379,
  redisUsername: process.env.REDIS_USERNAME || undefined,
  redisPassword: process.env.REDIS_PASSWORD || undefined,
};

export default config;
