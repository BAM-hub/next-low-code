import { relations } from "drizzle-orm";
import { serial, text, boolean, pgTable } from "drizzle-orm/pg-core";

export const Passwords = pgTable("password", {
  id: serial("id").primaryKey(),
  value: text("value").notNull(),
});

const User = pgTable("todo", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  done: boolean("done").default(false).notNull(),
});

export const usersRelations = relations(User, ({ many }) => ({
  passwords: many(Passwords),
}));

export const PasswordsRelations = relations(Passwords, ({ one }) => ({
  userId: one(User),
}));
