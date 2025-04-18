import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define user relations
export const usersRelations = relations(users, ({ many }) => ({
  skills: many(skills),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  requestedExchanges: many(exchanges, { relationName: "requester" }),
  providedExchanges: many(exchanges, { relationName: "provider" }),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "receiver" }),
}));

// Skill model
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array().notNull(),
  type: varchar("type", { length: 20 }).notNull(), // "offering" or "requesting"
  proficiencyLevel: varchar("proficiency_level", { length: 20 }), // "beginner", "intermediate", "advanced", "expert"
  timeAvailability: text("time_availability"),
  media: text("media"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define skill relations
export const skillsRelations = relations(skills, ({ one, many }) => ({
  user: one(users, {
    fields: [skills.userId],
    references: [users.id],
  }),
  requesterExchanges: many(exchanges, { relationName: "requesterSkill" }),
  providerExchanges: many(exchanges, { relationName: "providerSkill" }),
}));

// Message model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Exchange model
export const exchanges = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  providerId: integer("provider_id").notNull().references(() => users.id),
  requesterSkillId: integer("requester_skill_id").references(() => skills.id),
  providerSkillId: integer("provider_skill_id").references(() => skills.id),
  status: varchar("status", { length: 20 }).notNull(), // "pending", "accepted", "in_progress", "completed", "rejected"
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  nextSession: timestamp("next_session"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define exchange relations
export const exchangesRelations = relations(exchanges, ({ one, many }) => ({
  requester: one(users, {
    fields: [exchanges.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  provider: one(users, {
    fields: [exchanges.providerId],
    references: [users.id],
    relationName: "provider",
  }),
  requesterSkill: one(skills, {
    fields: [exchanges.requesterSkillId],
    references: [skills.id],
    relationName: "requesterSkill",
  }),
  providerSkill: one(skills, {
    fields: [exchanges.providerSkillId],
    references: [skills.id],
    relationName: "providerSkill",
  }),
  reviews: many(reviews),
}));

// Review model
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  exchangeId: integer("exchange_id").notNull().references(() => exchanges.id, { onDelete: "cascade" }),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define review relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  exchange: one(exchanges, {
    fields: [reviews.exchangeId],
    references: [exchanges.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer",
  }),
  receiver: one(users, {
    fields: [reviews.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isAdmin: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

export const insertExchangeSchema = createInsertSchema(exchanges).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Zod validation schemas with additional rules
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Exchange = typeof exchanges.$inferSelect;
export type InsertExchange = z.infer<typeof insertExchangeSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
