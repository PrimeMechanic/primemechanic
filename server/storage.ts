import { 
  type User, 
  type InsertUser, 
  type Vehicle, 
  type InsertVehicle,
  type MechanicProfile,
  type Service,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Conversation,
  type Message,
  type InsertMessage,
  type PortfolioItem,
  type InsertPortfolioItem,
  type Address,
  type InsertAddress,
  type ShopProfile,
  users,
  vehicles,
  mechanicProfiles,
  services,
  bookings,
  reviews,
  conversations,
  messages,
  portfolioItems,
  addresses,
  shopProfiles,
  shopServices,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getVehicles(userId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  deleteVehicle(id: number): Promise<void>;
  
  getMechanics(): Promise<(MechanicProfile & { user: User })[]>;
  getMechanic(id: number): Promise<(MechanicProfile & { user: User }) | undefined>;
  
  getServices(): Promise<Service[]>;
  
  getBookings(userId: string): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  getConversations(userId: string): Promise<Conversation[]>;
  getMessages(conversationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  createReview(review: InsertReview): Promise<Review>;
  
  getPortfolioItems(mechanicId: number): Promise<PortfolioItem[]>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  deletePortfolioItem(id: number): Promise<void>;
  getMechanicProfileByUserId(userId: string): Promise<MechanicProfile | undefined>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;

  getShops(): Promise<ShopProfile[]>;
  getShop(id: number): Promise<ShopProfile | undefined>;

  getAddresses(userId: string): Promise<Address[]>;
  createAddress(address: InsertAddress): Promise<Address>;
  updateAddress(id: number, updates: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: number): Promise<void>;
  setDefaultAddress(userId: string, addressId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      email: insertUser.email,
      name: insertUser.name,
      passwordHash: (insertUser as any).passwordHash || null,
      phone: insertUser.phone || null,
      role: insertUser.role || "customer",
      avatarUrl: insertUser.avatarUrl || null,
    }).returning();
    return user;
  }
  
  async getVehicles(userId: string): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.userId, userId));
  }
  
  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }
  
  async deleteVehicle(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.vehicleId, id));
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  async getMechanics(): Promise<(MechanicProfile & { user: User })[]> {
    const profiles = await db.select().from(mechanicProfiles);
    const results: (MechanicProfile & { user: User })[] = [];
    for (const profile of profiles) {
      const [user] = await db.select().from(users).where(eq(users.id, profile.userId));
      if (user) {
        results.push({ ...profile, user });
      }
    }
    return results;
  }
  
  async getMechanic(id: number): Promise<(MechanicProfile & { user: User }) | undefined> {
    const [profile] = await db.select().from(mechanicProfiles).where(eq(mechanicProfiles.id, id));
    if (!profile) return undefined;
    const [user] = await db.select().from(users).where(eq(users.id, profile.userId));
    if (!user) return undefined;
    return { ...profile, user };
  }
  
  async getServices(): Promise<Service[]> {
    return db.select().from(services).where(eq(services.isActive, true));
  }
  
  async getBookings(userId: string): Promise<Booking[]> {
    return db.select().from(bookings)
      .where(eq(bookings.customerId, userId))
      .orderBy(desc(bookings.scheduledDate));
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const totalPrice = parseFloat(booking.totalPrice);
    const platformFee = (totalPrice * 0.20).toFixed(2);
    const mechanicPayout = (totalPrice * 0.80).toFixed(2);
    
    const [newBooking] = await db.insert(bookings).values({
      ...booking,
      status: booking.status || "pending",
      platformFee,
      mechanicPayout,
      paymentStatus: "pending",
    }).returning();
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const updates: any = { status, updatedAt: new Date() };
    if (status === "completed") {
      updates.completedAt = new Date();
    }
    const [booking] = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }
  
  async getConversations(userId: string): Promise<Conversation[]> {
    return db.select().from(conversations)
      .where(eq(conversations.customerId, userId))
      .orderBy(desc(conversations.lastMessageAt));
  }
  
  async getMessages(conversationId: number): Promise<Message[]> {
    return db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    return newMessage;
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    const mechanic = await this.getMechanic(review.mechanicId);
    if (mechanic) {
      const currentRating = parseFloat(mechanic.rating || "0");
      const currentCount = mechanic.reviewCount || 0;
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + review.rating) / newCount;
      
      await db.update(mechanicProfiles)
        .set({ rating: newRating.toFixed(2), reviewCount: newCount })
        .where(eq(mechanicProfiles.id, review.mechanicId));
    }
    return newReview;
  }

  async getPortfolioItems(mechanicId: number): Promise<PortfolioItem[]> {
    return db.select().from(portfolioItems)
      .where(eq(portfolioItems.mechanicId, mechanicId))
      .orderBy(desc(portfolioItems.createdAt));
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const [newItem] = await db.insert(portfolioItems).values(item).returning();
    return newItem;
  }

  async deletePortfolioItem(id: number): Promise<void> {
    await db.delete(portfolioItems).where(eq(portfolioItems.id, id));
  }

  async getMechanicProfileByUserId(userId: string): Promise<MechanicProfile | undefined> {
    const [profile] = await db.select().from(mechanicProfiles).where(eq(mechanicProfiles.userId, userId));
    return profile;
  }

  async getShops(): Promise<ShopProfile[]> {
    return db.select().from(shopProfiles);
  }

  async getShop(id: number): Promise<ShopProfile | undefined> {
    const [shop] = await db.select().from(shopProfiles).where(eq(shopProfiles.id, id));
    return shop;
  }

  async getAddresses(userId: string): Promise<Address[]> {
    return db.select().from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.createdAt));
  }

  async createAddress(address: InsertAddress): Promise<Address> {
    const [newAddress] = await db.insert(addresses).values(address).returning();
    return newAddress;
  }

  async updateAddress(id: number, updates: Partial<InsertAddress>): Promise<Address | undefined> {
    const [updated] = await db.update(addresses).set(updates).where(eq(addresses.id, id)).returning();
    return updated;
  }

  async deleteAddress(id: number): Promise<void> {
    await db.delete(addresses).where(eq(addresses.id, id));
  }

  async setDefaultAddress(userId: string, addressId: number): Promise<void> {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, addressId));
  }
}

