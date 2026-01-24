# PrimeMechanic - Mobile Mechanic Marketplace

## Overview

PrimeMechanic is a two-sided marketplace mobile application connecting vehicle owners with mobile mechanics for on-demand automotive services. Built with React Native (Expo) for cross-platform mobile development and a Node.js/Express backend, the platform enables customers to browse mechanics, book services, and track appointments while mechanics can manage their profiles, accept jobs, and handle payouts.

The platform operates on a 20% commission model per completed job, similar to Uber's marketplace model but for mobile auto repair services.

## Recent Changes

### January 24, 2025
- Built complete MVP with Browse, Bookings, Messages, and Profile screens
- Implemented mechanic marketplace with service cards and mechanic profiles
- Added booking flow with service selection, vehicle, date/time, and location
- Created chat interface for customer-mechanic communication
- Set up database schema with Drizzle ORM (Users, Vehicles, MechanicProfiles, Services, Bookings, Reviews, Conversations, Messages)
- Implemented in-memory storage with seeded demo data for testing
- Added REST API endpoints for all core features
- **Updated to light theme** with Midnight Blue (#0D1B2A) primary, Electric Blue (#00D4FF) accent, White background
- **Built complete Mechanic UI** with role-based navigation:
  - MechanicDashboardScreen: Stats cards, today's schedule, earnings summary
  - JobsScreen: Incoming requests with Accept/Decline, Active jobs, History
  - EarningsScreen: Weekly chart, earnings cards, transaction history
  - MechanicProfileEditScreen: Availability toggle, services management, profile settings
- Added UserContext for role switching between Customer and Mechanic views
- Demo mode: Toggle between views via Profile screen "Switch to Mechanic/Customer View"
- **Added Dark/Light Mode Support**:
  - ThemeContext with AsyncStorage persistence
  - Theme toggle switch in both Customer and Mechanic Profile screens under "Appearance" section
  - Dynamic sun/moon icon changes based on current theme
  - Light theme: White backgrounds, Midnight Blue primary
  - Dark theme: Slate backgrounds (#0F172A, #1E293B), Electric Blue accent

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54 for cross-platform iOS, Android, and web support
- **Navigation**: React Navigation with role-based structure:
  - **Customer Tabs** (4): Browse, Bookings, Messages, Profile
  - **Mechanic Tabs** (4): Dashboard, Jobs, Earnings, Profile
  - Native stack navigator for push screens and modals
  - UserContext manages role switching between views
  - Floating action button for quick service booking (customer only)
- **State Management**: TanStack React Query for server state management
- **Styling**: Custom theme system with light/dark mode support, using design tokens (Colors, Spacing, Typography, BorderRadius)
  - ThemeContext provides dynamic colors based on current theme (stored in AsyncStorage)
  - Light mode: White background (#FFFFFF), Midnight Blue primary (#0D1B2A)
  - Dark mode: Slate background (#0F172A), Electric Blue accent (#00D4FF)
  - Secondary Text: Slate Gray (#64748B)
- **Animation**: React Native Reanimated for smooth UI animations with haptic feedback via Expo Haptics
- **Fonts**: Montserrat (Google Fonts) for professional automotive aesthetic

### Backend Architecture
- **Server**: Express.js running on Node.js with TypeScript
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Storage**: Currently uses in-memory storage (MemStorage class) with interface designed for PostgreSQL migration
- **CORS**: Dynamic origin handling for Replit dev/deployment domains plus localhost for Expo web development

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect (configured but using in-memory storage currently)
- **Schema Location**: `/shared/schema.ts` - shared between client and server
- **Validation**: drizzle-zod for schema-based validation
- **Key Entities**: Users, Vehicles, MechanicProfiles, Services, Bookings, Reviews, Conversations, Messages

### Directory Structure
```
/client          - React Native (Expo) frontend
  /components    - Reusable UI components (ThemedText, Card, Button, etc.)
  /screens       - Screen components for each route
  /navigation    - React Navigation setup
  /hooks         - Custom React hooks
  /constants     - Theme tokens and design system
  /lib           - API client and utilities
  /types         - TypeScript type definitions
  /data          - Mock data for development
/server          - Express backend
  /templates     - HTML templates for web landing page
/shared          - Shared code between client/server
  /schema.ts     - Drizzle database schema
/scripts         - Build and deployment scripts
/assets          - Static assets (images, icons)
```

### Key Screens

**Customer Screens:**
1. **BrowseScreen**: Search bar, service category cards, nearby mechanics list with ratings and availability
2. **BookingsScreen**: Segmented control (Upcoming/Past), booking cards with status badges
3. **MessagesScreen**: Conversation list with unread indicators
4. **ProfileScreen**: User info, vehicles list, settings, role switch option
5. **BookServiceScreen**: Modal for creating new bookings
6. **MechanicProfileScreen**: Detailed mechanic view with reviews, services, stats
7. **BookingDetailScreen**: Individual booking details with status timeline
8. **ChatScreen**: Real-time messaging with mechanics

**Mechanic Screens:**
1. **MechanicDashboardScreen**: Welcome header, earnings stats, today's schedule
2. **JobsScreen**: Segmented control (Requests/Active/History), job cards with accept/decline
3. **EarningsScreen**: Period selector, earnings summary, weekly chart, transactions list
4. **MechanicProfileEditScreen**: Avatar, availability toggle, services management, settings

### User Roles Architecture
Three distinct user roles with different capabilities:
1. **Customer**: Book services, manage vehicles, track jobs, message mechanics, leave reviews
2. **Mechanic**: Set services/pricing, accept/decline jobs, manage availability, handle earnings
3. **Admin**: Approve mechanics, manage platform commission, view analytics, handle disputes

## API Endpoints

### Services
- `GET /api/services` - List all available services

### Mechanics
- `GET /api/mechanics` - List all mechanics with profiles
- `GET /api/mechanics/:id` - Get single mechanic details

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/vehicles` - Get user's vehicles
- `GET /api/users/:id/bookings` - Get user's bookings
- `GET /api/users/:id/conversations` - Get user's conversations

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/status` - Update booking status

### Messages
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/messages` - Send new message

### Reviews
- `POST /api/reviews` - Submit review

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations

### Third-Party Services (Planned for Future)
- **Stripe Connect**: Marketplace split payments with Express accounts
- **Clerk Authentication**: User authentication

### Key NPM Packages
- **expo**: Core Expo SDK for React Native
- **@tanstack/react-query**: Server state management
- **react-native-reanimated**: Animations
- **react-native-gesture-handler**: Touch handling
- **@expo-google-fonts/montserrat**: Custom typography
- **expo-haptics**: Tactile feedback
- **pg**: PostgreSQL client
- **drizzle-orm/drizzle-kit**: Database ORM and migrations
- **tsx**: TypeScript execution for development server

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (for production)
- `EXPO_PUBLIC_DOMAIN`: Public domain for API requests
- `REPLIT_DEV_DOMAIN`: Development domain (auto-set by Replit)
