import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const guestbookEntries = sqliteTable(
  "guestbook_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    message: text("message").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_guestbook_entries_created_at").on(table.createdAt, table.id)],
);

export const busSurveyResponses = sqliteTable(
  "bus_survey_responses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    phone: text("phone").notNull().unique(),
    outboundCount: integer("outbound_count").notNull(),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_bus_survey_updated_at").on(table.updatedAt, table.id)],
);

export const attendanceSurveyResponses = sqliteTable(
  "attendance_survey_responses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    attendance: text("attendance").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull().unique(),
    mealPlan: text("meal_plan").notNull(),
    guestCount: integer("guest_count").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_attendance_survey_updated_at").on(table.updatedAt, table.id)],
);
