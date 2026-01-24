import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/mechanics", async (req, res) => {
    try {
      const mechanics = await storage.getMechanics();
      const formattedMechanics = mechanics.map(m => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        specialty: m.specialty,
        bio: m.bio,
        hourlyRate: parseFloat(m.hourlyRate),
        rating: parseFloat(m.rating || "0"),
        reviewCount: m.reviewCount,
        completedJobs: m.completedJobs,
        isVerified: m.isVerified,
        isAvailable: m.isAvailable,
      }));
      res.json(formattedMechanics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mechanics" });
    }
  });

  app.get("/api/mechanics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const mechanic = await storage.getMechanic(id);
      if (!mechanic) {
        return res.status(404).json({ error: "Mechanic not found" });
      }
      res.json({
        id: mechanic.id,
        name: mechanic.user.name,
        email: mechanic.user.email,
        specialty: mechanic.specialty,
        bio: mechanic.bio,
        hourlyRate: parseFloat(mechanic.hourlyRate),
        rating: parseFloat(mechanic.rating || "0"),
        reviewCount: mechanic.reviewCount,
        completedJobs: mechanic.completedJobs,
        isVerified: mechanic.isVerified,
        isAvailable: mechanic.isAvailable,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mechanic" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users/:id/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles(req.params.id);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicle = await storage.createVehicle(req.body);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.get("/api/users/:id/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings(req.params.id);
      const services = await storage.getServices();
      const mechanics = await storage.getMechanics();
      
      const enrichedBookings = await Promise.all(bookings.map(async b => {
        const service = services.find(s => s.id === b.serviceId);
        const mechanic = mechanics.find(m => m.id === b.mechanicId);
        const vehicles = await storage.getVehicles(b.customerId);
        const vehicle = vehicles.find(v => v.id === b.vehicleId);
        
        return {
          ...b,
          totalPrice: parseFloat(b.totalPrice),
          service: service ? {
            id: service.id,
            name: service.name,
            description: service.description,
            price: parseFloat(service.basePrice),
            duration: service.duration,
            icon: service.icon,
          } : null,
          mechanic: mechanic ? {
            id: mechanic.id,
            name: mechanic.user.name,
            rating: parseFloat(mechanic.rating || "0"),
            reviewCount: mechanic.reviewCount,
          } : null,
          vehicle: vehicle || null,
        };
      }));
      
      res.json(enrichedBookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const booking = await storage.createBooking(req.body);
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  app.get("/api/users/:id/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.params.id);
      const mechanics = await storage.getMechanics();
      
      const enrichedConversations = conversations.map(c => {
        const mechanic = mechanics.find(m => m.id === c.mechanicId);
        return {
          ...c,
          mechanic: mechanic ? {
            id: mechanic.id,
            name: mechanic.user.name,
            isAvailable: mechanic.isAvailable,
          } : null,
        };
      });
      
      res.json(enrichedConversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const messages = await storage.getMessages(id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const review = await storage.createReview(req.body);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
