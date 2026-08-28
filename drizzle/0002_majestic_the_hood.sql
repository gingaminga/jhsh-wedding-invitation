CREATE TABLE `bus_survey_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`outbound_count` integer NOT NULL,
	`return_count` integer,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bus_survey_responses_phone_unique` ON `bus_survey_responses` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_bus_survey_updated_at` ON `bus_survey_responses` (`updated_at`,`id`);