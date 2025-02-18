import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sessionsTable, usersTable } from '../db/schema';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getCookie, setCookie } from 'hono/cookie';
import { hashPassword, verifyPassword } from '../utils/password-hash';

const login = new Hono<{ Bindings: Env }>();
const register = new Hono<{ Bindings: Env }>();
const me = new Hono<{ Bindings: Env }>();

register.post(
	'/register',
	zValidator(
		'json',
		z.object({
			email: z.string().email(),
			password: z.string().min(6),
			name: z.string(),
		})
	),
	async (c) => {
		const { email, password, name } = await c.req.json();

		if (!email || !password || !name) {
			return c.json({ error: 'Missing required fields' }, 400);
		}

		try {
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
		} catch (error) {
			console.error('registration failed', error);
			return c.json({ error: 'Registration failed' }, 500);
		}
	}
);

login.post(
	'/login',
	zValidator(
		'json',
		z.object({
			email: z.string().email(),
			password: z.string().min(1),
		})
	),
	async (c) => {
		const { email, password } = await c.req.json();

		if (!email || !password) {
			return c.json({ error: 'Email and password are required' }, 400);
		}

		try {
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
		} catch (error) {
			return c.json({ error: 'Login failed' }, 500);
		}
	}
);

me.get('/me', async (c) => {
	try {
		const sessionToken = getCookie(c, 'session');
		console.log('sessionToken', sessionToken);
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
	} catch (error) {
		return c.json({ error: 'Failed to get user' }, 500);
	}
});

export { register, login, me };
