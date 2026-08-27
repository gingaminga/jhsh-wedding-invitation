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
