CREATE TABLE `attendance_survey_responses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attendance` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`meal_plan` text NOT NULL,
	`guest_count` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_survey_responses_phone_unique` ON `attendance_survey_responses` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_attendance_survey_updated_at` ON `attendance_survey_responses` (`updated_at`,`id`);