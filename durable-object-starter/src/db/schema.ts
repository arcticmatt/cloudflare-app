import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users_table', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text(),
	email: text().notNull().unique(),
	password: text(),
});

export const sessionsTable = sqliteTable('sessions_table', {
	id: int().primaryKey({ autoIncrement: true }),
	userId: int()
		.notNull()
		.references(() => usersTable.id),
	token: text().notNull().unique(),
	createdAt: text()
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	expiresAt: text().notNull(),
});
