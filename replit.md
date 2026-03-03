# PrimeMechanic - Mobile Mechanic Marketplace

## Overview
PrimeMechanic is a two-sided mobile marketplace connecting vehicle owners with mobile mechanics for on-demand automotive services. The platform facilitates booking, service tracking, and mechanic management. It operates on a 20% commission model per completed job, similar to a ride-sharing service, focusing on the mobile auto repair sector.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK, providing cross-platform support for iOS, Android, and web.
- **Navigation**: React Navigation, implementing role-based navigation with separate tab structures for Customers and Mechanics. A `UserContext` manages role switching.
- **State Management**: TanStack React Query for efficient server state management.
- **Styling**: A custom theme system supports light/dark modes, utilizing design tokens for consistent UI (Colors, Spacing, Typography, BorderRadius, Shadows). The design emphasizes card-based layouts with subtle shadows and uses Emerald Tech Green as the primary accent color.
- **Animation**: React Native Reanimated is used for smooth UI animations, complemented by Expo Haptics for tactile feedback.
- **Fonts**: Montserrat is used for a professional aesthetic.

### Backend Architecture
- **Server**: Express.js on Node.js with TypeScript.
- **API Pattern**: RESTful endpoints prefixed with `/api/*`.
- **Storage**: Currently utilizes in-memory storage (`MemStorage class`), designed for future migration to PostgreSQL.
- **CORS**: Dynamic origin handling for development and deployment environments.

### Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL, with schema defined in `/shared/schema.ts` for client-server consistency.
- **Validation**: `drizzle-zod` for schema-based validation.
- **Key Entities**: Users, Vehicles, MechanicProfiles, Services, Bookings, Reviews, Conversations, Messages, and dedicated tables for mechanic documents, job photos, and job notes.

### System Design Choices
- **Mechanic Screening & Compliance**: Implemented a multi-step onboarding process for mechanics including document uploads (insurance, license, W-9), background check consent, and contractor agreement review. A `screeningStatus` field tracks approval.
- **Real-time Features**: WebSocket server for real-time dashboard updates (earnings, requests, schedule) for mechanics.
- **Shops Feature**: Integration of physical auto repair shop profiles, including services offered, hours, and address.
- **Mechanic Portfolio**: Allows mechanics to upload and display portfolio images with captions, utilizing object storage for photo management.
- **Authentication**: Custom email/password authentication system with `bcryptjs` hashing, managed via `AuthContext`.
- **UI/UX**: Premium UI design overhaul featuring a new Emerald Tech Green color theme, card-based layouts with subtle shadows, and gradient buttons. Consistent design guidelines are maintained.
- **Role-Based Access**: Distinct user roles (Customer, Mechanic, Admin) with tailored interfaces and capabilities.
- **Photo Enforcement**: Before-photos are enforced for jobs, preventing status changes to `in_progress` without documentation.

## External Dependencies

### Database
- **PostgreSQL**: Primary database for persistent storage.
- **Drizzle ORM**: Used for type-safe database interactions and schema management.

### Third-Party Services
- **Stripe**: Integrated for marketplace payment processing, including a 20% platform commission model and webhook management via `stripe-replit-sync`.
- **Object Storage**: Used for storing mechanic portfolio images and job-related photos, accessed via presigned URLs.

### Key NPM Packages
- **expo**: Core framework for React Native development.
- **@tanstack/react-query**: For server state management.
- **react-native-reanimated**: For animations.
- **pg**: PostgreSQL client.
- **drizzle-orm/drizzle-kit**: ORM and migration tools.
- **bcryptjs**: For password hashing.
- **expo-image-picker**: For native photo selection.