import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sessionsTable, usersTable } from './db/schema';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getCookie, setCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { hashPassword, verifyPassword } from './utils/password-hash';
import { login, me, register } from './routes/auth';

export class MyDurableObject extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async sayHello(): Promise<string> {
		let result = this.ctx.storage.sql.exec("SELECT 'Hello, World!' as greeting").one();
		return result.greeting as string;
	}
}

const app = new Hono<{ Bindings: Env }>();
app.use(
	'*',
	cors({
		// TODO: need to make it work for prod
		origin: 'http://localhost:5173',
		credentials: true,
	})
);

const routes = app
	// .get('*', async (c) => {
	// 	const id: DurableObjectId = c.env.MY_DURABLE_OBJECT.idFromName(new URL(c.req.url).pathname);
	// 	const stub = c.env.MY_DURABLE_OBJECT.get(id);
	// 	const greeting = await stub.sayHello();

	// 	return c.text(greeting);
	// })
	.get('/hello', async (c) => {
		return c.text('hello world');
	})
	.get('/users', async (c) => {
		const db = drizzle(c.env.DB);
		const users = await db.select().from(usersTable).all();
		return c.json(users);
	})
	.route('/', register)
	.route('/', login)
	.route('/', me);

export default app;
export type AppType = typeof routes;
