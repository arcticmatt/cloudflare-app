import { zValidator } from '@hono/zod-validator';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import { sessionsTable, usersTable } from '../db/schema';
import { hashPassword, verifyPassword } from '../utils/password-hash';

export const register = new Hono<{ Bindings: Env }>().post(
	'/',
	zValidator(
		'json',
		z.object({
			email: z.string().email(),
			password: z.string().min(6),
			name: z.string(),
		})
	),
	async (c) => {
		const { email, password, name } = await c.req.valid('json');

		if (!email || !password || !name) {
			return c.json({ error: 'Missing required fields' }, 401);
		}

		const db = drizzle(c.env.DB);

		// Check if user already exists
		const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email)).get();

		if (existingUser) {
			return c.json({ error: 'User already exists' }, 400);
		}

		// Hash password before storing
		const hashedPassword = await hashPassword(password);

		// Insert new user
		const result = await db
			.insert(usersTable)
			.values({
				email,
				name,
				password: hashedPassword,
			})
			.returning();

		const user = result[0];

		// Create session
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

		const sessionToken = crypto.randomUUID();

		await db.insert(sessionsTable).values({
			userId: user.id,
			token: sessionToken,
			// TODO: need to actually implement expiry
			expiresAt: expiresAt.toISOString(),
		});

		setCookie(c, 'session', sessionToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'None',
			expires: expiresAt,
		});

		return c.json({ message: 'User registered successfully' });
	}
);

export const login = new Hono<{ Bindings: Env }>().post(
	'/',
	zValidator(
		'json',
		z.object({
			email: z.string().email(),
			password: z.string().min(1),
		})
	),
	async (c) => {
		const { email, password } = await c.req.valid('json');

		if (!email || !password) {
			return c.json({ error: 'Email and password are required' }, 400);
		}

		const db = drizzle(c.env.DB);

		// Find user by email
		const user = await db.select().from(usersTable).where(eq(usersTable.email, email)).get();

		if (!user) {
			return c.json({ error: 'User not found' }, 404);
		}

		// Verify password
		const isValid = await verifyPassword(password, user.password!);

		if (!isValid) {
			return c.json({ error: 'Invalid password' }, 401);
		}

		// Create session
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

		const sessionToken = crypto.randomUUID();

		await db.insert(sessionsTable).values({
			userId: user.id,
			token: sessionToken,
			// TODO: need to actually implement expiry
			expiresAt: expiresAt.toISOString(),
		});

		setCookie(c, 'session', sessionToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'None',
			expires: expiresAt,
		});

		return c.json({ message: 'Login successful' });
	}
);

export const me = new Hono<{ Bindings: Env }>().get(async (c) => {
	const sessionToken = getCookie(c, 'session');
	if (!sessionToken) {
		return c.json(null);
	}

	const db = drizzle(c.env.DB);
	const session = await db.select().from(sessionsTable).where(eq(sessionsTable.token, sessionToken)).get();

	if (!session) {
		return c.json(null);
	}

	const user = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).get();

	if (!user) {
		return c.json(null);
	}

	// Don't return password hash
	const { password, ...userWithoutPassword } = user;
	return c.json(userWithoutPassword);
});

export const logout = new Hono<{ Bindings: Env }>().post(async (c) => {
	const sessionToken = getCookie(c, 'session');
	if (!sessionToken) {
		return c.json({ message: 'Already logged out' });
	}

	const db = drizzle(c.env.DB);
	await db.delete(sessionsTable).where(eq(sessionsTable.token, sessionToken));
	deleteCookie(c, 'session');

	return c.json({ message: 'Logout successful' });
});
