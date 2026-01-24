# Mobile Mechanic Marketplace - Design Guidelines

## Brand Identity

**Purpose**: Connect vehicle owners with trusted mobile mechanics for on-demand automotive services.

**Aesthetic Direction**: Bold/Professional - This app handles people's vehicles, so it must feel CONFIDENT and TRUSTWORTHY. Dark, industrial palette with high-contrast accents. Automotive-inspired details (think dashboard gauges, workshop tools) without being literal. The memorable element: a distinctive "service status" visual language using color-coded progress indicators.

**Differentiation**: Real-time mechanic tracking map and transparent pricing before booking - no surprises.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs) with floating action button for "Book Now"

**Screen List**:
1. **Browse** (Tab 1) - Discover services and mechanics
2. **Bookings** (Tab 2) - View upcoming/past appointments
3. **Messages** (Tab 3) - Chat with mechanics
4. **Profile** (Tab 4) - Account settings
5. **Book Service** (FAB) - Core booking flow
6. **Service Detail** (Modal) - Service info and mechanic profile
7. **Mechanic Profile** (Push) - Full mechanic details
8. **Booking Detail** (Push) - Appointment info with live tracking
9. **Login/Signup** (Modal) - Authentication flow

## Screen Specifications

### Login/Signup Screen (Modal)
- **Purpose**: User authentication
- **Layout**: 
  - No header
  - Top inset: insets.top + Spacing.xl
  - Logo and tagline at top
  - SSO buttons (Apple, Google) centered
  - Privacy policy and terms links at bottom
- **Components**: Logo, SSO buttons, legal links

### Browse Screen (Tab 1)
- **Purpose**: Discover mechanics and services
- **Layout**:
  - Custom transparent header with search bar
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Scrollable content: featured services, nearby mechanics grid
- **Components**: Search bar, service category cards (oil change, brakes, diagnostics), mechanic profile cards with ratings and distance
- **Empty State**: "No mechanics nearby" illustration

### Bookings Screen (Tab 2)
- **Purpose**: View all appointments
- **Layout**:
  - Default header with title "My Bookings"
  - Top inset: Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Segmented control (Upcoming/Past)
  - Scrollable list of booking cards
- **Components**: Booking cards showing service type, mechanic name, date/time, status badge
- **Empty State**: "No bookings yet" illustration

### Messages Screen (Tab 3)
- **Purpose**: Chat with mechanics
- **Layout**:
  - Default header with title "Messages"
  - Top inset: Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - List of conversation threads
- **Components**: Chat preview cards with mechanic avatar, last message, timestamp
- **Empty State**: "No messages" illustration

### Profile Screen (Tab 4)
- **Purpose**: Account management
- **Layout**:
  - Custom transparent header
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Scrollable content: user avatar, name, saved vehicles, settings
- **Components**: Avatar, vehicle list, settings options, logout button
- **Settings Include**: Notifications, Payment methods, Saved addresses, Help & Support, Account > Delete account (double confirmation)

### Book Service Screen (Modal from FAB)
- **Purpose**: Create new service booking
- **Layout**:
  - Default header with Cancel (left) and title "Book Service"
  - Top inset: Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
  - Scrollable form with submit button at bottom
- **Form Fields**: Service type dropdown, Vehicle selection, Date/time picker, Location input, Special instructions
- **Components**: Form inputs, primary CTA button "Find Mechanics"

### Service Detail Screen (Modal)
- **Purpose**: View service details and mechanic info
- **Layout**:
  - Custom header with back button and share icon
  - Top inset: Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
  - Scrollable content with fixed "Book Now" button at bottom
- **Components**: Service image, price, duration, mechanic card, reviews, description
- **Floating Elements**: "Book Now" button with shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)

### Booking Detail Screen (Push)
- **Purpose**: View appointment details with live tracking
- **Layout**:
  - Default header with title "Booking Details"
  - Top inset: Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Map view at top (if mechanic is en route)
  - Scrollable content below
- **Components**: Map, status timeline, mechanic info, service details, cancel/reschedule buttons

## Color Palette

- **Primary**: #FF6B35 (Safety Orange - automotive, energetic, trustworthy)
- **Primary Variant**: #CC5529 (pressed state)
- **Background**: #0F1419 (Deep Charcoal)
- **Surface**: #1C2128 (Dark Gray)
- **Surface Elevated**: #2D333B (Card backgrounds)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #9EA3AB
- **Accent**: #00D9FF (Electric Blue - for status indicators)
- **Success**: #34C759
- **Warning**: #FFD60A
- **Error**: #FF453A
- **Border**: #3D444D

## Typography

- **Font**: Montserrat (Google Font) for headings - bold, confident, automotive industry feel
- **Body Font**: System font (SF Pro on iOS, Roboto on Android) for legibility
- **Type Scale**:
  - H1: Montserrat Bold, 28pt
  - H2: Montserrat SemiBold, 22pt
  - H3: Montserrat SemiBold, 18pt
  - Body: System Regular, 16pt
  - Caption: System Regular, 14pt
  - Small: System Regular, 12pt

## Visual Design

- Icons: Feather icons from @expo/vector-icons
- All touchable elements have 80% opacity on press
- Cards have subtle border (1px, Border color)
- FAB uses shadow: shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

## Assets to Generate

1. **icon.png** - App icon featuring stylized wrench/gear symbol in Safety Orange on dark background - USED: Device home screen
2. **splash-icon.png** - Same icon on charcoal background - USED: App launch screen
3. **empty-bookings.png** - Illustration of clipboard with checkmark in orange/blue - USED: Bookings screen empty state
4. **empty-messages.png** - Illustration of chat bubbles in muted colors - USED: Messages screen empty state
5. **empty-mechanics.png** - Illustration of map pin with "0" in subtle gray - USED: Browse screen when no mechanics nearby
6. **avatar-default.png** - Circular avatar placeholder with wrench icon - USED: User profile when no photo uploaded
7. **mechanic-avatar-1.png** - Professional mechanic avatar option 1 - USED: Sample mechanic profiles
8. **mechanic-avatar-2.png** - Professional mechanic avatar option 2 - USED: Sample mechanic profiles
9. **onboarding-hero.png** - Illustration of mobile mechanic at work, orange accent - USED: First-time user welcome screen