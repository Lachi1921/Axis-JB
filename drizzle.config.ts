import { defineConfig } from 'drizzle-kit';
import { env } from '@/data/env/server';


const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set.');
}

export default defineConfig({
    out: './src/drizzle/migrations',
    schema: './src/drizzle/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: databaseUrl,
    },
});
