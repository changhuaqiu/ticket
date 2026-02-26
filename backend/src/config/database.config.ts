import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: (process.env.DB_TYPE as 'postgres' | 'sqlite') || 'sqlite',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ticket_system',
  filename: process.env.DB_FILENAME || './ticket_system.db',
  synchronize: process.env.DB_SYNCHRONIZE !== 'false',
  logging: process.env.DB_LOGGING === 'true',
}));