export async function seedDatabase() {
  const existingShops = await db.select().from(shopProfiles);
  if (existingShops.length === 0) {
    console.log("Seeding shops...");
    await db.insert(shopProfiles).values([
      {
        name: "AutoCare Pro Center",
        description: "Full-service auto repair center with state-of-the-art diagnostic equipment and certified technicians.",
        phone: "(310) 555-0180",
        email: "info@autocarepro.com",
        street: "2450 Pacific Coast Hwy",
        city: "Long Beach",
        state: "CA",
        zipCode: "90803",
        rating: "4.80",
        reviewCount: 215,
        completedJobs: 1240,
        isVerified: true,
        hoursOpen: "7:00 AM",
        hoursClose: "7:00 PM",
        daysOpen: "Mon-Sat",
      },
      {
        name: "Precision Auto Works",
        description: "Specializing in European and luxury vehicle maintenance with factory-trained mechanics.",
        phone: "(323) 555-0241",
        email: "service@precisionauto.com",
        street: "8901 Sunset Blvd",
        city: "West Hollywood",
        state: "CA",
        zipCode: "90069",
        rating: "4.90",
        reviewCount: 178,
        completedJobs: 890,
        isVerified: true,
        hoursOpen: "8:00 AM",
        hoursClose: "6:00 PM",
        daysOpen: "Mon-Fri",
      },
      {
        name: "QuickFix Garage",
        description: "Fast, reliable auto repairs for all makes and models. Open 7 days a week for your convenience.",
        phone: "(424) 555-0399",
        email: "hello@quickfixgarage.com",
        street: "1234 Main Street",
        city: "Santa Monica",
        state: "CA",
        zipCode: "90401",
        rating: "4.60",
        reviewCount: 312,
        completedJobs: 2150,
        isVerified: true,
        hoursOpen: "6:00 AM",
        hoursClose: "9:00 PM",
        daysOpen: "Mon-Sun",
      },
    ]);
  }

  const existingServices = await db.select().from(services);
  if (existingServices.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  console.log("Seeding database with demo data...");

  await db.insert(services).values([
    { name: "Oil Change", description: "Full synthetic oil change with filter replacement", basePrice: "75.00", duration: 30, icon: "droplet", isActive: true },
    { name: "Brake Service", description: "Brake pad replacement and rotor inspection", basePrice: "250.00", duration: 90, icon: "disc", isActive: true },
    { name: "Diagnostics", description: "Full vehicle diagnostic scan and report", basePrice: "100.00", duration: 45, icon: "cpu", isActive: true },
    { name: "Tire Service", description: "Tire rotation, balancing, and inspection", basePrice: "60.00", duration: 45, icon: "circle", isActive: true },
    { name: "Battery", description: "Battery test, replacement, and terminal cleaning", basePrice: "150.00", duration: 30, icon: "battery-charging", isActive: true },
    { name: "AC Service", description: "AC system check, recharge, and leak detection", basePrice: "120.00", duration: 60, icon: "wind", isActive: true },
    { name: "Dent, Scratch & Paint Repair", description: "Paintless dent removal, scratch buffing, and touch-up paint", basePrice: "200.00", duration: 120, icon: "edit-3", isActive: true },
  ]);

  const mechanicUserData = [
    { id: "m1", email: "marcus@mechanix.com", name: "Marcus Johnson", phone: "555-0101", role: "mechanic" as const },
    { id: "m2", email: "sarah@mechanix.com", name: "Sarah Chen", phone: "555-0102", role: "mechanic" as const },
    { id: "m3", email: "david@mechanix.com", name: "David Rodriguez", phone: "555-0103", role: "mechanic" as const },
    { id: "m4", email: "emily@mechanix.com", name: "Emily Watson", phone: "555-0104", role: "mechanic" as const },
  ];

  for (const u of mechanicUserData) {
    await db.insert(users).values(u).onConflictDoNothing();
  }

  await db.insert(mechanicProfiles).values([
    { userId: "m1", specialty: "German Vehicles", bio: "ASE certified with 10+ years experience", hourlyRate: "85.00", rating: "4.90", reviewCount: 127, completedJobs: 342, isVerified: true, isAvailable: true, serviceRadius: 10 },
    { userId: "m2", specialty: "Japanese Imports", bio: "Specialized in Toyota and Honda repairs", hourlyRate: "75.00", rating: "4.80", reviewCount: 89, completedJobs: 256, isVerified: true, isAvailable: true, serviceRadius: 10 },
    { userId: "m3", specialty: "Domestic Vehicles", bio: "Ford and Chevy specialist", hourlyRate: "70.00", rating: "4.70", reviewCount: 156, completedJobs: 489, isVerified: true, isAvailable: false, serviceRadius: 10 },
    { userId: "m4", specialty: "Electric Vehicles", bio: "Tesla and EV certified technician", hourlyRate: "95.00", rating: "5.00", reviewCount: 43, completedJobs: 87, isVerified: true, isAvailable: true, serviceRadius: 10 },
  ]);

  const demoUser = { id: "demo", email: "alex@example.com", name: "Alex Thompson", phone: "555-1234", role: "customer" as const };
  await db.insert(users).values(demoUser).onConflictDoNothing();

  await db.insert(vehicles).values({ userId: "demo", make: "Honda", model: "Accord", year: 2021, licensePlate: "ABC 1234" });

  const insertedProfiles = await db.select().from(mechanicProfiles);
  const profile1 = insertedProfiles.find(p => p.userId === "m1");
  const profile2 = insertedProfiles.find(p => p.userId === "m2");
  const profile3 = insertedProfiles.find(p => p.userId === "m3");
  const insertedVehicles = await db.select().from(vehicles).where(eq(vehicles.userId, "demo"));

  if (profile1 && profile2 && profile3 && insertedVehicles.length > 0) {
    const vehicleId = insertedVehicles[0].id;
    await db.insert(bookings).values([
      { customerId: "demo", mechanicId: profile1.id, vehicleId, serviceId: 1, status: "upcoming", scheduledDate: new Date("2025-01-25T10:00:00"), location: "123 Main St, Apt 4B", totalPrice: "75.00", platformFee: "15.00", mechanicPayout: "60.00", paymentStatus: "pending" },
      { customerId: "demo", mechanicId: profile2.id, vehicleId, serviceId: 2, status: "completed", scheduledDate: new Date("2025-01-20T14:00:00"), location: "456 Oak Ave", totalPrice: "250.00", platformFee: "50.00", mechanicPayout: "200.00", paymentStatus: "paid" },
      { customerId: "demo", mechanicId: profile3.id, vehicleId, serviceId: 3, status: "completed", scheduledDate: new Date("2025-01-18T09:00:00"), location: "789 Elm St", totalPrice: "100.00", platformFee: "20.00", mechanicPayout: "80.00", paymentStatus: "paid" },
    ]);

    const [conv] = await db.insert(conversations).values({ customerId: "demo", mechanicId: profile1.id }).returning();
    
    await db.insert(messages).values([
      { conversationId: conv.id, senderId: "m1", content: "Hi! I saw you need help with your vehicle. What seems to be the issue?", isRead: true },
      { conversationId: conv.id, senderId: "demo", content: "Hey! Yes, my car has been making a strange noise when I brake.", isRead: true },
      { conversationId: conv.id, senderId: "m1", content: "I'll be there in 15 minutes!", isRead: false },
    ]);
  }

  console.log("Database seeded successfully!");
}

export const storage = new DatabaseStorage();
