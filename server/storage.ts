import { 
  users, skills, messages, exchanges, reviews,
  type User, type InsertUser, 
  type Skill, type InsertSkill,
  type Message, type InsertMessage,
  type Exchange, type InsertExchange,
  type Review, type InsertReview
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Define Store type for express-session
type SessionStore = session.Store;

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Skill operations
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByUser(userId: number): Promise<Skill[]>;
  getSkillsByCategory(category: string): Promise<Skill[]>;
  getSkillsByTags(tags: string[]): Promise<Skill[]>;
  getRecentSkills(limit: number): Promise<Skill[]>;
  getOfferingSkills(): Promise<Skill[]>;
  getRequestingSkills(): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, updates: Partial<InsertSkill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  getUnreadMessagesCount(userId: number): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Exchange operations
  getExchange(id: number): Promise<Exchange | undefined>;
  getExchangesByUser(userId: number): Promise<Exchange[]>;
  getActiveExchangesByUser(userId: number): Promise<Exchange[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined>;
  updateExchangeNextSession(id: number, nextSession: Date): Promise<Exchange | undefined>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  getAverageRatingForUser(userId: number): Promise<number>;
  
  // Session store
  sessionStore: SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private messages: Map<number, Message>;
  private exchanges: Map<number, Exchange>;
  private reviews: Map<number, Review>;
  private userIdCounter: number;
  private skillIdCounter: number;
  private messageIdCounter: number;
  private exchangeIdCounter: number;
  private reviewIdCounter: number;
  sessionStore: SessionStore;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.messages = new Map();
    this.exchanges = new Map();
    this.reviews = new Map();
    this.userIdCounter = 1;
    this.skillIdCounter = 1;
    this.messageIdCounter = 1;
    this.exchangeIdCounter = 1;
    this.reviewIdCounter = 1;
    
    // Create a memory store for sessions
    const MemoryStore = createMemoryStore(session);
    const store = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    this.sessionStore = store;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id, 
      isAdmin: false,
      createdAt: now,
      bio: user.bio || null,
      profileImage: user.profileImage || null
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Skill operations
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.userId === userId
    );
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getSkillsByTags(tags: string[]): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter((skill) => 
      tags.some((tag) => skill.tags.includes(tag))
    );
  }

  async getRecentSkills(limit: number): Promise<Skill[]> {
    return Array.from(this.skills.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getOfferingSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.isOffering
    );
  }

  async getRequestingSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(
      (skill) => !skill.isOffering
    );
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const now = new Date();
    const newSkill: Skill = { 
      ...skill, 
      id, 
      createdAt: now,
      timeAvailability: skill.timeAvailability || null,
      media: skill.media || null 
    };
    this.skills.set(id, newSkill);
    return newSkill;
  }

  async updateSkill(id: number, updates: Partial<InsertSkill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) {
      return undefined;
    }
    
    const updatedSkill = { ...skill, ...updates };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) => 
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUnreadMessagesCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (message) => message.receiverId === userId && !message.read
    ).length;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const newMessage: Message = { ...message, id, read: false, createdAt: now };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const message = this.messages.get(id);
    if (!message) {
      return false;
    }
    
    message.read = true;
    this.messages.set(id, message);
    return true;
  }

  // Exchange operations
  async getExchange(id: number): Promise<Exchange | undefined> {
    return this.exchanges.get(id);
  }

  async getExchangesByUser(userId: number): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(
      (exchange) => exchange.requesterId === userId || exchange.providerId === userId
    );
  }

  async getActiveExchangesByUser(userId: number): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(
      (exchange) => 
        (exchange.requesterId === userId || exchange.providerId === userId) &&
        (exchange.status === "accepted" || exchange.status === "in_progress")
    );
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const id = this.exchangeIdCounter++;
    const now = new Date();
    const newExchange: Exchange = { 
      ...exchange, 
      id, 
      createdAt: now,
      requesterSkillId: exchange.requesterSkillId || null,
      providerSkillId: exchange.providerSkillId || null,
      nextSession: exchange.nextSession || null
    };
    this.exchanges.set(id, newExchange);
    return newExchange;
  }

  async updateExchangeStatus(id: number, status: string): Promise<Exchange | undefined> {
    const exchange = this.exchanges.get(id);
    if (!exchange) {
      return undefined;
    }
    
    exchange.status = status;
    this.exchanges.set(id, exchange);
    return exchange;
  }

  async updateExchangeNextSession(id: number, nextSession: Date): Promise<Exchange | undefined> {
    const exchange = this.exchanges.get(id);
    if (!exchange) {
      return undefined;
    }
    
    exchange.nextSession = nextSession;
    this.exchanges.set(id, exchange);
    return exchange;
  }

  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.receiverId === userId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: now,
      comment: review.comment || null
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getAverageRatingForUser(userId: number): Promise<number> {
    const userReviews = await this.getReviewsByUser(userId);
    if (userReviews.length === 0) {
      return 0;
    }
    
    const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((totalRating / userReviews.length).toFixed(1));
  }
}

export const storage = new MemStorage();
