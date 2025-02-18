CREATE TABLE `sessions_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` text NOT NULL,
	`expiresAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_table_token_unique` ON `sessions_table` (`token`);--> statement-breakpoint
ALTER TABLE `users_table` ADD `password` text;