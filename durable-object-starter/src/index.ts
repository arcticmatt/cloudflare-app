import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { usersTable } from './db/schema';

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

const routes = app
	.use('*', async (c, next) => {
		c.res.headers.set('Access-Control-Allow-Origin', '*');
		await next();
	})
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
	});
export default app;

export type AppType = typeof routes;
