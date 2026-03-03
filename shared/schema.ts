import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 20 }).notNull().default("customer"),
  avatarUrl: text("avatar_url"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  trim: varchar("trim", { length: 100 }),
  licensePlate: varchar("license_plate", { length: 20 }),
  vin: varchar("vin", { length: 17 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mechanicProfiles = pgTable("mechanic_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  specialty: varchar("specialty", { length: 255 }),
  bio: text("bio"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  completedJobs: integer("completed_jobs").default(0),
  screeningStatus: varchar("screening_status", { length: 20 }).default("pending"),
  isVerified: boolean("is_verified").default(false),
  isAvailable: boolean("is_available").default(true),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  serviceRadius: integer("service_radius").default(10),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  stripeConnectId: varchar("stripe_connect_id", { length: 255 }),
  stripeConnectOnboarded: boolean("stripe_connect_onboarded").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  isActive: boolean("is_active").default(true),
});

export const mechanicServices = pgTable("mechanic_services", {
  id: serial("id").primaryKey(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  notes: text("notes"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
  mechanicPayout: decimal("mechanic_payout", { precision: 10, scale: 2 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull().unique(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  customerId: varchar("customer_id").references(() => users.id).notNull(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  platformFee: true,
  mechanicPayout: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const portfolioItems = pgTable("portfolio_items", {
  id: serial("id").primaryKey(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  serviceType: varchar("service_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPortfolioItemSchema = createInsertSchema(portfolioItems).omit({
  id: true,
  createdAt: true,
});

export const shopProfiles = pgTable("shop_profiles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  completedJobs: integer("completed_jobs").default(0),
  isVerified: boolean("is_verified").default(false),
  hoursOpen: varchar("hours_open", { length: 50 }).default("8:00 AM"),
  hoursClose: varchar("hours_close", { length: 50 }).default("6:00 PM"),
  daysOpen: varchar("days_open", { length: 100 }).default("Mon-Fri"),
  avatarUrl: text("avatar_url"),
  stripeConnectId: varchar("stripe_connect_id", { length: 255 }),
  stripeConnectOnboarded: boolean("stripe_connect_onboarded").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shopServices = pgTable("shop_services", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").references(() => shopProfiles.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  label: varchar("label", { length: 50 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  apt: varchar("apt", { length: 50 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const mechanicDocuments = pgTable("mechanic_documents", {
  id: serial("id").primaryKey(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  documentType: varchar("document_type", { length: 50 }).notNull(),
  fileUrl: text("file_url").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertMechanicDocumentSchema = createInsertSchema(mechanicDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const jobPhotos = pgTable("job_photos", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  photoUrl: text("photo_url").notNull(),
  photoType: varchar("photo_type", { length: 10 }).notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobPhotoSchema = createInsertSchema(jobPhotos).omit({
  id: true,
  createdAt: true,
});

export const jobNotes = pgTable("job_notes", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  mechanicId: integer("mechanic_id").references(() => mechanicProfiles.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobNoteSchema = createInsertSchema(jobNotes).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type MechanicProfile = typeof mechanicProfiles.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = z.infer<typeof insertPortfolioItemSchema>;
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type ShopProfile = typeof shopProfiles.$inferSelect;
export type MechanicDocument = typeof mechanicDocuments.$inferSelect;
export type InsertMechanicDocument = z.infer<typeof insertMechanicDocumentSchema>;
export type JobPhoto = typeof jobPhotos.$inferSelect;
export type InsertJobPhoto = z.infer<typeof insertJobPhotoSchema>;
export type JobNote = typeof jobNotes.$inferSelect;
export type InsertJobNote = z.infer<typeof insertJobNoteSchema>;
