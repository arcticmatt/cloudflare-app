import { DurableObjectNamespace } from '@cloudflare/workers-types';

export interface Env {
	DB: D1Database;
	BUCKET: R2Bucket;
	CORS_ORIGIN: string;
	MY_DURABLE_OBJECT: DurableObjectNamespace;
}
