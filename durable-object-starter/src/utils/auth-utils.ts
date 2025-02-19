import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sessionsTable } from '../db/schema';

export async function getCurrentSession(c: Context<{ Bindings: Env }>) {
	const sessionToken = getCookie(c, 'session');
	if (!sessionToken) {
		return null;
	}

	const db = drizzle(c.env.DB);
	const session = await db.select().from(sessionsTable).where(eq(sessionsTable.token, sessionToken)).get();

	return session;
}

export async function requireAuth(c: Context<{ Bindings: Env }>) {
	const session = await getCurrentSession(c);
	if (!session) {
		return c.json({ error: 'Unauthorized' }, 401);
	}
	return session;
}
