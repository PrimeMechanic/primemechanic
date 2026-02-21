import type { Express } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name, phone, role } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        name,
        phone: phone || null,
        role: role || "customer",
        avatarUrl: null,
        passwordHash,
      } as any);
      
      const { passwordHash: _, ...userWithoutPassword } = user as any;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      const userWithPassword = user as any;
      if (!userWithPassword.passwordHash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      const { passwordHash: _, ...userWithoutPassword } = userWithPassword;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  // Stripe routes
  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe key error:", error);
      res.status(500).json({ error: "Failed to get Stripe key" });
    }
  });

  app.post("/api/payments/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId, customerId } = req.body;
      
      if (!amount || !bookingId) {
        return res.status(400).json({ error: "Amount and bookingId are required" });
      }
      
      const stripe = await getUncachableStripeClient();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: {
          bookingId: bookingId.toString(),
          customerId: customerId || "",
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id 
      });
    } catch (error) {
      console.error("Payment intent error:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

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

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteVehicle(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
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

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Upload URL error:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.get("/objects/{*objectPath}", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      console.error("Object serve error:", error);
      return res.sendStatus(500);
    }
  });

  app.get("/api/mechanics/:id/portfolio", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await storage.getPortfolioItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const { mechanicId, uploadURL, caption, serviceType } = req.body;
      if (!mechanicId || !uploadURL) {
        return res.status(400).json({ error: "mechanicId and uploadURL are required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      const item = await storage.createPortfolioItem({
        mechanicId,
        imageUrl: objectPath,
        caption: caption || null,
        serviceType: serviceType || null,
      });
      res.status(201).json(item);
    } catch (error) {
      console.error("Portfolio create error:", error);
      res.status(500).json({ error: "Failed to create portfolio item" });
    }
  });

  app.delete("/api/portfolio/:id", async (req, res) => {
    try {
      await storage.deletePortfolioItem(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete portfolio item" });
    }
  });

  app.get("/api/users/:id/mechanic-profile", async (req, res) => {
    try {
      const profile = await storage.getMechanicProfileByUserId(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Mechanic profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mechanic profile" });
    }
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ error: "Failed to get Stripe key" });
    }
  });

  app.get("/api/users/:id/payment-methods", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.stripeCustomerId) {
        return res.json([]);
      }

      const stripe = await getUncachableStripeClient();
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });

      const formatted = paymentMethods.data.map((pm: any) => ({
        id: pm.id,
        brand: pm.card?.brand || "unknown",
        last4: pm.card?.last4 || "****",
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
        isDefault: false,
      }));

      if (formatted.length > 0) {
        try {
          const customer = await stripe.customers.retrieve(user.stripeCustomerId) as any;
          const defaultPmId = customer.invoice_settings?.default_payment_method;
          if (defaultPmId) {
            const defaultCard = formatted.find((pm: any) => pm.id === defaultPmId);
            if (defaultCard) defaultCard.isDefault = true;
          }
        } catch (e) {}
      }

      res.json(formatted);
    } catch (error) {
      console.error("Payment methods error:", error);
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/users/:id/setup-intent", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
      });

      res.json({ clientSecret: setupIntent.client_secret });
    } catch (error) {
      console.error("Setup intent error:", error);
      res.status(500).json({ error: "Failed to create setup intent" });
    }
  });

  app.post("/api/users/:id/checkout-setup", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      const host = req.headers.host || process.env.REPLIT_DEV_DOMAIN || "localhost:5000";
      const protocol = host.includes("localhost") ? "http" : "https";
      const baseUrl = `${protocol}://${host}`;

      const session = await stripe.checkout.sessions.create({
        mode: "setup",
        customer: customerId,
        payment_method_types: ["card"],
        success_url: `${baseUrl}/api/payment-setup/success`,
        cancel_url: `${baseUrl}/api/payment-setup/cancel`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout setup error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/payment-setup/success", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #F6F8F7; }
            .card { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); max-width: 360px; }
            .icon { width: 64px; height: 64px; border-radius: 32px; background: #E8F8EF; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
            h2 { color: #1C1C1C; margin: 0 0 8px; font-size: 20px; }
            p { color: #6B6F73; margin: 0; font-size: 15px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">&#10003;</div>
            <h2>Card Added Successfully</h2>
            <p>Your payment method has been saved. You can close this window and return to the app.</p>
          </div>
        </body>
      </html>
    `);
  });

  app.get("/api/payment-setup/cancel", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #F6F8F7; }
            .card { text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); max-width: 360px; }
            .icon { width: 64px; height: 64px; border-radius: 32px; background: #FEE2E2; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
            h2 { color: #1C1C1C; margin: 0 0 8px; font-size: 20px; }
            p { color: #6B6F73; margin: 0; font-size: 15px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">&#10007;</div>
            <h2>Setup Cancelled</h2>
            <p>No card was added. You can close this window and return to the app.</p>
          </div>
        </body>
      </html>
    `);
  });

  app.delete("/api/payment-methods/:paymentMethodId", async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      await stripe.paymentMethods.detach(req.params.paymentMethodId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete payment method error:", error);
      res.status(500).json({ error: "Failed to remove payment method" });
    }
  });

  app.post("/api/payment-methods/:paymentMethodId/default", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer" });
      }

      const stripe = await getUncachableStripeClient();
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: req.params.paymentMethodId,
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Set default error:", error);
      res.status(500).json({ error: "Failed to set default payment method" });
    }
  });

  // Address routes
  app.get("/api/users/:id/addresses", async (req, res) => {
    try {
      const addrs = await storage.getAddresses(req.params.id);
      res.json(addrs);
    } catch (error) {
      console.error("Get addresses error:", error);
      res.status(500).json({ error: "Failed to get addresses" });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const { userId, label, street, apt, city, state, zipCode, isDefault } = req.body;
      if (!userId || !label || !street || !city || !state || !zipCode) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const address = await storage.createAddress({ userId, label, street, apt: apt || null, city, state, zipCode, isDefault: isDefault || false });
      if (isDefault) {
        await storage.setDefaultAddress(userId, address.id);
      }
      res.json(address);
    } catch (error) {
      console.error("Create address error:", error);
      res.status(500).json({ error: "Failed to create address" });
    }
  });

  app.patch("/api/addresses/:id", async (req, res) => {
    try {
      const { label, street, apt, city, state, zipCode, isDefault, userId } = req.body;
      const address = await storage.updateAddress(Number(req.params.id), { label, street, apt: apt || null, city, state, zipCode });
      if (isDefault && userId) {
        await storage.setDefaultAddress(userId, Number(req.params.id));
      }
      res.json(address);
    } catch (error) {
      console.error("Update address error:", error);
      res.status(500).json({ error: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      await storage.deleteAddress(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete address error:", error);
      res.status(500).json({ error: "Failed to delete address" });
    }
  });

  app.post("/api/addresses/:id/default", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }
      await storage.setDefaultAddress(userId, Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Set default address error:", error);
      res.status(500).json({ error: "Failed to set default address" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
