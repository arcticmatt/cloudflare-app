import { DurableObject } from 'cloudflare:workers';
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sessionsTable, usersTable } from './db/schema';
import { getCookie } from 'hono/cookie';
import { cors } from 'hono/cors';
import { login, logout, me, register } from './routes/auth';

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
		origin: (_origin, c) => c.env.CORS_ORIGIN,
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
	.route('/register', register)
	.route('/login', login)
	.route('/me', me)
	.route('/logout', logout)
	.post('/uploadProfilePhoto', async (c) => {
		const sessionToken = getCookie(c, 'session');
		if (!sessionToken) {
			console.log('no session token');
			return c.json({ error: 'Unauthorized' }, 401);
		}

		const db = drizzle(c.env.DB);
		const session = await db.select().from(sessionsTable).where(eq(sessionsTable.token, sessionToken)).get();
		if (!session) {
			console.log('no session found');
			return c.json({ error: 'Unauthorized' }, 401);
		}
		const userId = session.userId;

		const bucket = c.env.BUCKET;
		const body = await c.req.parseBody();
		const file = body['file'] as File;
		const key = `profile-photos/${userId}`;
		await bucket.put(key, file.stream(), {
			httpMetadata: {
				contentType: file.type,
			},
		});
		return c.json({ key });
	})
	.get('/getProfilePhoto', async (c) => {
		const sessionToken = getCookie(c, 'session');
		if (!sessionToken) {
			console.log('no session token');
			return c.json({ error: 'Unauthorized' }, 401);
		}

		const db = drizzle(c.env.DB);
		const session = await db.select().from(sessionsTable).where(eq(sessionsTable.token, sessionToken)).get();
		if (!session) {
			console.log('no session found');
			return c.json({ error: 'Unauthorized' }, 401);
		}

		const bucket = c.env.BUCKET;
		const key = `profile-photos/${session.userId}`;
		const object = await bucket.get(key);

		if (!object) {
			return c.json({ error: 'Profile photo not found' }, 404);
		}

		return new Response(object.body, {
			headers: {
				'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
			},
		});
	});

export default app;
export type AppType = typeof routes;
