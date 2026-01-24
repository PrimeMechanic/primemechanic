# PrimeMechanic - Mobile Mechanic Marketplace - Design Guidelines

## Brand Identity

**Purpose**: Connect vehicle owners with trusted mobile mechanics for on-demand automotive services.

**Aesthetic Direction**: Professional/Modern - This app handles people's vehicles, so it must feel CONFIDENT and TRUSTWORTHY. Midnight blue palette with electric blue accents and clean white text. The memorable element: a distinctive "service status" visual language using color-coded progress indicators.

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

## Color Palette

- **Primary**: #00D4FF (Electric Blue - modern, tech-forward, trustworthy)
- **Primary Variant**: #00A8CC (pressed state)
- **Background**: #0D1B2A (Midnight Blue)
- **Surface**: #1B2838 (Dark Blue-Gray)
- **Surface Elevated**: #253649 (Card backgrounds)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #9CA3AF
- **Accent**: #00D4FF (Electric Blue - for status indicators)
- **Success**: #34C759
- **Warning**: #FFD60A
- **Error**: #FF453A
- **Border**: #2D3748

## Typography

- **Font**: Montserrat (Google Font) for headings - bold, confident, modern feel
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
- Primary accent backgrounds use rgba(0, 212, 255, 0.15)

## Assets

1. **icon.png** - App icon featuring stylized wrench/gear symbol in Electric Blue on Midnight Blue background
2. **splash-icon.png** - Same icon on Midnight Blue background
3. **empty-bookings.png** - Illustration of clipboard with checkmark
4. **empty-messages.png** - Illustration of chat bubbles
5. **empty-mechanics.png** - Illustration of map pin
6. **avatar-default.png** - Circular avatar placeholder with wrench icon
7. **mechanic-avatar-1.png** - Professional mechanic avatar option 1
8. **mechanic-avatar-2.png** - Professional mechanic avatar option 2
