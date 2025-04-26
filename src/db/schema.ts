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

export const Page = pgTable("page", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isPublished: boolean("isPublished").default(false).notNull(),
  createdAt: text("createdAt").notNull(),
  updatedAt: text("updatedAt").notNull(),
});

export const Component = pgTable("component", {
  name: text("name").notNull(),
  path: text("path").primaryKey(),
  isServer: boolean("isServer").default(false).notNull(),
});

export const ComponentToPage = pgTable("componentToPage", {
  props: text("props").notNull(),
  pageId: text("pageId").notNull(),
  componentId: text("path").notNull(),
});

export const ComponentRelations = relations(Component, ({ many }) => ({
  pageId: many(Page),
  componentToPages: many(ComponentToPage),
}));

export const componentToPageRelations = relations(
  ComponentToPage,
  ({ one }) => ({
    component: one(Component, {
      fields: [ComponentToPage.componentId],
      references: [Component.path],
    }),
  })
);
