import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error', err);
});

export const cacheSet = async (key: string, value: string, ttlSeconds: number = 3600) => {
  await redisClient.set(key, value, 'EX', ttlSeconds);
};

export const cacheGet = async (key: string): Promise<string | null> => {
  return await redisClient.get(key);
};

export const cacheDel = async (key: string) => {
  await redisClient.del(key);
};

export const cacheExists = async (key: string): Promise<boolean> => {
  const result = await redisClient.exists(key);
  return result === 1;
};

export default redisClient;
