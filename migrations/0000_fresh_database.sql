CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"label" varchar(50) NOT NULL,
	"street" varchar(255) NOT NULL,
	"apt" varchar(50),
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"mechanic_id" integer NOT NULL,
	"vehicle_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"location" text NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"notes" text,
	"total_price" numeric(10, 2) NOT NULL,
	"platform_fee" numeric(10, 2),
	"mechanic_payout" numeric(10, 2),
	"stripe_payment_intent_id" varchar(255),
	"stripe_transfer_id" varchar(255),
	"payment_status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"earnings_credited_at" timestamp with time zone,
	"checkout_session_id" varchar(255),
	"checkout_started_at" timestamp with time zone
);

CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar NOT NULL,
	"mechanic_id" integer NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "job_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"mechanic_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "job_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"mechanic_id" integer NOT NULL,
	"photo_url" text NOT NULL,
	"photo_type" varchar(10) NOT NULL,
	"caption" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "mechanic_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"mechanic_id" integer NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"file_url" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "mechanic_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"specialty" varchar(255),
	"bio" text,
	"hourly_rate" numeric(10, 2) NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"completed_jobs" integer DEFAULT 0,
	"screening_status" varchar(20) DEFAULT 'pending',
	"is_verified" boolean DEFAULT false,
	"is_available" boolean DEFAULT true,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"service_radius" integer DEFAULT 10,
	"total_earnings" numeric(10, 2) DEFAULT '0',
	"stripe_connect_id" varchar(255),
	"stripe_connect_onboarded" boolean DEFAULT false,
	"onboarding_submitted_at" timestamp with time zone,
	"consent_version" text,
	"offered_services" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mechanic_profiles_user_id_unique" UNIQUE("user_id")
);

CREATE TABLE "mechanic_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"mechanic_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"custom_price" numeric(10, 2),
	"is_active" boolean DEFAULT true
);

CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"sender_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "payment_events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "portfolio_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"mechanic_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"service_type" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"customer_id" varchar NOT NULL,
	"mechanic_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_booking_id_unique" UNIQUE("booking_id")
);

CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"base_price" numeric(10, 2) NOT NULL,
	"duration" integer NOT NULL,
	"icon" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true
);

CREATE TABLE "sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

CREATE TABLE "shop_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"phone" varchar(20),
	"email" varchar(255),
	"street" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"completed_jobs" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"hours_open" varchar(50) DEFAULT '8:00 AM',
	"hours_close" varchar(50) DEFAULT '6:00 PM',
	"days_open" varchar(100) DEFAULT 'Mon-Fri',
	"avatar_url" text,
	"stripe_connect_id" varchar(255),
	"stripe_connect_onboarded" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "shop_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"custom_price" numeric(10, 2),
	"is_active" boolean DEFAULT true
);

CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"role" varchar(20) DEFAULT 'customer' NOT NULL,
	"avatar_url" text,
	"stripe_customer_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"make" varchar(100) NOT NULL,
	"model" varchar(100) NOT NULL,
	"year" integer NOT NULL,
	"trim" varchar(100),
	"license_plate" varchar(20),
	"vin" varchar(17),
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "job_notes" ADD CONSTRAINT "job_notes_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "job_notes" ADD CONSTRAINT "job_notes_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "job_photos" ADD CONSTRAINT "job_photos_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "mechanic_documents" ADD CONSTRAINT "mechanic_documents_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "mechanic_profiles" ADD CONSTRAINT "mechanic_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "mechanic_services" ADD CONSTRAINT "mechanic_services_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "mechanic_services" ADD CONSTRAINT "mechanic_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_mechanic_id_mechanic_profiles_id_fk" FOREIGN KEY ("mechanic_id") REFERENCES "public"."mechanic_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "shop_services" ADD CONSTRAINT "shop_services_shop_id_shop_profiles_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shop_profiles"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "shop_services" ADD CONSTRAINT "shop_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
