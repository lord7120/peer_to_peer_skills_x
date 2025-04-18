import { db } from "./db";
import { 
  users, 
  skills, 
  messages,
  exchanges,
  reviews,
  type User, 
  type InsertUser,
  type Skill,
  type InsertSkill,
  type Message,
  type InsertMessage,
  type Exchange,
  type InsertExchange,
  type Review,
  type InsertReview 
} from "@shared/schema";
import { eq, and, desc, or, gte, lte } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Skill operations
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.userId, userId));
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return await db.select().from(skills).where(eq(skills.category, category));
  }

  async getSkillsByTags(tags: string[]): Promise<Skill[]> {
    // This is a simplified implementation; ideal would be to use array contains
    // For PostgreSQL with array tags: skills.tags && array[...tags]
    // For simplicity we'll filter skills that have ANY of the tags
    const result = await db.select().from(skills);
    return result.filter(skill => 
      skill.tags && tags.some(tag => skill.tags.includes(tag))
    );
  }

  async getRecentSkills(limit: number): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .orderBy(desc(skills.createdAt))
      .limit(limit);
  }

  async getOfferingSkills(): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.type, 'offering'));
  }

  async getRequestingSkills(): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.type, 'requesting'));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [newSkill] = await db
      .insert(skills)
      .values(skill)
      .returning();
    return newSkill;
  }

  async updateSkill(id: number, updates: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [updatedSkill] = await db
      .update(skills)
      .set(updates)
      .where(eq(skills.id, id))
      .returning();
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const deleted = await db
      .delete(skills)
      .where(eq(skills.id, id))
      .returning({ id: skills.id });
    return deleted.length > 0;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, user1Id),
            eq(messages.receiverId, user2Id)
          ),
          and(
            eq(messages.senderId, user2Id),
            eq(messages.receiverId, user1Id)
          )
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getUnreadMessagesCount(userId: number): Promise<number> {
    const unreadMessages = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );
    return unreadMessages.length;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const updated = await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, id))
      .returning({ id: messages.id });
    return updated.length > 0;
  }

  // Exchange operations
  async getExchange(id: number): Promise<Exchange | undefined> {
    const [exchange] = await db
      .select()
      .from(exchanges)
      .where(eq(exchanges.id, id));
    return exchange;
  }

  async getExchangesByUser(userId: number): Promise<Exchange[]> {
    return await db
      .select()
      .from(exchanges)
      .where(
        or(
          eq(exchanges.requesterId, userId),
          eq(exchanges.providerId, userId)
        )
      )
      .orderBy(desc(exchanges.createdAt));
  }

  async getActiveExchangesByUser(userId: number): Promise<Exchange[]> {
    const now = new Date();
    return await db
      .select()
      .from(exchanges)
      .where(
        and(
          or(
            eq(exchanges.requesterId, userId),
            eq(exchanges.providerId, userId)
          ),
          or(
            eq(exchanges.status, 'active'),
            eq(exchanges.status, 'pending')
          )
        )
      )
      .orderBy(desc(exchanges.createdAt));
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const [newExchange] = await db
      .insert(exchanges)
      .values(exchange)
      .returning();
    return newExchange;
  }

  async updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined> {
    const [updatedExchange] = await db
      .update(exchanges)
      .set({ status })
      .where(eq(exchanges.id, id))
      .returning();
    return updatedExchange;
  }

  async updateExchangeNextSession(id: number, nextSession: Date): Promise<Exchange | undefined> {
    const [updatedExchange] = await db
      .update(exchanges)
      .set({ nextSession })
      .where(eq(exchanges.id, id))
      .returning();
    return updatedExchange;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, id));
    return review;
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.receiverId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getAverageRatingForUser(userId: number): Promise<number> {
    const userReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.receiverId, userId));
    
    if (!userReviews.length) return 0;
    
    const sum = userReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / userReviews.length;
  }
}