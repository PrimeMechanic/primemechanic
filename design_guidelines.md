# PrimeMechanic - Mobile Mechanic Marketplace - Design Guidelines

## Brand Identity

**Purpose**: Connect vehicle owners with trusted mobile mechanics for on-demand automotive services.

**Aesthetic Direction**: Clean/Professional - This app handles people's vehicles, so it must feel CONFIDENT and TRUSTWORTHY. White background with Midnight Blue primary elements and Electric Blue accents. Clean, modern, and professional.

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

- **Primary**: #0D1B2A (Midnight Blue - headers, buttons, key UI elements)
- **Primary Variant**: #1B2838 (pressed state)
- **Accent**: #00D4FF (Electric Blue - highlights, icons, badges, active states)
- **Background Root**: #FFFFFF (White - main background)
- **Background Default**: #F8FAFC (Light gray - secondary surfaces)
- **Background Secondary**: #F1F5F9 (Cards, inputs)
- **Text Primary**: #0D1B2A (Midnight Blue)
- **Text Secondary**: #64748B (Slate Gray)
- **Success**: #22C55E
- **Warning**: #F59E0B
- **Error**: #EF4444
- **Border**: #E2E8F0

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
- All touchable elements have subtle scale animation on press
- Cards have light border (1px, #E2E8F0)
- FAB uses Midnight Blue with shadow for depth
- Accent color backgrounds use rgba(0, 212, 255, 0.1)
- Status bar: dark (dark text on light background)

## Assets

1. **icon.png** - App icon featuring stylized wrench/gear symbol in Electric Blue on Midnight Blue background
2. **splash-icon.png** - Same icon on white background
3. **empty-bookings.png** - Illustration with Electric Blue accents
4. **empty-messages.png** - Illustration with Electric Blue accents
5. **empty-mechanics.png** - Illustration with Electric Blue accents
