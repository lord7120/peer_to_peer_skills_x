import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSkillSchema, 
  insertMessageSchema, 
  insertExchangeSchema, 
  insertReviewSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Enable CORS for development
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Add any middleware before API routes
  app.use(express.json());
  
  // Simple endpoint to test API connectivity
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is working properly' });
  });

  const httpServer = createServer(app);

  // API Routes
  
  // Skills
  app.get("/api/skills", async (req, res) => {
    try {
      let skills;
      
      // Filter by category if provided
      if (req.query.category) {
        skills = await storage.getSkillsByCategory(req.query.category as string);
      } 
      // Filter by type (offering or requesting)
      else if (req.query.type) {
        if (req.query.type === "offering") {
          skills = await storage.getOfferingSkills();
        } else if (req.query.type === "requesting") {
          skills = await storage.getRequestingSkills();
        } else {
          skills = await storage.getRecentSkills(20);
        }
      } 
      // Get recent skills by default
      else {
        skills = await storage.getRecentSkills(20);
      }

      // For each skill, get the user who created it
      const skillsWithUsers = await Promise.all(
        skills.map(async (skill) => {
          const user = await storage.getUser(skill.userId);
          return {
            ...skill,
            user: user ? {
              id: user.id,
              username: user.username,
              name: user.name,
              profileImage: user.profileImage
            } : null,
          };
        })
      );

      res.json(skillsWithUsers);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Error fetching skills" });
    }
  });

  app.get("/api/skills/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const skills = await storage.getRecentSkills(limit);
      
      // For each skill, get the user who created it
      const skillsWithUsers = await Promise.all(
        skills.map(async (skill) => {
          const user = await storage.getUser(skill.userId);
          return {
            ...skill,
            user: user ? {
              id: user.id,
              username: user.username,
              name: user.name,
              profileImage: user.profileImage
            } : null,
          };
        })
      );

      res.json(skillsWithUsers);
    } catch (error) {
      console.error("Error fetching recent skills:", error);
      res.status(500).json({ message: "Error fetching recent skills" });
    }
  });

  app.get("/api/skills/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const skills = await storage.getSkillsByUser(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Error fetching user skills" });
    }
  });

  app.get("/api/skills/:id", async (req, res) => {
    try {
      const skillId = parseInt(req.params.id);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Get the user who created the skill
      const user = await storage.getUser(skill.userId);
      
      res.json({
        ...skill,
        user: user ? {
          id: user.id,
          username: user.username,
          name: user.name,
          profileImage: user.profileImage
        } : null,
      });
    } catch (error) {
      console.error("Error fetching skill:", error);
      res.status(500).json({ message: "Error fetching skill" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validation = insertSkillSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid skill data", errors: validation.error.format() });
      }

      const skill = await storage.createSkill({
        ...validation.data,
        userId: req.user.id,
      });
      
      res.status(201).json(skill);
    } catch (error) {
      console.error("Error creating skill:", error);
      res.status(500).json({ message: "Error creating skill" });
    }
  });

  app.put("/api/skills/:id", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const skillId = parseInt(req.params.id);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Ensure user owns the skill or is admin
      if (skill.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this skill" });
      }
      
      const updatedSkill = await storage.updateSkill(skillId, req.body);
      res.json(updatedSkill);
    } catch (error) {
      console.error("Error updating skill:", error);
      res.status(500).json({ message: "Error updating skill" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const skillId = parseInt(req.params.id);
      const skill = await storage.getSkill(skillId);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Ensure user owns the skill or is admin
      if (skill.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to delete this skill" });
      }
      
      const success = await storage.deleteSkill(skillId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete skill" });
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Error deleting skill" });
    }
  });

  // Messages
  app.get("/api/messages", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messages = await storage.getMessagesByUser(req.user.id);
      
      // Group messages by conversation partner
      const conversations = {};
      for (const message of messages) {
        const partnerId = message.senderId === req.user.id ? message.receiverId : message.senderId;
        if (!conversations[partnerId]) {
          const partner = await storage.getUser(partnerId);
          conversations[partnerId] = {
            user: partner ? {
              id: partner.id,
              username: partner.username,
              name: partner.name,
              profileImage: partner.profileImage
            } : null,
            messages: []
          };
        }
        conversations[partnerId].messages.push(message);
      }
      
      // Sort conversations by latest message
      const result = Object.values(conversations)
        .map(convo => ({
          ...convo,
          messages: convo.messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        }))
        .sort((a, b) => b.messages[0]?.createdAt?.getTime() - a.messages[0]?.createdAt?.getTime());
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.get("/api/messages/unread", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const count = await storage.getUnreadMessagesCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      res.status(500).json({ message: "Error fetching unread messages count" });
    }
  });

  app.get("/api/messages/:userId", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const partnerId = parseInt(req.params.userId);
      const conversation = await storage.getConversation(req.user.id, partnerId);
      
      // Get partner details
      const partner = await storage.getUser(partnerId);
      
      res.json({
        user: partner ? {
          id: partner.id,
          username: partner.username,
          name: partner.name,
          profileImage: partner.profileImage
        } : null,
        messages: conversation
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Error fetching conversation" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validation = insertMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validation.error.format() });
      }
      
      // Ensure sender ID matches the authenticated user
      if (req.body.senderId !== req.user.id) {
        return res.status(400).json({ message: "Sender ID must match the authenticated user" });
      }
      
      const message = await storage.createMessage(validation.data);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message" });
    }
  });

  app.post("/api/messages/:id/read", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Ensure the user is the recipient of the message
      if (message.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to mark this message as read" });
      }
      
      const success = await storage.markMessageAsRead(messageId);
      
      if (success) {
        res.status(200).json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to mark message as read" });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Error marking message as read" });
    }
  });

  // Exchanges
  app.get("/api/exchanges", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const exchanges = await storage.getExchangesByUser(req.user.id);
      
      // For each exchange, get the skills and users involved
      const exchangesWithDetails = await Promise.all(
        exchanges.map(async (exchange) => {
          const requester = await storage.getUser(exchange.requesterId);
          const provider = await storage.getUser(exchange.providerId);
          
          let requesterSkill = null;
          let providerSkill = null;
          
          if (exchange.requesterSkillId) {
            requesterSkill = await storage.getSkill(exchange.requesterSkillId);
          }
          
          if (exchange.providerSkillId) {
            providerSkill = await storage.getSkill(exchange.providerSkillId);
          }
          
          return {
            ...exchange,
            requester: requester ? {
              id: requester.id,
              username: requester.username,
              name: requester.name,
              profileImage: requester.profileImage
            } : null,
            provider: provider ? {
              id: provider.id,
              username: provider.username,
              name: provider.name,
              profileImage: provider.profileImage
            } : null,
            requesterSkill,
            providerSkill
          };
        })
      );
      
      res.json(exchangesWithDetails);
    } catch (error) {
      console.error("Error fetching exchanges:", error);
      res.status(500).json({ message: "Error fetching exchanges" });
    }
  });

  app.get("/api/exchanges/active", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const exchanges = await storage.getActiveExchangesByUser(req.user.id);
      
      // For each exchange, get the skills and users involved
      const exchangesWithDetails = await Promise.all(
        exchanges.map(async (exchange) => {
          const requester = await storage.getUser(exchange.requesterId);
          const provider = await storage.getUser(exchange.providerId);
          
          let requesterSkill = null;
          let providerSkill = null;
          
          if (exchange.requesterSkillId) {
            requesterSkill = await storage.getSkill(exchange.requesterSkillId);
          }
          
          if (exchange.providerSkillId) {
            providerSkill = await storage.getSkill(exchange.providerSkillId);
          }
          
          return {
            ...exchange,
            requester: requester ? {
              id: requester.id,
              username: requester.username,
              name: requester.name,
              profileImage: requester.profileImage
            } : null,
            provider: provider ? {
              id: provider.id,
              username: provider.username,
              name: provider.name,
              profileImage: provider.profileImage
            } : null,
            requesterSkill,
            providerSkill
          };
        })
      );
      
      res.json(exchangesWithDetails);
    } catch (error) {
      console.error("Error fetching active exchanges:", error);
      res.status(500).json({ message: "Error fetching active exchanges" });
    }
  });

  app.get("/api/exchanges/:id", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const exchangeId = parseInt(req.params.id);
      const exchange = await storage.getExchange(exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Ensure user is part of the exchange
      if (exchange.requesterId !== req.user.id && exchange.providerId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to view this exchange" });
      }
      
      // Get the users and skills involved
      const requester = await storage.getUser(exchange.requesterId);
      const provider = await storage.getUser(exchange.providerId);
      
      let requesterSkill = null;
      let providerSkill = null;
      
      if (exchange.requesterSkillId) {
        requesterSkill = await storage.getSkill(exchange.requesterSkillId);
      }
      
      if (exchange.providerSkillId) {
        providerSkill = await storage.getSkill(exchange.providerSkillId);
      }
      
      res.json({
        ...exchange,
        requester: requester ? {
          id: requester.id,
          username: requester.username,
          name: requester.name,
          profileImage: requester.profileImage
        } : null,
        provider: provider ? {
          id: provider.id,
          username: provider.username,
          name: provider.name,
          profileImage: provider.profileImage
        } : null,
        requesterSkill,
        providerSkill
      });
    } catch (error) {
      console.error("Error fetching exchange:", error);
      res.status(500).json({ message: "Error fetching exchange" });
    }
  });

  app.post("/api/exchanges", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validation = insertExchangeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid exchange data", errors: validation.error.format() });
      }
      
      // Ensure requester ID matches the authenticated user
      if (validation.data.requesterId !== req.user.id) {
        return res.status(400).json({ message: "Requester ID must match the authenticated user" });
      }
      
      const exchange = await storage.createExchange(validation.data);
      res.status(201).json(exchange);
    } catch (error) {
      console.error("Error creating exchange:", error);
      res.status(500).json({ message: "Error creating exchange" });
    }
  });

  app.put("/api/exchanges/:id/status", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const exchangeId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "accepted", "in_progress", "completed", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const exchange = await storage.getExchange(exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Ensure user is part of the exchange
      if (exchange.requesterId !== req.user.id && exchange.providerId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this exchange" });
      }
      
      const updatedExchange = await storage.updateExchangeStatus(exchangeId, status);
      res.json(updatedExchange);
    } catch (error) {
      console.error("Error updating exchange status:", error);
      res.status(500).json({ message: "Error updating exchange status" });
    }
  });

  app.put("/api/exchanges/:id/next-session", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const exchangeId = parseInt(req.params.id);
      const { nextSession } = req.body;
      
      if (!nextSession) {
        return res.status(400).json({ message: "Next session date is required" });
      }
      
      const exchange = await storage.getExchange(exchangeId);
      
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      // Ensure user is part of the exchange
      if (exchange.requesterId !== req.user.id && exchange.providerId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized to update this exchange" });
      }
      
      const updatedExchange = await storage.updateExchangeNextSession(exchangeId, new Date(nextSession));
      res.json(updatedExchange);
    } catch (error) {
      console.error("Error updating next session:", error);
      res.status(500).json({ message: "Error updating next session" });
    }
  });

  // Reviews
  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reviews = await storage.getReviewsByUser(userId);
      
      // For each review, get the reviewer
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const reviewer = await storage.getUser(review.reviewerId);
          return {
            ...review,
            reviewer: reviewer ? {
              id: reviewer.id,
              username: reviewer.username,
              name: reviewer.name,
              profileImage: reviewer.profileImage
            } : null,
          };
        })
      );
      
      res.json(reviewsWithUsers);
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      res.status(500).json({ message: "Error fetching user reviews" });
    }
  });

  app.get("/api/reviews/user/:userId/average", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const averageRating = await storage.getAverageRatingForUser(userId);
      res.json({ averageRating });
    } catch (error) {
      console.error("Error fetching average rating:", error);
      res.status(500).json({ message: "Error fetching average rating" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validation = insertReviewSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid review data", errors: validation.error.format() });
      }
      
      // Ensure reviewer ID matches the authenticated user
      if (validation.data.reviewerId !== req.user.id) {
        return res.status(400).json({ message: "Reviewer ID must match the authenticated user" });
      }
      
      // Ensure exchange exists and is completed
      const exchange = await storage.getExchange(validation.data.exchangeId);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }
      
      if (exchange.status !== "completed") {
        return res.status(400).json({ message: "Cannot review an exchange that is not completed" });
      }
      
      // Ensure user is part of the exchange
      if (exchange.requesterId !== req.user.id && exchange.providerId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to review this exchange" });
      }
      
      const review = await storage.createReview(validation.data);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Error creating review" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Ensure user is authenticated and is an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const users = Array.from(storage.users.values());
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get("/api/admin/skills", async (req, res) => {
    try {
      // Ensure user is authenticated and is an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const skills = Array.from(storage.skills.values());
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Error fetching skills" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      // Ensure user is authenticated and is an admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const userId = parseInt(req.params.id);
      
      // Remove the user from the in-memory storage
      const success = storage.users.delete(userId);
      
      if (success) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete user" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Statistics for dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = req.user.id;
      
      // Get active exchanges
      const activeExchanges = (await storage.getActiveExchangesByUser(userId)).length;
      
      // Get completed exchanges
      const completedExchanges = (await storage.getExchangesByUser(userId))
        .filter(exchange => exchange.status === "completed")
        .length;
      
      // Get average rating
      const averageRating = await storage.getAverageRatingForUser(userId);
      
      // Get unread messages
      const unreadMessages = await storage.getUnreadMessagesCount(userId);
      
      res.json({
        activeExchanges,
        completedExchanges,
        averageRating,
        unreadMessages
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  // Log server start for debugging
  httpServer.on('listening', () => {
    const addr = httpServer.address();
    const port = typeof addr === 'string' ? addr : addr?.port;
    console.log('HTTP server is listening on port', port);
  });

  // Log server errors
  httpServer.on('error', (error) => {
    console.error('HTTP server error:', error);
  });

  return httpServer;
}
