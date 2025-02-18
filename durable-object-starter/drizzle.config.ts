import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
const PROD_CONFIG = defineConfig({
	out: './drizzle',
	schema: './src/db/schema.ts',
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
		token: process.env.CLOUDFLARE_D1_TOKEN!,
	},
});

const LOCAL_CONFIG = defineConfig({
	dialect: 'sqlite',
	out: './drizzle',
	schema: './src/db/schema.ts',
	dbCredentials: {
		url: '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/ab51060c6bd15daddaf3e185b400d6745e0b0c71a303604d4b47a0e9e60f9e1f.sqlite',
	},
});

export default process.env.DRIZZLE_LOCAL ? LOCAL_CONFIG : PROD_CONFIG;
