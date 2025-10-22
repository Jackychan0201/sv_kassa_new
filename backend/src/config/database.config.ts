import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA || 'public',  
  ssl: process.env.DB_SSL === 'true', 
  autoLoadEntities: true,
  synchronize: process.env.NODE_ENV !== 'production',
  retryAttempts: 3,
  retryDelay: 3000,
}));
