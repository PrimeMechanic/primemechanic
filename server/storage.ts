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
  type InsertMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getVehicles(userId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<number, Vehicle>;
  private mechanicProfiles: Map<number, MechanicProfile>;
  private services: Map<number, Service>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  
  private vehicleIdCounter = 1;
  private mechanicIdCounter = 1;
  private bookingIdCounter = 1;
  private reviewIdCounter = 1;
  private conversationIdCounter = 1;
  private messageIdCounter = 1;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.mechanicProfiles = new Map();
    this.services = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    
    this.seedData();
  }
  
  private seedData() {
    const services: Service[] = [
      { id: 1, name: "Oil Change", description: "Full synthetic oil change with filter replacement", basePrice: "75.00", duration: 30, icon: "droplet", isActive: true },
      { id: 2, name: "Brake Service", description: "Brake pad replacement and rotor inspection", basePrice: "250.00", duration: 90, icon: "disc", isActive: true },
      { id: 3, name: "Diagnostics", description: "Full vehicle diagnostic scan and report", basePrice: "100.00", duration: 45, icon: "cpu", isActive: true },
      { id: 4, name: "Tire Service", description: "Tire rotation, balancing, and inspection", basePrice: "60.00", duration: 45, icon: "circle", isActive: true },
      { id: 5, name: "Battery", description: "Battery test, replacement, and terminal cleaning", basePrice: "150.00", duration: 30, icon: "battery-charging", isActive: true },
      { id: 6, name: "AC Service", description: "AC system check, recharge, and leak detection", basePrice: "120.00", duration: 60, icon: "wind", isActive: true },
    ];
    
    services.forEach(s => this.services.set(s.id, s));
    
    const mechanicUsers: User[] = [
      { id: "m1", email: "marcus@mechanix.com", name: "Marcus Johnson", phone: "555-0101", role: "mechanic", avatarUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "m2", email: "sarah@mechanix.com", name: "Sarah Chen", phone: "555-0102", role: "mechanic", avatarUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "m3", email: "david@mechanix.com", name: "David Rodriguez", phone: "555-0103", role: "mechanic", avatarUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { id: "m4", email: "emily@mechanix.com", name: "Emily Watson", phone: "555-0104", role: "mechanic", avatarUrl: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    
    mechanicUsers.forEach(u => this.users.set(u.id, u));
    
    const mechanicProfiles: MechanicProfile[] = [
      { id: 1, userId: "m1", specialty: "German Vehicles", bio: "ASE certified with 10+ years experience", hourlyRate: "85.00", rating: "4.90", reviewCount: 127, completedJobs: 342, isVerified: true, isAvailable: true, latitude: null, longitude: null, serviceRadius: 10, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, userId: "m2", specialty: "Japanese Imports", bio: "Specialized in Toyota and Honda repairs", hourlyRate: "75.00", rating: "4.80", reviewCount: 89, completedJobs: 256, isVerified: true, isAvailable: true, latitude: null, longitude: null, serviceRadius: 10, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, userId: "m3", specialty: "Domestic Vehicles", bio: "Ford and Chevy specialist", hourlyRate: "70.00", rating: "4.70", reviewCount: 156, completedJobs: 489, isVerified: true, isAvailable: false, latitude: null, longitude: null, serviceRadius: 10, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, userId: "m4", specialty: "Electric Vehicles", bio: "Tesla and EV certified technician", hourlyRate: "95.00", rating: "5.00", reviewCount: 43, completedJobs: 87, isVerified: true, isAvailable: true, latitude: null, longitude: null, serviceRadius: 10, createdAt: new Date(), updatedAt: new Date() },
    ];
    
    mechanicProfiles.forEach(m => {
      this.mechanicProfiles.set(m.id, m);
      this.mechanicIdCounter = Math.max(this.mechanicIdCounter, m.id + 1);
    });
    
    const demoUser: User = { id: "demo", email: "alex@example.com", name: "Alex Thompson", phone: "555-1234", role: "customer", avatarUrl: null, createdAt: new Date(), updatedAt: new Date() };
    this.users.set(demoUser.id, demoUser);
    
    const demoVehicle: Vehicle = { id: 1, userId: "demo", make: "Honda", model: "Accord", year: 2021, licensePlate: "ABC 1234", vin: null, createdAt: new Date() };
    this.vehicles.set(demoVehicle.id, demoVehicle);
    this.vehicleIdCounter = 2;
    
    const demoBookings: Booking[] = [
      { id: 1, customerId: "demo", mechanicId: 1, vehicleId: 1, serviceId: 1, status: "upcoming", scheduledDate: new Date("2025-01-25T10:00:00"), location: "123 Main St, Apt 4B", latitude: null, longitude: null, notes: null, totalPrice: "75.00", platformFee: "15.00", mechanicPayout: "60.00", createdAt: new Date(), updatedAt: new Date(), completedAt: null },
      { id: 2, customerId: "demo", mechanicId: 2, vehicleId: 1, serviceId: 2, status: "completed", scheduledDate: new Date("2025-01-20T14:00:00"), location: "456 Oak Ave", latitude: null, longitude: null, notes: null, totalPrice: "250.00", platformFee: "50.00", mechanicPayout: "200.00", createdAt: new Date(), updatedAt: new Date(), completedAt: new Date("2025-01-20T16:30:00") },
      { id: 3, customerId: "demo", mechanicId: 3, vehicleId: 1, serviceId: 3, status: "completed", scheduledDate: new Date("2025-01-18T09:00:00"), location: "789 Elm St", latitude: null, longitude: null, notes: null, totalPrice: "100.00", platformFee: "20.00", mechanicPayout: "80.00", createdAt: new Date(), updatedAt: new Date(), completedAt: new Date("2025-01-18T10:00:00") },
    ];
    
    demoBookings.forEach(b => {
      this.bookings.set(b.id, b);
      this.bookingIdCounter = Math.max(this.bookingIdCounter, b.id + 1);
    });
    
    const demoConversation: Conversation = { id: 1, customerId: "demo", mechanicId: 1, lastMessageAt: new Date(), createdAt: new Date() };
    this.conversations.set(demoConversation.id, demoConversation);
    this.conversationIdCounter = 2;
    
    const demoMessages: Message[] = [
      { id: 1, conversationId: 1, senderId: "m1", content: "Hi! I saw you need help with your vehicle. What seems to be the issue?", isRead: true, createdAt: new Date() },
      { id: 2, conversationId: 1, senderId: "demo", content: "Hey! Yes, my car has been making a strange noise when I brake.", isRead: true, createdAt: new Date() },
      { id: 3, conversationId: 1, senderId: "m1", content: "I'll be there in 15 minutes!", isRead: false, createdAt: new Date() },
    ];
    
    demoMessages.forEach(m => {
      this.messages.set(m.id, m);
      this.messageIdCounter = Math.max(this.messageIdCounter, m.id + 1);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      phone: insertUser.phone || null,
      role: insertUser.role || "customer",
      avatarUrl: insertUser.avatarUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async getVehicles(userId: string): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values()).filter(v => v.userId === userId);
  }
  
  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleIdCounter++;
    const newVehicle: Vehicle = {
      ...vehicle,
      id,
      licensePlate: vehicle.licensePlate || null,
      vin: vehicle.vin || null,
      createdAt: new Date()
    };
    this.vehicles.set(id, newVehicle);
    return newVehicle;
  }
  
  async getMechanics(): Promise<(MechanicProfile & { user: User })[]> {
    return Array.from(this.mechanicProfiles.values()).map(m => ({
      ...m,
      user: this.users.get(m.userId)!
    }));
  }
  
  async getMechanic(id: number): Promise<(MechanicProfile & { user: User }) | undefined> {
    const mechanic = this.mechanicProfiles.get(id);
    if (!mechanic) return undefined;
    return { ...mechanic, user: this.users.get(mechanic.userId)! };
  }
  
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.isActive);
  }
  
  async getBookings(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(b => b.customerId === userId)
      .sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }
  
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.bookingIdCounter++;
    const totalPrice = parseFloat(booking.totalPrice);
    const platformFee = (totalPrice * 0.20).toFixed(2);
    const mechanicPayout = (totalPrice * 0.80).toFixed(2);
    
    const newBooking: Booking = {
      ...booking,
      id,
      status: booking.status || "pending",
      latitude: booking.latitude || null,
      longitude: booking.longitude || null,
      notes: booking.notes || null,
      platformFee,
      mechanicPayout,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    booking.status = status;
    booking.updatedAt = new Date();
    if (status === "completed") {
      booking.completedAt = new Date();
    }
    
    this.bookings.set(id, booking);
    return booking;
  }
  
  async getConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(c => c.customerId === userId)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }
  
  async getMessages(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const newMessage: Message = {
      ...message,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessageAt = new Date();
      this.conversations.set(message.conversationId, conversation);
    }
    
    return newMessage;
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const newReview: Review = {
      ...review,
      comment: review.comment || null,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    
    const mechanic = this.mechanicProfiles.get(review.mechanicId);
    if (mechanic) {
      const currentRating = parseFloat(mechanic.rating || "0");
      const currentCount = mechanic.reviewCount || 0;
      const newCount = currentCount + 1;
      const newRating = ((currentRating * currentCount) + review.rating) / newCount;
      
      mechanic.rating = newRating.toFixed(2);
      mechanic.reviewCount = newCount;
      this.mechanicProfiles.set(review.mechanicId, mechanic);
    }
    
    return newReview;
  }
}

export const storage = new MemStorage();
