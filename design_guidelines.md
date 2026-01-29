# PrimeMechanic - Mobile Mechanic Marketplace - Design Guidelines

## Brand Identity

**Purpose**: Connect vehicle owners with trusted mobile mechanics for on-demand automotive services.

**Aesthetic Direction**: Luxurious/Refined - Premium materials, subtle details, restrained elegance. This app handles people's vehicles and money, so it must feel TRUSTWORTHY and HIGH-END like Stripe or Apple. Think premium automotive showroom meets modern fintech.

**Differentiation**: Real-time mechanic tracking map with subtle animations and transparent pricing that feels like magic - no surprises, just confidence.

## Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs) with floating action button for "Book Service"

**Tabs**:
1. **Browse** - Discover services and mechanics
2. **Bookings** - View upcoming/past appointments  
3. **Messages** - Chat with mechanics
4. **Profile** - Account settings and preferences

**Modal/Push Screens**:
5. **Book Service** (Modal) - Core booking flow
6. **Service Detail** (Modal) - Service information and mechanic profile
7. **Mechanic Profile** (Push) - Full mechanic details and reviews
8. **Booking Detail** (Push) - Appointment info with live tracking map
9. **Login/Signup** (Modal) - Authentication flow with Apple/Google Sign-In

## Screen-by-Screen Specifications

### Browse Screen (Tab 1)
- **Header**: Transparent, left: location pill (subtle green background), right: notification bell icon
- **Layout**: ScrollView with sections:
  - Search bar (card-style with shadow)
  - Popular services grid (2 columns, card-based)
  - Featured mechanics horizontal scroll (cards with mechanic photo, name, rating, specialty)
- **Safe Area**: Top: headerHeight + 20px, Bottom: tabBarHeight + 20px
- **Empty State**: N/A (always has content)

### Bookings Screen (Tab 2)
- **Header**: Default with "Bookings" title, right: filter icon
- **Layout**: Segmented control (Upcoming/Past), then ScrollView with booking cards
- **Card Design**: White cards with 14px radius, soft shadow, show service type icon, mechanic photo, date/time, price, status badge
- **Safe Area**: Top: 20px, Bottom: tabBarHeight + 20px
- **Empty State**: empty-bookings.png centered with "No bookings yet" headline

### Messages Screen (Tab 3)
- **Header**: Default with "Messages" title, right: settings icon
- **Layout**: FlatList of conversation cards
- **Card Design**: White cards, left: mechanic avatar, center: name/last message preview, right: timestamp/unread badge
- **Safe Area**: Top: 20px, Bottom: tabBarHeight + 20px
- **Empty State**: empty-messages.png centered with "No conversations"

### Profile Screen (Tab 4)
- **Header**: Transparent with "Profile" title
- **Layout**: ScrollView with sections:
  - User card (avatar, name, email) at top with gradient background
  - White cards for: Payment Methods, Vehicles, Settings, Help & Support, Log Out
- **Safe Area**: Top: headerHeight + 20px, Bottom: tabBarHeight + 20px
- **Components**: Each row is tappable card with chevron-right icon

### Book Service Screen (Modal)
- **Header**: Custom with large "Book Service" title, left: close button
- **Layout**: Multi-step form with progress indicator (4 steps: Service Type → Vehicle → Date/Time → Confirm)
- **Form Design**: Large tap targets, white cards for options, green checkmarks for selected items
- **Footer**: Fixed CTA button "Continue" with gradient background
- **Safe Area**: Top: 20px, Bottom: insets.bottom + 20px

### Service Detail Screen (Modal)
- **Header**: Custom transparent, left: back button, right: share icon
- **Layout**: ScrollView with hero image, service title, price (large, prominent), description, mechanic preview card
- **Footer**: Fixed CTA "Book This Service" button
- **Safe Area**: Top: insets.top + 20px, Bottom: insets.bottom + 20px

### Mechanic Profile Screen (Push)
- **Header**: Default with mechanic name
- **Layout**: ScrollView with sections: photo/rating/badges, about, services offered, reviews (cards), availability calendar
- **Safe Area**: Top: 20px, Bottom: 20px
- **Footer**: Fixed "Book with [Name]" CTA button

### Booking Detail Screen (Push)
- **Header**: Default with "Booking Details"
- **Layout**: ScrollView with live tracking map (if active), service card, mechanic card, timeline card (requested/confirmed/in progress/completed), payment summary
- **Map**: Interactive with mechanic location pin and user location
- **Safe Area**: Top: 20px, Bottom: 20px
- **Actions**: Contact mechanic, Cancel booking (if upcoming)

### Login/Signup Screen (Modal)
- **Header**: Large logo centered at top, close button top-right
- **Layout**: Centered content with Apple Sign-In button (primary), Google Sign-In button (secondary), divider, email form (collapsed by default)
- **Footer**: Terms & Privacy links
- **Safe Area**: Top: insets.top + 20px, Bottom: insets.bottom + 20px

## Color Palette

- **Primary**: #0FA958 (Emerald Tech Green - CTAs, active states, success)
- **Primary Variant**: #0B8A47 (pressed state)
- **Secondary**: #0B3D2E (Deep Emerald - headers, emphasis)
- **Background Root**: #F6F8F7 (Warm off-white)
- **Surface**: #FFFFFF (Cards, modals)
- **Text Primary**: #1C1C1C (Near black)
- **Text Secondary**: #6B6F73 (Slate)
- **Border**: #E3E7E5 (Subtle green-gray)
- **Success**: #0FA958 (matches primary)
- **Warning**: #F59E0B
- **Error**: #EF4444

## Typography

- **Display Font**: SF Pro Display (iOS) / Roboto (Android) - use system fonts for premium polish
- **Type Scale**:
  - H1: Bold, 32pt (screen titles)
  - H2: Semibold, 24pt (section headers)
  - H3: Semibold, 18pt (card titles)
  - Body Large: Regular, 17pt (primary content)
  - Body: Regular, 15pt (secondary content)
  - Caption: Medium, 13pt (labels, metadata)

## Visual Design

- **Icons**: Feather icons from @expo/vector-icons, colored with Primary or Text Secondary
- **Cards**: White background, 14px border radius, subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.04, shadowRadius: 8)
- **Buttons**: 
  - Primary CTA: Green gradient (#0FA958 to #0B8A47), white text, 16px radius, 56px height
  - Secondary: White with green border, green text
  - All buttons scale to 0.97 on press
- **Tab Bar**: White background with subtle top border, icons colored Text Secondary (inactive) or Primary (active)
- **FAB**: Emerald green circle (64px) with shadow (shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.12, shadowRadius: 8), white plus icon
- **Input Fields**: White cards with subtle border, 12px radius, 52px height
- **Status Bar**: Dark content (dark text on light background)

## Assets to Generate

1. **icon.png** - Minimalist wrench inside shield shape, emerald gradient, white background
   - WHERE USED: Device home screen
2. **splash-icon.png** - Same icon, larger, centered on #F6F8F7 background
   - WHERE USED: App launch screen
3. **empty-bookings.png** - Elegant illustration of calendar with checkmark, emerald accents, white background
   - WHERE USED: Bookings tab when user has no bookings
4. **empty-messages.png** - Refined illustration of message bubble with wrench, emerald accents
   - WHERE USED: Messages tab when user has no conversations
5. **avatar-placeholder.png** - Subtle geometric pattern in emerald on light gray circle
   - WHERE USED: User/mechanic profile images before photo upload